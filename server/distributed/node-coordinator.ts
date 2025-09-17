/**
 * SINGULARIS PRIME Distributed Node Coordinator
 * 
 * Multi-node synchronization and fault tolerance for distributed quantum networks.
 * This module provides robust coordination mechanisms to ensure quantum operations
 * complete successfully across multiple nodes with proper error handling and recovery.
 * 
 * Key features:
 * - Barrier synchronization for distributed quantum operations
 * - Quorum-based coordination with Byzantine fault tolerance
 * - Timeout and rollback mechanisms for failed operations
 * - Safe classical fallback for measured quantum results
 * - Re-routing through alternate channels on failures
 * - Leader election and consensus algorithms for coordination
 * - Network partition handling and recovery
 * 
 * Core responsibilities:
 * - Coordinate distributed quantum operations across nodes
 * - Ensure atomic execution of multi-node quantum protocols
 * - Handle node failures and network partitions gracefully
 * - Provide classical fallback mechanisms for reliability
 * - Manage distributed state consistency and synchronization
 * - Monitor and enforce distributed operation deadlines
 * - Implement recovery and rollback procedures
 */

import { EventEmitter } from 'events';
import {
  NodeId,
  ChannelId,
  SessionId,
  DistributedQuantumNode,
  DistributedOperation,
  DistributedOperationType,
  OperationStatus,
  OperationPriority,
  NetworkMetadata,
  ResourceUsage,
  DistributedError,
  DistributedErrorType,
  FallbackStrategy,
  CoherenceBudget
} from '../../shared/types/distributed-quantum-types';

import {
  QuantumReferenceId,
  QuantumState,
  MeasurementResult
} from '../../shared/types/quantum-types';

// Import related services
import { timeSynchronizer } from './time-sync';
import { latencyEstimator } from './latency-estimator';
import { executionWindowScheduler } from './coherence-budget-manager';
import { distributedQuantumMemoryGraph } from '../runtime/distributed-quantum-memory-graph';

// =============================================================================
// NODE COORDINATION TYPES
// =============================================================================

export enum CoordinationProtocol {
  BARRIER_SYNC = 'barrier_sync',
  LEADER_FOLLOWER = 'leader_follower',
  CONSENSUS = 'consensus',
  QUORUM = 'quorum',
  PAXOS = 'paxos',
  RAFT = 'raft',
  QUANTUM_BYZANTINE = 'quantum_byzantine'
}

export interface CoordinationGroup {
  readonly groupId: string;
  readonly sessionId: SessionId;
  readonly coordinatorNode: NodeId; // Leader/coordinator node
  readonly participantNodes: ReadonlySet<NodeId>;
  readonly protocol: CoordinationProtocol;
  readonly quorumSize: number; // Minimum nodes needed for consensus
  readonly timeout: number; // Coordination timeout in nanoseconds
  readonly priority: OperationPriority;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly isActive: boolean;
}

export interface BarrierSynchronization {
  readonly barrierId: string;
  readonly groupId: string;
  readonly requiredParticipants: ReadonlySet<NodeId>;
  readonly arrivedParticipants: ReadonlySet<NodeId>;
  readonly barrierType: 'quantum_operation' | 'measurement' | 'decoherence' | 'cleanup';
  readonly deadline: number; // Absolute deadline in nanoseconds
  readonly timeoutAction: 'abort' | 'partial_proceed' | 'wait_extend' | 'fallback';
  readonly isComplete: boolean;
  readonly completedAt?: number;
  readonly coordinationOverhead: number;
}

export interface QuorumDecision {
  readonly decisionId: string;
  readonly groupId: string;
  readonly proposer: NodeId;
  readonly proposal: CoordinationProposal;
  readonly votes: ReadonlyMap<NodeId, Vote>;
  readonly quorumAchieved: boolean;
  readonly decision: 'accept' | 'reject' | 'timeout' | 'pending';
  readonly decisionTime: number;
  readonly consensusRound: number;
}

export interface CoordinationProposal {
  readonly proposalId: string;
  readonly type: 'operation_execute' | 'fallback_activate' | 'resource_reallocate' | 'timeout_extend';
  readonly operation?: DistributedOperation;
  readonly fallbackStrategy?: FallbackStrategy;
  readonly resourceChanges?: ResourceReallocation;
  readonly timeExtension?: number;
  readonly justification: string;
  readonly urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface Vote {
  readonly voter: NodeId;
  readonly decision: 'accept' | 'reject' | 'abstain';
  readonly timestamp: number;
  readonly reasoning?: string;
  readonly alternativeProposal?: CoordinationProposal;
  readonly confidence: number; // 0-1, confidence in the vote
}

export interface ResourceReallocation {
  readonly fromNode: NodeId;
  readonly toNode: NodeId;
  readonly resourceType: 'qubits' | 'epr_pairs' | 'bandwidth' | 'coherence_budget';
  readonly quantity: number;
  readonly reason: string;
  readonly priority: OperationPriority;
}

export interface NodeFailureDetection {
  readonly nodeId: NodeId;
  readonly detectedAt: number;
  readonly detectorNode: NodeId;
  readonly failureType: 'communication' | 'timeout' | 'corruption' | 'byzantine' | 'crash';
  readonly lastKnownGoodState: number;
  readonly affectedOperations: ReadonlyArray<string>;
  readonly recoveryStrategy: RecoveryStrategy;
  readonly estimatedRecoveryTime: number;
}

export interface RecoveryStrategy {
  readonly type: 'node_replacement' | 'operation_redistribution' | 'classical_fallback' | 'abort_and_retry';
  readonly alternativeNodes: ReadonlyArray<NodeId>;
  readonly fallbackProtocol: FallbackStrategy;
  readonly maxRecoveryAttempts: number;
  readonly successProbability: number;
}

export interface NetworkPartition {
  readonly partitionId: string;
  readonly detectedAt: number;
  readonly partitions: ReadonlyArray<ReadonlySet<NodeId>>;
  readonly isolatedNodes: ReadonlySet<NodeId>;
  readonly affectedSessions: ReadonlyArray<SessionId>;
  readonly healingStrategy: PartitionHealingStrategy;
  readonly isHealed: boolean;
  readonly healedAt?: number;
}

export interface PartitionHealingStrategy {
  readonly type: 'wait_for_healing' | 'force_majority' | 'split_brain_resolution' | 'restart_session';
  readonly majorityPartition?: ReadonlySet<NodeId>;
  readonly timeout: number;
  readonly fallbackActions: ReadonlyArray<string>;
}

// =============================================================================
// DISTRIBUTED NODE COORDINATOR
// =============================================================================

export class DistributedNodeCoordinator extends EventEmitter {
  private readonly coordinationGroups = new Map<string, CoordinationGroup>();
  private readonly activeBarriers = new Map<string, BarrierSynchronization>();
  private readonly pendingDecisions = new Map<string, QuorumDecision>();
  private readonly nodeStates = new Map<NodeId, NodeCoordinationState>();
  private readonly failureDetections = new Map<NodeId, NodeFailureDetection>();
  private readonly networkPartitions = new Map<string, NetworkPartition>();
  
