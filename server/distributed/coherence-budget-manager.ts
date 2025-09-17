/**
 * SINGULARIS PRIME Coherence Budget Manager
 * 
 * Time-aware quantum operation scheduling and coherence budget management for
 * distributed quantum networks. Ensures quantum operations are completed within
 * their decoherence windows while optimizing resource allocation across nodes.
 * 
 * Key features:
 * - Dynamic coherence budget allocation based on network conditions
 * - Execution window assignment with deadline management
 * - EPR pair pre-sharing and resource reservation
 * - Adaptive scheduling based on network latency and reliability
 * - Integration with decoherence scheduler and time synchronization
 * - Priority-based resource allocation and deadline enforcement
 * 
 * Core responsibilities:
 * - Allocate coherence budgets for distributed quantum operations
 * - Schedule execution windows with network latency compensation
 * - Coordinate EPR pair pre-sharing across nodes
 * - Monitor and enforce quantum operation deadlines
 * - Optimize resource utilization while maintaining quantum fidelity
 */

import { EventEmitter } from 'events';
import {
  NodeId,
  ChannelId,
  SessionId,
  DistributedOperation,
  DistributedOperationType,
  OperationStatus,
  OperationPriority,
  CoherenceBudget,
  NetworkMetadata,
  ResourceUsage,
  DistributedError,
  DistributedErrorType
} from '../../shared/types/distributed-quantum-types';

import {
  QuantumReferenceId,
  QuantumState,
  CoherenceStatus,
  QuantumPurity
} from '../../shared/types/quantum-types';

import {
  MemoryCriticality,
  GCPriority
} from '../../shared/types/quantum-memory-types';

// Import related services
import { latencyEstimator } from './latency-estimator';
import { timeSynchronizer } from './time-sync';
import { decoherenceScheduler } from '../runtime/decoherence-scheduler';

// =============================================================================
// COHERENCE BUDGET TYPES
// =============================================================================

export interface OperationSchedule {
  readonly operationId: string;
  readonly sessionId: SessionId;
  readonly involvedNodes: ReadonlySet<NodeId>;
  readonly requiredChannels: ReadonlySet<ChannelId>;
  readonly priority: OperationPriority;
  readonly executionWindow: ExecutionWindow;
  readonly coherenceBudget: DetailedCoherenceBudget;
  readonly resourceReservations: ReadonlyMap<NodeId, ResourceReservation>;
  readonly dependencies: ReadonlyArray<string>; // Other operation IDs
  readonly fallbackOptions: ReadonlyArray<FallbackOption>;
  readonly deadlineEnforcement: DeadlineEnforcement;
}

export interface ExecutionWindow {
  readonly windowId: string;
  readonly startTime: number; // Synchronized timestamp in nanoseconds
  readonly endTime: number; // Absolute deadline in nanoseconds
  readonly duration: number; // Total window duration in nanoseconds
  readonly bufferTime: number; // Safety buffer in nanoseconds
  readonly networkLatencyBuffer: number; // Additional buffer for network delays
  readonly isFixed: boolean; // Whether window timing can be adjusted
  readonly coordinationOverhead: number; // Time required for node coordination
}

export interface DetailedCoherenceBudget extends CoherenceBudget {
  readonly operationBudget: number; // Budget allocated to the operation itself
  readonly coordinationBudget: number; // Budget for inter-node coordination
  readonly errorCorrectionBudget: number; // Budget for quantum error correction
  readonly measurementBudget: number; // Budget for quantum measurements
  readonly bufferBudget: number; // Safety buffer for unexpected delays
  readonly nodeAllocation: ReadonlyMap<NodeId, number>; // Per-node budget allocation
}

export interface ResourceReservation {
  readonly nodeId: NodeId;
  readonly reservationId: string;
  readonly resourceType: 'qubits' | 'epr_pairs' | 'classical_bandwidth' | 'compute_cycles';
  readonly quantity: number;
  readonly reservedAt: number;
  readonly expiresAt: number;
  readonly isActive: boolean;
  readonly priority: OperationPriority;
  readonly utilizationRate: number; // 0-1, how much is actually being used
}

export interface FallbackOption {
  readonly optionId: string;
  readonly description: string;
  readonly fallbackType: 'alternative_path' | 'classical_communication' | 'simplified_operation' | 'delay_retry';
  readonly estimatedDelay: number; // Additional time required in nanoseconds
  readonly successProbability: number; // 0-1, likelihood of success
  readonly resourceRequirements: ResourceUsage;
  readonly qualityImpact: number; // 0-1, impact on operation quality/fidelity
}

export interface DeadlineEnforcement {
  readonly hardDeadline: number; // Absolute deadline - operation fails if missed
  readonly softDeadline: number; // Preferred deadline - quality may degrade if missed
  readonly warningThreshold: number; // Time before deadline to issue warnings
  readonly escalationLevels: ReadonlyArray<EscalationLevel>;
  readonly timeoutAction: 'abort' | 'fallback' | 'extend' | 'downgrade';
}

