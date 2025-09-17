/**
 * SINGULARIS PRIME WebSocket Monitoring Service
 * 
 * This module provides real-time WebSocket communication for AI verification
 * monitoring. It streams live updates about verification status, oversight
 * requests, explainability scores, and audit trails to connected clients.
 * 
 * Key responsibilities:
 * - Real-time verification status streaming
 * - Oversight request notifications
 * - Explainability monitoring updates
 * - Audit trail streaming
 * - Client authentication and authorization
 * - Connection management and cleanup
 */

import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { Server } from 'http';
import {
  AIEntityId,
  AIContractId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality
} from '../../shared/types/ai-types';

import { aiVerificationService, VerificationEvent, VerificationResult } from './ai-verification-service';
import { explainabilityMonitor, ExplainabilityMeasurement, ExplainabilityAlert } from './explainability-monitor';
import { humanOversightManager, OversightRequest, OversightDecision } from './human-oversight-manager';

// WebSocket message types
export enum MessageType {
  // Authentication
  AUTH_REQUEST = 'auth_request',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',
  
  // Subscriptions
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  SUBSCRIPTION_CONFIRMED = 'subscription_confirmed',
  
  // Verification monitoring
  VERIFICATION_STATUS = 'verification_status',
  VERIFICATION_EVENT = 'verification_event',
  VERIFICATION_METRICS = 'verification_metrics',
  
  // Explainability monitoring
  EXPLAINABILITY_MEASUREMENT = 'explainability_measurement',
  EXPLAINABILITY_ALERT = 'explainability_alert',
  EXPLAINABILITY_TREND = 'explainability_trend',
  
  // Human oversight
  OVERSIGHT_REQUEST = 'oversight_request',
  OVERSIGHT_DECISION = 'oversight_decision',
  OVERSIGHT_STATUS = 'oversight_status',
  
  // Audit trail
  AUDIT_ENTRY = 'audit_entry',
  AUDIT_STREAM = 'audit_stream',
  
  // System status
  SYSTEM_STATUS = 'system_status',
  CONNECTION_STATUS = 'connection_status',
  
  // Errors
  ERROR = 'error'
}

// WebSocket message structure
export interface WebSocketMessage {
  readonly type: MessageType;
  readonly timestamp: number;
  readonly data: any;
  readonly id?: string;
  readonly correlationId?: string;
}

// Client subscription channels
export enum SubscriptionChannel {
  VERIFICATION_EVENTS = 'verification_events',
  EXPLAINABILITY_MONITORING = 'explainability_monitoring',
  OVERSIGHT_REQUESTS = 'oversight_requests',
  AUDIT_TRAIL = 'audit_trail',
  SYSTEM_STATUS = 'system_status',
  ALL = 'all'
}

// Client information
export interface WebSocketClient {
  readonly id: string;
  readonly socket: WebSocket;
  readonly userId?: string;
  readonly role?: string;
  readonly permissions: string[];
  readonly subscriptions: Set<SubscriptionChannel>;
  readonly connectedAt: number;
  readonly lastActivity: number;
  readonly isAuthenticated: boolean;
}

// Monitoring statistics
export interface MonitoringStatistics {
  readonly connectedClients: number;
  readonly authenticatedClients: number;
  readonly totalMessagesSet: number;
  readonly totalVerificationEvents: number;
  readonly totalOversightRequests: number;
  readonly averageResponseTime: number;
  readonly systemHealth: 'healthy' | 'degraded' | 'critical';
}

/**
 * WebSocket Monitoring Service
 */
export class WebSocketMonitoringService extends EventEmitter {
  private static instance: WebSocketMonitoringService | null = null;
  
  // WebSocket server
  private wss: WebSocketServer | null = null;
  private server: Server | null = null;
  
  // Client management
  private clients: Map<string, WebSocketClient> = new Map();
  private isRunning: boolean = false;
  
  // Statistics
  private statistics: MonitoringStatistics = {
    connectedClients: 0,
    authenticatedClients: 0,
    totalMessagesSet: 0,
    totalVerificationEvents: 0,
    totalOversightRequests: 0,
    averageResponseTime: 0,
    systemHealth: 'healthy'
  };
  
  // Configuration
  private readonly config = {
    port: 8081,
    authRequired: true,
    maxConnections: 100,
    heartbeatInterval: 30000, // 30 seconds
    messageRateLimit: 100, // messages per minute
    auditRetentionHours: 24,
    enableCompression: true
  };
  