  // Coordination metrics and monitoring
  private coordinationMetrics = {
    successfulBarriers: 0,
    failedBarriers: 0,
    quorumDecisions: 0,
    failureDetections: 0,
    recoveryOperations: 0,
    classicalFallbacks: 0,
    partitionEvents: 0,
    lastReset: Date.now()
  };

  // Configuration
  private readonly config = {
    defaultQuorumSize: 3,
    barrierTimeoutMs: 30000, // 30 second default barrier timeout
    heartbeatIntervalMs: 1000, // 1 second heartbeat
    failureDetectionTimeoutMs: 5000, // 5 second failure detection
    maxRecoveryAttempts: 3,
    consensusTimeoutMs: 10000, // 10 second consensus timeout
    partitionHealingTimeoutMs: 60000, // 1 minute partition healing
    enableByzantineFaultTolerance: true,
    maxConcurrentCoordinations: 50
  };

  private isRunning = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private failureDetectionInterval: NodeJS.Timeout | null = null;

  constructor(private readonly localNodeId: NodeId) {
    super();
    this.initializeLocalNodeState();
    this.setupEventHandlers();
  }

  /**
   * Start the node coordinator service
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // Start heartbeat monitoring
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
      this.checkNodeHealth();
    }, this.config.heartbeatIntervalMs);

    // Start failure detection
    this.failureDetectionInterval = setInterval(() => {
      this.detectNodeFailures();
    }, this.config.failureDetectionTimeoutMs);

    this.emit('coordinator_started', {
      nodeId: this.localNodeId,
      timestamp: timeSynchronizer.getCurrentTime()
    });

    console.log(`Node Coordinator started for node ${this.localNodeId}`);
  }

  /**
   * Stop the node coordinator service
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.failureDetectionInterval) {
      clearInterval(this.failureDetectionInterval);
      this.failureDetectionInterval = null;
    }

    // Clean up active coordinations
    this.cleanupCoordinations();

    this.emit('coordinator_stopped', {
      nodeId: this.localNodeId,
      timestamp: timeSynchronizer.getCurrentTime()
    });

    console.log(`Node Coordinator stopped for node ${this.localNodeId}`);
  }

  /**
   * Create a coordination group for distributed operations
   */
  async createCoordinationGroup(
    sessionId: SessionId,
    participantNodes: ReadonlySet<NodeId>,
    protocol: CoordinationProtocol = CoordinationProtocol.CONSENSUS,
    priority: OperationPriority = OperationPriority.NORMAL
  ): Promise<CoordinationGroupResult> {
    const groupId = `group_${sessionId}_${Date.now()}`;
    const now = timeSynchronizer.getCurrentTime();

    try {
      // Determine quorum size based on protocol and number of participants
      const quorumSize = this.calculateQuorumSize(participantNodes.size, protocol);
      
      // Calculate coordination timeout based on network conditions
      const timeout = this.calculateCoordinationTimeout(participantNodes, priority);

      // Select coordinator node (leader)
      const coordinatorNode = await this.electCoordinator(participantNodes, protocol);

      const coordinationGroup: CoordinationGroup = {
        groupId,
        sessionId,
        coordinatorNode,
        participantNodes,
        protocol,
        quorumSize,
        timeout,
        priority,
        createdAt: now,
        expiresAt: now + timeout,
        isActive: true
      };

      this.coordinationGroups.set(groupId, coordinationGroup);

      // Initialize node states for participants
      await this.initializeParticipantStates(participantNodes, groupId);

      this.emit('coordination_group_created', {
        groupId,
        sessionId,
        participantCount: participantNodes.size,
        coordinator: coordinatorNode,
        protocol,
        timestamp: now
      });

      return {
        success: true,
        groupId,
        coordinationGroup,
        errors: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown coordination group creation error';
      
      return {
        success: false,
        groupId,
        coordinationGroup: undefined,
        errors: [{
          type: 'coordination_failure',
          message: errorMessage,
          timestamp: now,
          affectedNodes: Array.from(participantNodes),
          recoveryAction: 'retry_with_different_protocol'
        }]
      };
    }
  }

  /**
   * Establish a barrier synchronization point
   */
  async establishBarrier(
    groupId: string,
    barrierType: 'quantum_operation' | 'measurement' | 'decoherence' | 'cleanup',
    requiredParticipants: ReadonlySet<NodeId>,
    deadline?: number
  ): Promise<BarrierResult> {
    const group = this.coordinationGroups.get(groupId);
    if (!group) {
      return {
        success: false,
        barrierId: '',
        errors: ['Coordination group not found']
      };
    }

    const barrierId = `barrier_${groupId}_${Date.now()}`;
    const now = timeSynchronizer.getCurrentTime();
    const barrierDeadline = deadline || (now + this.config.barrierTimeoutMs * 1000000);

    try {
      const barrier: BarrierSynchronization = {
        barrierId,
        groupId,
        requiredParticipants,
        arrivedParticipants: new Set(),
        barrierType,
        deadline: barrierDeadline,
        timeoutAction: 'fallback',
        isComplete: false,
        coordinationOverhead: this.calculateCoordinationOverhead(requiredParticipants)
      };

      this.activeBarriers.set(barrierId, barrier);

      // Send barrier establishment message to all participants
      await this.sendBarrierMessage(barrier, 'establish');

      // Start barrier timeout monitoring
      this.monitorBarrierTimeout(barrier);

      this.emit('barrier_established', {
        barrierId,
        groupId,
        barrierType,
        participantCount: requiredParticipants.size,
        deadline: barrierDeadline,
        timestamp: now
      });

      return {
        success: true,
        barrierId,
        errors: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown barrier establishment error';
      
      return {
        success: false,
        barrierId,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Arrive at a barrier synchronization point
   */
  async arriveAtBarrier(
    barrierId: string,
    nodeId: NodeId = this.localNodeId
  ): Promise<BarrierArrivalResult> {
    const barrier = this.activeBarriers.get(barrierId);
    if (!barrier) {
      return {
        success: false,
        allArrived: false,
        errors: ['Barrier not found']
      };
    }

    const now = timeSynchronizer.getCurrentTime();
    
    // Check if barrier has timed out
    if (now > barrier.deadline) {
      return {
        success: false,
        allArrived: false,
        errors: ['Barrier deadline exceeded']
      };
    }

    // Check if node is required participant
    if (!barrier.requiredParticipants.has(nodeId)) {
      return {
        success: false,
        allArrived: false,
        errors: ['Node not a required participant']
      };
    }

    try {
      // Add node to arrived participants
      const mutableBarrier = barrier as any;
      const arrivedSet = new Set(mutableBarrier.arrivedParticipants);
      arrivedSet.add(nodeId);
      mutableBarrier.arrivedParticipants = arrivedSet;

      // Check if all participants have arrived
      const allArrived = arrivedSet.size === barrier.requiredParticipants.size;

      if (allArrived) {
        mutableBarrier.isComplete = true;
        mutableBarrier.completedAt = now;
        
        // Notify all participants that barrier is complete
        await this.sendBarrierMessage(barrier, 'complete');
        
        this.coordinationMetrics.successfulBarriers++;
        
        this.emit('barrier_completed', {
          barrierId,
          groupId: barrier.groupId,
          participantCount: barrier.requiredParticipants.size,
          completionTime: now,
          coordinationOverhead: barrier.coordinationOverhead,
          timestamp: now
        });
      }

      return {
        success: true,
        allArrived,
        waitingFor: allArrived ? new Set() : new Set(
          Array.from(barrier.requiredParticipants).filter(
            participant => !arrivedSet.has(participant)
          )
        ),
        errors: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown barrier arrival error';
      
      return {
        success: false,
        allArrived: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Initiate a quorum-based decision
   */
  async initiateQuorumDecision(
    groupId: string,
    proposal: CoordinationProposal,
    timeoutMs: number = this.config.consensusTimeoutMs
  ): Promise<QuorumDecisionResult> {
    const group = this.coordinationGroups.get(groupId);
    if (!group) {
      return {
        success: false,
        decisionId: '',
        decision: 'reject',
        errors: ['Coordination group not found']
      };
    }

    const decisionId = `decision_${groupId}_${Date.now()}`;
    const now = timeSynchronizer.getCurrentTime();

    try {
      const quorumDecision: QuorumDecision = {
        decisionId,
        groupId,
        proposer: this.localNodeId,
        proposal,
        votes: new Map(),
        quorumAchieved: false,
        decision: 'pending',
        decisionTime: now + timeoutMs * 1000000,
        consensusRound: 1
      };

      this.pendingDecisions.set(decisionId, quorumDecision);

      // Send proposal to all participants
      await this.sendProposalMessage(group, proposal, decisionId);

      // Start consensus timeout monitoring
      this.monitorConsensusTimeout(quorumDecision, timeoutMs);

      this.emit('quorum_decision_initiated', {
        decisionId,
        groupId,
        proposalType: proposal.type,
        proposer: this.localNodeId,
        participantCount: group.participantNodes.size,
        timestamp: now
      });

      return {
        success: true,
        decisionId,
        decision: 'pending',
        errors: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown quorum decision error';
      
      return {
        success: false,
        decisionId,
        decision: 'reject',
        errors: [errorMessage]
      };
    }
  }

  /**
   * Cast a vote in a quorum decision
   */
  async castVote(
    decisionId: string,
    vote: 'accept' | 'reject' | 'abstain',
    reasoning?: string,
    alternativeProposal?: CoordinationProposal
  ): Promise<VoteResult> {
    const decision = this.pendingDecisions.get(decisionId);
    if (!decision) {
      return {
        success: false,
        quorumAchieved: false,
        errors: ['Decision not found']
      };
    }

    const now = timeSynchronizer.getCurrentTime();
    
    // Check if voting period has expired
    if (now > decision.decisionTime) {
      return {
        success: false,
        quorumAchieved: false,
        errors: ['Voting period expired']
      };
    }

    try {
      const nodeVote: Vote = {
        voter: this.localNodeId,
        decision: vote,
        timestamp: now,
        reasoning,
        alternativeProposal,
        confidence: 0.9 // Default confidence
      };

      // Add vote to decision
      const mutableDecision = decision as any;
      const votes = new Map(mutableDecision.votes);
      votes.set(this.localNodeId, nodeVote);
      mutableDecision.votes = votes;

      // Check if quorum is achieved
      const group = this.coordinationGroups.get(decision.groupId);
      if (group) {
        const acceptVotes = Array.from(votes.values()).filter(v => v.decision === 'accept').length;
        const quorumAchieved = acceptVotes >= group.quorumSize;

        if (quorumAchieved && !mutableDecision.quorumAchieved) {
          mutableDecision.quorumAchieved = true;
          mutableDecision.decision = 'accept';
          mutableDecision.decisionTime = now;

          this.coordinationMetrics.quorumDecisions++;

          // Execute the accepted proposal
          await this.executeProposal(decision.proposal, group);

          this.emit('quorum_achieved', {
            decisionId,
            groupId: decision.groupId,
            proposal: decision.proposal,
            acceptVotes,
            totalVotes: votes.size,
            timestamp: now
          });
        }

        return {
          success: true,
          quorumAchieved,
          currentVotes: votes.size,
          requiredVotes: group.quorumSize,
          errors: []
        };
      }

      return {
        success: false,
        quorumAchieved: false,
        errors: ['Coordination group not found']
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown voting error';
      
      return {
        success: false,
        quorumAchieved: false,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Handle node failure and initiate recovery
   */
  async handleNodeFailure(
    failedNodeId: NodeId,
    failureType: 'communication' | 'timeout' | 'corruption' | 'byzantine' | 'crash'
  ): Promise<RecoveryResult> {
    const now = timeSynchronizer.getCurrentTime();
    
    // Check if failure already detected
    if (this.failureDetections.has(failedNodeId)) {
      const existing = this.failureDetections.get(failedNodeId)!;
      return {
        success: true,
        recoveryStrategy: existing.recoveryStrategy,
        estimatedRecoveryTime: existing.estimatedRecoveryTime,
        alternativeNodes: existing.recoveryStrategy.alternativeNodes,
        affectedOperations: existing.affectedOperations
      };
    }

    try {
      // Identify affected operations
      const affectedOperations = this.identifyAffectedOperations(failedNodeId);
      
      // Generate recovery strategy
      const recoveryStrategy = await this.generateRecoveryStrategy(
        failedNodeId,
        failureType,
        affectedOperations
      );

      // Record failure detection
      const failureDetection: NodeFailureDetection = {
        nodeId: failedNodeId,
        detectedAt: now,
        detectorNode: this.localNodeId,
        failureType,
        lastKnownGoodState: this.getLastKnownGoodState(failedNodeId),
        affectedOperations,
        recoveryStrategy,
        estimatedRecoveryTime: this.estimateRecoveryTime(recoveryStrategy)
      };

      this.failureDetections.set(failedNodeId, failureDetection);
      this.coordinationMetrics.failureDetections++;

      // Initiate recovery procedures
      await this.initiateRecovery(failureDetection);

      this.emit('node_failure_detected', {
        failedNode: failedNodeId,
        failureType,
        detectorNode: this.localNodeId,
        affectedOperations: affectedOperations.length,
        recoveryStrategy: recoveryStrategy.type,
        timestamp: now
      });

      return {
        success: true,
        recoveryStrategy,
        estimatedRecoveryTime: failureDetection.estimatedRecoveryTime,
        alternativeNodes: recoveryStrategy.alternativeNodes,
        affectedOperations
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown recovery error';
      
      return {
        success: false,
        recoveryStrategy: {
          type: 'abort_and_retry',
          alternativeNodes: [],
          fallbackProtocol: FallbackStrategy.CLASSICAL,
          maxRecoveryAttempts: 0,
          successProbability: 0
        },
        estimatedRecoveryTime: 0,
        alternativeNodes: [],
        affectedOperations: [],
        error: errorMessage
      };
    }
  }

  /**
   * Activate classical fallback for quantum operations
   */
  async activateClassicalFallback(
    operationId: string,
    quantumResults: ReadonlyMap<QuantumReferenceId, MeasurementResult>,
    fallbackStrategy: FallbackStrategy = FallbackStrategy.CLASSICAL
  ): Promise<ClassicalFallbackResult> {
    const now = timeSynchronizer.getCurrentTime();
    this.coordinationMetrics.classicalFallbacks++;

    try {
      // Convert quantum results to classical data
      const classicalData = this.convertQuantumToClassical(quantumResults);
      
      // Establish classical communication channels
      const classicalChannels = await this.establishClassicalChannels(operationId);
      
      // Transmit classical data with error correction
      const transmissionResult = await this.transmitClassicalData(
        classicalData,
        classicalChannels,
        fallbackStrategy
      );

      // Verify classical data integrity
      const verificationResult = await this.verifyClassicalData(
        transmissionResult.receivedData,
        classicalData
      );

      const success = transmissionResult.success && verificationResult.success;
      
      this.emit('classical_fallback_activated', {
        operationId,
        fallbackStrategy,
        success,
        dataIntegrity: verificationResult.integrity,
        transmissionTime: transmissionResult.duration,
        classicalChannels: classicalChannels.length,
        timestamp: now
      });

      return {
        success,
        classicalData: success ? transmissionResult.receivedData : new Map(),
        fallbackStrategy,
        transmissionTime: transmissionResult.duration,
        dataIntegrity: verificationResult.integrity,
        errors: success ? [] : [
          ...transmissionResult.errors,
          ...verificationResult.errors
        ]
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown classical fallback error';
      
      return {
        success: false,
        classicalData: new Map(),
        fallbackStrategy,
        transmissionTime: 0,
        dataIntegrity: 0,
        errors: [errorMessage]
      };
    }
  }

  /**
   * Get coordination statistics and health metrics
   */
  getCoordinationMetrics(): CoordinationMetrics {
    const now = timeSynchronizer.getCurrentTime();
    const timeSinceReset = (now - this.coordinationMetrics.lastReset) / 1000000000; // Convert to seconds

    return {
      activeCoordinationGroups: this.coordinationGroups.size,
      activeBarriers: this.activeBarriers.size,
      pendingDecisions: this.pendingDecisions.size,
      coordinatedNodes: this.nodeStates.size,
      failedNodes: this.failureDetections.size,
      networkPartitions: this.networkPartitions.size,
      operationMetrics: {
        successfulBarriersPerSecond: timeSinceReset > 0 ? this.coordinationMetrics.successfulBarriers / timeSinceReset : 0,
        failedBarriersPerSecond: timeSinceReset > 0 ? this.coordinationMetrics.failedBarriers / timeSinceReset : 0,
        quorumDecisionsPerSecond: timeSinceReset > 0 ? this.coordinationMetrics.quorumDecisions / timeSinceReset : 0,
        failureDetectionsPerSecond: timeSinceReset > 0 ? this.coordinationMetrics.failureDetections / timeSinceReset : 0,
        classicalFallbacksPerSecond: timeSinceReset > 0 ? this.coordinationMetrics.classicalFallbacks / timeSinceReset : 0
      },
      networkHealth: this.calculateNetworkHealth(),
      coordinationEfficiency: this.calculateCoordinationEfficiency(),
      lastUpdate: now
    };
  }

  // Private helper methods

  private initializeLocalNodeState(): void {
    const now = timeSynchronizer.getCurrentTime();
    
    const localState: NodeCoordinationState = {
      nodeId: this.localNodeId,
      isOnline: true,
      lastHeartbeat: now,
      coordinationLoad: 0,
      participatingGroups: new Set(),
      activeBarriers: new Set(),
      pendingVotes: new Set(),
      networkLatency: 0,
      reliability: 1.0,
      capabilities: {
        maxConcurrentOperations: 10,
        supportedProtocols: [
          CoordinationProtocol.BARRIER_SYNC,
          CoordinationProtocol.CONSENSUS,
          CoordinationProtocol.QUORUM
        ],
        byzantineFaultTolerance: this.config.enableByzantineFaultTolerance,
        classicalFallbackSupport: true
      },
      lastUpdate: now
    };

    this.nodeStates.set(this.localNodeId, localState);
  }

  private calculateQuorumSize(participantCount: number, protocol: CoordinationProtocol): number {
    switch (protocol) {
      case CoordinationProtocol.CONSENSUS:
      case CoordinationProtocol.PAXOS:
      case CoordinationProtocol.RAFT:
        // Simple majority
        return Math.floor(participantCount / 2) + 1;
        
      case CoordinationProtocol.QUANTUM_BYZANTINE:
        // Byzantine fault tolerance: (n-1)/3 < f, so n > 3f+1
        // For f failures, need at least 3f+1 nodes
        return Math.max(Math.floor((participantCount * 2) / 3) + 1, this.config.defaultQuorumSize);
        
      case CoordinationProtocol.QUORUM:
        return Math.min(participantCount, this.config.defaultQuorumSize);
        
      case CoordinationProtocol.BARRIER_SYNC:
        // All participants must arrive at barrier
        return participantCount;
        
      default:
        return Math.min(participantCount, this.config.defaultQuorumSize);
    }
  }

  private calculateCoordinationTimeout(
    participantNodes: ReadonlySet<NodeId>,
    priority: OperationPriority
  ): number {
    // Base timeout
    let timeout = this.config.barrierTimeoutMs * 1000000; // Convert to nanoseconds

    // Adjust for network latency
    let maxLatency = 0;
    for (const nodeId of participantNodes) {
      const metrics = latencyEstimator.getLatency(this.localNodeId, nodeId);
      if (metrics) {
        maxLatency = Math.max(maxLatency, metrics.averageLatency * 1000000); // Convert to nanoseconds
      }
    }

    timeout += maxLatency * 4; // 4x network latency buffer

    // Adjust for priority
    switch (priority) {
      case OperationPriority.CRITICAL:
        timeout *= 0.5; // Reduce timeout for critical operations
        break;
      case OperationPriority.HIGH:
        timeout *= 0.75;
        break;
      case OperationPriority.LOW:
        timeout *= 2.0; // Increase timeout for low priority
        break;
    }

    return Math.max(timeout, 1000000000); // Minimum 1 second
  }

  private async electCoordinator(
    participantNodes: ReadonlySet<NodeId>,
    protocol: CoordinationProtocol
  ): Promise<NodeId> {
    // Simple leader election based on node ID lexicographic ordering
    // In a real implementation, this would use more sophisticated algorithms
    
    const sortedNodes = Array.from(participantNodes).sort();
    
    // Check if any nodes are known to be more reliable
    for (const nodeId of sortedNodes) {
      const nodeState = this.nodeStates.get(nodeId);
      if (nodeState && nodeState.reliability > 0.9) {
        return nodeId;
      }
    }
    
    // Default to first node in sorted order
    return sortedNodes[0];
  }

  private async initializeParticipantStates(
    participantNodes: ReadonlySet<NodeId>,
    groupId: string
  ): Promise<void> {
    for (const nodeId of participantNodes) {
      let nodeState = this.nodeStates.get(nodeId);
      
      if (!nodeState) {
        // Create initial state for unknown node
        nodeState = {
          nodeId,
          isOnline: true,
          lastHeartbeat: timeSynchronizer.getCurrentTime(),
          coordinationLoad: 0,
          participatingGroups: new Set(),
          activeBarriers: new Set(),
          pendingVotes: new Set(),
          networkLatency: 50000000, // Default 50ms
          reliability: 0.8, // Conservative default
          capabilities: {
            maxConcurrentOperations: 5,
            supportedProtocols: [CoordinationProtocol.BARRIER_SYNC],
            byzantineFaultTolerance: false,
            classicalFallbackSupport: true
          },
          lastUpdate: timeSynchronizer.getCurrentTime()
        };
        
        this.nodeStates.set(nodeId, nodeState);
      }

      // Add group to participating groups
      const mutableState = nodeState as any;
      const participatingGroups = new Set(mutableState.participatingGroups);
      participatingGroups.add(groupId);
      mutableState.participatingGroups = participatingGroups;
      mutableState.coordinationLoad += 1;
      mutableState.lastUpdate = timeSynchronizer.getCurrentTime();
    }
  }

  private calculateCoordinationOverhead(requiredParticipants: ReadonlySet<NodeId>): number {
    // Calculate coordination overhead based on network latencies
    let totalOverhead = 0;
    
    for (const nodeId of requiredParticipants) {
      const metrics = latencyEstimator.getLatency(this.localNodeId, nodeId);
      if (metrics) {
        totalOverhead += metrics.averageLatency * 2000000; // Round-trip in nanoseconds
      }
    }
    
    // Add coordination protocol overhead
    const protocolOverhead = requiredParticipants.size * 100000; // 0.1ms per participant
    
    return totalOverhead + protocolOverhead;
  }

  private async sendBarrierMessage(
    barrier: BarrierSynchronization,
    messageType: 'establish' | 'complete'
  ): Promise<void> {
    // Simulate sending barrier messages to participants
    for (const nodeId of barrier.requiredParticipants) {
      if (nodeId !== this.localNodeId) {
        // In a real implementation, this would send actual network messages
        console.log(`Sending barrier ${messageType} message to ${nodeId} for barrier ${barrier.barrierId}`);
      }
    }
  }

  private monitorBarrierTimeout(barrier: BarrierSynchronization): void {
    const timeoutMs = (barrier.deadline - timeSynchronizer.getCurrentTime()) / 1000000;
    
    setTimeout(() => {
      if (!barrier.isComplete) {
        this.handleBarrierTimeout(barrier);
      }
    }, Math.max(timeoutMs, 0));
  }

  private handleBarrierTimeout(barrier: BarrierSynchronization): void {
    this.coordinationMetrics.failedBarriers++;
    
    const mutableBarrier = barrier as any;
    mutableBarrier.isComplete = true;
    mutableBarrier.completedAt = timeSynchronizer.getCurrentTime();

    const waitingNodes = new Set(
      Array.from(barrier.requiredParticipants).filter(
        node => !barrier.arrivedParticipants.has(node)
      )
    );

    this.emit('barrier_timeout', {
      barrierId: barrier.barrierId,
      groupId: barrier.groupId,
      arrivedCount: barrier.arrivedParticipants.size,
      requiredCount: barrier.requiredParticipants.size,
      waitingNodes: Array.from(waitingNodes),
      timeoutAction: barrier.timeoutAction,
      timestamp: timeSynchronizer.getCurrentTime()
    });

    // Execute timeout action
    switch (barrier.timeoutAction) {
      case 'abort':
        this.abortBarrier(barrier);
        break;
      case 'partial_proceed':
        this.proceedWithPartialBarrier(barrier);
        break;
      case 'fallback':
        this.activateBarrierFallback(barrier);
        break;
    }
  }

  private async sendProposalMessage(
    group: CoordinationGroup,
    proposal: CoordinationProposal,
    decisionId: string
  ): Promise<void> {
    // Simulate sending proposal messages to all participants
    for (const nodeId of group.participantNodes) {
      if (nodeId !== this.localNodeId) {
        console.log(`Sending proposal ${proposal.proposalId} to ${nodeId} for decision ${decisionId}`);
      }
    }
  }

  private monitorConsensusTimeout(decision: QuorumDecision, timeoutMs: number): void {
    setTimeout(() => {
      if (decision.decision === 'pending') {
        this.handleConsensusTimeout(decision);
      }
    }, timeoutMs);
  }

  private handleConsensusTimeout(decision: QuorumDecision): void {
    const mutableDecision = decision as any;
    mutableDecision.decision = 'timeout';
    mutableDecision.decisionTime = timeSynchronizer.getCurrentTime();

    this.emit('consensus_timeout', {
      decisionId: decision.decisionId,
      groupId: decision.groupId,
      proposal: decision.proposal,
      votesReceived: decision.votes.size,
      quorumRequired: this.coordinationGroups.get(decision.groupId)?.quorumSize || 0,
      timestamp: timeSynchronizer.getCurrentTime()
    });
  }

  private async executeProposal(
    proposal: CoordinationProposal,
    group: CoordinationGroup
  ): Promise<void> {
    switch (proposal.type) {
      case 'operation_execute':
        if (proposal.operation) {
          await this.executeDistributedOperation(proposal.operation);
        }
        break;
        
      case 'fallback_activate':
        if (proposal.fallbackStrategy) {
          await this.activateGroupFallback(group, proposal.fallbackStrategy);
        }
        break;
        
      case 'resource_reallocate':
        if (proposal.resourceChanges) {
          await this.reallocateResources(proposal.resourceChanges);
        }
        break;
        
      case 'timeout_extend':
        if (proposal.timeExtension) {
          await this.extendGroupTimeout(group, proposal.timeExtension);
        }
        break;
    }
  }

  private identifyAffectedOperations(failedNodeId: NodeId): string[] {
    const affectedOperations: string[] = [];
    
    // Check coordination groups
    for (const [groupId, group] of this.coordinationGroups) {
      if (group.participantNodes.has(failedNodeId)) {
        affectedOperations.push(groupId);
      }
    }
    
    // Check active barriers
    for (const [barrierId, barrier] of this.activeBarriers) {
      if (barrier.requiredParticipants.has(failedNodeId)) {
        affectedOperations.push(barrierId);
      }
    }
    
    return affectedOperations;
  }

  private async generateRecoveryStrategy(
    failedNodeId: NodeId,
    failureType: string,
    affectedOperations: string[]
  ): Promise<RecoveryStrategy> {
    // Identify potential replacement nodes
    const alternativeNodes = Array.from(this.nodeStates.keys()).filter(
      nodeId => nodeId !== failedNodeId && this.nodeStates.get(nodeId)?.isOnline
    );

    switch (failureType) {
      case 'communication':
      case 'timeout':
        return {
          type: 'node_replacement',
          alternativeNodes: alternativeNodes.slice(0, 3), // Top 3 alternatives
          fallbackProtocol: FallbackStrategy.ALTERNATIVE_PATH,
          maxRecoveryAttempts: this.config.maxRecoveryAttempts,
          successProbability: 0.8
        };
        
      case 'byzantine':
      case 'corruption':
        return {
          type: 'operation_redistribution',
          alternativeNodes: alternativeNodes.filter(nodeId => {
            const state = this.nodeStates.get(nodeId);
            return state?.capabilities.byzantineFaultTolerance;
          }),
          fallbackProtocol: FallbackStrategy.CLASSICAL,
          maxRecoveryAttempts: 1,
          successProbability: 0.6
        };
        
      case 'crash':
      default:
        return {
          type: 'classical_fallback',
          alternativeNodes: alternativeNodes,
          fallbackProtocol: FallbackStrategy.CLASSICAL,
          maxRecoveryAttempts: 2,
          successProbability: 0.9
        };
    }
  }

  private getLastKnownGoodState(nodeId: NodeId): number {
    const nodeState = this.nodeStates.get(nodeId);
    return nodeState?.lastHeartbeat || 0;
  }

  private estimateRecoveryTime(strategy: RecoveryStrategy): number {
    // Estimate recovery time based on strategy type
    switch (strategy.type) {
      case 'node_replacement':
        return 5000000000; // 5 seconds in nanoseconds
      case 'operation_redistribution':
        return 10000000000; // 10 seconds
      case 'classical_fallback':
        return 2000000000; // 2 seconds
      case 'abort_and_retry':
        return 15000000000; // 15 seconds
      default:
        return 5000000000;
    }
  }

  private async initiateRecovery(detection: NodeFailureDetection): Promise<void> {
    this.coordinationMetrics.recoveryOperations++;
    
    switch (detection.recoveryStrategy.type) {
      case 'node_replacement':
        await this.replaceFailedNode(detection);
        break;
      case 'operation_redistribution':
        await this.redistributeOperations(detection);
        break;
      case 'classical_fallback':
        await this.activateRecoveryFallback(detection);
        break;
      case 'abort_and_retry':
        await this.abortAndRetryOperations(detection);
        break;
    }
  }

  private convertQuantumToClassical(
    quantumResults: ReadonlyMap<QuantumReferenceId, MeasurementResult>
  ): Map<string, ClassicalData> {
    const classicalData = new Map<string, ClassicalData>();
    
    for (const [stateId, result] of quantumResults) {
      classicalData.set(stateId, {
        value: result.outcome === 'measured' ? result.value : null,
        probability: result.probability,
        timestamp: result.timestamp,
        fidelity: result.fidelity || 1.0
      });
    }
    
    return classicalData;
  }

  private async establishClassicalChannels(operationId: string): Promise<ClassicalChannel[]> {
    // Simulate establishing classical communication channels
    return [
      {
        channelId: `classical_${operationId}_1`,
        type: 'tcp',
        bandwidth: 1000000, // 1 Mbps
        latency: 50, // 50ms
        reliability: 0.99
      }
    ];
  }

  private async transmitClassicalData(
    data: Map<string, ClassicalData>,
    channels: ClassicalChannel[],
    strategy: FallbackStrategy
  ): Promise<ClassicalTransmissionResult> {
    const transmissionStart = timeSynchronizer.getCurrentTime();
    
    // Simulate classical data transmission
    const success = Math.random() > 0.05; // 95% success rate
    const duration = 100000000; // 100ms transmission time
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success,
      receivedData: success ? new Map(data) : new Map(),
      duration,
      errors: success ? [] : ['Transmission failed']
    };
  }

  private async verifyClassicalData(
    receivedData: Map<string, ClassicalData>,
    originalData: Map<string, ClassicalData>
  ): Promise<ClassicalVerificationResult> {
    let matches = 0;
    let total = 0;
    
    for (const [key, originalValue] of originalData) {
      total++;
      const receivedValue = receivedData.get(key);
      if (receivedValue && this.dataMatches(originalValue, receivedValue)) {
        matches++;
      }
    }
    
    const integrity = total > 0 ? matches / total : 0;
    
    return {
      success: integrity > 0.95,
      integrity,
      errors: integrity < 0.95 ? ['Data integrity check failed'] : []
    };
  }

  private dataMatches(original: ClassicalData, received: ClassicalData): boolean {
    return original.value === received.value && 
           Math.abs(original.probability - received.probability) < 0.01;
  }

  private sendHeartbeat(): void {
    const now = timeSynchronizer.getCurrentTime();
    const localState = this.nodeStates.get(this.localNodeId);
    
    if (localState) {
      const mutableState = localState as any;
      mutableState.lastHeartbeat = now;
      mutableState.lastUpdate = now;
    }

    // In a real implementation, this would send heartbeat messages to other nodes
  }

  private checkNodeHealth(): void {
    const now = timeSynchronizer.getCurrentTime();
    const healthTimeout = this.config.failureDetectionTimeoutMs * 1000000; // Convert to nanoseconds
    
    for (const [nodeId, nodeState] of this.nodeStates) {
      if (nodeId === this.localNodeId) continue;
      
      const timeSinceHeartbeat = now - nodeState.lastHeartbeat;
      if (timeSinceHeartbeat > healthTimeout && nodeState.isOnline) {
        // Mark node as offline and initiate failure handling
        const mutableState = nodeState as any;
        mutableState.isOnline = false;
        
        this.handleNodeFailure(nodeId, 'timeout');
      }
    }
  }

  private detectNodeFailures(): void {
    // Additional failure detection logic beyond heartbeat monitoring
    // This could include network connectivity tests, Byzantine behavior detection, etc.
  }

  private cleanupCoordinations(): void {
    // Clean up all active coordinations when stopping
    for (const [groupId, group] of this.coordinationGroups) {
      if (group.isActive) {
        const mutableGroup = group as any;
        mutableGroup.isActive = false;
      }
    }
    
    for (const [barrierId, barrier] of this.activeBarriers) {
      if (!barrier.isComplete) {
        const mutableBarrier = barrier as any;
        mutableBarrier.isComplete = true;
        mutableBarrier.completedAt = timeSynchronizer.getCurrentTime();
      }
    }
  }

  private calculateNetworkHealth(): number {
    const onlineNodes = Array.from(this.nodeStates.values()).filter(state => state.isOnline).length;
    const totalNodes = this.nodeStates.size;
    
    if (totalNodes === 0) return 1.0;
    
    const nodeHealth = onlineNodes / totalNodes;
    const partitionPenalty = this.networkPartitions.size * 0.1;
    
    return Math.max(0, Math.min(1, nodeHealth - partitionPenalty));
  }

  private calculateCoordinationEfficiency(): number {
    const totalBarriers = this.coordinationMetrics.successfulBarriers + this.coordinationMetrics.failedBarriers;
    if (totalBarriers === 0) return 1.0;
    
    const successRate = this.coordinationMetrics.successfulBarriers / totalBarriers;
    const fallbackPenalty = this.coordinationMetrics.classicalFallbacks * 0.02; // 2% penalty per fallback
    
    return Math.max(0, Math.min(1, successRate - fallbackPenalty));
  }

  private setupEventHandlers(): void {
    this.on('barrier_completed', (event) => {
      console.log(`Barrier completed: ${event.barrierId} with ${event.participantCount} participants`);
    });

    this.on('node_failure_detected', (event) => {
      console.warn(`Node failure detected: ${event.failedNode} (${event.failureType}) affecting ${event.affectedOperations} operations`);
    });

    this.on('classical_fallback_activated', (event) => {
      console.log(`Classical fallback activated for operation ${event.operationId} with ${event.dataIntegrity}% integrity`);
    });
  }

  // Placeholder implementations for referenced methods
  private async abortBarrier(barrier: BarrierSynchronization): Promise<void> {
    console.log(`Aborting barrier ${barrier.barrierId}`);
  }

  private async proceedWithPartialBarrier(barrier: BarrierSynchronization): Promise<void> {
    console.log(`Proceeding with partial barrier ${barrier.barrierId}`);
  }

  private async activateBarrierFallback(barrier: BarrierSynchronization): Promise<void> {
    console.log(`Activating fallback for barrier ${barrier.barrierId}`);
  }

  private async executeDistributedOperation(operation: DistributedOperation): Promise<void> {
    console.log(`Executing distributed operation ${operation.id}`);
  }

  private async activateGroupFallback(group: CoordinationGroup, strategy: FallbackStrategy): Promise<void> {
    console.log(`Activating group fallback for ${group.groupId} with strategy ${strategy}`);
  }

  private async reallocateResources(changes: ResourceReallocation): Promise<void> {
    console.log(`Reallocating ${changes.quantity} ${changes.resourceType} from ${changes.fromNode} to ${changes.toNode}`);
  }

  private async extendGroupTimeout(group: CoordinationGroup, extension: number): Promise<void> {
    console.log(`Extending timeout for group ${group.groupId} by ${extension}ns`);
  }

  private async replaceFailedNode(detection: NodeFailureDetection): Promise<void> {
    console.log(`Replacing failed node ${detection.nodeId}`);
  }

  private async redistributeOperations(detection: NodeFailureDetection): Promise<void> {
    console.log(`Redistributing operations from failed node ${detection.nodeId}`);
  }

  private async activateRecoveryFallback(detection: NodeFailureDetection): Promise<void> {
    console.log(`Activating recovery fallback for failed node ${detection.nodeId}`);
  }

  private async abortAndRetryOperations(detection: NodeFailureDetection): Promise<void> {
    console.log(`Aborting and retrying operations from failed node ${detection.nodeId}`);
  }
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface NodeCoordinationState {
  readonly nodeId: NodeId;
  isOnline: boolean;
  lastHeartbeat: number;
  coordinationLoad: number;
  participatingGroups: Set<string>;
  activeBarriers: Set<string>;
  pendingVotes: Set<string>;
  networkLatency: number;
  reliability: number;
  capabilities: NodeCapabilities;
  lastUpdate: number;
}

interface NodeCapabilities {
  readonly maxConcurrentOperations: number;
  readonly supportedProtocols: ReadonlyArray<CoordinationProtocol>;
  readonly byzantineFaultTolerance: boolean;
  readonly classicalFallbackSupport: boolean;
}

interface CoordinationGroupResult {
  readonly success: boolean;
  readonly groupId: string;
  readonly coordinationGroup?: CoordinationGroup;
  readonly errors: ReadonlyArray<DistributedError>;
}

interface BarrierResult {
  readonly success: boolean;
  readonly barrierId: string;
  readonly errors: ReadonlyArray<string>;
}

interface BarrierArrivalResult {
  readonly success: boolean;
  readonly allArrived: boolean;
  readonly waitingFor?: ReadonlySet<NodeId>;
  readonly errors: ReadonlyArray<string>;
}

interface QuorumDecisionResult {
  readonly success: boolean;
  readonly decisionId: string;
  readonly decision: 'accept' | 'reject' | 'timeout' | 'pending';
  readonly errors: ReadonlyArray<string>;
}

interface VoteResult {
  readonly success: boolean;
  readonly quorumAchieved: boolean;
  readonly currentVotes?: number;
  readonly requiredVotes?: number;
  readonly errors: ReadonlyArray<string>;
}

interface RecoveryResult {
  readonly success: boolean;
  readonly recoveryStrategy: RecoveryStrategy;
  readonly estimatedRecoveryTime: number;
  readonly alternativeNodes: ReadonlyArray<NodeId>;
  readonly affectedOperations: ReadonlyArray<string>;
  readonly error?: string;
}

interface ClassicalFallbackResult {
  readonly success: boolean;
  readonly classicalData: ReadonlyMap<string, ClassicalData>;
  readonly fallbackStrategy: FallbackStrategy;
  readonly transmissionTime: number;
  readonly dataIntegrity: number;
  readonly errors: ReadonlyArray<string>;
}

interface ClassicalData {
  readonly value: any;
  readonly probability: number;
  readonly timestamp: number;
  readonly fidelity: number;
}

interface ClassicalChannel {
  readonly channelId: string;
  readonly type: 'tcp' | 'udp' | 'websocket' | 'http';
  readonly bandwidth: number;
  readonly latency: number;
  readonly reliability: number;
}

interface ClassicalTransmissionResult {
  readonly success: boolean;
  readonly receivedData: Map<string, ClassicalData>;
  readonly duration: number;
  readonly errors: ReadonlyArray<string>;
}

interface ClassicalVerificationResult {
  readonly success: boolean;
  readonly integrity: number;
  readonly errors: ReadonlyArray<string>;
}

export interface CoordinationMetrics {
  readonly activeCoordinationGroups: number;
  readonly activeBarriers: number;
  readonly pendingDecisions: number;
  readonly coordinatedNodes: number;
  readonly failedNodes: number;
  readonly networkPartitions: number;
  readonly operationMetrics: {
    readonly successfulBarriersPerSecond: number;
    readonly failedBarriersPerSecond: number;
    readonly quorumDecisionsPerSecond: number;
    readonly failureDetectionsPerSecond: number;
    readonly classicalFallbacksPerSecond: number;
  };
  readonly networkHealth: number;
  readonly coordinationEfficiency: number;
  readonly lastUpdate: number;
}

// Export singleton instance
export const distributedNodeCoordinator = new DistributedNodeCoordinator('local_node' as NodeId);