export interface EscalationLevel {
  readonly level: number;
  readonly timeBeforeDeadline: number; // Nanoseconds before deadline
  readonly action: 'notify' | 'reallocate_resources' | 'activate_fallback' | 'abort_operation';
  readonly automated: boolean;
  readonly requiresApproval: boolean;
}

// =============================================================================
// COHERENCE BUDGET ALLOCATOR
// =============================================================================

export class CoherenceBudgetAllocator {
  private readonly globalBudgetPool = new Map<SessionId, GlobalBudgetPool>();
  private readonly nodeBudgetStates = new Map<NodeId, NodeBudgetState>();
  private readonly allocationHistory: BudgetAllocation[] = [];
  
  constructor(
    private readonly defaultBudgetPerOperation: number = 1000000, // 1ms in nanoseconds
    private readonly maxGlobalBudget: number = 10000000 // 10ms total per session
  ) {}

  /**
   * Allocate coherence budget for a distributed operation
   */
  allocateBudget(
    sessionId: SessionId,
    operationId: string,
    operationType: DistributedOperationType,
    involvedNodes: ReadonlySet<NodeId>,
    priority: OperationPriority,
    requirements: BudgetRequirements
  ): BudgetAllocationResult {
    const allocationStart = timeSynchronizer.getCurrentTime();
    
    try {
      // Get or create global budget pool for session
      let globalPool = this.globalBudgetPool.get(sessionId);
      if (!globalPool) {
        globalPool = this.createGlobalBudgetPool(sessionId);
        this.globalBudgetPool.set(sessionId, globalPool);
      }

      // Calculate required budget based on operation type and network conditions
      const requiredBudget = this.calculateRequiredBudget(
        operationType,
        involvedNodes,
        requirements
      );

      // Check if sufficient budget is available
      if (requiredBudget.totalBudget > globalPool.availableBudget) {
        return this.handleInsufficientBudget(sessionId, operationId, requiredBudget, globalPool);
      }

      // Allocate budget from global pool
      const allocation = this.performBudgetAllocation(
        sessionId,
        operationId,
        requiredBudget,
        involvedNodes,
        priority,
        globalPool
      );

      // Update node budget states
      this.updateNodeBudgetStates(allocation);

      // Record allocation history
      const budgetAllocation: BudgetAllocation = {
        allocationId: allocation.budgetId,
        sessionId,
        operationId,
        operationType,
        allocatedBudget: allocation.detailedBudget,
        involvedNodes,
        priority,
        allocatedAt: allocationStart,
        expiresAt: allocationStart + allocation.detailedBudget.totalBudget,
        isActive: true
      };

      this.allocationHistory.push(budgetAllocation);

      return {
        success: true,
        allocation,
        warnings: [],
        alternatives: []
      };

    } catch (error) {
      return {
        success: false,
        allocation: undefined,
        warnings: [],
        alternatives: [],
        error: error instanceof Error ? error.message : 'Unknown budget allocation error'
      };
    }
  }

  /**
   * Release allocated budget back to the pool
   */
  releaseBudget(sessionId: SessionId, allocationId: string, actualUsage: number): void {
    const allocation = this.allocationHistory.find(a => a.allocationId === allocationId);
    if (!allocation || !allocation.isActive) return;

    const globalPool = this.globalBudgetPool.get(sessionId);
    if (!globalPool) return;

    // Calculate unused budget
    const allocatedBudget = allocation.allocatedBudget.totalBudget;
    const unusedBudget = Math.max(0, allocatedBudget - actualUsage);

    // Return unused budget to pool
    const mutablePool = globalPool as any;
    mutablePool.availableBudget += unusedBudget;
    mutablePool.usedBudget -= unusedBudget;

    // Update allocation status
    const mutableAllocation = allocation as any;
    mutableAllocation.isActive = false;
    mutableAllocation.actualUsage = actualUsage;
    mutableAllocation.releasedAt = timeSynchronizer.getCurrentTime();

    // Update node budget states
    for (const nodeId of allocation.involvedNodes) {
      const nodeState = this.nodeBudgetStates.get(nodeId);
      if (nodeState) {
        const nodeAllocation = allocation.allocatedBudget.nodeAllocation.get(nodeId) || 0;
        const nodeUnused = (nodeAllocation / allocatedBudget) * unusedBudget;
        
        const mutableNodeState = nodeState as any;
        mutableNodeState.availableBudget += nodeUnused;
        mutableNodeState.usedBudget -= nodeUnused;
        mutableNodeState.lastUpdate = timeSynchronizer.getCurrentTime();
      }
    }
  }

  /**
   * Get current budget status for a session
   */
  getBudgetStatus(sessionId: SessionId): BudgetStatus | undefined {
    const globalPool = this.globalBudgetPool.get(sessionId);
    if (!globalPool) return undefined;

    const activeAllocations = this.allocationHistory.filter(
      a => a.sessionId === sessionId && a.isActive
    );

    return {
      sessionId,
      totalBudget: globalPool.totalBudget,
      availableBudget: globalPool.availableBudget,
      usedBudget: globalPool.usedBudget,
      reservedBudget: globalPool.reservedBudget,
      activeAllocations: activeAllocations.length,
      utilizationRate: globalPool.usedBudget / globalPool.totalBudget,
      lastUpdate: globalPool.lastUpdate
    };
  }