  constructor() {
    super();
    this.setupEventListeners();
  }
  
  /**
   * Singleton pattern
   */
  public static getInstance(): WebSocketMonitoringService {
    if (!WebSocketMonitoringService.instance) {
      WebSocketMonitoringService.instance = new WebSocketMonitoringService();
    }
    return WebSocketMonitoringService.instance;
  }
  
  /**
   * Start the WebSocket monitoring service
   */
  public async start(server?: Server): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.server = server || null;
    
    // Create WebSocket server with dedicated path to avoid conflict with Vite HMR
    this.wss = new WebSocketServer({
      server: this.server,
      port: this.server ? undefined : this.config.port,
      path: '/ws/ai-monitor', // Dedicated path to avoid conflict with Vite HMR
      perMessageDeflate: this.config.enableCompression
    });
    
    this.setupWebSocketServer();
    this.startHeartbeat();
    this.startStatisticsUpdater();
    
    this.isRunning = true;
    
    console.log(`WebSocket Monitoring Service started on ${this.server ? 'HTTP server' : `port ${this.config.port}`} at path /ws/ai-monitor`);
    this.emit('service_started', { timestamp: Date.now() });
  }
  
  /**
   * Stop the WebSocket monitoring service
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    // Close all client connections
    for (const client of this.clients.values()) {
      client.socket.close(1000, 'Service shutting down');
    }
    
    this.clients.clear();
    
    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    console.log('WebSocket Monitoring Service stopped');
    this.emit('service_stopped', { timestamp: Date.now() });
  }
  
  /**
   * Broadcast message to all subscribed clients
   */
  public broadcast(
    channel: SubscriptionChannel,
    message: Omit<WebSocketMessage, 'timestamp' | 'id'>
  ): void {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };
    
    let sentCount = 0;
    
    for (const client of this.clients.values()) {
      if (this.shouldReceiveMessage(client, channel, fullMessage)) {
        this.sendToClient(client, fullMessage);
        sentCount++;
      }
    }
    
    this.statistics.totalMessagesSet += sentCount;
    
    if (sentCount > 0) {
      this.emit('message_broadcast', { channel, message: fullMessage, recipients: sentCount });
    }
  }
  
  /**
   * Send message to specific client
   */
  public sendToClient(client: WebSocketClient, message: WebSocketMessage): boolean {
    if (client.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      client.socket.send(JSON.stringify(message));
      
      // Update client activity
      const updatedClient = { ...client, lastActivity: Date.now() };
      this.clients.set(client.id, updatedClient);
      
      return true;
    } catch (error) {
      console.error(`Failed to send message to client ${client.id}:`, error);
      this.handleClientError(client, error);
      return false;
    }
  }
  
  /**
   * Get monitoring statistics
   */
  public getStatistics(): MonitoringStatistics {
    return { ...this.statistics };
  }
  
  /**
   * Get connected clients (filtered for privacy)
   */
  public getConnectedClients(): Array<{
    id: string;
    userId?: string;
    role?: string;
    connectedAt: number;
    isAuthenticated: boolean;
    subscriptions: string[];
  }> {
    return Array.from(this.clients.values()).map(client => ({
      id: client.id,
      userId: client.userId,
      role: client.role,
      connectedAt: client.connectedAt,
      isAuthenticated: client.isAuthenticated,
      subscriptions: Array.from(client.subscriptions)
    }));
  }
  
  /**
   * Setup WebSocket server
   */
  private setupWebSocketServer(): void {
    if (!this.wss) return;
    
    this.wss.on('connection', (socket: WebSocket, request) => {
      // Verify the connection is to our monitoring path
      if (request.url && !request.url.startsWith('/ws/ai-monitor')) {
        socket.close(4001, 'Invalid path - AI monitoring only'); // Use valid close code 4001
        return;
      }
      
      const clientId = this.generateClientId();
      
      const client: WebSocketClient = {
        id: clientId,
        socket,
        permissions: [],
        subscriptions: new Set(),
        connectedAt: Date.now(),
        lastActivity: Date.now(),
        isAuthenticated: !this.config.authRequired // Auto-authenticate if auth not required
      };
      
      this.clients.set(clientId, client);
      this.statistics.connectedClients = this.clients.size;
      
      console.log(`WebSocket AI monitor client connected: ${clientId}`);
      
      // Setup client event handlers
      this.setupClientHandlers(client);
      
      // Send connection confirmation
      this.sendToClient(client, {
        type: MessageType.CONNECTION_STATUS,
        timestamp: Date.now(),
        data: {
          clientId,
          authRequired: this.config.authRequired,
          availableChannels: Object.values(SubscriptionChannel)
        }
      });
      
      this.emit('client_connected', { client });
    });
    
    this.wss.on('error', (error) => {
      console.error('WebSocket AI monitoring server error:', error);
      this.emit('server_error', { error });
    });
  }
  
  /**
   * Setup client event handlers
   */
  private setupClientHandlers(client: WebSocketClient): void {
    client.socket.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        this.handleClientMessage(client, message);
      } catch (error) {
        this.sendError(client, 'Invalid message format', 'MESSAGE_PARSE_ERROR');
      }
    });
    
    client.socket.on('close', (code: number, reason: Buffer) => {
      this.handleClientDisconnect(client, code, reason.toString());
    });
    
    client.socket.on('error', (error: Error) => {
      this.handleClientError(client, error);
    });
    
    client.socket.on('pong', () => {
      // Update client activity on pong response
      const updatedClient = { ...client, lastActivity: Date.now() };
      this.clients.set(client.id, updatedClient);
    });
  }
  
  /**
   * Handle client messages
   */
  private handleClientMessage(client: WebSocketClient, message: WebSocketMessage): void {
    // Update client activity
    const updatedClient = { ...client, lastActivity: Date.now() };
    this.clients.set(client.id, updatedClient);
    
    switch (message.type) {
      case MessageType.AUTH_REQUEST:
        this.handleAuthRequest(updatedClient, message.data);
        break;
        
      case MessageType.SUBSCRIBE:
        this.handleSubscribe(updatedClient, message.data);
        break;
        
      case MessageType.UNSUBSCRIBE:
        this.handleUnsubscribe(updatedClient, message.data);
        break;
        
      default:
        this.sendError(updatedClient, `Unknown message type: ${message.type}`, 'UNKNOWN_MESSAGE_TYPE');
    }
  }
  
  /**
   * Handle authentication request
   */
  private handleAuthRequest(client: WebSocketClient, authData: any): void {
    // For now, implement basic authentication
    // In a full implementation, this would validate tokens/credentials
    const { token, userId, role } = authData;
    
    if (!token && this.config.authRequired) {
      this.sendToClient(client, {
        type: MessageType.AUTH_FAILED,
        timestamp: Date.now(),
        data: { reason: 'Token required' }
      });
      return;
    }
    
    // Simulate authentication
    const authenticatedClient: WebSocketClient = {
      ...client,
      userId: userId || 'anonymous',
      role: role || 'viewer',
      permissions: this.getPermissionsForRole(role || 'viewer'),
      isAuthenticated: true
    };
    
    this.clients.set(client.id, authenticatedClient);
    this.statistics.authenticatedClients = Array.from(this.clients.values())
      .filter(c => c.isAuthenticated).length;
    
    this.sendToClient(authenticatedClient, {
      type: MessageType.AUTH_SUCCESS,
      timestamp: Date.now(),
      data: {
        userId: authenticatedClient.userId,
        role: authenticatedClient.role,
        permissions: authenticatedClient.permissions
      }
    });
    
    console.log(`Client ${client.id} authenticated as ${authenticatedClient.userId}`);
  }
  
  /**
   * Handle subscription request
   */
  private handleSubscribe(client: WebSocketClient, subscriptionData: any): void {
    const { channels } = subscriptionData;
    
    if (!Array.isArray(channels)) {
      this.sendError(client, 'Channels must be an array', 'INVALID_SUBSCRIPTION');
      return;
    }
    
    const validChannels = channels.filter(channel => 
      Object.values(SubscriptionChannel).includes(channel)
    );
    
    if (validChannels.length === 0) {
      this.sendError(client, 'No valid channels specified', 'NO_VALID_CHANNELS');
      return;
    }
    
    // Check permissions for each channel
    const allowedChannels = validChannels.filter(channel => 
      this.hasPermissionForChannel(client, channel)
    );
    
    if (allowedChannels.length === 0) {
      this.sendError(client, 'No permission for requested channels', 'PERMISSION_DENIED');
      return;
    }
    
    // Add subscriptions
    const updatedSubscriptions = new Set(client.subscriptions);
    allowedChannels.forEach(channel => updatedSubscriptions.add(channel));
    
    const updatedClient = { ...client, subscriptions: updatedSubscriptions };
    this.clients.set(client.id, updatedClient);
    
    this.sendToClient(updatedClient, {
      type: MessageType.SUBSCRIPTION_CONFIRMED,
      timestamp: Date.now(),
      data: {
        subscribed: allowedChannels,
        rejected: validChannels.filter(c => !allowedChannels.includes(c))
      }
    });
    
    // Send initial status for subscribed channels
    this.sendInitialStatus(updatedClient, allowedChannels);
  }
  
  /**
   * Handle unsubscribe request
   */
  private handleUnsubscribe(client: WebSocketClient, unsubscribeData: any): void {
    const { channels } = unsubscribeData;
    
    if (!Array.isArray(channels)) {
      this.sendError(client, 'Channels must be an array', 'INVALID_UNSUBSCRIPTION');
      return;
    }
    
    const updatedSubscriptions = new Set(client.subscriptions);
    channels.forEach(channel => updatedSubscriptions.delete(channel));
    
    const updatedClient = { ...client, subscriptions: updatedSubscriptions };
    this.clients.set(client.id, updatedClient);
    
    this.sendToClient(updatedClient, {
      type: MessageType.SUBSCRIPTION_CONFIRMED,
      timestamp: Date.now(),
      data: { unsubscribed: channels }
    });
  }
  
  /**
   * Handle client disconnect
   */
  private handleClientDisconnect(client: WebSocketClient, code: number, reason: string): void {
    this.clients.delete(client.id);
    this.statistics.connectedClients = this.clients.size;
    this.statistics.authenticatedClients = Array.from(this.clients.values())
      .filter(c => c.isAuthenticated).length;
    
    console.log(`WebSocket client disconnected: ${client.id} (code: ${code}, reason: ${reason})`);
    this.emit('client_disconnected', { client, code, reason });
  }
  
  /**
   * Handle client error
   */
  private handleClientError(client: WebSocketClient, error: any): void {
    console.error(`WebSocket client error: ${client.id}`, error);
    this.emit('client_error', { client, error });
    
    // Remove client if socket is in bad state
    if (client.socket.readyState === WebSocket.CLOSED || 
        client.socket.readyState === WebSocket.CLOSING) {
      this.clients.delete(client.id);
    }
  }
  
  /**
   * Send error message to client
   */
  private sendError(client: WebSocketClient, message: string, code: string): void {
    this.sendToClient(client, {
      type: MessageType.ERROR,
      timestamp: Date.now(),
      data: { message, code }
    });
  }
  
  /**
   * Check if client should receive message for channel
   */
  private shouldReceiveMessage(
    client: WebSocketClient, 
    channel: SubscriptionChannel, 
    message: WebSocketMessage
  ): boolean {
    return client.isAuthenticated &&
           client.socket.readyState === WebSocket.OPEN &&
           (client.subscriptions.has(channel) || client.subscriptions.has(SubscriptionChannel.ALL)) &&
           this.hasPermissionForChannel(client, channel);
  }
  
  /**
   * Check if client has permission for channel
   */
  private hasPermissionForChannel(client: WebSocketClient, channel: SubscriptionChannel): boolean {
    // Basic permission check - can be expanded
    switch (channel) {
      case SubscriptionChannel.AUDIT_TRAIL:
        return client.permissions.includes('view_audit_logs');
      case SubscriptionChannel.OVERSIGHT_REQUESTS:
        return client.permissions.includes('manage_oversight') || client.permissions.includes('view_oversight');
      case SubscriptionChannel.SYSTEM_STATUS:
        return client.permissions.includes('view_system_status');
      default:
        return true; // Most channels are accessible to authenticated users
    }
  }
  
  /**
   * Get permissions for role
   */
  private getPermissionsForRole(role: string): string[] {
    switch (role) {
      case 'admin':
        return ['view_audit_logs', 'manage_oversight', 'view_system_status', 'manage_system'];
      case 'supervisor':
        return ['view_audit_logs', 'manage_oversight', 'view_system_status'];
      case 'reviewer':
        return ['view_oversight', 'view_system_status'];
      case 'viewer':
      default:
        return ['view_system_status'];
    }
  }
  
  /**
   * Send initial status for subscribed channels
   */
  private sendInitialStatus(client: WebSocketClient, channels: SubscriptionChannel[]): void {
    for (const channel of channels) {
      switch (channel) {
        case SubscriptionChannel.VERIFICATION_EVENTS:
          this.sendToClient(client, {
            type: MessageType.VERIFICATION_STATUS,
            timestamp: Date.now(),
            data: aiVerificationService.getMonitoringStatus()
          });
          break;
          
        case SubscriptionChannel.EXPLAINABILITY_MONITORING:
          this.sendToClient(client, {
            type: MessageType.EXPLAINABILITY_TREND,
            timestamp: Date.now(),
            data: explainabilityMonitor.getStatus()
          });
          break;
          
        case SubscriptionChannel.OVERSIGHT_REQUESTS:
          this.sendToClient(client, {
            type: MessageType.OVERSIGHT_STATUS,
            timestamp: Date.now(),
            data: humanOversightManager.getStatus()
          });
          break;
      }
    }
  }
  
  /**
   * Setup event listeners for verification services
   */
  private setupEventListeners(): void {
    // AI Verification Service events
    aiVerificationService.on('verification_completed', (event: VerificationEvent) => {
      this.broadcast(SubscriptionChannel.VERIFICATION_EVENTS, {
        type: MessageType.VERIFICATION_EVENT,
        data: event
      });
      this.statistics.totalVerificationEvents++;
    });
    
    aiVerificationService.on('oversight_required', (data) => {
      this.broadcast(SubscriptionChannel.OVERSIGHT_REQUESTS, {
        type: MessageType.OVERSIGHT_REQUEST,
        data
      });
    });
    
    // Explainability Monitor events
    explainabilityMonitor.on('measurement_completed', (measurement: ExplainabilityMeasurement) => {
      this.broadcast(SubscriptionChannel.EXPLAINABILITY_MONITORING, {
        type: MessageType.EXPLAINABILITY_MEASUREMENT,
        data: measurement
      });
    });
    
    explainabilityMonitor.on('threshold_violation', (data) => {
      this.broadcast(SubscriptionChannel.EXPLAINABILITY_MONITORING, {
        type: MessageType.EXPLAINABILITY_ALERT,
        data
      });
    });
    
    // Human Oversight Manager events
    humanOversightManager.on('oversight_requested', (data) => {
      this.broadcast(SubscriptionChannel.OVERSIGHT_REQUESTS, {
        type: MessageType.OVERSIGHT_REQUEST,
        data
      });
      this.statistics.totalOversightRequests++;
    });
    
    humanOversightManager.on('decision_processed', (data) => {
      this.broadcast(SubscriptionChannel.OVERSIGHT_REQUESTS, {
        type: MessageType.OVERSIGHT_DECISION,
        data
      });
    });
  }
  
  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    setInterval(() => {
      if (!this.isRunning) return;
      
      const now = Date.now();
      const staleThreshold = this.config.heartbeatInterval * 2;
      
      for (const [clientId, client] of this.clients.entries()) {
        if (now - client.lastActivity > staleThreshold) {
          console.log(`Removing stale client: ${clientId}`);
          client.socket.close(1001, 'Connection stale');
          this.clients.delete(clientId);
        } else if (client.socket.readyState === WebSocket.OPEN) {
          // Send ping
          client.socket.ping();
        }
      }
      
      this.statistics.connectedClients = this.clients.size;
      this.statistics.authenticatedClients = Array.from(this.clients.values())
        .filter(c => c.isAuthenticated).length;
        
    }, this.config.heartbeatInterval);
  }
  
  /**
   * Start statistics updater
   */
  private startStatisticsUpdater(): void {
    setInterval(() => {
      if (!this.isRunning) return;
      
      // Update system health based on various metrics
      const verificationStatus = aiVerificationService.getMonitoringStatus();
      const explainabilityStatus = explainabilityMonitor.getStatus();
      const oversightStatus = humanOversightManager.getStatus();
      
      this.statistics.systemHealth = verificationStatus.systemHealth === 'critical' ||
                                   !explainabilityStatus.isMonitoring ||
                                   !oversightStatus.isActive ? 'critical' :
                                   verificationStatus.systemHealth === 'degraded' ? 'degraded' : 'healthy';
      
      // Broadcast system status to subscribed clients
      this.broadcast(SubscriptionChannel.SYSTEM_STATUS, {
        type: MessageType.SYSTEM_STATUS,
        data: {
          monitoring: this.statistics,
          verification: verificationStatus,
          explainability: explainabilityStatus,
          oversight: oversightStatus
        }
      });
      
    }, 30000); // Update every 30 seconds
  }
  
  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const webSocketMonitoringService = WebSocketMonitoringService.getInstance();