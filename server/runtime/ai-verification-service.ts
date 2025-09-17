/**
 * SINGULARIS PRIME AI Verification Runtime Service
 * 
 * This module provides real-time verification and monitoring of AI operations
 * during SINGULARIS PRIME code execution. It enforces explainability thresholds,
 * human oversight requirements, and safety constraints at runtime.
 * 
 * Key responsibilities:
 * - Real-time explainability monitoring
 * - Automatic fallback mechanisms for safety violations
 * - Human oversight enforcement
 * - Audit trail generation and compliance tracking
 * - Integration with the interpreter for runtime verification
 */

import { EventEmitter } from 'events';
import {
  AIEntity,
  AIContract,
  AIEntityId,
  AIContractId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality,
  ComplianceStatus,
  ConfidenceLevel,
  AIDecision,
  SafetyRating,
  isHighExplainability,
  requiresHumanOversight,
  isOperationCritical
} from '../../shared/types/ai-types';

import {
  QuantumReferenceId,
  QuantumState,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus
} from '../../shared/types/quantum-types';

import {
  QuantumHandle,
  MemoryCriticality,
  QuantumLifecyclePhase
} from '../../shared/types/quantum-memory-types';

// Import QMM system for integration
import { quantumMemoryManager } from './quantum-memory-manager';
import { entanglementManager } from './entanglement-manager';
import { decoherenceScheduler } from './decoherence-scheduler';

// Verification event types
export interface VerificationEvent {
  readonly timestamp: number;
  readonly eventType: 'explainability_check' | 'oversight_required' | 'safety_violation' | 'fallback_triggered' | 'human_approval_needed';
  readonly operation: VerificationOperation;
  readonly result: VerificationResult;
  readonly aiEntityId?: AIEntityId;
  readonly contractId?: AIContractId;
}

export interface VerificationOperation {
  readonly id: string;
  readonly type: 'ai_contract' | 'model_deployment' | 'decision_point' | 'quantum_operation' | 'quantum_memory' | 'verification_check';
  readonly description: string;
  readonly criticality: OperationCriticality;
  readonly explainabilityRequirement: ExplainabilityScore;
  readonly oversightLevel: HumanOversightLevel;
  readonly context: {
    readonly sourceLocation?: { line: number; column: number };
    readonly codeFragment?: string;
    readonly parameters?: Record<string, any>;
    readonly quantumState?: QuantumReferenceId;
    readonly quantumMemoryOperation?: {
      readonly operation: 'allocation' | 'entanglement' | 'measurement' | 'decoherence' | 'destruction';
      readonly stateIds: QuantumReferenceId[];
      readonly memoryCriticality: MemoryCriticality;
      readonly lifecyclePhase: QuantumLifecyclePhase;
    };
  };
}

export interface VerificationResult {
  readonly success: boolean;
  readonly explainabilityScore: ExplainabilityScore;
  readonly complianceStatus: ComplianceStatus;
  readonly violations: VerificationViolation[];
  readonly fallbackTriggered: boolean;
  readonly humanOversightRequired: boolean;
  readonly auditTrail: AuditEntry[];
}

export interface VerificationViolation {
  readonly type: 'explainability_threshold' | 'human_oversight_missing' | 'safety_constraint' | 'compliance_failure';
  readonly severity: 'warning' | 'error' | 'critical';
  readonly message: string;
  readonly suggestion: string;
  readonly location?: { line: number; column: number };
}

export interface AuditEntry {
  readonly timestamp: number;
  readonly action: string;
  readonly entityId?: AIEntityId;
  readonly userId?: string;
  readonly details: Record<string, any>;
  readonly verificationScore: ExplainabilityScore;
}

// Real-time monitoring status
export interface MonitoringStatus {
  readonly activeOperations: number;
  readonly verificationsPerformed: number;
  readonly violationsDetected: number;
  readonly humanInterventionsRequired: number;
  readonly averageExplainabilityScore: ExplainabilityScore;
  readonly lastViolation?: VerificationViolation;
  readonly systemHealth: 'healthy' | 'degraded' | 'critical';
}

// Human oversight request
export interface OversightRequest {
  readonly id: string;
  readonly timestamp: number;
  readonly operation: VerificationOperation;
  readonly reason: string;
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly status: 'pending' | 'approved' | 'rejected' | 'expired';
  readonly assignedTo?: string;
  readonly response?: OversightResponse;
}