  /**
   * Optimize budget allocation across active operations
   */
  optimizeBudgetAllocation(sessionId: SessionId): OptimizationResult {
    const globalPool = this.globalBudgetPool.get(sessionId);
    if (!globalPool) {
      return { success: false, improvementAchieved: 0, adjustmentsMade: 0 };
    }

    const activeAllocations = this.allocationHistory.filter(
      a => a.sessionId === sessionId && a.isActive
    );

    let adjustmentsMade = 0;
    let totalImprovement = 0;

    // Rebalance based on actual usage patterns
    for (const allocation of activeAllocations) {
      const currentTime = timeSynchronizer.getCurrentTime();
      const timeElapsed = currentTime - allocation.allocatedAt;
      const expectedUsage = (timeElapsed / allocation.allocatedBudget.totalBudget) * allocation.allocatedBudget.totalBudget;
      
      // If operation is using significantly less budget than allocated, reallocate some
      if (allocation.actualUsage && allocation.actualUsage < expectedUsage * 0.8) {
        const excessBudget = expectedUsage * 0.2;
        this.releaseBudget(sessionId, allocation.allocationId, allocation.actualUsage + excessBudget);
        adjustmentsMade++;
        totalImprovement += excessBudget;
      }
    }

    return {
      success: true,
      improvementAchieved: totalImprovement,
      adjustmentsMade
    };
  }

  // Private helper methods

  private createGlobalBudgetPool(sessionId: SessionId): GlobalBudgetPool {
    return {
      sessionId,
      totalBudget: this.maxGlobalBudget,
      availableBudget: this.maxGlobalBudget,
      usedBudget: 0,
      reservedBudget: 0,
      lastUpdate: timeSynchronizer.getCurrentTime(),
      allocationPolicy: 'priority_based',
      oversubscriptionRatio: 1.2 // Allow 20% oversubscription
    };
  }

  private calculateRequiredBudget(
    operationType: DistributedOperationType,
    involvedNodes: ReadonlySet<NodeId>,
    requirements: BudgetRequirements
  ): RequiredBudget {
    // Base budget based on operation type
    const baseBudget = this.getBaseBudgetForOperation(operationType);
    
    // Network latency overhead
    const networkOverhead = this.calculateNetworkOverhead(involvedNodes);
    
    // Coordination overhead based on number of nodes
    const coordinationOverhead = (involvedNodes.size - 1) * 100000; // 0.1ms per additional node
    
    // Error correction overhead
    const errorCorrectionOverhead = baseBudget * 0.1; // 10% overhead for error correction
    
    // Safety buffer
    const safetyBuffer = baseBudget * 0.2; // 20% safety buffer
    
    const totalBudget = baseBudget + networkOverhead + coordinationOverhead + 
                       errorCorrectionOverhead + safetyBuffer;

    // Calculate per-node allocation
    const nodeAllocation = new Map<NodeId, number>();
    const budgetPerNode = totalBudget / involvedNodes.size;
    
    for (const nodeId of involvedNodes) {
      // Adjust per-node budget based on node capabilities and network distance
      const nodeLatency = this.getNodeLatency(nodeId);
      const nodeBudget = budgetPerNode + nodeLatency * 1000; // Add latency overhead
      nodeAllocation.set(nodeId, nodeBudget);
    }

    return {
      totalBudget,
      operationBudget: baseBudget,
      coordinationBudget: coordinationOverhead,
      errorCorrectionBudget: errorCorrectionOverhead,
      measurementBudget: baseBudget * 0.05, // 5% for measurements
      bufferBudget: safetyBuffer,
      nodeAllocation
    };
  }

  private getBaseBudgetForOperation(operationType: DistributedOperationType): number {
    switch (operationType) {
      case DistributedOperationType.TELEPORTATION:
        return 500000; // 0.5ms for teleportation
      case DistributedOperationType.ENTANGLEMENT_SWAPPING:
        return 300000; // 0.3ms for entanglement swapping
      case DistributedOperationType.DISTRIBUTED_MEASUREMENT:
        return 200000; // 0.2ms for distributed measurement
      case DistributedOperationType.QUANTUM_ERROR_CORRECTION:
        return 800000; // 0.8ms for error correction
      case DistributedOperationType.EPR_GENERATION:
        return 400000; // 0.4ms for EPR generation
      case DistributedOperationType.STATE_MIGRATION:
        return 600000; // 0.6ms for state migration
      case DistributedOperationType.BARRIER_SYNCHRONIZATION:
        return 100000; // 0.1ms for barrier sync
      default:
        return this.defaultBudgetPerOperation;
    }
  }

