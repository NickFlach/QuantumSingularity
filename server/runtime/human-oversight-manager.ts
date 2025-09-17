/**
 * SINGULARIS PRIME Human Oversight Manager
 * 
 * This module manages human oversight requirements for AI operations during
 * SINGULARIS PRIME code execution. It handles approval workflows, notifications,
 * timeouts, and escalation procedures for operations requiring human intervention.
 * 
 * Key responsibilities:
 * - Managing human approval workflows
 * - Real-time notification system for oversight requests
 * - Timeout and escalation handling
 * - Audit trail for human decisions
 * - Integration with AI verification service
 * - User role and permission management
 */

import { EventEmitter } from 'events';
import {
  AIEntityId,
  AIContractId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality,
  ComplianceStatus,
  requiresHumanOversight
} from '../../shared/types/ai-types';

// User and role management
export interface HumanOverseer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: OverseerRole;
  readonly permissions: Permission[];
  readonly expertise: ExpertiseArea[];
  readonly isOnline: boolean;
  readonly lastActivity: number;
  readonly responseTime: { // Average response times in minutes
    readonly approval: number;
    readonly rejection: number;
    readonly total: number;
  };
}

export enum OverseerRole {
  JUNIOR_REVIEWER = 'junior_reviewer',
  SENIOR_REVIEWER = 'senior_reviewer',
  AI_SAFETY_EXPERT = 'ai_safety_expert',
  SYSTEM_ADMINISTRATOR = 'system_administrator',
  EMERGENCY_CONTACT = 'emergency_contact'
}

export enum Permission {
  APPROVE_LOW_RISK = 'approve_low_risk',
  APPROVE_MEDIUM_RISK = 'approve_medium_risk',
  APPROVE_HIGH_RISK = 'approve_high_risk',
  APPROVE_CRITICAL = 'approve_critical',
  APPROVE_SAFETY_CRITICAL = 'approve_safety_critical',
  EMERGENCY_OVERRIDE = 'emergency_override',
  MANAGE_USERS = 'manage_users',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  CONFIGURE_SYSTEM = 'configure_system'
}

export enum ExpertiseArea {
  QUANTUM_COMPUTING = 'quantum_computing',
  AI_SAFETY = 'ai_safety',
  MACHINE_LEARNING = 'machine_learning',
  CRYPTOGRAPHY = 'cryptography',
  ETHICS = 'ethics',
  COMPLIANCE = 'compliance',
  SYSTEM_SECURITY = 'system_security'
}

// Oversight request management
export interface OversightRequest {
  readonly id: string;
  readonly timestamp: number;
  readonly operationId: string;
  readonly requestType: RequestType;
  readonly criticality: OperationCriticality;
  readonly requiredLevel: HumanOversightLevel;
  readonly context: OversightContext;
  readonly status: RequestStatus;
  readonly priority: Priority;
  readonly timeoutAt: number;
  readonly assignedTo?: string[];
  readonly escalatedTo?: string[];
  readonly decision?: OversightDecision;
  readonly notifications: NotificationRecord[];
}

export enum RequestType {
  APPROVAL = 'approval',
  REVIEW = 'review',
  EMERGENCY_STOP = 'emergency_stop',
  COMPLIANCE_CHECK = 'compliance_check',
  SAFETY_VALIDATION = 'safety_validation'
}

export enum RequestStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
  EXPIRED = 'expired',
  EMERGENCY_OVERRIDE = 'emergency_override'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  EMERGENCY = 'emergency'
}

export interface OversightContext {
  readonly description: string;
  readonly aiEntityId?: AIEntityId;
  readonly contractId?: AIContractId;
  readonly explainabilityScore: ExplainabilityScore;
  readonly riskAssessment: RiskAssessment;
  readonly codeFragment?: string;
  readonly sourceLocation?: { file: string; line: number; column: number };
  readonly relatedOperations?: string[];
  readonly complianceIssues?: string[];
}

export interface RiskAssessment {
  readonly level: 'low' | 'medium' | 'high' | 'critical';
  readonly factors: RiskFactor[];
  readonly mitigations: string[];
  readonly potentialImpact: string[];
  readonly likelihood: number; // 0.0 - 1.0
}