export interface OversightResponse {
  readonly timestamp: number;
  readonly userId: string;
  readonly decision: 'approve' | 'reject' | 'modify';
  readonly reasoning: string;
  readonly modifications?: Record<string, any>;
  readonly additionalConstraints?: string[];
}

/**
 * Core AI Verification Runtime Service
 */
export class AIVerificationService extends EventEmitter {
  private static instance: AIVerificationService | null = null;
  
  // State management
  private isRunning: boolean = false;
  private activeOperations: Map<string, VerificationOperation> = new Map();
  private auditTrail: AuditEntry[] = [];
  private monitoringData: MonitoringStatus;
  private pendingOversightRequests: Map<string, OversightRequest> = new Map();
  
  // Configuration
  private readonly config = {
    explainabilityThreshold: 0.85 as ExplainabilityScore,
    maxOperationsPerSecond: 1000,
    auditRetentionDays: 90,
    oversightTimeoutMinutes: 30,
    enableRealTimeMonitoring: true,
    fallbackOnViolation: true
  };
  
  constructor() {
    super();
    
    this.monitoringData = {
      activeOperations: 0,
      verificationsPerformed: 0,
      violationsDetected: 0,
      humanInterventionsRequired: 0,
      averageExplainabilityScore: 0.85 as ExplainabilityScore,
      systemHealth: 'healthy'
    };
    
    this.setupEventHandlers();
  }
  
  /**
   * Singleton pattern for global access
   */
  public static getInstance(): AIVerificationService {
    if (!AIVerificationService.instance) {
      AIVerificationService.instance = new AIVerificationService();
    }
    return AIVerificationService.instance;
  }
  
  /**
   * Start the verification service
   */
  public async startVerification(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    this.isRunning = true;
    this.emit('service_started', { timestamp: Date.now() });
    
    // Start monitoring loops
    if (this.config.enableRealTimeMonitoring) {
      this.startMonitoringLoop();
    }
    
    // Start oversight request cleanup
    this.startOversightCleanup();
    
    console.log('AI Verification Service started');
  }
  
  /**
   * Stop the verification service
   */
  public async stopVerification(): Promise<void> {
    this.isRunning = false;
    this.emit('service_stopped', { timestamp: Date.now() });
    console.log('AI Verification Service stopped');
  }
  