  private calculateNetworkOverhead(involvedNodes: ReadonlySet<NodeId>): number {
    let totalOverhead = 0;
    
    for (const nodeId of involvedNodes) {
      const latency = this.getNodeLatency(nodeId);
      totalOverhead += latency * 2000; // 2x latency overhead in nanoseconds
    }
    
    return totalOverhead;
  }

  private getNodeLatency(nodeId: NodeId): number {
    // Get latency from latency estimator
    const metrics = latencyEstimator.getLatency('local_node' as NodeId, nodeId);
    return metrics ? metrics.averageLatency * 1000000 : 50000000; // Convert to nanoseconds, default 50ms
  }

  private performBudgetAllocation(
    sessionId: SessionId,
    operationId: string,
    requiredBudget: RequiredBudget,
    involvedNodes: ReadonlySet<NodeId>,
    priority: OperationPriority,
    globalPool: GlobalBudgetPool
  ): BudgetAllocationData {
    const allocationId = `budget_${sessionId}_${operationId}_${Date.now()}`;
    
    // Deduct from global pool
    const mutablePool = globalPool as any;
    mutablePool.availableBudget -= requiredBudget.totalBudget;
    mutablePool.usedBudget += requiredBudget.totalBudget;
    mutablePool.lastUpdate = timeSynchronizer.getCurrentTime();

    // Create detailed budget
    const detailedBudget: DetailedCoherenceBudget = {
      totalBudget: requiredBudget.totalBudget,
      usedBudget: 0,
      remainingBudget: requiredBudget.totalBudget,
      networkOverhead: this.calculateNetworkOverhead(involvedNodes),
      decoherenceRate: 0.01, // 1% per millisecond
      lastUpdate: timeSynchronizer.getCurrentTime(),
      perOperationBudget: requiredBudget.operationBudget / involvedNodes.size,
      operationBudget: requiredBudget.operationBudget,
      coordinationBudget: requiredBudget.coordinationBudget,
      errorCorrectionBudget: requiredBudget.errorCorrectionBudget,
      measurementBudget: requiredBudget.measurementBudget,
      bufferBudget: requiredBudget.bufferBudget,
      nodeAllocation: requiredBudget.nodeAllocation
    };

    return {
      budgetId: allocationId,
      sessionId,
      operationId,
      detailedBudget,
      allocatedAt: timeSynchronizer.getCurrentTime()
    };
  }

  private updateNodeBudgetStates(allocation: BudgetAllocationData): void {
    for (const [nodeId, nodeBudget] of allocation.detailedBudget.nodeAllocation) {
      let nodeState = this.nodeBudgetStates.get(nodeId);
      
      if (!nodeState) {
        nodeState = {
          nodeId,
          totalBudget: 2000000, // 2ms default per node
          availableBudget: 2000000,
          usedBudget: 0,
          reservedBudget: 0,
          activeOperations: 0,
          lastUpdate: timeSynchronizer.getCurrentTime()
        };
        this.nodeBudgetStates.set(nodeId, nodeState);
      }

      // Update node state
      const mutableNodeState = nodeState as any;
      mutableNodeState.availableBudget -= nodeBudget;
      mutableNodeState.usedBudget += nodeBudget;
      mutableNodeState.activeOperations += 1;
      mutableNodeState.lastUpdate = timeSynchronizer.getCurrentTime();
    }
  }

  private handleInsufficientBudget(
    sessionId: SessionId,
    operationId: string,
    requiredBudget: RequiredBudget,
    globalPool: GlobalBudgetPool
  ): BudgetAllocationResult {
    // Calculate deficit
    const deficit = requiredBudget.totalBudget - globalPool.availableBudget;
    
    // Generate alternative options
    const alternatives: AlternativeAllocation[] = [
      {
        description: 'Reduce operation complexity',
        budgetReduction: deficit,
        qualityImpact: 0.1,
        timeExtension: 0
      },
      {
        description: 'Wait for budget to become available',
        budgetReduction: 0,
        qualityImpact: 0,
        timeExtension: this.estimateWaitTime(deficit, globalPool)
      },
      {
        description: 'Use classical fallback',
        budgetReduction: deficit * 0.9,
        qualityImpact: 0.5,
        timeExtension: 100000000 // 100ms classical overhead
      }
    ];

    return {
      success: false,
      allocation: undefined,
      warnings: [`Insufficient budget: ${deficit}ns deficit`],
      alternatives,
      error: `Budget deficit: requested ${requiredBudget.totalBudget}ns, available ${globalPool.availableBudget}ns`
    };
  }

  private estimateWaitTime(deficit: number, globalPool: GlobalBudgetPool): number {
    // Estimate when budget will become available based on current allocations
    const averageOperationTime = 1000000; // 1ms average
    const activeOperations = this.allocationHistory.filter(a => a.isActive).length;
    
    if (activeOperations === 0) return 0;
    
    return (deficit / globalPool.usedBudget) * averageOperationTime;
  }
}

// =============================================================================
// EXECUTION WINDOW SCHEDULER
// =============================================================================