export interface RiskFactor {
  readonly category: 'safety' | 'security' | 'privacy' | 'ethics' | 'compliance' | 'technical';
  readonly description: string;
  readonly severity: number; // 0.0 - 1.0
  readonly likelihood: number; // 0.0 - 1.0
}

export interface OversightDecision {
  readonly timestamp: number;
  readonly overseerId: string;
  readonly decision: 'approve' | 'reject' | 'request_modifications' | 'escalate';
  readonly reasoning: string;
  readonly conditions?: string[];
  readonly modifications?: Record<string, any>;
  readonly additionalReviewers?: string[];
  readonly followUpRequired?: boolean;
  readonly validityPeriod?: number; // milliseconds
}

// Notification system
export interface NotificationRecord {
  readonly id: string;
  readonly timestamp: number;
  readonly recipientId: string;
  readonly method: NotificationMethod;
  readonly status: 'sent' | 'delivered' | 'read' | 'failed';
  readonly content: NotificationContent;
  readonly responseDeadline?: number;
}

export enum NotificationMethod {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  SLACK = 'slack',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook'
}

export interface NotificationContent {
  readonly subject: string;
  readonly message: string;
  readonly urgency: 'low' | 'medium' | 'high' | 'critical';
  readonly actionRequired: boolean;
  readonly actionUrl?: string;
  readonly attachments?: string[];
}

// Workflow configuration
export interface WorkflowConfig {
  readonly escalationRules: EscalationRule[];
  readonly timeoutSettings: TimeoutSettings;
  readonly notificationSettings: NotificationSettings;
  readonly assignmentRules: AssignmentRule[];
  readonly emergencyProcedures: EmergencyProcedure[];
}

export interface EscalationRule {
  readonly trigger: EscalationTrigger;
  readonly targetRole: OverseerRole;
  readonly timeoutMinutes: number;
  readonly notificationMethod: NotificationMethod[];
}

export interface EscalationTrigger {
  readonly type: 'timeout' | 'rejection' | 'complexity' | 'risk_level' | 'manual';
  readonly threshold?: number;
  readonly conditions?: string[];
}

export interface TimeoutSettings {
  readonly defaultTimeoutMinutes: number;
  readonly timeoutByPriority: Record<Priority, number>;
  readonly timeoutByCriticality: Record<OperationCriticality, number>;
  readonly maxRetries: number;
  readonly retryIntervalMinutes: number;
}

export interface NotificationSettings {
  readonly enabledMethods: NotificationMethod[];
  readonly remindingIntervals: number[]; // minutes
  readonly maxReminders: number;
  readonly urgentContactMethods: NotificationMethod[];
}

export interface AssignmentRule {
  readonly criteria: AssignmentCriteria;
  readonly targetRole: OverseerRole;
  readonly requiredExpertise?: ExpertiseArea[];
  readonly requiredPermissions: Permission[];
  readonly assignmentStrategy: 'round_robin' | 'load_balanced' | 'expertise_based' | 'availability_based';
}

export interface AssignmentCriteria {
  readonly operationType?: string[];
  readonly criticality?: OperationCriticality[];
  readonly explainabilityThreshold?: ExplainabilityScore;
  readonly riskLevel?: string[];
}

export interface EmergencyProcedure {
  readonly id: string;
  readonly name: string;
  readonly triggers: string[];
  readonly actions: EmergencyAction[];
  readonly contacts: string[];
  readonly autoExecute: boolean;
}

export interface EmergencyAction {
  readonly type: 'stop_operation' | 'notify' | 'escalate' | 'fallback' | 'log';
  readonly parameters: Record<string, any>;
  readonly order: number;
}

/**
 * Human Oversight Manager
 */
export class HumanOversightManager extends EventEmitter {
  private static instance: HumanOversightManager | null = null;
  
  // State management
  private isActive: boolean = false;
  private overseers: Map<string, HumanOverseer> = new Map();
  private requests: Map<string, OversightRequest> = new Map();
  private workflows: Map<string, WorkflowConfig> = new Map();
  