  /**
   * Verify an AI operation before execution
   */
  public async verifyOperation(operation: VerificationOperation): Promise<VerificationResult> {
    const startTime = Date.now();
    
    try {
      // Track active operation
      this.activeOperations.set(operation.id, operation);
      this.monitoringData.activeOperations = this.activeOperations.size;
      
      // Perform verification checks
      const violations: VerificationViolation[] = [];
      let explainabilityScore = operation.explainabilityRequirement;
      let humanOversightRequired = false;
      let fallbackTriggered = false;
      
      // 1. Explainability threshold check
      if (!isHighExplainability(explainabilityScore)) {
        violations.push({
          type: 'explainability_threshold',
          severity: 'error',
          message: `Operation explainability score ${explainabilityScore} below threshold ${this.config.explainabilityThreshold}`,
          suggestion: 'Increase explainability score or add human oversight',
          location: operation.context.sourceLocation
        });
      }
      
      // 2. Human oversight requirement check
      if (requiresHumanOversight(operation.criticality)) {
        if (operation.oversightLevel === HumanOversightLevel.NONE) {
          violations.push({
            type: 'human_oversight_missing',
            severity: 'critical',
            message: `Critical operation requires human oversight but none configured`,
            suggestion: 'Add human approval or supervision for this operation',
            location: operation.context.sourceLocation
          });
          humanOversightRequired = true;
        }
      }
      
      // 3. Safety constraint validation
      if (operation.criticality === OperationCriticality.SAFETY) {
        // Extra safety checks for safety-critical operations
        if (explainabilityScore < 0.95) {
          violations.push({
            type: 'safety_constraint',
            severity: 'critical',
            message: 'Safety-critical operations require explainability score ≥ 0.95',
            suggestion: 'Improve operation transparency or add additional verification',
            location: operation.context.sourceLocation
          });
        }
      }
      
      // 4. Compliance validation
      const complianceStatus = this.validateCompliance(operation);
      if (complianceStatus !== ComplianceStatus.COMPLIANT) {
        violations.push({
          type: 'compliance_failure',
          severity: 'error',
          message: `Operation does not meet compliance requirements: ${complianceStatus}`,
          suggestion: 'Review and update operation to meet compliance standards',
          location: operation.context.sourceLocation
        });
      }
      
      // Determine if fallback should be triggered
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0 && this.config.fallbackOnViolation) {
        fallbackTriggered = true;
        
        // If human oversight is required, create oversight request
        if (humanOversightRequired) {
          await this.createOversightRequest(operation, criticalViolations);
        }
      }
      
      // Create audit entry
      const auditEntry: AuditEntry = {
        timestamp: Date.now(),
        action: `verify_operation_${operation.type}`,
        details: {
          operationId: operation.id,
          violationsCount: violations.length,
          fallbackTriggered,
          executionTime: Date.now() - startTime
        },
        verificationScore: explainabilityScore
      };
      
      this.auditTrail.push(auditEntry);
      
      // Update monitoring statistics
      this.monitoringData.verificationsPerformed++;
      this.monitoringData.violationsDetected += violations.length;
      if (humanOversightRequired) {
        this.monitoringData.humanInterventionsRequired++;
      }
      
      const result: VerificationResult = {
        success: violations.length === 0 && !fallbackTriggered,
        explainabilityScore,
        complianceStatus,
        violations,
        fallbackTriggered,
        humanOversightRequired,
        auditTrail: [auditEntry]
      };
      
      // Emit verification event
      const event: VerificationEvent = {
        timestamp: Date.now(),
        eventType: violations.length > 0 ? 'safety_violation' : 'explainability_check',
        operation,
        result
      };
      
      this.emit('verification_completed', event);
      
      return result;
      
    } catch (error) {
      // Handle verification errors
      const errorResult: VerificationResult = {
        success: false,
        explainabilityScore: 0.0 as ExplainabilityScore,
        complianceStatus: ComplianceStatus.NON_COMPLIANT,
        violations: [{
          type: 'safety_constraint',
          severity: 'critical',
          message: `Verification failed: ${error instanceof Error ? error.message : String(error)}`,
          suggestion: 'Review operation and retry verification'
        }],
        fallbackTriggered: true,
        humanOversightRequired: true,
        auditTrail: []
      };
      
      this.emit('verification_error', { operation, error: errorResult });
      return errorResult;
      
    } finally {
      // Clean up active operation
      this.activeOperations.delete(operation.id);
      this.monitoringData.activeOperations = this.activeOperations.size;
    }
  }
  
  /**
   * Request human oversight for an operation
   */
  public async createOversightRequest(
    operation: VerificationOperation, 
    violations: VerificationViolation[]
  ): Promise<string> {
    const requestId = `oversight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const priority = operation.criticality === OperationCriticality.SAFETY ? 'urgent' :
                    operation.criticality === OperationCriticality.CRITICAL ? 'high' :
                    operation.criticality === OperationCriticality.HIGH ? 'medium' : 'low';
    
    const request: OversightRequest = {
      id: requestId,
      timestamp: Date.now(),
      operation,
      reason: violations.map(v => v.message).join('; '),
      priority,
      status: 'pending'
    };
    
    this.pendingOversightRequests.set(requestId, request);
    
    // Emit oversight request event
    this.emit('oversight_required', { request, violations });
    
    return requestId;
  }
  
  /**
   * Respond to an oversight request
   */
  public async respondToOversight(
    requestId: string, 
    response: OversightResponse
  ): Promise<boolean> {
    const request = this.pendingOversightRequests.get(requestId);
    if (!request) {
      return false;
    }
    
    const updatedRequest: OversightRequest = {
      ...request,
      status: response.decision === 'approve' ? 'approved' : 'rejected',
      response
    };
    
    this.pendingOversightRequests.set(requestId, updatedRequest);
    
    // Create audit entry
    const auditEntry: AuditEntry = {
      timestamp: Date.now(),
      action: `oversight_${response.decision}`,
      userId: response.userId,
      details: {
        requestId,
        operationId: request.operation.id,
        reasoning: response.reasoning,
        modifications: response.modifications
      },
      verificationScore: request.operation.explainabilityRequirement
    };
    
    this.auditTrail.push(auditEntry);
    
    this.emit('oversight_responded', { request: updatedRequest, response });
    
    return true;
  }
  
  /**
   * Get current monitoring status
   */
  public getMonitoringStatus(): MonitoringStatus {
    // Calculate average explainability score from recent audit entries
    const recentEntries = this.auditTrail.slice(-100);
    const avgScore = recentEntries.length > 0 
      ? recentEntries.reduce((sum, entry) => sum + entry.verificationScore, 0) / recentEntries.length
      : 0.85;
    
    const violationRate = this.monitoringData.verificationsPerformed > 0 
      ? this.monitoringData.violationsDetected / this.monitoringData.verificationsPerformed
      : 0;
    
    const systemHealth = violationRate > 0.5 ? 'critical' :
                        violationRate > 0.2 ? 'degraded' : 'healthy';
    
    return {
      ...this.monitoringData,
      averageExplainabilityScore: avgScore as ExplainabilityScore,
      systemHealth
    };
  }
  
  /**
   * Get pending oversight requests
   */
  public getPendingOversightRequests(): OversightRequest[] {
    return Array.from(this.pendingOversightRequests.values())
      .filter(req => req.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }
  
  /**
   * Get audit trail entries
   */
  public getAuditTrail(limit?: number): AuditEntry[] {
    const entries = [...this.auditTrail].reverse();
    return limit ? entries.slice(0, limit) : entries;
  }

  /**
   * Quantum Memory Management Verification Methods
   */

  /**
   * Verify quantum memory allocation operations
   */
  public async verifyQuantumMemoryAllocation(
    stateIds: QuantumReferenceId[],
    memoryCriticality: MemoryCriticality,
    allocationType: 'qubit' | 'qudit' | 'composite'
  ): Promise<VerificationResult> {
    const operationId = `qmm_alloc_${Date.now()}`;
    
    const operation: VerificationOperation = {
      id: operationId,
      type: 'quantum_memory',
      description: `Quantum memory allocation: ${allocationType} (${stateIds.length} states, ${memoryCriticality} criticality)`,
      criticality: this.mapMemoryCriticalityToOperationCriticality(memoryCriticality),
      explainabilityRequirement: 0.9 as ExplainabilityScore,
      oversightLevel: memoryCriticality === MemoryCriticality.CRITICAL ? 
        HumanOversightLevel.REQUIRED : HumanOversightLevel.OPTIONAL,
      context: {
        quantumMemoryOperation: {
          operation: 'allocation',
          stateIds,
          memoryCriticality,
          lifecyclePhase: QuantumLifecyclePhase.CREATED
        }
      }
    };

    // Check memory pressure and system capacity
    const memoryStatus = quantumMemoryManager.getMemoryStatus();
    const violations: VerificationViolation[] = [];

    if (memoryStatus.totalAllocated / memoryStatus.maxCapacity > 0.85) {
      violations.push({
        type: 'safety_constraint',
        severity: 'warning',
        message: 'Quantum memory usage is approaching capacity limits',
        suggestion: 'Consider garbage collection or state migration before allocation'
      });
    }

    if (memoryCriticality === MemoryCriticality.CRITICAL && violations.length > 0) {
      violations.push({
        type: 'human_oversight_missing',
        severity: 'error',
        message: 'Critical quantum memory allocation requires oversight approval',
        suggestion: 'Request human oversight before proceeding with critical allocation'
      });
    }

    const result: VerificationResult = {
      success: violations.length === 0,
      explainabilityScore: 0.95 as ExplainabilityScore,
      complianceStatus: violations.length === 0 ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT,
      violations,
      fallbackTriggered: false,
      humanOversightRequired: memoryCriticality === MemoryCriticality.CRITICAL,
      auditTrail: [{
        timestamp: Date.now(),
        action: `quantum_memory_allocation_verified`,
        details: { operationId, stateIds, memoryCriticality, allocationType },
        verificationScore: 0.95 as ExplainabilityScore
      }]
    };

    this.logVerificationEvent(operation, result);
    return result;
  }

  /**
   * Verify quantum entanglement operations
   */
  public async verifyQuantumEntanglement(
    stateIds: QuantumReferenceId[],
    entanglementType: 'bell_state' | 'ghz_state' | 'custom'
  ): Promise<VerificationResult> {
    const operationId = `qmm_entangle_${Date.now()}`;
    
    const operation: VerificationOperation = {
      id: operationId,
      type: 'quantum_memory',
      description: `Quantum entanglement creation: ${entanglementType} (${stateIds.length} participants)`,
      criticality: stateIds.length > 3 ? OperationCriticality.HIGH : OperationCriticality.MEDIUM,
      explainabilityRequirement: 0.85 as ExplainabilityScore,
      oversightLevel: stateIds.length > 5 ? HumanOversightLevel.REQUIRED : HumanOversightLevel.OPTIONAL,
      context: {
        quantumMemoryOperation: {
          operation: 'entanglement',
          stateIds,
          memoryCriticality: MemoryCriticality.HIGH,
          lifecyclePhase: QuantumLifecyclePhase.COHERENT
        }
      }
    };

    const violations: VerificationViolation[] = [];

    // Verify all states are valid and coherent
    for (const stateId of stateIds) {
      const memoryNode = quantumMemoryManager.memoryGraph.nodes.get(stateId);
      if (!memoryNode) {
        violations.push({
          type: 'safety_constraint',
          severity: 'error',
          message: `Quantum state ${stateId} not found in memory graph`,
          suggestion: 'Verify state exists before attempting entanglement'
        });
        continue;
      }

      if (memoryNode.state.coherence !== CoherenceStatus.COHERENT) {
        violations.push({
          type: 'safety_constraint',
          severity: 'error',
          message: `Quantum state ${stateId} is not coherent for entanglement`,
          suggestion: 'Only coherent states can participate in entanglement'
        });
      }

      if (memoryNode.state.measurementStatus === MeasurementStatus.MEASURED) {
        violations.push({
          type: 'safety_constraint',
          severity: 'error',
          message: `Quantum state ${stateId} has been measured and cannot be entangled`,
          suggestion: 'Measured states cannot participate in new entanglements'
        });
      }
    }

    const result: VerificationResult = {
      success: violations.length === 0,
      explainabilityScore: 0.9 as ExplainabilityScore,
      complianceStatus: violations.length === 0 ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT,
      violations,
      fallbackTriggered: false,
      humanOversightRequired: stateIds.length > 5,
      auditTrail: [{
        timestamp: Date.now(),
        action: `quantum_entanglement_verified`,
        details: { operationId, stateIds, entanglementType },
        verificationScore: 0.9 as ExplainabilityScore
      }]
    };

    this.logVerificationEvent(operation, result);
    return result;
  }

  /**
   * Verify quantum measurement operations
   */
  public async verifyQuantumMeasurement(
    stateId: QuantumReferenceId,
    measurementBasis: string
  ): Promise<VerificationResult> {
    const operationId = `qmm_measure_${Date.now()}`;
    
    const memoryNode = quantumMemoryManager.memoryGraph.nodes.get(stateId);
    const entanglementGroup = entanglementManager.findGroup(stateId);
    
    const operation: VerificationOperation = {
      id: operationId,
      type: 'quantum_memory',
      description: `Quantum measurement: ${stateId} in ${measurementBasis} basis`,
      criticality: entanglementGroup ? OperationCriticality.HIGH : OperationCriticality.MEDIUM,
      explainabilityRequirement: 0.95 as ExplainabilityScore,
      oversightLevel: entanglementGroup && entanglementGroup.memberIds.size > 2 ? 
        HumanOversightLevel.REQUIRED : HumanOversightLevel.OPTIONAL,
      context: {
        quantumMemoryOperation: {
          operation: 'measurement',
          stateIds: [stateId],
          memoryCriticality: memoryNode?.criticality || MemoryCriticality.NORMAL,
          lifecyclePhase: QuantumLifecyclePhase.COHERENT
        }
      }
    };

    const violations: VerificationViolation[] = [];

    if (!memoryNode) {
      violations.push({
        type: 'safety_constraint',
        severity: 'error',
        message: `Quantum state ${stateId} not found for measurement`,
        suggestion: 'Verify state exists and is accessible'
      });
    } else {
      if (memoryNode.state.measurementStatus === MeasurementStatus.MEASURED) {
        violations.push({
          type: 'safety_constraint',
          severity: 'error',
          message: `Quantum state ${stateId} has already been measured`,
          suggestion: 'States can only be measured once due to quantum mechanics'
        });
      }

      if (memoryNode.state.coherence !== CoherenceStatus.COHERENT) {
        violations.push({
          type: 'safety_constraint',
          severity: 'warning',
          message: `Measuring decoherent state ${stateId} may yield unreliable results`,
          suggestion: 'Consider state preparation before measurement'
        });
      }
    }

    // Check entanglement implications
    if (entanglementGroup && entanglementGroup.memberIds.size > 1) {
      violations.push({
        type: 'explainability_threshold',
        severity: 'warning',
        message: `Measurement will collapse entanglement group ${entanglementGroup.id} affecting ${entanglementGroup.memberIds.size} states`,
        suggestion: 'Document entanglement collapse effects for explainability'
      });
    }

    const result: VerificationResult = {
      success: violations.filter(v => v.severity === 'error').length === 0,
      explainabilityScore: 0.95 as ExplainabilityScore,
      complianceStatus: violations.length === 0 ? ComplianceStatus.COMPLIANT : ComplianceStatus.NON_COMPLIANT,
      violations,
      fallbackTriggered: false,
      humanOversightRequired: entanglementGroup && entanglementGroup.memberIds.size > 2,
      auditTrail: [{
        timestamp: Date.now(),
        action: `quantum_measurement_verified`,
        details: { 
          operationId, 
          stateId, 
          measurementBasis,
          entanglementAffected: entanglementGroup?.memberIds.size || 0
        },
        verificationScore: 0.95 as ExplainabilityScore
      }]
    };

    this.logVerificationEvent(operation, result);
    return result;
  }

  /**
   * Map memory criticality to operation criticality
   */
  private mapMemoryCriticalityToOperationCriticality(memoryCriticality: MemoryCriticality): OperationCriticality {
    switch (memoryCriticality) {
      case MemoryCriticality.CRITICAL:
      case MemoryCriticality.PINNED:
        return OperationCriticality.CRITICAL;
      case MemoryCriticality.HIGH:
        return OperationCriticality.HIGH;
      case MemoryCriticality.NORMAL:
        return OperationCriticality.MEDIUM;
      case MemoryCriticality.LOW:
        return OperationCriticality.LOW;
      default:
        return OperationCriticality.MEDIUM;
    }
  }

  /**
   * Log verification event for quantum memory operations
   */
  private logVerificationEvent(operation: VerificationOperation, result: VerificationResult): void {
    const event: VerificationEvent = {
      timestamp: Date.now(),
      eventType: result.violations.length > 0 ? 'safety_violation' : 'explainability_check',
      operation,
      result
    };

    this.emit('verification_completed', event);
    
    // Update monitoring data
    this.monitoringData.verificationsPerformed++;
    if (result.violations.length > 0) {
      this.monitoringData.violationsDetected++;
    }
    if (result.humanOversightRequired) {
      this.monitoringData.humanInterventionsRequired++;
    }
  }
  
  /**
   * Validate compliance for an operation
   */
  private validateCompliance(operation: VerificationOperation): ComplianceStatus {
    // Basic compliance checks
    if (operation.type === 'ai_contract' || operation.type === 'model_deployment') {
      if (operation.explainabilityRequirement < this.config.explainabilityThreshold) {
        return ComplianceStatus.NON_COMPLIANT;
      }
    }
    
    if (operation.criticality === OperationCriticality.SAFETY) {
      if (operation.oversightLevel === HumanOversightLevel.NONE) {
        return ComplianceStatus.NON_COMPLIANT;
      }
    }
    
    return ComplianceStatus.COMPLIANT;
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('verification_completed', (event: VerificationEvent) => {
      if (event.result.violations.length > 0) {
        console.log(`Verification violations detected for operation ${event.operation.id}:`, 
          event.result.violations.map(v => v.message));
      }
    });
    
    this.on('oversight_required', ({ request }: { request: OversightRequest }) => {
      console.log(`Human oversight required for operation ${request.operation.id}: ${request.reason}`);
    });
  }
  
  /**
   * Start monitoring loop for system health
   */
  private startMonitoringLoop(): void {
    setInterval(() => {
      if (!this.isRunning) return;
      
      // Update system health metrics
      const status = this.getMonitoringStatus();
      
      if (status.systemHealth !== this.monitoringData.systemHealth) {
        this.monitoringData.systemHealth = status.systemHealth;
        this.emit('system_health_changed', { status });
      }
      
      // Clean up old audit entries
      const cutoffTime = Date.now() - (this.config.auditRetentionDays * 24 * 60 * 60 * 1000);
      this.auditTrail = this.auditTrail.filter(entry => entry.timestamp > cutoffTime);
      
    }, 30000); // Run every 30 seconds
  }
  
  /**
   * Start oversight request cleanup
   */
  private startOversightCleanup(): void {
    setInterval(() => {
      if (!this.isRunning) return;
      
      const timeoutMs = this.config.oversightTimeoutMinutes * 60 * 1000;
      const cutoffTime = Date.now() - timeoutMs;
      
      for (const [id, request] of this.pendingOversightRequests.entries()) {
        if (request.status === 'pending' && request.timestamp < cutoffTime) {
          // Mark as expired
          const expiredRequest = { ...request, status: 'expired' as const };
          this.pendingOversightRequests.set(id, expiredRequest);
          
          this.emit('oversight_expired', { request: expiredRequest });
        }
      }
      
    }, 60000); // Run every minute
  }
}

// Export singleton instance
export const aiVerificationService = AIVerificationService.getInstance();