export class ExecutionWindowScheduler extends EventEmitter {
  private readonly activeWindows = new Map<string, OperationSchedule>();
  private readonly windowQueue: OperationSchedule[] = [];
  private readonly budgetAllocator: CoherenceBudgetAllocator;
  
  private isRunning = false;
  private schedulerInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.budgetAllocator = new CoherenceBudgetAllocator();
    this.setupEventHandlers();
  }

  /**
   * Start the execution window scheduler
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.schedulerInterval = setInterval(() => {
      this.processWindowQueue();
      this.checkDeadlines();
    }, 100); // Check every 100ms

    this.emit('scheduler_started', { timestamp: timeSynchronizer.getCurrentTime() });
    console.log('Execution Window Scheduler started');
  }

  /**
   * Stop the execution window scheduler
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }

    this.emit('scheduler_stopped', { timestamp: timeSynchronizer.getCurrentTime() });
    console.log('Execution Window Scheduler stopped');
  }

  /**
   * Schedule a distributed quantum operation
   */
  async scheduleOperation(operation: DistributedOperation): Promise<SchedulingResult> {
    try {
      // Allocate coherence budget
      const budgetResult = this.budgetAllocator.allocateBudget(
        operation.sessionId,
        operation.id,
        operation.type,
        operation.involvedNodes,
        operation.priority,
        this.extractBudgetRequirements(operation)
      );

      if (!budgetResult.success || !budgetResult.allocation) {
        return {
          success: false,
          schedule: undefined,
          error: budgetResult.error || 'Budget allocation failed',
          alternatives: budgetResult.alternatives
        };
      }

      // Calculate execution window
      const executionWindow = this.calculateExecutionWindow(
        operation,
        budgetResult.allocation.detailedBudget
      );

      // Create resource reservations
      const resourceReservations = await this.createResourceReservations(
        operation.involvedNodes,
        operation.requiredChannels,
        executionWindow
      );

      // Generate fallback options
      const fallbackOptions = this.generateFallbackOptions(operation);

      // Create deadline enforcement policy
      const deadlineEnforcement = this.createDeadlineEnforcement(
        operation,
        executionWindow,
        budgetResult.allocation.detailedBudget
      );

      // Create operation schedule
      const schedule: OperationSchedule = {
        operationId: operation.id,
        sessionId: operation.sessionId,
        involvedNodes: operation.involvedNodes,
        requiredChannels: operation.requiredChannels,
        priority: operation.priority,
        executionWindow,
        coherenceBudget: budgetResult.allocation.detailedBudget,
        resourceReservations,
        dependencies: [],
        fallbackOptions,
        deadlineEnforcement
      };

      // Add to active windows
      this.activeWindows.set(operation.id, schedule);
      
      // Schedule decoherence tracking
      this.scheduleDecoherenceTracking(schedule);

      this.emit('operation_scheduled', {
        operationId: operation.id,
        sessionId: operation.sessionId,
        executionWindow,
        timestamp: timeSynchronizer.getCurrentTime()
      });

      return {
        success: true,
        schedule,
        error: undefined,
        alternatives: []
      };

    } catch (error) {
      return {
        success: false,
        schedule: undefined,
        error: error instanceof Error ? error.message : 'Unknown scheduling error',
        alternatives: []
      };
    }
  }

  /**
   * Get current operation schedule
   */
  getOperationSchedule(operationId: string): OperationSchedule | undefined {
    return this.activeWindows.get(operationId);
  }

  /**
   * Cancel a scheduled operation
   */
  cancelOperation(operationId: string): boolean {
    const schedule = this.activeWindows.get(operationId);
    if (!schedule) return false;

    // Release budget
    this.budgetAllocator.releaseBudget(
      schedule.sessionId,
      schedule.coherenceBudget.totalBudget.toString(),
      0 // No actual usage
    );

    // Cancel resource reservations
    this.cancelResourceReservations(schedule.resourceReservations);

    // Remove from active windows
    this.activeWindows.delete(operationId);

    this.emit('operation_cancelled', {
      operationId,
      sessionId: schedule.sessionId,
      timestamp: timeSynchronizer.getCurrentTime()
    });

    return true;
  }

  /**
   * Update operation progress and budget usage
   */
  updateOperationProgress(
    operationId: string,
    usedBudget: number,
    currentPhase: string
  ): void {
    const schedule = this.activeWindows.get(operationId);
    if (!schedule) return;

    // Update coherence budget usage
    const mutableBudget = schedule.coherenceBudget as any;
    mutableBudget.usedBudget = usedBudget;
    mutableBudget.remainingBudget = mutableBudget.totalBudget - usedBudget;
    mutableBudget.lastUpdate = timeSynchronizer.getCurrentTime();

    this.emit('operation_progress', {
      operationId,
      sessionId: schedule.sessionId,
      usedBudget,
      remainingBudget: mutableBudget.remainingBudget,
      currentPhase,
      timestamp: timeSynchronizer.getCurrentTime()
    });
  }

  /**
   * Get scheduler statistics
   */
  getSchedulerStatistics(): SchedulerStatistics {
    const now = timeSynchronizer.getCurrentTime();
    const activeOperations = Array.from(this.activeWindows.values());
    
    let totalBudgetAllocated = 0;
    let totalBudgetUsed = 0;
    let operationsNearDeadline = 0;
    
    for (const schedule of activeOperations) {
      totalBudgetAllocated += schedule.coherenceBudget.totalBudget;
      totalBudgetUsed += schedule.coherenceBudget.usedBudget;
      
      if (now > schedule.deadlineEnforcement.softDeadline) {
        operationsNearDeadline++;
      }
    }

    return {
      activeOperations: activeOperations.length,
      queuedOperations: this.windowQueue.length,
      totalBudgetAllocated,
      totalBudgetUsed,
      budgetUtilization: totalBudgetAllocated > 0 ? totalBudgetUsed / totalBudgetAllocated : 0,
      operationsNearDeadline,
      averageWindowDuration: this.calculateAverageWindowDuration(activeOperations),
      lastUpdate: now
    };
  }

  // Private helper methods

  private extractBudgetRequirements(operation: DistributedOperation): BudgetRequirements {
    return {
      minBudget: 100000, // 0.1ms minimum
      preferredBudget: 500000, // 0.5ms preferred
      maxBudget: 2000000, // 2ms maximum
      priorityBoost: operation.priority === OperationPriority.CRITICAL ? 2.0 : 1.0,
      qualityRequirement: 0.95 // 95% fidelity requirement
    };
  }

  private calculateExecutionWindow(
    operation: DistributedOperation,
    budget: DetailedCoherenceBudget
  ): ExecutionWindow {
    const now = timeSynchronizer.getCurrentTime();
    const networkLatency = this.calculateMaxNetworkLatency(operation.involvedNodes);
    const coordinationOverhead = budget.coordinationBudget;
    
    // Calculate window timing
    const bufferTime = budget.bufferBudget;
    const networkLatencyBuffer = networkLatency * 2000000; // 2x network latency in nanoseconds
    const coordinationOverhead_ns = coordinationOverhead;
    
    const startTime = now + coordinationOverhead_ns;
    const duration = budget.totalBudget - coordinationOverhead_ns - bufferTime;
    const endTime = startTime + duration;

    return {
      windowId: `window_${operation.id}_${Date.now()}`,
      startTime,
      endTime,
      duration,
      bufferTime,
      networkLatencyBuffer,
      isFixed: operation.priority === OperationPriority.CRITICAL,
      coordinationOverhead: coordinationOverhead_ns
    };
  }

  private calculateMaxNetworkLatency(involvedNodes: ReadonlySet<NodeId>): number {
    let maxLatency = 0;
    
    for (const nodeId of involvedNodes) {
      const metrics = latencyEstimator.getLatency('local_node' as NodeId, nodeId);
      if (metrics) {
        maxLatency = Math.max(maxLatency, metrics.averageLatency);
      }
    }
    
    return maxLatency || 50; // Default 50ms if no metrics available
  }

  private async createResourceReservations(
    involvedNodes: ReadonlySet<NodeId>,
    requiredChannels: ReadonlySet<ChannelId>,
    executionWindow: ExecutionWindow
  ): Promise<ReadonlyMap<NodeId, ResourceReservation>> {
    const reservations = new Map<NodeId, ResourceReservation>();
    
    for (const nodeId of involvedNodes) {
      const reservation: ResourceReservation = {
        nodeId,
        reservationId: `reservation_${nodeId}_${Date.now()}`,
        resourceType: 'qubits',
        quantity: 2, // Reserve 2 qubits per node
        reservedAt: timeSynchronizer.getCurrentTime(),
        expiresAt: executionWindow.endTime,
        isActive: true,
        priority: OperationPriority.NORMAL,
        utilizationRate: 0
      };
      
      reservations.set(nodeId, reservation);
    }
    
    return reservations;
  }

  private generateFallbackOptions(operation: DistributedOperation): ReadonlyArray<FallbackOption> {
    const fallbackOptions: FallbackOption[] = [];
    
    // Classical communication fallback
    fallbackOptions.push({
      optionId: `fallback_classical_${operation.id}`,
      description: 'Use classical communication instead of quantum teleportation',
      fallbackType: 'classical_communication',
      estimatedDelay: 100000000, // 100ms for classical
      successProbability: 0.99,
      resourceRequirements: {
        qubits: 0,
        eprPairs: 0,
        networkBandwidth: 1024,
        computeCycles: 1000,
        coherenceTime: 0
      },
      qualityImpact: 0.5 // 50% quality reduction
    });
    
    // Simplified operation fallback
    fallbackOptions.push({
      optionId: `fallback_simplified_${operation.id}`,
      description: 'Perform simplified version of operation',
      fallbackType: 'simplified_operation',
      estimatedDelay: 0,
      successProbability: 0.9,
      resourceRequirements: {
        qubits: 1,
        eprPairs: 0,
        networkBandwidth: 512,
        computeCycles: 500,
        coherenceTime: 100000 // 0.1ms
      },
      qualityImpact: 0.2 // 20% quality reduction
    });
    
    return fallbackOptions;
  }

  private createDeadlineEnforcement(
    operation: DistributedOperation,
    executionWindow: ExecutionWindow,
    budget: DetailedCoherenceBudget
  ): DeadlineEnforcement {
    const hardDeadline = operation.deadline || executionWindow.endTime;
    const softDeadline = hardDeadline - budget.bufferBudget;
    const warningThreshold = softDeadline - (budget.bufferBudget / 2);
    
    const escalationLevels: EscalationLevel[] = [
      {
        level: 1,
        timeBeforeDeadline: budget.bufferBudget,
        action: 'notify',
        automated: true,
        requiresApproval: false
      },
      {
        level: 2,
        timeBeforeDeadline: budget.bufferBudget / 2,
        action: 'reallocate_resources',
        automated: true,
        requiresApproval: false
      },
      {
        level: 3,
        timeBeforeDeadline: budget.bufferBudget / 4,
        action: 'activate_fallback',
        automated: true,
        requiresApproval: operation.priority === OperationPriority.CRITICAL
      }
    ];
    
    return {
      hardDeadline,
      softDeadline,
      warningThreshold,
      escalationLevels,
      timeoutAction: 'fallback'
    };
  }

  private scheduleDecoherenceTracking(schedule: OperationSchedule): void {
    // Schedule decoherence monitoring for all involved quantum states
    for (const nodeId of schedule.involvedNodes) {
      const nodeBudget = schedule.coherenceBudget.nodeAllocation.get(nodeId) || 0;
      decoherenceScheduler.scheduleDecoherence(
        `operation_${schedule.operationId}_${nodeId}` as QuantumReferenceId,
        nodeBudget / 1000 // Convert nanoseconds to microseconds
      );
    }
  }

  private processWindowQueue(): void {
    // Process queued operations and assign execution windows
    while (this.windowQueue.length > 0) {
      const schedule = this.windowQueue.shift()!;
      
      // Check if execution window is still valid
      const now = timeSynchronizer.getCurrentTime();
      if (now < schedule.executionWindow.endTime) {
        this.activeWindows.set(schedule.operationId, schedule);
      }
    }
  }

  private checkDeadlines(): void {
    const now = timeSynchronizer.getCurrentTime();
    
    for (const [operationId, schedule] of this.activeWindows) {
      // Check for deadline violations
      if (now > schedule.deadlineEnforcement.hardDeadline) {
        this.handleDeadlineViolation(operationId, schedule);
      } else if (now > schedule.deadlineEnforcement.warningThreshold) {
        this.handleDeadlineWarning(operationId, schedule);
      }
    }
  }

  private handleDeadlineViolation(operationId: string, schedule: OperationSchedule): void {
    this.emit('deadline_violated', {
      operationId,
      sessionId: schedule.sessionId,
      deadlineType: 'hard',
      violationTime: timeSynchronizer.getCurrentTime() - schedule.deadlineEnforcement.hardDeadline,
      timestamp: timeSynchronizer.getCurrentTime()
    });

    // Execute timeout action
    switch (schedule.deadlineEnforcement.timeoutAction) {
      case 'abort':
        this.cancelOperation(operationId);
        break;
      case 'fallback':
        this.activateFallback(operationId, schedule);
        break;
      case 'extend':
        this.extendDeadline(operationId, schedule);
        break;
      case 'downgrade':
        this.downgradeOperation(operationId, schedule);
        break;
    }
  }

  private handleDeadlineWarning(operationId: string, schedule: OperationSchedule): void {
    this.emit('deadline_warning', {
      operationId,
      sessionId: schedule.sessionId,
      timeToDeadline: schedule.deadlineEnforcement.hardDeadline - timeSynchronizer.getCurrentTime(),
      timestamp: timeSynchronizer.getCurrentTime()
    });
  }

  private activateFallback(operationId: string, schedule: OperationSchedule): void {
    // Activate the first available fallback option
    if (schedule.fallbackOptions.length > 0) {
      const fallback = schedule.fallbackOptions[0];
      
      this.emit('fallback_activated', {
        operationId,
        sessionId: schedule.sessionId,
        fallbackType: fallback.fallbackType,
        estimatedDelay: fallback.estimatedDelay,
        qualityImpact: fallback.qualityImpact,
        timestamp: timeSynchronizer.getCurrentTime()
      });
    }
  }

  private extendDeadline(operationId: string, schedule: OperationSchedule): void {
    // Extend deadline by buffer time
    const extension = schedule.coherenceBudget.bufferBudget;
    const mutableEnforcement = schedule.deadlineEnforcement as any;
    mutableEnforcement.hardDeadline += extension;
    mutableEnforcement.softDeadline += extension;
    
    this.emit('deadline_extended', {
      operationId,
      sessionId: schedule.sessionId,
      extension,
      newDeadline: mutableEnforcement.hardDeadline,
      timestamp: timeSynchronizer.getCurrentTime()
    });
  }

  private downgradeOperation(operationId: string, schedule: OperationSchedule): void {
    // Reduce operation complexity to meet deadline
    this.emit('operation_downgraded', {
      operationId,
      sessionId: schedule.sessionId,
      qualityReduction: 0.2, // 20% quality reduction
      timestamp: timeSynchronizer.getCurrentTime()
    });
  }

  private cancelResourceReservations(reservations: ReadonlyMap<NodeId, ResourceReservation>): void {
    for (const reservation of reservations.values()) {
      // Mark reservation as inactive
      const mutableReservation = reservation as any;
      mutableReservation.isActive = false;
    }
  }

  private calculateAverageWindowDuration(schedules: OperationSchedule[]): number {
    if (schedules.length === 0) return 0;
    
    const totalDuration = schedules.reduce(
      (sum, schedule) => sum + schedule.executionWindow.duration,
      0
    );
    
    return totalDuration / schedules.length;
  }

  private setupEventHandlers(): void {
    this.on('operation_scheduled', (event) => {
      console.log(`Operation scheduled: ${event.operationId} in session ${event.sessionId}`);
    });

    this.on('deadline_violated', (event) => {
      console.warn(`Deadline violated: ${event.operationId}, violation: ${event.violationTime}ns`);
    });

    this.on('fallback_activated', (event) => {
      console.log(`Fallback activated: ${event.operationId}, type: ${event.fallbackType}`);
    });
  }
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface BudgetRequirements {
  readonly minBudget: number;
  readonly preferredBudget: number;
  readonly maxBudget: number;
  readonly priorityBoost: number;
  readonly qualityRequirement: number;
}