  // Configuration
  private readonly defaultConfig: WorkflowConfig = {
    escalationRules: [
      {
        trigger: { type: 'timeout', threshold: 30 },
        targetRole: OverseerRole.SENIOR_REVIEWER,
        timeoutMinutes: 15,
        notificationMethod: [NotificationMethod.EMAIL, NotificationMethod.PUSH]
      },
      {
        trigger: { type: 'risk_level', threshold: 0.8 },
        targetRole: OverseerRole.AI_SAFETY_EXPERT,
        timeoutMinutes: 10,
        notificationMethod: [NotificationMethod.EMAIL, NotificationMethod.SMS]
      }
    ],
    timeoutSettings: {
      defaultTimeoutMinutes: 30,
      timeoutByPriority: {
        [Priority.LOW]: 120,
        [Priority.MEDIUM]: 60,
        [Priority.HIGH]: 30,
        [Priority.URGENT]: 15,
        [Priority.EMERGENCY]: 5
      },
      timeoutByCriticality: {
        [OperationCriticality.LOW]: 120,
        [OperationCriticality.MEDIUM]: 60,
        [OperationCriticality.HIGH]: 30,
        [OperationCriticality.CRITICAL]: 15,
        [OperationCriticality.SAFETY]: 10
      },
      maxRetries: 3,
      retryIntervalMinutes: 10
    },
    notificationSettings: {
      enabledMethods: [NotificationMethod.EMAIL, NotificationMethod.IN_APP],
      remindingIntervals: [5, 15, 30],
      maxReminders: 3,
      urgentContactMethods: [NotificationMethod.EMAIL, NotificationMethod.SMS, NotificationMethod.PUSH]
    },
    assignmentRules: [
      {
        criteria: { criticality: [OperationCriticality.SAFETY] },
        targetRole: OverseerRole.AI_SAFETY_EXPERT,
        requiredExpertise: [ExpertiseArea.AI_SAFETY],
        requiredPermissions: [Permission.APPROVE_SAFETY_CRITICAL],
        assignmentStrategy: 'expertise_based'
      },
      {
        criteria: { criticality: [OperationCriticality.CRITICAL] },
        targetRole: OverseerRole.SENIOR_REVIEWER,
        requiredPermissions: [Permission.APPROVE_CRITICAL],
        assignmentStrategy: 'availability_based'
      }
    ],
    emergencyProcedures: [
      {
        id: 'emergency_stop',
        name: 'Emergency Operation Stop',
        triggers: ['safety_violation', 'critical_failure'],
        actions: [
          { type: 'stop_operation', parameters: {}, order: 1 },
          { type: 'notify', parameters: { role: 'AI_SAFETY_EXPERT' }, order: 2 },
          { type: 'log', parameters: { severity: 'critical' }, order: 3 }
        ],
        contacts: [],
        autoExecute: true
      }
    ]
  };
  
  // Metrics
  private metrics = {
    totalRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    escalatedRequests: 0,
    expiredRequests: 0,
    averageResponseTime: 0,
    activeOverseers: 0
  };
  
  constructor() {
    super();
    this.setupDefaultWorkflow();
    this.setupEventHandlers();
  }
  
  /**
   * Singleton pattern for global access
   */
  public static getInstance(): HumanOversightManager {
    if (!HumanOversightManager.instance) {
      HumanOversightManager.instance = new HumanOversightManager();
    }
    return HumanOversightManager.instance;
  }
  
  /**
   * Start the oversight manager
   */
  public async start(): Promise<void> {
    if (this.isActive) {
      return;
    }
    
    this.isActive = true;
    this.emit('manager_started', { timestamp: Date.now() });
    
    // Start monitoring loops
    this.startTimeoutMonitoring();
    this.startEscalationMonitoring();
    this.startNotificationMonitoring();
    
    console.log('Human Oversight Manager started');
  }
  
  /**
   * Stop the oversight manager
   */
  public async stop(): Promise<void> {
    this.isActive = false;
    this.emit('manager_stopped', { timestamp: Date.now() });
    console.log('Human Oversight Manager stopped');
  }
  
