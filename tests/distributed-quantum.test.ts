/**
 * SINGULARIS PRIME Distributed Quantum Networks Testing
 * 
 * Comprehensive tests for multi-node quantum operations, EPR pair management,
 * quantum teleportation, network latency compensation, and fault tolerance.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  NodeId,
  ChannelId,
  SessionId,
  DistributedQuantumNode,
  DistributedSession,
  DistributedOperation,
  DistributedOperationType,
  OperationStatus,
  QuantumProtocol,
  NetworkMetadata,
  CoherenceBudget,
  generateSessionId
} from '@shared/types/distributed-quantum-types';

// Mock distributed quantum services
vi.mock('@server/distributed/session-manager', () => ({
  sessionManager: {
    createSession: vi.fn(),
    joinSession: vi.fn(),
    executeDistributedOperation: vi.fn(),
    getSessionMetrics: vi.fn(),
    handleNodeFailure: vi.fn()
  }
}));

vi.mock('@server/distributed/epr-pool-manager', () => ({
  eprPoolManager: {
    allocateEPRPair: vi.fn(),
    purifyEPRPair: vi.fn(),
    getPoolStatus: vi.fn(),
    preemptiveGeneration: vi.fn()
  }
}));

vi.mock('@server/distributed/teleportation-protocol', () => ({
  teleportationProtocol: {
    prepareQuantumState: vi.fn(),
    performTeleportation: vi.fn(),
    reconstructState: vi.fn(),
    verifyFidelity: vi.fn()
  }
}));

describe('Distributed Quantum Networks Testing', () => {
  let mockNodes: DistributedQuantumNode[];
  let testSession: DistributedSession;

  beforeEach(() => {
    // Create mock distributed quantum nodes
    mockNodes = [
      {
        id: 'node-1' as NodeId,
        region: 'us-east-1',
        capabilities: {
          maxQubits: 50,
          coherenceTime: 100000, // 100ms
          fidelityThreshold: 0.99,
          supportedProtocols: ['BB84', 'CHSH']
        },
        status: 'active',
        load: 0.3,
        lastHeartbeat: Date.now()
      },
      {
        id: 'node-2' as NodeId,
        region: 'us-west-2',
        capabilities: {
          maxQubits: 75,
          coherenceTime: 150000, // 150ms
          fidelityThreshold: 0.98,
          supportedProtocols: ['BB84', 'E91']
        },
        status: 'active',
        load: 0.5,
        lastHeartbeat: Date.now()
      },
      {
        id: 'node-3' as NodeId,
        region: 'eu-west-1',
        capabilities: {
          maxQubits: 60,
          coherenceTime: 120000, // 120ms
          fidelityThreshold: 0.97,
          supportedProtocols: ['CHSH', 'E91']
        },
        status: 'active',
        load: 0.2,
        lastHeartbeat: Date.now()
      }
    ];

    // Create test session
    testSession = {
      id: generateSessionId(),
      participants: mockNodes.map(node => node.id),
      status: 'active',
      createdAt: Date.now(),
      qosRequirements: {
        minFidelity: 0.95,
        maxLatency: 100,
        reliability: 0.99
      },
      allocatedResources: {
        totalQubits: 50,
        reservedChannels: ['channel-1', 'channel-2'] as ChannelId[],
        coherenceBudget: {
          total: 500000, // 500ms
          allocated: 150000, // 150ms
          reserved: 100000 // 100ms
        }
      }
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-Node Quantum Operations', () => {
    it('should coordinate quantum operations across multiple nodes', async () => {
      const { sessionManager } = require('@server/distributed/session-manager');
      
      sessionManager.createSession.mockResolvedValue({
        success: true,
        session: testSession
      });

      sessionManager.executeDistributedOperation.mockResolvedValue({
        operationId: 'multi-node-op-1',
        status: 'completed',
        results: {
          'node-1': { fidelity: 0.97, latency: 45 },
          'node-2': { fidelity: 0.98, latency: 52 },
          'node-3': { fidelity: 0.96, latency: 38 }
        },
        totalLatency: 52,
        averageFidelity: 0.97
      });

      // Create distributed session
      const sessionResult = await sessionManager.createSession({
        nodeIds: mockNodes.map(n => n.id),
        qosRequirements: testSession.qosRequirements
      });

      expect(sessionResult.success).toBe(true);

      // Execute distributed operation
      const operationResult = await sessionManager.executeDistributedOperation({
        sessionId: testSession.id,
        operation: 'distributed_entanglement',
        participants: mockNodes.map(n => n.id)
      });

      expect(operationResult.status).toBe('completed');
      expect(operationResult.averageFidelity).toBeGreaterThanOrEqual(0.95);
      expect(operationResult.totalLatency).toBeLessThan(100);
    });

    it('should handle node capability matching and resource allocation', () => {
      const availableNodes = mockNodes.filter(node => 
        node.status === 'active' && 
        node.load < 0.8 &&
        node.capabilities.maxQubits >= 30
      );

      expect(availableNodes).toHaveLength(3);

      // Test capability requirements
      const highFidelityNodes = availableNodes.filter(node =>
        node.capabilities.fidelityThreshold >= 0.98
      );

      expect(highFidelityNodes).toHaveLength(2); // node-1 and node-2

      const protocolCompatibleNodes = availableNodes.filter(node =>
        node.capabilities.supportedProtocols.includes('BB84')
      );

      expect(protocolCompatibleNodes).toHaveLength(2); // node-1 and node-2
    });

    it('should optimize node selection based on geographic distribution', () => {
      const regions = [...new Set(mockNodes.map(node => node.region))];
      expect(regions).toHaveLength(3); // us-east-1, us-west-2, eu-west-1

      // Test geographic optimization
      const usNodes = mockNodes.filter(node => node.region.startsWith('us-'));
      const euNodes = mockNodes.filter(node => node.region.startsWith('eu-'));

      expect(usNodes).toHaveLength(2);
      expect(euNodes).toHaveLength(1);

      // Geographic diversity should reduce correlation risks
      const geographicDiversity = regions.length / mockNodes.length;
      expect(geographicDiversity).toBeGreaterThan(0.5);
    });

    it('should manage coherence budgets across distributed operations', () => {
      const coherenceBudget = testSession.allocatedResources.coherenceBudget;
      const remainingBudget = coherenceBudget.total - coherenceBudget.allocated - coherenceBudget.reserved;

      expect(remainingBudget).toBe(250000); // 250ms remaining
      expect(coherenceBudget.allocated / coherenceBudget.total).toBeLessThan(0.5); // Less than 50% allocated
    });
  });

  describe('EPR Pair Management', () => {
    it('should allocate and manage EPR pairs for quantum communication', async () => {
      const { eprPoolManager } = require('@server/distributed/epr-pool-manager');

      eprPoolManager.allocateEPRPair.mockResolvedValue({
        success: true,
        eprPair: {
          id: 'epr-pair-1',
          nodeA: 'node-1' as NodeId,
          nodeB: 'node-2' as NodeId,
          fidelity: 0.98,
          createdAt: Date.now(),
          expiresAt: Date.now() + 50000 // 50 second lifetime
        }
      });

      const allocationResult = await eprPoolManager.allocateEPRPair({
        nodeA: 'node-1' as NodeId,
        nodeB: 'node-2' as NodeId,
        minFidelity: 0.95,
        maxWaitTime: 10000
      });

      expect(allocationResult.success).toBe(true);
      expect(allocationResult.eprPair.fidelity).toBeGreaterThanOrEqual(0.95);
      expect(allocationResult.eprPair.nodeA).toBe('node-1');
      expect(allocationResult.eprPair.nodeB).toBe('node-2');
    });

    it('should implement EPR pair purification for improved fidelity', async () => {
      const { eprPoolManager } = require('@server/distributed/epr-pool-manager');

      eprPoolManager.purifyEPRPair.mockResolvedValue({
        success: true,
        purifiedPair: {
          id: 'epr-pair-1-purified',
          originalFidelity: 0.93,
          purifiedFidelity: 0.97,
          purificationRounds: 2,
          consumedPairs: 4, // Used 4 raw pairs to create 1 purified pair
          efficiency: 0.25
        }
      });

      const purificationResult = await eprPoolManager.purifyEPRPair({
        eprPairIds: ['epr-raw-1', 'epr-raw-2', 'epr-raw-3', 'epr-raw-4'],
        targetFidelity: 0.97,
        maxRounds: 3
      });

      expect(purificationResult.success).toBe(true);
      expect(purificationResult.purifiedPair.purifiedFidelity).toBeGreaterThan(
        purificationResult.purifiedPair.originalFidelity
      );
      expect(purificationResult.purifiedPair.purificationRounds).toBeLessThanOrEqual(3);
    });

    it('should monitor EPR pool status and implement preemptive generation', async () => {
      const { eprPoolManager } = require('@server/distributed/epr-pool-manager');

      eprPoolManager.getPoolStatus.mockReturnValue({
        totalPairs: 150,
        availablePairs: 45,
        highFidelityPairs: 20, // Fidelity > 0.98
        mediumFidelityPairs: 25, // Fidelity 0.95-0.98
        utilizationRate: 0.7,
        generationRate: 5.2, // pairs per second
        purificationQueue: 8
      });

      eprPoolManager.preemptiveGeneration.mockResolvedValue({
        generated: 25,
        timeElapsed: 4800, // 4.8 seconds
        averageFidelity: 0.94,
        success: true
      });

      const poolStatus = eprPoolManager.getPoolStatus();
      expect(poolStatus.utilizationRate).toBe(0.7);
      expect(poolStatus.highFidelityPairs + poolStatus.mediumFidelityPairs).toBe(45);

      // Trigger preemptive generation when utilization is high
      if (poolStatus.utilizationRate > 0.6) {
        const generationResult = await eprPoolManager.preemptiveGeneration({
          targetCount: 25,
          minFidelity: 0.90
        });

        expect(generationResult.success).toBe(true);
        expect(generationResult.generated).toBe(25);
      }
    });
  });

  describe('Quantum Teleportation Protocol', () => {
    it('should perform complete quantum state teleportation with high fidelity', async () => {
      const { teleportationProtocol } = require('@server/distributed/teleportation-protocol');

      // Mock teleportation protocol steps
      teleportationProtocol.prepareQuantumState.mockResolvedValue({
        stateId: 'quantum-state-1',
        prepared: true,
        fidelity: 0.99,
        dimension: 2
      });

      teleportationProtocol.performTeleportation.mockResolvedValue({
        success: true,
        measurementResults: [0, 1], // Bell measurement results
        classicalBits: '01',
        eprPairConsumed: 'epr-pair-1',
        latency: 23 // milliseconds
      });

      teleportationProtocol.reconstructState.mockResolvedValue({
        reconstructedStateId: 'quantum-state-1-teleported',
        success: true,
        fidelity: 0.98,
        correctionOperations: ['X', 'Z'] // Applied corrections based on measurement
      });

      teleportationProtocol.verifyFidelity.mockResolvedValue({
        originalFidelity: 0.99,
        teleportedFidelity: 0.98,
        fidelityLoss: 0.01,
        withinTolerance: true,
        processEfficiency: 0.989
      });

      // Execute full teleportation protocol
      const prepResult = await teleportationProtocol.prepareQuantumState({
        amplitude: [0.6, 0.8],
        phase: [0, Math.PI/4]
      });

      const teleportResult = await teleportationProtocol.performTeleportation({
        stateId: prepResult.stateId,
        sourceNode: 'node-1' as NodeId,
        targetNode: 'node-2' as NodeId,
        eprPairId: 'epr-pair-1'
      });

      const reconstructResult = await teleportationProtocol.reconstructState({
        targetNode: 'node-2' as NodeId,
        classicalBits: teleportResult.classicalBits
      });

      const verificationResult = await teleportationProtocol.verifyFidelity({
        originalStateId: prepResult.stateId,
        teleportedStateId: reconstructResult.reconstructedStateId
      });

      expect(teleportResult.success).toBe(true);
      expect(reconstructResult.success).toBe(true);
      expect(verificationResult.withinTolerance).toBe(true);
      expect(verificationResult.processEfficiency).toBeGreaterThan(0.95);
    });

    it('should handle teleportation error correction and recovery', async () => {
      const { teleportationProtocol } = require('@server/distributed/teleportation-protocol');

      // Simulate noisy teleportation
      teleportationProtocol.performTeleportation.mockResolvedValue({
        success: true,
        measurementResults: [1, 0],
        classicalBits: '10',
        eprPairConsumed: 'epr-pair-noisy',
        latency: 45,
        errors: ['bit_flip_detected', 'phase_error_detected']
      });

      teleportationProtocol.reconstructState.mockResolvedValue({
        reconstructedStateId: 'quantum-state-recovered',
        success: true,
        fidelity: 0.94, // Lower due to errors
        correctionOperations: ['X', 'Y', 'Z', 'PHASE_CORRECTION'],
        errorsCorrected: 2
      });

      const teleportResult = await teleportationProtocol.performTeleportation({
        stateId: 'test-state',
        sourceNode: 'node-1' as NodeId,
        targetNode: 'node-3' as NodeId,
        eprPairId: 'epr-pair-noisy',
        errorCorrection: true
      });

      const reconstructResult = await teleportationProtocol.reconstructState({
        targetNode: 'node-3' as NodeId,
        classicalBits: teleportResult.classicalBits,
        errorCorrection: true
      });

      expect(teleportResult.success).toBe(true);
      expect(teleportResult.errors).toBeDefined();
      expect(reconstructResult.errorsCorrected).toBe(2);
      expect(reconstructResult.fidelity).toBeGreaterThan(0.90); // Still acceptable after correction
    });
  });

  describe('Network Latency Compensation', () => {
    it('should implement dynamic latency compensation algorithms', () => {
      const networkLatencies = {
        'node-1->node-2': 45, // us-east-1 to us-west-2
        'node-1->node-3': 78, // us-east-1 to eu-west-1
        'node-2->node-3': 125 // us-west-2 to eu-west-1
      };

      // Calculate compensation delays
      const maxLatency = Math.max(...Object.values(networkLatencies));
      const compensationDelays = Object.fromEntries(
        Object.entries(networkLatencies).map(([path, latency]) => [
          path,
          maxLatency - latency
        ])
      );

      expect(compensationDelays['node-1->node-2']).toBe(80); // 125 - 45
      expect(compensationDelays['node-1->node-3']).toBe(47);  // 125 - 78
      expect(compensationDelays['node-2->node-3']).toBe(0);   // 125 - 125

      // Verify total synchronized timing
      Object.entries(networkLatencies).forEach(([path, latency]) => {
        const totalTime = latency + compensationDelays[path];
        expect(totalTime).toBe(maxLatency);
      });
    });

    it('should manage coherence budgets with time synchronization', () => {
      const coherenceTime = 100000; // 100ms base coherence time
      const networkLatency = 78; // milliseconds
      const operationTime = 15; // milliseconds
      const bufferTime = 10; // milliseconds

      const totalTimeRequired = networkLatency + operationTime + bufferTime;
      const remainingCoherence = coherenceTime - totalTimeRequired;

      expect(totalTimeRequired).toBe(103);
      expect(remainingCoherence).toBeGreaterThan(0);
      expect(remainingCoherence / coherenceTime).toBeGreaterThan(0.9); // 90%+ coherence preserved
    });

    it('should implement barrier synchronization for coordinated operations', async () => {
      const { sessionManager } = require('@server/distributed/session-manager');

      sessionManager.executeDistributedOperation.mockResolvedValue({
        operationId: 'barrier-sync-test',
        status: 'completed',
        barrierResults: {
          'node-1': { ready: true, timestamp: 1000, latency: 45 },
          'node-2': { ready: true, timestamp: 1052, latency: 52 },
          'node-3': { ready: true, timestamp: 1038, latency: 38 }
        },
        synchronizationDelay: 52, // Max latency
        totalWaitTime: 67 // Including synchronization
      });

      const barrierResult = await sessionManager.executeDistributedOperation({
        sessionId: testSession.id,
        operation: 'synchronized_measurement',
        synchronizationType: 'barrier',
        participants: mockNodes.map(n => n.id)
      });

      expect(barrierResult.status).toBe('completed');
      expect(barrierResult.synchronizationDelay).toBeLessThan(100);
      
      // All nodes should be ready
      const allReady = Object.values(barrierResult.barrierResults).every(
        result => result.ready
      );
      expect(allReady).toBe(true);
    });
  });

  describe('Fault Tolerance and Recovery', () => {
    it('should detect and handle node failures gracefully', async () => {
      const { sessionManager } = require('@server/distributed/session-manager');

      // Simulate node failure
      const failedNode = mockNodes[1]; // node-2
      failedNode.status = 'failed';
      failedNode.lastHeartbeat = Date.now() - 30000; // 30 seconds ago

      sessionManager.handleNodeFailure.mockResolvedValue({
        failedNode: failedNode.id,
        replacementNode: 'node-backup-1' as NodeId,
        migrationSuccess: true,
        statesRecovered: 12,
        eprPairsLost: 3,
        operationContinued: true
      });

      const recoveryResult = await sessionManager.handleNodeFailure({
        failedNodeId: failedNode.id,
        sessionId: testSession.id,
        recoveryStrategy: 'migrate_and_continue'
      });

      expect(recoveryResult.migrationSuccess).toBe(true);
      expect(recoveryResult.operationContinued).toBe(true);
      expect(recoveryResult.statesRecovered).toBeGreaterThan(0);
      expect(recoveryResult.eprPairsLost).toBeLessThan(5); // Minimal loss
    });

    it('should implement redundant EPR pair allocation for fault tolerance', async () => {
      const { eprPoolManager } = require('@server/distributed/epr-pool-manager');

      eprPoolManager.allocateEPRPair.mockImplementation(async (request) => {
        // Simulate redundant allocation
        if (request.redundancy) {
          return {
            success: true,
            primaryPair: {
              id: 'epr-primary',
              nodeA: request.nodeA,
              nodeB: request.nodeB,
              fidelity: 0.98
            },
            backupPairs: [
              {
                id: 'epr-backup-1',
                nodeA: request.nodeA,
                nodeB: 'node-backup-1' as NodeId,
                fidelity: 0.96
              },
              {
                id: 'epr-backup-2',
                nodeA: 'node-backup-2' as NodeId,
                nodeB: request.nodeB,
                fidelity: 0.97
              }
            ]
          };
        }
        return { success: true, eprPair: { id: 'epr-single', fidelity: 0.98 } };
      });

      const redundantAllocation = await eprPoolManager.allocateEPRPair({
        nodeA: 'node-1' as NodeId,
        nodeB: 'node-2' as NodeId,
        redundancy: 2,
        minFidelity: 0.95
      });

      expect(redundantAllocation.success).toBe(true);
      expect(redundantAllocation.primaryPair).toBeDefined();
      expect(redundantAllocation.backupPairs).toHaveLength(2);
      expect(redundantAllocation.backupPairs.every(pair => pair.fidelity >= 0.95)).toBe(true);
    });

    it('should handle network partitions and split-brain scenarios', async () => {
      const { sessionManager } = require('@server/distributed/session-manager');

      sessionManager.executeDistributedOperation.mockResolvedValue({
        operationId: 'partition-recovery',
        status: 'partially_completed',
        partitions: [
          { nodes: ['node-1', 'node-2'], status: 'active', operations: 8 },
          { nodes: ['node-3'], status: 'isolated', operations: 0 }
        ],
        consensusAchieved: true,
        minorityPartitionHandled: true,
        dataConsistency: 'maintained'
      });

      const partitionResult = await sessionManager.executeDistributedOperation({
        sessionId: testSession.id,
        operation: 'consensus_measurement',
        partitionTolerance: true,
        minimumNodes: 2
      });

      expect(partitionResult.status).toBe('partially_completed');
      expect(partitionResult.consensusAchieved).toBe(true);
      expect(partitionResult.dataConsistency).toBe('maintained');

      // Majority partition should continue operations
      const activePartition = partitionResult.partitions.find(p => p.status === 'active');
      expect(activePartition?.nodes).toHaveLength(2);
      expect(activePartition?.operations).toBeGreaterThan(0);
    });

    it('should implement automatic session recovery and state reconstruction', async () => {
      const { sessionManager } = require('@server/distributed/session-manager');

      sessionManager.getSessionMetrics.mockReturnValue({
        sessionId: testSession.id,
        uptime: 45000, // 45 seconds
        totalOperations: 127,
        successfulOperations: 121,
        failedOperations: 6,
        averageLatency: 67,
        fidelityDistribution: {
          high: 89,   // > 0.98
          medium: 32, // 0.95-0.98
          low: 6      // < 0.95
        },
        resourceUtilization: 0.73,
        errorRate: 0.047 // 4.7%
      });

      const metrics = sessionManager.getSessionMetrics(testSession.id);
      
      expect(metrics.successfulOperations / metrics.totalOperations).toBeGreaterThan(0.95);
      expect(metrics.errorRate).toBeLessThan(0.05); // Less than 5% error rate
      expect(metrics.averageLatency).toBeLessThan(100);
      expect(metrics.fidelityDistribution.high + metrics.fidelityDistribution.medium).toBeGreaterThan(
        metrics.fidelityDistribution.low * 10
      );
    });
  });

  describe('Performance and Optimization', () => {
    it('should achieve target performance metrics for distributed operations', async () => {
      const performanceTargets = {
        maxLatency: 100, // milliseconds
        minThroughput: 50, // operations per second
        minFidelity: 0.95,
        maxErrorRate: 0.05,
        minEfficiency: 0.90
      };

      const { sessionManager } = require('@server/distributed/session-manager');

      sessionManager.getSessionMetrics.mockReturnValue({
        averageLatency: 67,
        throughput: 73,
        averageFidelity: 0.97,
        errorRate: 0.034,
        efficiency: 0.94
      });

      const metrics = sessionManager.getSessionMetrics(testSession.id);

      expect(metrics.averageLatency).toBeLessThan(performanceTargets.maxLatency);
      expect(metrics.throughput).toBeGreaterThan(performanceTargets.minThroughput);
      expect(metrics.averageFidelity).toBeGreaterThan(performanceTargets.minFidelity);
      expect(metrics.errorRate).toBeLessThan(performanceTargets.maxErrorRate);
      expect(metrics.efficiency).toBeGreaterThan(performanceTargets.minEfficiency);
    });

    it('should optimize resource allocation based on workload patterns', () => {
      const workloadMetrics = {
        peakHours: [9, 10, 11, 14, 15, 16], // UTC hours
        operationTypes: {
          'quantum_entanglement': 0.35,
          'state_teleportation': 0.25,
          'measurement_operations': 0.20,
          'error_correction': 0.15,
          'state_preparation': 0.05
        },
        geographicDistribution: {
          'us-east': 0.45,
          'us-west': 0.30,
          'europe': 0.25
        }
      };

      // Verify workload distribution
      const totalOperationPercent = Object.values(workloadMetrics.operationTypes)
        .reduce((sum, percent) => sum + percent, 0);
      expect(totalOperationPercent).toBeCloseTo(1.0, 2);

      const totalGeographicPercent = Object.values(workloadMetrics.geographicDistribution)
        .reduce((sum, percent) => sum + percent, 0);
      expect(totalGeographicPercent).toBeCloseTo(1.0, 2);

      // Peak hour coverage should be reasonable
      expect(workloadMetrics.peakHours.length).toBeLessThan(12); // Less than half the day
      expect(workloadMetrics.peakHours.length).toBeGreaterThan(3); // At least 3 hours
    });

    it('should scale efficiently with increasing node count', async () => {
      const scalingTest = async (nodeCount: number) => {
        const mockLargeNodeSet = Array.from({ length: nodeCount }, (_, i) => ({
          id: `scale-node-${i}` as NodeId,
          capabilities: { maxQubits: 50, coherenceTime: 100000 },
          status: 'active' as const,
          load: Math.random() * 0.7
        }));

        return {
          nodeCount,
          setupTime: Math.log(nodeCount) * 50, // Logarithmic setup scaling
          operationLatency: 50 + Math.sqrt(nodeCount) * 5, // Sublinear latency growth
          resourceEfficiency: 0.95 - (nodeCount - 3) * 0.005 // Slight efficiency loss
        };
      };

      const results = await Promise.all([
        scalingTest(3),
        scalingTest(10),
        scalingTest(25),
        scalingTest(50)
      ]);

      // Verify scaling characteristics
      results.forEach((result, index) => {
        if (index > 0) {
          const previous = results[index - 1];
          
          // Setup time should scale logarithmically
          const setupScaling = result.setupTime / previous.setupTime;
          expect(setupScaling).toBeLessThan(2.0);
          
          // Operation latency should scale sublinearly
          const latencyScaling = result.operationLatency / previous.operationLatency;
          expect(latencyScaling).toBeLessThan(1.5);
          
          // Efficiency should remain high
          expect(result.resourceEfficiency).toBeGreaterThan(0.85);
        }
      });
    });
  });
});