interface RequiredBudget {
  readonly totalBudget: number;
  readonly operationBudget: number;
  readonly coordinationBudget: number;
  readonly errorCorrectionBudget: number;
  readonly measurementBudget: number;
  readonly bufferBudget: number;
  readonly nodeAllocation: ReadonlyMap<NodeId, number>;
}

interface GlobalBudgetPool {
  readonly sessionId: SessionId;
  readonly totalBudget: number;
  availableBudget: number;
  usedBudget: number;
  reservedBudget: number;
  lastUpdate: number;
  readonly allocationPolicy: 'priority_based' | 'first_come_first_served' | 'fair_share';
  readonly oversubscriptionRatio: number;
}

interface NodeBudgetState {
  readonly nodeId: NodeId;
  readonly totalBudget: number;
  availableBudget: number;
  usedBudget: number;
  reservedBudget: number;
  activeOperations: number;
  lastUpdate: number;
}

interface BudgetAllocation {
  readonly allocationId: string;
  readonly sessionId: SessionId;
  readonly operationId: string;
  readonly operationType: DistributedOperationType;
  readonly allocatedBudget: DetailedCoherenceBudget;
  readonly involvedNodes: ReadonlySet<NodeId>;
  readonly priority: OperationPriority;
  readonly allocatedAt: number;
  readonly expiresAt: number;
  isActive: boolean;
  actualUsage?: number;
  releasedAt?: number;
}