  /**
   * Request human oversight for an operation
   */
  public async requestOversight(
    operationId: string,
    requestType: RequestType,
    criticality: OperationCriticality,
    context: OversightContext,
    requiredLevel: HumanOversightLevel = HumanOversightLevel.APPROVAL
  ): Promise<string> {
    const requestId = `oversight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine priority based on criticality and risk
    const priority = this.determinePriority(criticality, context.riskAssessment);
    
    // Calculate timeout
    const timeoutMinutes = this.calculateTimeout(priority, criticality);
    const timeoutAt = Date.now() + (timeoutMinutes * 60 * 1000);
    
    const request: OversightRequest = {
      id: requestId,
      timestamp: Date.now(),
      operationId,
      requestType,
      criticality,
      requiredLevel,
      context,
      status: RequestStatus.PENDING,
      priority,
      timeoutAt,
      notifications: []
    };
    
    // Store request
    this.requests.set(requestId, request);
    this.metrics.totalRequests++;
    
    // Assign to appropriate overseers
    await this.assignRequest(request);
    
    // Send initial notifications
    await this.sendNotifications(request);
    
    // Emit request event
    this.emit('oversight_requested', { request });
    
    console.log(`Oversight requested: ${requestId} (${priority} priority, timeout: ${timeoutMinutes}min)`);
    
    return requestId;
  }
  
  /**
   * Process an oversight decision
   */
  public async processDecision(
    requestId: string,
    overseerId: string,
    decision: OversightDecision
  ): Promise<boolean> {
    const request = this.requests.get(requestId);
    if (!request || request.status !== RequestStatus.PENDING && request.status !== RequestStatus.IN_REVIEW) {
      return false;
    }
    
    // Verify overseer has permission
    const overseer = this.overseers.get(overseerId);
    if (!overseer || !this.hasPermissionForRequest(overseer, request)) {
      return false;
    }
    
    // Update request status
    const newStatus = decision.decision === 'approve' ? RequestStatus.APPROVED :
                     decision.decision === 'reject' ? RequestStatus.REJECTED :
                     decision.decision === 'escalate' ? RequestStatus.ESCALATED :
                     RequestStatus.IN_REVIEW;
    
    const updatedRequest: OversightRequest = {
      ...request,
      status: newStatus,
      decision
    };
    
    this.requests.set(requestId, updatedRequest);
    
    // Update metrics
    if (newStatus === RequestStatus.APPROVED) {
      this.metrics.approvedRequests++;
    } else if (newStatus === RequestStatus.REJECTED) {
      this.metrics.rejectedRequests++;
    } else if (newStatus === RequestStatus.ESCALATED) {
      this.metrics.escalatedRequests++;
    }
    
    // Update overseer response time
    this.updateOverseerMetrics(overseer, request.timestamp);
    
    // Handle escalation if requested
    if (decision.decision === 'escalate') {
      await this.escalateRequest(updatedRequest, decision.additionalReviewers);
    }
    
    // Send decision notifications
    await this.sendDecisionNotifications(updatedRequest);
    
    // Emit decision event
    this.emit('decision_processed', { request: updatedRequest, overseer, decision });
    
    console.log(`Decision processed: ${requestId} -> ${decision.decision} by ${overseer.name}`);
    
    return true;
  }
  
  /**
   * Register a human overseer
   */
  public registerOverseer(overseer: HumanOverseer): void {
    this.overseers.set(overseer.id, overseer);
    this.metrics.activeOverseers = Array.from(this.overseers.values()).filter(o => o.isOnline).length;
    this.emit('overseer_registered', { overseer });
  }
  
  /**
   * Update overseer status
   */
  public updateOverseerStatus(overseerId: string, isOnline: boolean): void {
    const overseer = this.overseers.get(overseerId);
    if (overseer) {
      const updatedOverseer = { ...overseer, isOnline, lastActivity: Date.now() };
      this.overseers.set(overseerId, updatedOverseer);
      this.metrics.activeOverseers = Array.from(this.overseers.values()).filter(o => o.isOnline).length;
      this.emit('overseer_status_updated', { overseer: updatedOverseer });
    }
  }
  
  /**
   * Get pending requests for an overseer
   */
  public getPendingRequests(overseerId?: string): OversightRequest[] {
    const pendingRequests = Array.from(this.requests.values())
      .filter(r => r.status === RequestStatus.PENDING || r.status === RequestStatus.ASSIGNED);
    
    if (overseerId) {
      return pendingRequests.filter(r => 
        r.assignedTo?.includes(overseerId) || 
        this.canOverseerHandleRequest(overseerId, r)
      );
    }
    
    return pendingRequests.sort((a, b) => {
      const priorityOrder = { emergency: 5, urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  /**
   * Get oversight status and metrics
   */
  public getStatus(): {
    isActive: boolean;
    metrics: typeof this.metrics;
    pendingRequests: number;
    activeOverseers: HumanOverseer[];
    recentDecisions: OversightRequest[];
  } {
    const activeOverseers = Array.from(this.overseers.values()).filter(o => o.isOnline);
    const pendingRequests = this.getPendingRequests().length;
    const recentDecisions = Array.from(this.requests.values())
      .filter(r => r.decision && r.decision.timestamp > Date.now() - 24 * 60 * 60 * 1000)
      .sort((a, b) => (b.decision?.timestamp || 0) - (a.decision?.timestamp || 0))
      .slice(0, 10);
    
    return {
      isActive: this.isActive,
      metrics: { ...this.metrics },
      pendingRequests,
      activeOverseers,
      recentDecisions
    };
  }
  
  /**
   * Execute emergency procedure
   */
  public async executeEmergencyProcedure(
    procedureId: string,
    context: Record<string, any>
  ): Promise<boolean> {
    const procedure = this.defaultConfig.emergencyProcedures.find(p => p.id === procedureId);
    if (!procedure) {
      return false;
    }
    
    console.log(`Executing emergency procedure: ${procedure.name}`);
    
    // Execute actions in order
    const sortedActions = procedure.actions.sort((a, b) => a.order - b.order);
    
    for (const action of sortedActions) {
      try {
        await this.executeEmergencyAction(action, context);
      } catch (error) {
        console.error(`Failed to execute emergency action ${action.type}:`, error);
      }
    }
    
    // Notify emergency contacts
    for (const contactId of procedure.contacts) {
      await this.sendEmergencyNotification(contactId, procedure, context);
    }
    
    this.emit('emergency_procedure_executed', { procedure, context });
    
    return true;
  }
  
  /**
   * Determine priority based on criticality and risk
   */
  private determinePriority(
    criticality: OperationCriticality, 
    riskAssessment: RiskAssessment
  ): Priority {
    if (criticality === OperationCriticality.SAFETY || riskAssessment.level === 'critical') {
      return Priority.EMERGENCY;
    }
    
    if (criticality === OperationCriticality.CRITICAL || riskAssessment.level === 'high') {
      return Priority.URGENT;
    }
    
    if (criticality === OperationCriticality.HIGH || riskAssessment.level === 'medium') {
      return Priority.HIGH;
    }
    
    if (criticality === OperationCriticality.MEDIUM) {
      return Priority.MEDIUM;
    }
    
    return Priority.LOW;
  }
  
  /**
   * Calculate timeout for request
   */
  private calculateTimeout(priority: Priority, criticality: OperationCriticality): number {
    const priorityTimeout = this.defaultConfig.timeoutSettings.timeoutByPriority[priority];
    const criticalityTimeout = this.defaultConfig.timeoutSettings.timeoutByCriticality[criticality];
    
    // Use the shorter timeout
    return Math.min(priorityTimeout, criticalityTimeout);
  }
  
  /**
   * Assign request to appropriate overseers
   */
  private async assignRequest(request: OversightRequest): Promise<void> {
    const config = this.workflows.get('default') || this.defaultConfig;
    
    // Find matching assignment rule
    const rule = config.assignmentRules.find(r => 
      this.matchesAssignmentCriteria(request, r.criteria)
    );
    
    if (!rule) {
      console.warn(`No assignment rule found for request ${request.id}`);
      return;
    }
    
    // Find eligible overseers
    const eligibleOverseers = Array.from(this.overseers.values()).filter(overseer =>
      overseer.role === rule.targetRole &&
      overseer.isOnline &&
      this.hasRequiredPermissions(overseer, rule.requiredPermissions) &&
      this.hasRequiredExpertise(overseer, rule.requiredExpertise || [])
    );
    
    if (eligibleOverseers.length === 0) {
      console.warn(`No eligible overseers found for request ${request.id}`);
      await this.escalateRequest(request);
      return;
    }
    
    // Select overseer based on strategy
    const selectedOverseer = this.selectOverseer(eligibleOverseers, rule.assignmentStrategy);
    
    // Update request
    const updatedRequest = {
      ...request,
      status: RequestStatus.ASSIGNED as const,
      assignedTo: [selectedOverseer.id]
    };
    
    this.requests.set(request.id, updatedRequest);
    
    console.log(`Request ${request.id} assigned to ${selectedOverseer.name}`);
  }
  
  /**
   * Send notifications for request
   */
  private async sendNotifications(request: OversightRequest): Promise<void> {
    if (!request.assignedTo) return;
    
    for (const overseerId of request.assignedTo) {
      const overseer = this.overseers.get(overseerId);
      if (!overseer) continue;
      
      const notificationId = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const notification: NotificationRecord = {
        id: notificationId,
        timestamp: Date.now(),
        recipientId: overseerId,
        method: NotificationMethod.IN_APP, // For now, use in-app notifications
        status: 'sent',
        content: {
          subject: `Oversight Required: ${request.requestType}`,
          message: `A ${request.priority} priority oversight request requires your attention: ${request.context.description}`,
          urgency: request.priority === Priority.EMERGENCY ? 'critical' : 
                  request.priority === Priority.URGENT ? 'high' : 
                  request.priority === Priority.HIGH ? 'medium' : 'low',
          actionRequired: true,
          actionUrl: `/oversight/requests/${request.id}`
        }
      };
      
      // Add notification to request
      const updatedRequest = {
        ...request,
        notifications: [...request.notifications, notification]
      };
      
      this.requests.set(request.id, updatedRequest);
      
      this.emit('notification_sent', { notification, overseer, request });
    }
  }
  
  /**
   * Check if overseer has permission for request
   */
  private hasPermissionForRequest(overseer: HumanOverseer, request: OversightRequest): boolean {
    const requiredPermission = this.getRequiredPermission(request.criticality);
    return overseer.permissions.includes(requiredPermission);
  }
  
  /**
   * Get required permission for criticality level
   */
  private getRequiredPermission(criticality: OperationCriticality): Permission {
    switch (criticality) {
      case OperationCriticality.SAFETY:
        return Permission.APPROVE_SAFETY_CRITICAL;
      case OperationCriticality.CRITICAL:
        return Permission.APPROVE_CRITICAL;
      case OperationCriticality.HIGH:
        return Permission.APPROVE_HIGH_RISK;
      case OperationCriticality.MEDIUM:
        return Permission.APPROVE_MEDIUM_RISK;
      case OperationCriticality.LOW:
      default:
        return Permission.APPROVE_LOW_RISK;
    }
  }
  
  /**
   * Check if overseer can handle a request
   */
  private canOverseerHandleRequest(overseerId: string, request: OversightRequest): boolean {
    const overseer = this.overseers.get(overseerId);
    if (!overseer) return false;
    
    return this.hasPermissionForRequest(overseer, request);
  }
  
  /**
   * Escalate a request
   */
  private async escalateRequest(
    request: OversightRequest, 
    additionalReviewers?: string[]
  ): Promise<void> {
    const updatedRequest = {
      ...request,
      status: RequestStatus.ESCALATED as const,
      escalatedTo: additionalReviewers || []
    };
    
    this.requests.set(request.id, updatedRequest);
    this.metrics.escalatedRequests++;
    
    console.log(`Request ${request.id} escalated`);
    this.emit('request_escalated', { request: updatedRequest });
  }
  
  /**
   * Send decision notifications
   */
  private async sendDecisionNotifications(request: OversightRequest): Promise<void> {
    // Implementation would send notifications about the decision
    this.emit('decision_notifications_sent', { request });
  }
  
  /**
   * Update overseer metrics
   */
  private updateOverseerMetrics(overseer: HumanOverseer, requestTimestamp: number): void {
    const responseTime = (Date.now() - requestTimestamp) / (1000 * 60); // minutes
    
    // Update overseer's response time (simplified)
    const updatedOverseer = {
      ...overseer,
      responseTime: {
        ...overseer.responseTime,
        total: (overseer.responseTime.total + responseTime) / 2
      }
    };
    
    this.overseers.set(overseer.id, updatedOverseer);
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('oversight_requested', ({ request }: { request: OversightRequest }) => {
      console.log(`New oversight request: ${request.id} (${request.priority})`);
    });
    
    this.on('decision_processed', ({ request, decision }: { request: OversightRequest; decision: OversightDecision }) => {
      console.log(`Decision: ${decision.decision} for request ${request.id}`);
    });
  }
  
  /**
   * Setup default workflow
   */
  private setupDefaultWorkflow(): void {
    this.workflows.set('default', this.defaultConfig);
  }
  
  /**
   * Start timeout monitoring
   */
  private startTimeoutMonitoring(): void {
    setInterval(() => {
      if (!this.isActive) return;
      
      const now = Date.now();
      
      for (const [id, request] of this.requests.entries()) {
        if ((request.status === RequestStatus.PENDING || request.status === RequestStatus.ASSIGNED) &&
            request.timeoutAt <= now) {
          
          const expiredRequest = { ...request, status: RequestStatus.EXPIRED as const };
          this.requests.set(id, expiredRequest);
          this.metrics.expiredRequests++;
          
          this.emit('request_expired', { request: expiredRequest });
          console.log(`Request ${id} expired`);
        }
      }
      
    }, 30000); // Check every 30 seconds
  }
  
  /**
   * Start escalation monitoring
   */
  private startEscalationMonitoring(): void {
    setInterval(() => {
      if (!this.isActive) return;
      
      // Check for requests that need escalation
      for (const [id, request] of this.requests.entries()) {
        if (request.status === RequestStatus.PENDING && !request.escalatedTo) {
          const timePending = (Date.now() - request.timestamp) / (1000 * 60); // minutes
          
          // Check escalation rules
          for (const rule of this.defaultConfig.escalationRules) {
            if (this.shouldEscalate(request, rule, timePending)) {
              this.escalateRequest(request);
              break;
            }
          }
        }
      }
      
    }, 60000); // Check every minute
  }
  
  /**
   * Start notification monitoring
   */
  private startNotificationMonitoring(): void {
    setInterval(() => {
      if (!this.isActive) return;
      
      // Send reminders for pending requests
      for (const [id, request] of this.requests.entries()) {
        if (request.status === RequestStatus.PENDING || request.status === RequestStatus.ASSIGNED) {
          // Implementation would send reminder notifications
        }
      }
      
    }, 300000); // Check every 5 minutes
  }
  
  /**
   * Helper methods for assignment rules
   */
  private matchesAssignmentCriteria(request: OversightRequest, criteria: AssignmentCriteria): boolean {
    if (criteria.criticality && !criteria.criticality.includes(request.criticality)) {
      return false;
    }
    
    if (criteria.explainabilityThreshold && request.context.explainabilityScore >= criteria.explainabilityThreshold) {
      return false;
    }
    
    return true;
  }
  
  private hasRequiredPermissions(overseer: HumanOverseer, requiredPermissions: Permission[]): boolean {
    return requiredPermissions.every(permission => overseer.permissions.includes(permission));
  }
  
  private hasRequiredExpertise(overseer: HumanOverseer, requiredExpertise: ExpertiseArea[]): boolean {
    return requiredExpertise.every(expertise => overseer.expertise.includes(expertise));
  }
  
  private selectOverseer(overseers: HumanOverseer[], strategy: string): HumanOverseer {
    // For now, just return the first available overseer
    // In a full implementation, this would implement different selection strategies
    return overseers[0];
  }
  
  private shouldEscalate(request: OversightRequest, rule: EscalationRule, timePending: number): boolean {
    if (rule.trigger.type === 'timeout' && timePending >= rule.timeoutMinutes) {
      return true;
    }
    
    if (rule.trigger.type === 'risk_level' && rule.trigger.threshold) {
      const riskScore = request.context.riskAssessment.factors.reduce((max, factor) => 
        Math.max(max, factor.severity * factor.likelihood), 0);
      return riskScore >= rule.trigger.threshold;
    }
    
    return false;
  }
  
  private async executeEmergencyAction(action: EmergencyAction, context: Record<string, any>): Promise<void> {
    switch (action.type) {
      case 'stop_operation':
        this.emit('emergency_stop_operation', context);
        break;
      case 'notify':
        this.emit('emergency_notification', { ...action.parameters, context });
        break;
      case 'log':
        console.error('Emergency log:', { ...action.parameters, context });
        break;
      // Add other emergency action types as needed
    }
  }
  
  private async sendEmergencyNotification(
    contactId: string, 
    procedure: EmergencyProcedure, 
    context: Record<string, any>
  ): Promise<void> {
    this.emit('emergency_contact_notification', { contactId, procedure, context });
  }
}

// Export singleton instance
export const humanOversightManager = HumanOversightManager.getInstance();