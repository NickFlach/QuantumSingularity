/**
 * AI Verification Runtime Dashboard
 * 
 * Real-time monitoring interface for AI verification system status,
 * oversight requests, and explainability metrics.
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Brain, 
  Shield, 
  Activity,
  Users,
  Zap,
  BarChart3,
  AlertCircle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types for WebSocket messages
interface VerificationStatus {
  isActive: boolean;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  totalVerifications: number;
  passedVerifications: number;
  failedVerifications: number;
  pendingOversight: number;
  averageExplainability: number;
}

interface ExplainabilityMeasurement {
  id: string;
  timestamp: number;
  operationId: string;
  score: number;
  method: string;
  context: {
    sourceLocation?: { line: number; column: number };
    functionName?: string;
    algorithmType?: string;
  };
}

interface OversightRequest {
  id: string;
  timestamp: number;
  operationId: string;
  requestType: string;
  criticality: string;
  status: string;
  priority: string;
  description: string;
  timeoutAt: number;
}

interface SystemMetrics {
  connectedClients: number;
  authenticatedClients: number;
  totalMessages: number;
  totalVerificationEvents: number;
  totalOversightRequests: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
}

export function AIVerificationDashboard() {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isActive: false,
    systemHealth: 'healthy',
    totalVerifications: 0,
    passedVerifications: 0,
    failedVerifications: 0,
    pendingOversight: 0,
    averageExplainability: 0.85
  });
  
  const [explainabilityMeasurements, setExplainabilityMeasurements] = useState<ExplainabilityMeasurement[]>([]);
  const [oversightRequests, setOversightRequests] = useState<OversightRequest[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    connectedClients: 0,
    authenticatedClients: 0,
    totalMessages: 0,
    totalVerificationEvents: 0,
    totalOversightRequests: 0,
    systemHealth: 'healthy'
  });
  
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>>([]);
  
  // WebSocket connection
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // WebSocket connection management
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, []);
  
  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://${window.location.hostname}:${window.location.port}/ws/ai-monitor`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        addAlert('info', 'Connected to AI Verification monitoring service');
        
        // Authenticate and subscribe to channels
        ws.current?.send(JSON.stringify({
          type: 'auth_request',
          timestamp: Date.now(),
          data: {
            token: 'demo_token',
            userId: 'dashboard_user',
            role: 'admin'
          }
        }));
        
        // Subscribe to all channels
        ws.current?.send(JSON.stringify({
          type: 'subscribe',
          timestamp: Date.now(),
          data: {
            channels: ['verification_events', 'explainability_monitoring', 'oversight_requests', 'system_status']
          }
        }));
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.current.onclose = () => {
        setIsConnected(false);
        addAlert('warning', 'Lost connection to monitoring service. Attempting to reconnect...');
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
      
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        addAlert('error', 'WebSocket connection error');
      };
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      addAlert('error', 'Failed to connect to monitoring service');
    }
  };
  
  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'auth_success':
        addAlert('info', 'Successfully authenticated with monitoring service');
        break;
        
      case 'verification_status':
        setVerificationStatus(message.data);
        break;
        
      case 'verification_event':
        addAlert('info', `Verification ${message.data.result.success ? 'passed' : 'failed'} for operation ${message.data.operation.id}`);
        break;
        
      case 'explainability_measurement':
        setExplainabilityMeasurements(prev => [message.data, ...prev.slice(0, 99)]); // Keep last 100
        if (message.data.score < 0.85) {
          addAlert('warning', `Low explainability score (${message.data.score.toFixed(2)}) for operation ${message.data.operationId}`);
        }
        break;
        
      case 'explainability_alert':
        addAlert('error', `Explainability threshold violation: ${message.data.message}`);
        break;
        
      case 'oversight_request':
        setOversightRequests(prev => [message.data.request, ...prev]);
        addAlert('warning', `Human oversight required for ${message.data.request.requestType} operation`);
        break;
        
      case 'oversight_decision':
        setOversightRequests(prev => 
          prev.map(req => 
            req.id === message.data.request.id 
              ? { ...req, status: message.data.request.status }
              : req
          )
        );
        addAlert('info', `Oversight decision: ${message.data.decision.decision} for request ${message.data.request.id}`);
        break;
        
      case 'system_status':
        setSystemMetrics(message.data.monitoring);
        break;
        
      case 'error':
        addAlert('error', message.data.message);
        break;
    }
  };
  
  const addAlert = (type: 'info' | 'warning' | 'error', message: string) => {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now()
    };
    
    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    
    // Auto-remove info alerts after 5 seconds
    if (type === 'info') {
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
      }, 5000);
    }
  };
  
  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'degraded': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <AlertCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'expired': return 'outline';
      default: return 'secondary';
    }
  };
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  const calculateSuccessRate = () => {
    const total = verificationStatus.totalVerifications;
    return total > 0 ? (verificationStatus.passedVerifications / total) * 100 : 100;
  };
  
  return (
    <div className="p-6 space-y-6" data-testid="ai-verification-dashboard">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">AI Verification Runtime</h1>
        <div className="flex items-center space-x-2">
          <div className={cn(
            "flex items-center space-x-2 px-3 py-1 rounded-full text-sm",
            isConnected ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : 
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
      
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="system-health-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {getHealthIcon(verificationStatus.systemHealth)}
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getHealthStatusColor(verificationStatus.systemHealth))}>
              {verificationStatus.systemHealth.charAt(0).toUpperCase() + verificationStatus.systemHealth.slice(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              {verificationStatus.isActive ? 'Verification Active' : 'Verification Inactive'}
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="verification-rate-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateSuccessRate().toFixed(1)}%</div>
            <Progress value={calculateSuccessRate()} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              {verificationStatus.passedVerifications} / {verificationStatus.totalVerifications} passed
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="explainability-score-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Explainability</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationStatus.averageExplainability.toFixed(2)}</div>
            <Progress 
              value={verificationStatus.averageExplainability * 100} 
              className="mt-2"
              // @ts-ignore - Progress component accepts this prop
              indicatorColor={verificationStatus.averageExplainability >= 0.85 ? 'bg-green-500' : 'bg-yellow-500'}
            />
            <p className="text-xs text-muted-foreground">
              Threshold: 0.85
            </p>
          </CardContent>
        </Card>
        
        <Card data-testid="pending-oversight-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Oversight</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationStatus.pendingOversight}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting human approval
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Monitoring Interface */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="explainability" data-testid="tab-explainability">Explainability</TabsTrigger>
          <TabsTrigger value="oversight" data-testid="tab-oversight">Oversight</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Metrics */}
            <Card data-testid="system-metrics-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>System Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Connected Clients</span>
                  <span className="font-medium">{systemMetrics.connectedClients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Verifications</span>
                  <span className="font-medium">{systemMetrics.totalVerificationEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Oversight Requests</span>
                  <span className="font-medium">{systemMetrics.totalOversightRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Messages Sent</span>
                  <span className="font-medium">{systemMetrics.totalMessages}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card data-testid="recent-activity-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  {alerts.slice(0, 10).map((alert) => (
                    <div key={alert.id} className="mb-2 p-2 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <Badge variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'default'}>
                          {alert.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No recent activity
                    </p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="explainability" className="space-y-4">
          <Card data-testid="explainability-measurements-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Explainability Measurements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {explainabilityMeasurements.map((measurement) => (
                  <div key={measurement.id} className="mb-4 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={measurement.score >= 0.85 ? 'default' : 'secondary'}>
                        Score: {measurement.score.toFixed(3)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(measurement.timestamp)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm"><strong>Operation:</strong> {measurement.operationId}</p>
                      <p className="text-sm"><strong>Method:</strong> {measurement.method}</p>
                      {measurement.context.functionName && (
                        <p className="text-sm"><strong>Function:</strong> {measurement.context.functionName}</p>
                      )}
                      {measurement.context.sourceLocation && (
                        <p className="text-sm">
                          <strong>Location:</strong> Line {measurement.context.sourceLocation.line}, Column {measurement.context.sourceLocation.column}
                        </p>
                      )}
                    </div>
                    <Progress 
                      value={measurement.score * 100} 
                      className="mt-2"
                      // @ts-ignore - Progress component accepts this prop
                      indicatorColor={measurement.score >= 0.85 ? 'bg-green-500' : 'bg-yellow-500'}
                    />
                  </div>
                ))}
                {explainabilityMeasurements.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No explainability measurements yet
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="oversight" className="space-y-4">
          <Card data-testid="oversight-requests-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Human Oversight Requests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {oversightRequests.map((request) => (
                  <div key={request.id} className="mb-4 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status}
                        </Badge>
                        <Badge variant="outline">
                          {request.priority}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(request.timestamp)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm"><strong>Operation:</strong> {request.operationId}</p>
                      <p className="text-sm"><strong>Type:</strong> {request.requestType}</p>
                      <p className="text-sm"><strong>Criticality:</strong> {request.criticality}</p>
                      <p className="text-sm"><strong>Description:</strong> {request.description}</p>
                      {request.status === 'pending' && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Timeout: {formatTimestamp(request.timeoutAt)}
                          </span>
                        </div>
                      )}
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="default"
                          data-testid={`approve-request-${request.id}`}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          data-testid={`reject-request-${request.id}`}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {oversightRequests.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No oversight requests
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <Card data-testid="alerts-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {alerts.map((alert) => (
                  <Alert key={alert.id} className={cn(
                    "mb-4",
                    alert.type === 'error' && "border-red-200 dark:border-red-800",
                    alert.type === 'warning' && "border-yellow-200 dark:border-yellow-800"
                  )}>
                    <div className="flex items-center justify-between">
                      <Badge variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'secondary' : 'default'}>
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                    <AlertDescription className="mt-2">
                      {alert.message}
                    </AlertDescription>
                  </Alert>
                ))}
                {alerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No alerts
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}