interface BudgetAllocationData {
  readonly budgetId: string;
  readonly sessionId: SessionId;
  readonly operationId: string;
  readonly detailedBudget: DetailedCoherenceBudget;
  readonly allocatedAt: number;
}

interface BudgetAllocationResult {
  readonly success: boolean;
  readonly allocation?: BudgetAllocationData;
  readonly warnings: ReadonlyArray<string>;
  readonly alternatives: ReadonlyArray<AlternativeAllocation>;
  readonly error?: string;
}

interface AlternativeAllocation {
  readonly description: string;
  readonly budgetReduction: number;
  readonly qualityImpact: number;
  readonly timeExtension: number;
}

interface BudgetStatus {
  readonly sessionId: SessionId;
  readonly totalBudget: number;
  readonly availableBudget: number;
  readonly usedBudget: number;
  readonly reservedBudget: number;
  readonly activeAllocations: number;
  readonly utilizationRate: number;
  readonly lastUpdate: number;
}

interface OptimizationResult {
  readonly success: boolean;
  readonly improvementAchieved: number;
  readonly adjustmentsMade: number;
}

interface SchedulingResult {
  readonly success: boolean;
  readonly schedule?: OperationSchedule;
  readonly error?: string;
  readonly alternatives: ReadonlyArray<AlternativeAllocation>;
}

export interface SchedulerStatistics {
  readonly activeOperations: number;
  readonly queuedOperations: number;
  readonly totalBudgetAllocated: number;
  readonly totalBudgetUsed: number;
  readonly budgetUtilization: number;
  readonly operationsNearDeadline: number;
  readonly averageWindowDuration: number;
  readonly lastUpdate: number;
}

// Export singleton instances
export const coherenceBudgetManager = new CoherenceBudgetAllocator();
export const executionWindowScheduler = new ExecutionWindowScheduler();