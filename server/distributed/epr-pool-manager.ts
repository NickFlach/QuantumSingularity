/**
 * SINGULARIS PRIME EPR Pool Manager
 * 
 * This module provides comprehensive EPR (Einstein-Podolsky-Rosen) pair resource management
 * for distributed quantum networks. It handles creation, purification, allocation, and
 * lifecycle management of entangled quantum states across network nodes.
 * 
 * Key responsibilities:
 * - EPR pair generation and pool maintenance
 * - Purification protocols for fidelity improvement
 * - Entanglement swapping for distant node connections
 * - Resource allocation and reservation management
 * - Integration with Quantum Memory Manager (QMM)
 * - Network-aware resource optimization
 */

import { EventEmitter } from 'events';
import {
  NodeId,
  ChannelId,
  SessionId,
  EPRChannel,
  EPRPair,
  PurificationStep,
  DistributedQuantumNode,
  DistributedOperation,
  DistributedOperationType,
  OperationStatus,
  OperationPriority,
  TeleportationResult,
  EntanglementResult,
  DistributedError,
  DistributedErrorType,
  ResourceUsage,
  generateChannelId,
  QuantumProtocol,
  ChannelStatus,
  EPRChannelStatus
} from '../../shared/types/distributed-quantum-types';

import {
  QuantumState,
  QuantumReferenceId,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  QuantumPurity,
  QuantumDimension,
  generateQuantumReferenceId,
  Qubit,
  Complex
} from '../../shared/types/quantum-types';

import {
  QuantumHandle,
  QuantumMemorySystem,
  MemoryCriticality,
  EntanglementGroupId
} from '../../shared/types/quantum-memory-types';

// Import QMM singleton
import { quantumMemoryManager } from '../runtime/quantum-memory-manager';

// =============================================================================
// EPR POOL CONFIGURATION AND METRICS
// =============================================================================

export interface EPRPoolConfiguration {
  readonly maxChannels: number;
  readonly maxPairsPerChannel: number;
  readonly defaultFidelity: number;
  readonly purificationThreshold: number;
  readonly maxPurificationSteps: number;
  readonly generationRate: number; // pairs per second
  readonly coherenceTime: number; // microseconds
  readonly defaultTTL: number; // milliseconds
  readonly resourceTimeout: number; // milliseconds
  readonly backgroundGeneration: boolean;
  readonly adaptivePooling: boolean;
  readonly qualityThresholds: QualityThresholds;
}

export interface QualityThresholds {
  readonly minimumFidelity: number;
  readonly targetFidelity: number;
  readonly excellentFidelity: number;
  readonly purificationRequired: number;
  readonly swappingRequired: number;
}

export interface EPRPoolMetrics {
  readonly totalChannels: number;
  readonly activeChannels: number;
  readonly totalPairs: number;
  readonly availablePairs: number;
  readonly allocatedPairs: number;
  readonly expiredPairs: number;
  readonly averageFidelity: number;
  readonly purificationSuccess: number;
  readonly swappingSuccess: number;
  readonly resourceUtilization: number; // 0-1
  readonly generationRate: number;
  readonly allocationRate: number;
  readonly expirationRate: number;
  readonly lastUpdate: number;
}

export interface ChannelMetrics {
  readonly channelId: ChannelId;
  readonly status: EPRChannelStatus;
  readonly fidelity: number;
  readonly pairCount: number;
  readonly usageRate: number;
  readonly errorRate: number;
  readonly latency: number;
  readonly lastActivity: number;
  readonly reliability: number;
}

// =============================================================================
// EPR RESOURCE ALLOCATION
// =============================================================================

export interface EPRAllocationRequest {
  readonly sessionId: SessionId;
  readonly requesterId: NodeId;
  readonly targetNode: NodeId;
  readonly requiredPairs: number;
  readonly minFidelity: number;
  readonly maxLatency: number;
  readonly timeoutMs: number;
  readonly priority: OperationPriority;
  readonly reservationOnly: boolean;
  readonly purificationAllowed: boolean;
  readonly swappingAllowed: boolean;
  readonly qualityGuarantee: boolean;
}

export interface EPRAllocation {
  readonly allocationId: string;
  readonly sessionId: SessionId;
  readonly channelId: ChannelId;
  readonly allocatedPairs: ReadonlyArray<EPRPair>;
  readonly reservedUntil: number;
  readonly actualFidelity: number;
  readonly estimatedLatency: number;
  readonly allocationTime: number;
  readonly expiresAt: number;
  readonly isActive: boolean;
}

export interface EPRReservation {
  readonly reservationId: string;
  readonly sessionId: SessionId;
  readonly channelId: ChannelId;
  readonly requiredPairs: number;
  readonly minFidelity: number;
  readonly reservedUntil: number;
  readonly createdAt: number;
  readonly priority: OperationPriority;
  readonly isActive: boolean;
}

// =============================================================================
// PURIFICATION PROTOCOLS
// =============================================================================

export enum PurificationProtocol {
  ENTANGLEMENT_BREEDING = 'breeding',
  ENTANGLEMENT_DISTILLATION = 'distillation',
  QUANTUM_HASHING = 'hashing',
  BENNETT_BRASSARD = 'bennett_brassard',
  DEUTSCH_SCHUMACHER = 'deutsch_schumacher'
}

export interface PurificationRequest {
  readonly protocol: PurificationProtocol;
  readonly sourcePairs: ReadonlyArray<QuantumReferenceId>;
  readonly targetFidelity: number;
  readonly maxSteps: number;
  readonly resourceBudget: number;
  readonly timeoutMs: number;
  readonly priority: OperationPriority;
}

export interface PurificationResult {
  readonly success: boolean;
  readonly outputPairs: ReadonlyArray<EPRPair>;
  readonly achievedFidelity: number;
  readonly stepsUsed: number;
  readonly resourceCost: number;
  readonly duration: number;
  readonly error?: DistributedError;
  readonly purificationHistory: ReadonlyArray<PurificationStep>;
}

// =============================================================================
// ENTANGLEMENT SWAPPING
// =============================================================================

export interface SwappingRequest {
  readonly nodeA: NodeId;
  readonly nodeB: NodeId;
  readonly mediatorNode: NodeId;
  readonly channelAtoM: ChannelId;
  readonly channelMtoB: ChannelId;
  readonly targetFidelity: number;
  readonly timeoutMs: number;
  readonly priority: OperationPriority;
}

export interface SwappingResult {
  readonly success: boolean;
  readonly newChannelId?: ChannelId;
  readonly swappedPair?: EPRPair;
  readonly achievedFidelity: number;
  readonly swappingLatency: number;
  readonly resourceCost: number;
  readonly error?: DistributedError;
  readonly intermediateResults: any; // Protocol-specific data
}

// =============================================================================
// EPR POOL MANAGER IMPLEMENTATION
// =============================================================================

export class EPRPoolManager extends EventEmitter {
  private readonly config: EPRPoolConfiguration;
  private readonly channels: Map<ChannelId, EPRChannel> = new Map();
  private readonly pairs: Map<QuantumReferenceId, EPRPair> = new Map();
  private readonly allocations: Map<string, EPRAllocation> = new Map();
  private readonly reservations: Map<string, EPRReservation> = new Map();
  private readonly qmm: QuantumMemorySystem;
  
  // Background processes
  private readonly generationTimer: NodeJS.Timeout;
  private readonly maintenanceTimer: NodeJS.Timeout;
  private readonly metricsTimer: NodeJS.Timeout;
  
  // Metrics and monitoring
  private metrics: EPRPoolMetrics;
  private channelMetrics: Map<ChannelId, ChannelMetrics> = new Map();
  private lastMetricsUpdate: number = Date.now();
  
  // Generation and allocation tracking
  private generationRequests: Map<ChannelId, number> = new Map();
  private allocationQueue: EPRAllocationRequest[] = [];
  private purificationQueue: PurificationRequest[] = [];
  private swappingQueue: SwappingRequest[] = [];
  
  constructor(config: Partial<EPRPoolConfiguration> = {}) {
    super();
    
    this.config = {
      maxChannels: 1000,
      maxPairsPerChannel: 10000,
      defaultFidelity: 0.9,
      purificationThreshold: 0.95,
      maxPurificationSteps: 3,
      generationRate: 100.0, // pairs per second
      coherenceTime: 1000000, // 1 second in microseconds
      defaultTTL: 30000, // 30 seconds
      resourceTimeout: 10000, // 10 seconds
      backgroundGeneration: true,
      adaptivePooling: true,
      qualityThresholds: {
        minimumFidelity: 0.7,
        targetFidelity: 0.9,
        excellentFidelity: 0.98,
        purificationRequired: 0.85,
        swappingRequired: 0.8
      },
      ...config
    };
    
    this.qmm = quantumMemoryManager;
    
    // Initialize metrics
    this.metrics = this.initializeMetrics();
    
    // Start background processes
    this.generationTimer = setInterval(
      () => this.processBackgroundGeneration(),
      1000 / this.config.generationRate
    );
    
    this.maintenanceTimer = setInterval(
      () => this.performMaintenance(),
      5000 // Every 5 seconds
    );
    
    this.metricsTimer = setInterval(
      () => this.updateMetrics(),
      1000 // Every second
    );
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  // =============================================================================
  // CHANNEL MANAGEMENT
  // =============================================================================
  
  /**
   * Create a new EPR channel between two nodes
   */
  async createChannel(
    nodeA: NodeId,
    nodeB: NodeId,
    options: Partial<EPRChannel> = {}
  ): Promise<ChannelId> {
    if (this.channels.size >= this.config.maxChannels) {
      throw new Error(`Maximum channel limit reached: ${this.config.maxChannels}`);
    }
    
    const channelId = generateChannelId(nodeA, nodeB);
    
    // Check if channel already exists
    if (this.channels.has(channelId)) {
      throw new Error(`Channel already exists: ${channelId}`);
    }
    
    const channel: EPRChannel = {
      id: channelId,
      nodeA,
      nodeB,
      status: EPRChannelStatus.ACTIVE,
      fidelity: this.config.defaultFidelity,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      usageCount: 0,
      maxUsage: this.config.maxPairsPerChannel,
      
      eprPairs: [],
      availablePairs: 0,
      totalPairs: 0,
      generationRate: this.config.generationRate,
      
      entanglementStrength: this.config.defaultFidelity,
      coherenceTime: this.config.coherenceTime,
      errorRate: 1 - this.config.defaultFidelity,
      purificationLevel: 0,
      
      supportedProtocols: [
        QuantumProtocol.TELEPORTATION,
        QuantumProtocol.DISTRIBUTED_COMPUTING,
        QuantumProtocol.ENTANGLEMENT_SWAPPING
      ],
      
      authentication: {
        method: 'quantum_signature',
        publicKeyA: `pubkey_${nodeA}`,
        publicKeyB: `pubkey_${nodeB}`,
        lastAuthenticated: Date.now(),
        trustScore: 1.0
      },
      
      encryption: {
        enabled: true,
        algorithm: 'AES-256-GCM',
        keyRotationPeriod: 3600, // 1 hour
        lastKeyRotation: Date.now()
      },
      
      ...options
    };
    
    this.channels.set(channelId, channel);
    this.channelMetrics.set(channelId, this.initializeChannelMetrics(channelId));
    
    // Start background generation for this channel
    if (this.config.backgroundGeneration) {
      this.generationRequests.set(channelId, this.config.maxPairsPerChannel / 4);
    }
    
    this.emit('channelCreated', { channelId, nodeA, nodeB });
    
    return channelId;
  }
  
  /**
   * Get channel information
   */
  getChannel(channelId: ChannelId): EPRChannel | undefined {
    return this.channels.get(channelId);
  }
  
  /**
   * Update channel status
   */
  async updateChannelStatus(channelId: ChannelId, status: EPRChannelStatus): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }
    
    const updatedChannel = { ...channel, status };
    this.channels.set(channelId, updatedChannel);
    
    this.emit('channelStatusUpdated', { channelId, oldStatus: channel.status, newStatus: status });
  }
  
  /**
   * Remove a channel and clean up all associated pairs
   */
  async removeChannel(channelId: ChannelId): Promise<void> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      return; // Already removed
    }
    
    // Clean up all pairs in this channel
    for (const pair of channel.eprPairs) {
      await this.removePair(pair.id);
    }
    
    // Remove from tracking
    this.channels.delete(channelId);
    this.channelMetrics.delete(channelId);
    this.generationRequests.delete(channelId);
    
    this.emit('channelRemoved', { channelId });
  }
  
  // =============================================================================
  // EPR PAIR GENERATION
  // =============================================================================
  
  /**
   * Generate EPR pairs for a specific channel
   */
  async generateEPRPairs(
    channelId: ChannelId,
    count: number,
    targetFidelity: number = this.config.defaultFidelity
  ): Promise<ReadonlyArray<EPRPair>> {
    const channel = this.channels.get(channelId);
    if (!channel) {
      throw new Error(`Channel not found: ${channelId}`);
    }
    
    if (channel.status !== EPRChannelStatus.ACTIVE) {
      throw new Error(`Channel not active: ${channelId}`);
    }
    
    if (channel.totalPairs + count > this.config.maxPairsPerChannel) {
      throw new Error(`Would exceed maximum pairs per channel: ${this.config.maxPairsPerChannel}`);
    }
    
    const generatedPairs: EPRPair[] = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const pair = await this.generateSingleEPRPair(channelId, targetFidelity);
        generatedPairs.push(pair);
        
        // Add to channel and global tracking
        const updatedChannel = {
          ...channel,
          eprPairs: [...channel.eprPairs, pair],
          totalPairs: channel.totalPairs + 1,
          availablePairs: channel.availablePairs + 1
        };
        this.channels.set(channelId, updatedChannel);
        this.pairs.set(pair.id, pair);
        
      } catch (error) {
        console.error(`Failed to generate EPR pair ${i + 1}/${count}:`, error);
        break; // Stop generation on error
      }
    }
    
    this.emit('pairsGenerated', { channelId, count: generatedPairs.length, targetFidelity });
    
    return generatedPairs;
  }
  
  /**
   * Generate a single EPR pair
   */
  private async generateSingleEPRPair(
    channelId: ChannelId,
    targetFidelity: number
  ): Promise<EPRPair> {
    const channel = this.channels.get(channelId)!;
    
    // Generate quantum state IDs for the entangled pair
    const stateAId = generateQuantumReferenceId();
    const stateBId = generateQuantumReferenceId();
    const pairId = generateQuantumReferenceId();
    
    // Create Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2
    const bellAmplitude: Complex = {
      real: Math.sqrt(0.5),
      imaginary: 0,
      magnitude: Math.sqrt(0.5),
      phase: 0
    };
    
    // Create quantum states for each node
    const stateA: Qubit = {
      id: stateAId,
      dimension: QuantumDimension.QUBIT,
      purity: QuantumPurity.ENTANGLED,
      coherence: CoherenceStatus.COHERENT,
      measurementStatus: MeasurementStatus.UNMEASURED,
      createdAt: Date.now(),
      lastInteraction: Date.now(),
      entangledWith: new Set([stateBId]),
      cannotClone: true,
      uniqueReference: true,
      trackEntanglement: true,
      __quantumNoClone: Symbol('quantumNoClone'),
      basis: 'computational',
      amplitude: bellAmplitude,
      phase: 0
    };
    
    const stateB: Qubit = {
      id: stateBId,
      dimension: QuantumDimension.QUBIT,
      purity: QuantumPurity.ENTANGLED,
      coherence: CoherenceStatus.COHERENT,
      measurementStatus: MeasurementStatus.UNMEASURED,
      createdAt: Date.now(),
      lastInteraction: Date.now(),
      entangledWith: new Set([stateAId]),
      cannotClone: true,
      uniqueReference: true,
      trackEntanglement: true,
      __quantumNoClone: Symbol('quantumNoClone'),
      basis: 'computational',
      amplitude: bellAmplitude,
      phase: 0
    };
    
    // Register states with QMM
    await this.qmm.allocateQuantumState(stateA, MemoryCriticality.HIGH);
    await this.qmm.allocateQuantumState(stateB, MemoryCriticality.HIGH);
    
    // Apply noise model to simulate real-world fidelity
    const actualFidelity = this.applyNoiseModel(targetFidelity);
    
    // Create EPR pair
    const pair: EPRPair = {
      id: pairId,
      stateA: stateAId,
      stateB: stateBId,
      entanglementType: 'bell_state',
      fidelity: actualFidelity,
      createdAt: Date.now(),
      coherenceTime: this.config.coherenceTime,
      isUsed: false,
      purificationHistory: []
    };
    
    return pair;
  }
  
  /**
   * Apply noise model to simulate realistic fidelity
   */
  private applyNoiseModel(targetFidelity: number): number {
    // Simple noise model with Gaussian distribution
    const noise = (Math.random() - 0.5) * 0.1; // ±5% noise
    const noisyFidelity = targetFidelity + noise;
    
    // Clamp to valid range
    return Math.max(0.1, Math.min(0.999, noisyFidelity));
  }
  
  // =============================================================================
  // EPR PAIR ALLOCATION AND RESERVATION
  // =============================================================================
  
  /**
   * Allocate EPR pairs for immediate use
   */
  async allocateEPRPairs(request: EPRAllocationRequest): Promise<EPRAllocation> {
    const channelId = this.findBestChannel(request);
    if (!channelId) {
      throw new Error(`No suitable channel found for allocation request`);
    }
    
    const channel = this.channels.get(channelId)!;
    const availablePairs = this.getAvailablePairs(channelId, request.minFidelity);
    
    if (availablePairs.length < request.requiredPairs) {
      // Try to generate more pairs if needed
      if (!request.reservationOnly) {
        const needed = request.requiredPairs - availablePairs.length;
        await this.generateEPRPairs(channelId, needed, request.minFidelity);
      } else {
        throw new Error(`Insufficient EPR pairs available: need ${request.requiredPairs}, have ${availablePairs.length}`);
      }
    }
    
    // Select best pairs
    const selectedPairs = this.selectBestPairs(
      channelId,
      request.requiredPairs,
      request.minFidelity,
      request.purificationAllowed
    );
    
    if (selectedPairs.length < request.requiredPairs) {
      throw new Error(`Could not allocate sufficient high-quality pairs`);
    }
    
    // Mark pairs as allocated
    const allocationId = `alloc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const allocation: EPRAllocation = {
      allocationId,
      sessionId: request.sessionId,
      channelId,
      allocatedPairs: selectedPairs,
      reservedUntil: Date.now() + request.timeoutMs,
      actualFidelity: selectedPairs.reduce((sum, p) => sum + p.fidelity, 0) / selectedPairs.length,
      estimatedLatency: this.estimateLatency(channelId),
      allocationTime: Date.now(),
      expiresAt: Date.now() + request.timeoutMs,
      isActive: true
    };
    
    this.allocations.set(allocationId, allocation);
    
    // Update channel usage
    const updatedChannel = {
      ...channel,
      availablePairs: channel.availablePairs - selectedPairs.length,
      usageCount: channel.usageCount + selectedPairs.length,
      lastUsed: Date.now()
    };
    this.channels.set(channelId, updatedChannel);
    
    this.emit('pairsAllocated', { allocationId, sessionId: request.sessionId, pairCount: selectedPairs.length });
    
    return allocation;
  }
  
  /**
   * Reserve EPR pairs for future use
   */
  async reserveEPRPairs(request: EPRAllocationRequest): Promise<EPRReservation> {
    const channelId = this.findBestChannel(request);
    if (!channelId) {
      throw new Error(`No suitable channel found for reservation request`);
    }
    
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reservation: EPRReservation = {
      reservationId,
      sessionId: request.sessionId,
      channelId,
      requiredPairs: request.requiredPairs,
      minFidelity: request.minFidelity,
      reservedUntil: Date.now() + request.timeoutMs,
      createdAt: Date.now(),
      priority: request.priority,
      isActive: true
    };
    
    this.reservations.set(reservationId, reservation);
    
    // Schedule pair generation if needed
    if (this.config.adaptivePooling) {
      this.scheduleGeneration(channelId, request.requiredPairs);
    }
    
    this.emit('pairsReserved', { reservationId, sessionId: request.sessionId, channelId });
    
    return reservation;
  }
  
  /**
   * Find the best channel for a request
   */
  private findBestChannel(request: EPRAllocationRequest): ChannelId | undefined {
    const candidates: { channelId: ChannelId; score: number }[] = [];
    
    for (const [channelId, channel] of this.channels) {
      // Check if channel connects the required nodes
      if (!((channel.nodeA === request.requesterId && channel.nodeB === request.targetNode) ||
            (channel.nodeA === request.targetNode && channel.nodeB === request.requesterId))) {
        continue;
      }
      
      // Check if channel is active and has sufficient capacity
      if (channel.status !== EPRChannelStatus.ACTIVE) {
        continue;
      }
      
      const availablePairs = this.getAvailablePairs(channelId, request.minFidelity);
      if (availablePairs.length < request.requiredPairs && request.reservationOnly) {
        continue;
      }
      
      // Calculate score based on fidelity, latency, and availability
      const metrics = this.channelMetrics.get(channelId)!;
      const score = this.calculateChannelScore(channel, metrics, request);
      
      candidates.push({ channelId, score });
    }
    
    // Sort by score (descending)
    candidates.sort((a, b) => b.score - a.score);
    
    return candidates.length > 0 ? candidates[0].channelId : undefined;
  }
  
  /**
   * Calculate channel suitability score
   */
  private calculateChannelScore(
    channel: EPRChannel,
    metrics: ChannelMetrics,
    request: EPRAllocationRequest
  ): number {
    let score = 0;
    
    // Fidelity score (0-40 points)
    const fidelityScore = Math.min(40, (channel.fidelity - request.minFidelity) * 400);
    score += fidelityScore;
    
    // Latency score (0-30 points)
    const latencyScore = Math.max(0, 30 - (metrics.latency / request.maxLatency) * 30);
    score += latencyScore;
    
    // Availability score (0-20 points)
    const availabilityScore = (channel.availablePairs / channel.totalPairs) * 20;
    score += availabilityScore;
    
    // Reliability score (0-10 points)
    const reliabilityScore = metrics.reliability * 10;
    score += reliabilityScore;
    
    return score;
  }
  
  /**
   * Get available pairs in a channel with minimum fidelity
   */
  private getAvailablePairs(channelId: ChannelId, minFidelity: number): EPRPair[] {
    const channel = this.channels.get(channelId);
    if (!channel) return [];
    
    return channel.eprPairs.filter(pair => 
      !pair.isUsed &&
      pair.fidelity >= minFidelity &&
      Date.now() < pair.createdAt + this.config.defaultTTL
    );
  }
  
  /**
   * Select the best pairs for allocation
   */
  private selectBestPairs(
    channelId: ChannelId,
    count: number,
    minFidelity: number,
    purificationAllowed: boolean
  ): EPRPair[] {
    const availablePairs = this.getAvailablePairs(channelId, minFidelity);
    
    // Sort by fidelity (descending) and creation time (recent first)
    availablePairs.sort((a, b) => {
      if (Math.abs(a.fidelity - b.fidelity) > 0.01) {
        return b.fidelity - a.fidelity;
      }
      return b.createdAt - a.createdAt;
    });
    
    let selected = availablePairs.slice(0, count);
    
    // If we don't have enough high-quality pairs and purification is allowed,
    // try to purify lower-quality pairs
    if (selected.length < count && purificationAllowed) {
      const lowQualityPairs = availablePairs.slice(count).filter(
        pair => pair.fidelity >= this.config.qualityThresholds.purificationRequired
      );
      
      // Add pairs that can be purified
      const additionalPairs = Math.min(count - selected.length, lowQualityPairs.length);
      selected = selected.concat(lowQualityPairs.slice(0, additionalPairs));
    }
    
    return selected;
  }
  
  /**
   * Estimate latency for a channel
   */
  private estimateLatency(channelId: ChannelId): number {
    const metrics = this.channelMetrics.get(channelId);
    return metrics ? metrics.latency : 1000; // Default 1ms
  }
  
  // =============================================================================
  // PURIFICATION PROTOCOLS
  // =============================================================================
  
  /**
   * Purify EPR pairs to improve fidelity
   */
  async purifyEPRPairs(request: PurificationRequest): Promise<PurificationResult> {
    const startTime = Date.now();
    
    try {
      let currentPairs = [...request.sourcePairs];
      let steps = 0;
      let totalResourceCost = 0;
      const purificationHistory: PurificationStep[] = [];
      
      while (steps < request.maxSteps && currentPairs.length >= 2) {
        const stepResult = await this.executePurificationStep(
          request.protocol,
          currentPairs.slice(0, 2),
          request.targetFidelity
        );
        
        if (stepResult.success) {
          // Replace two input pairs with one output pair
          currentPairs = [stepResult.outputPairId, ...currentPairs.slice(2)];
          totalResourceCost += stepResult.resourceCost;
          purificationHistory.push({
            timestamp: Date.now(),
            protocol: request.protocol,
            inputFidelity: stepResult.inputFidelity,
            outputFidelity: stepResult.outputFidelity,
            success: true,
            resourceCost: stepResult.resourceCost
          });
          
          // Check if target fidelity achieved
          if (stepResult.outputFidelity >= request.targetFidelity) {
            break;
          }
        } else {
          purificationHistory.push({
            timestamp: Date.now(),
            protocol: request.protocol,
            inputFidelity: stepResult.inputFidelity,
            outputFidelity: 0,
            success: false,
            resourceCost: stepResult.resourceCost
          });
          break;
        }
        
        steps++;
      }
      
      // Get the final purified pairs
      const outputPairs: EPRPair[] = [];
      for (const pairId of currentPairs) {
        const pair = this.pairs.get(pairId);
        if (pair) {
          outputPairs.push(pair);
        }
      }
      
      const achievedFidelity = outputPairs.length > 0 ? 
        outputPairs.reduce((sum, p) => sum + p.fidelity, 0) / outputPairs.length : 0;
      
      return {
        success: outputPairs.length > 0 && achievedFidelity >= request.targetFidelity,
        outputPairs,
        achievedFidelity,
        stepsUsed: steps,
        resourceCost: totalResourceCost,
        duration: Date.now() - startTime,
        purificationHistory
      };
      
    } catch (error) {
      return {
        success: false,
        outputPairs: [],
        achievedFidelity: 0,
        stepsUsed: 0,
        resourceCost: 0,
        duration: Date.now() - startTime,
        error: {
          type: DistributedErrorType.PROTOCOL_VIOLATION,
          message: `Purification failed: ${error.message}`,
          quantumStateId: request.sourcePairs[0] || '',
          timestamp: Date.now(),
          distributedType: DistributedErrorType.PROTOCOL_VIOLATION,
          nodeId: '' as NodeId,
          networkDiagnostics: {
            latency: 0,
            packetLoss: 0,
            bandwidth: 0,
            jitter: 0,
            lastSuccessfulOperation: 0,
            errorRate: 1,
            recoveryTime: 0
          }
        },
        purificationHistory: []
      };
    }
  }
  
  /**
   * Execute a single purification step
   */
  private async executePurificationStep(
    protocol: PurificationProtocol,
    inputPairIds: ReadonlyArray<QuantumReferenceId>,
    targetFidelity: number
  ): Promise<{
    success: boolean;
    outputPairId: QuantumReferenceId;
    inputFidelity: number;
    outputFidelity: number;
    resourceCost: number;
  }> {
    if (inputPairIds.length !== 2) {
      throw new Error('Purification requires exactly 2 input pairs');
    }
    
    const pair1 = this.pairs.get(inputPairIds[0]);
    const pair2 = this.pairs.get(inputPairIds[1]);
    
    if (!pair1 || !pair2) {
      throw new Error('Input pairs not found');
    }
    
    const inputFidelity = (pair1.fidelity + pair2.fidelity) / 2;
    
    // Simulate purification protocol
    let outputFidelity: number;
    let success: boolean;
    let resourceCost: number;
    
    switch (protocol) {
      case PurificationProtocol.ENTANGLEMENT_BREEDING:
        ({ outputFidelity, success, resourceCost } = this.simulateBreeding(pair1.fidelity, pair2.fidelity));
        break;
      case PurificationProtocol.ENTANGLEMENT_DISTILLATION:
        ({ outputFidelity, success, resourceCost } = this.simulateDistillation(pair1.fidelity, pair2.fidelity));
        break;
      case PurificationProtocol.BENNETT_BRASSARD:
        ({ outputFidelity, success, resourceCost } = this.simulateBennettBrassard(pair1.fidelity, pair2.fidelity));
        break;
      default:
        throw new Error(`Unsupported purification protocol: ${protocol}`);
    }
    
    if (success) {
      // Create purified pair
      const outputPairId = generateQuantumReferenceId();
      const purifiedPair: EPRPair = {
        id: outputPairId,
        stateA: pair1.stateA,
        stateB: pair1.stateB,
        entanglementType: 'bell_state',
        fidelity: outputFidelity,
        createdAt: Date.now(),
        coherenceTime: this.config.coherenceTime,
        isUsed: false,
        purificationHistory: [
          ...pair1.purificationHistory,
          ...pair2.purificationHistory,
          {
            timestamp: Date.now(),
            protocol,
            inputFidelity,
            outputFidelity,
            success: true,
            resourceCost
          }
        ]
      };
      
      // Store purified pair and remove input pairs
      this.pairs.set(outputPairId, purifiedPair);
      this.pairs.delete(pair1.id);
      this.pairs.delete(pair2.id);
      
      return {
        success: true,
        outputPairId,
        inputFidelity,
        outputFidelity,
        resourceCost
      };
    } else {
      return {
        success: false,
        outputPairId: inputPairIds[0],
        inputFidelity,
        outputFidelity: 0,
        resourceCost
      };
    }
  }
  
  /**
   * Simulate entanglement breeding protocol
   */
  private simulateBreeding(f1: number, f2: number): { outputFidelity: number; success: boolean; resourceCost: number } {
    // Breeding protocol: F_out = (F1 * F2) / (F1 * F2 + (1-F1) * (1-F2))
    const numerator = f1 * f2;
    const denominator = f1 * f2 + (1 - f1) * (1 - f2);
    const outputFidelity = numerator / denominator;
    
    // Success probability depends on input fidelities
    const successProb = f1 * f2 + (1 - f1) * (1 - f2);
    const success = Math.random() < successProb;
    
    return {
      outputFidelity: success ? outputFidelity : 0,
      success,
      resourceCost: 2 // Consumes 2 pairs
    };
  }
  
  /**
   * Simulate entanglement distillation protocol
   */
  private simulateDistillation(f1: number, f2: number): { outputFidelity: number; success: boolean; resourceCost: number } {
    // Distillation protocol - more conservative but reliable
    const avgFidelity = (f1 + f2) / 2;
    const outputFidelity = Math.min(0.99, avgFidelity + 0.1 * (avgFidelity - 0.5));
    
    const successProb = 0.7; // 70% success rate
    const success = Math.random() < successProb;
    
    return {
      outputFidelity: success ? outputFidelity : 0,
      success,
      resourceCost: 2
    };
  }
  
  /**
   * Simulate Bennett-Brassard protocol
   */
  private simulateBennettBrassard(f1: number, f2: number): { outputFidelity: number; success: boolean; resourceCost: number } {
    // BB protocol optimized for high fidelity
    const outputFidelity = Math.sqrt(f1 * f2);
    const successProb = Math.sqrt(f1 * f2);
    const success = Math.random() < successProb;
    
    return {
      outputFidelity: success ? outputFidelity : 0,
      success,
      resourceCost: 2
    };
  }
  
  // =============================================================================
  // ENTANGLEMENT SWAPPING
  // =============================================================================
  
  /**
   * Perform entanglement swapping between distant nodes
   */
  async performEntanglementSwapping(request: SwappingRequest): Promise<SwappingResult> {
    const startTime = Date.now();
    
    try {
      // Get channels
      const channelAtoM = this.channels.get(request.channelAtoM);
      const channelMtoB = this.channels.get(request.channelMtoB);
      
      if (!channelAtoM || !channelMtoB) {
        throw new Error('Required channels not found for swapping');
      }
      
      // Get EPR pairs from each channel
      const pairAM = this.getBestAvailablePair(request.channelAtoM, request.targetFidelity);
      const pairMB = this.getBestAvailablePair(request.channelMtoB, request.targetFidelity);
      
      if (!pairAM || !pairMB) {
        throw new Error('Insufficient high-quality pairs for swapping');
      }
      
      // Perform Bell measurement at mediator node
      const bellMeasurementResult = this.performBellMeasurement(pairAM, pairMB);
      
      if (bellMeasurementResult.success) {
        // Create new direct channel between A and B
        const newChannelId = generateChannelId(request.nodeA, request.nodeB);
        
        // Calculate resulting fidelity after swapping
        const swappedFidelity = this.calculateSwappedFidelity(
          pairAM.fidelity,
          pairMB.fidelity,
          bellMeasurementResult.measurementFidelity
        );
        
        // Create swapped pair
        const swappedPair: EPRPair = {
          id: generateQuantumReferenceId(),
          stateA: pairAM.stateA, // Now connected to node A
          stateB: pairMB.stateB, // Now connected to node B
          entanglementType: 'bell_state',
          fidelity: swappedFidelity,
          createdAt: Date.now(),
          coherenceTime: Math.min(pairAM.coherenceTime, pairMB.coherenceTime),
          isUsed: false,
          purificationHistory: []
        };
        
        // Create or update channel
        if (!this.channels.has(newChannelId)) {
          await this.createChannel(request.nodeA, request.nodeB);
        }
        
        const channel = this.channels.get(newChannelId)!;
        const updatedChannel = {
          ...channel,
          eprPairs: [...channel.eprPairs, swappedPair],
          totalPairs: channel.totalPairs + 1,
          availablePairs: channel.availablePairs + 1,
          fidelity: Math.max(channel.fidelity, swappedFidelity)
        };
        this.channels.set(newChannelId, updatedChannel);
        this.pairs.set(swappedPair.id, swappedPair);
        
        // Mark original pairs as used
        this.markPairAsUsed(pairAM.id, `swapping_${Date.now()}`);
        this.markPairAsUsed(pairMB.id, `swapping_${Date.now()}`);
        
        return {
          success: true,
          newChannelId,
          swappedPair,
          achievedFidelity: swappedFidelity,
          swappingLatency: Date.now() - startTime,
          resourceCost: 2, // Consumed 2 pairs
          intermediateResults: {
            bellMeasurement: bellMeasurementResult,
            originalPairs: [pairAM.id, pairMB.id]
          }
        };
      } else {
        return {
          success: false,
          achievedFidelity: 0,
          swappingLatency: Date.now() - startTime,
          resourceCost: 2,
          error: {
            type: DistributedErrorType.PROTOCOL_VIOLATION,
            message: 'Bell measurement failed during swapping',
            quantumStateId: pairAM.id,
            timestamp: Date.now(),
            distributedType: DistributedErrorType.PROTOCOL_VIOLATION,
            nodeId: request.mediatorNode,
            networkDiagnostics: {
              latency: 0,
              packetLoss: 0,
              bandwidth: 0,
              jitter: 0,
              lastSuccessfulOperation: 0,
              errorRate: 1,
              recoveryTime: 0
            }
          },
          intermediateResults: {
            bellMeasurement: bellMeasurementResult
          }
        };
      }
      
    } catch (error) {
      return {
        success: false,
        achievedFidelity: 0,
        swappingLatency: Date.now() - startTime,
        resourceCost: 0,
        error: {
          type: DistributedErrorType.PROTOCOL_VIOLATION,
          message: `Swapping failed: ${error.message}`,
          quantumStateId: '' as QuantumReferenceId,
          timestamp: Date.now(),
          distributedType: DistributedErrorType.PROTOCOL_VIOLATION,
          nodeId: request.mediatorNode,
          networkDiagnostics: {
            latency: 0,
            packetLoss: 0,
            bandwidth: 0,
            jitter: 0,
            lastSuccessfulOperation: 0,
            errorRate: 1,
            recoveryTime: 0
          }
        },
        intermediateResults: { error: error.message }
      };
    }
  }
  
  /**
   * Get the best available pair from a channel
   */
  private getBestAvailablePair(channelId: ChannelId, minFidelity: number): EPRPair | undefined {
    const availablePairs = this.getAvailablePairs(channelId, minFidelity);
    if (availablePairs.length === 0) return undefined;
    
    // Return the highest fidelity pair
    return availablePairs.reduce((best, current) => 
      current.fidelity > best.fidelity ? current : best
    );
  }
  
  /**
   * Simulate Bell measurement for entanglement swapping
   */
  private performBellMeasurement(pairAM: EPRPair, pairMB: EPRPair): {
    success: boolean;
    measurementFidelity: number;
    bellState: string;
  } {
    // Simulate measurement with some probability of success
    const measurementFidelity = Math.min(pairAM.fidelity, pairMB.fidelity) * 0.9;
    const successProb = measurementFidelity;
    const success = Math.random() < successProb;
    
    const bellStates = ['|Φ+⟩', '|Φ-⟩', '|Ψ+⟩', '|Ψ-⟩'];
    const bellState = bellStates[Math.floor(Math.random() * bellStates.length)];
    
    return {
      success,
      measurementFidelity,
      bellState
    };
  }
  
  /**
   * Calculate fidelity after entanglement swapping
   */
  private calculateSwappedFidelity(f1: number, f2: number, measurementFidelity: number): number {
    // Simplified model: product of fidelities with measurement overhead
    return f1 * f2 * measurementFidelity * 0.8; // 20% overhead
  }
  
  // =============================================================================
  // BACKGROUND PROCESSES AND MAINTENANCE
  // =============================================================================
  
  /**
   * Process background EPR pair generation
   */
  private async processBackgroundGeneration(): Promise<void> {
    if (!this.config.backgroundGeneration) return;
    
    for (const [channelId, targetCount] of this.generationRequests) {
      const channel = this.channels.get(channelId);
      if (!channel || channel.status !== EPRChannelStatus.ACTIVE) continue;
      
      const currentCount = channel.availablePairs;
      if (currentCount < targetCount) {
        try {
          const needed = Math.min(5, targetCount - currentCount); // Generate up to 5 at a time
          await this.generateEPRPairs(channelId, needed);
        } catch (error) {
          console.error(`Background generation failed for channel ${channelId}:`, error);
        }
      }
    }
  }
  
  /**
   * Perform periodic maintenance
   */
  private async performMaintenance(): Promise<void> {
    await Promise.all([
      this.cleanupExpiredPairs(),
      this.cleanupExpiredAllocations(),
      this.cleanupExpiredReservations(),
      this.updateChannelHealth(),
      this.optimizeResourceAllocation()
    ]);
  }
  
  /**
   * Clean up expired EPR pairs
   */
  private async cleanupExpiredPairs(): Promise<void> {
    const now = Date.now();
    const expiredPairs: QuantumReferenceId[] = [];
    
    for (const [pairId, pair] of this.pairs) {
      if (pair.isUsed) continue;
      
      const age = now - pair.createdAt;
      const isExpired = age > this.config.defaultTTL;
      const isDecoherent = age > pair.coherenceTime;
      
      if (isExpired || isDecoherent) {
        expiredPairs.push(pairId);
      }
    }
    
    for (const pairId of expiredPairs) {
      await this.removePair(pairId);
    }
    
    if (expiredPairs.length > 0) {
      this.emit('pairsExpired', { count: expiredPairs.length });
    }
  }
  
  /**
   * Clean up expired allocations
   */
  private async cleanupExpiredAllocations(): Promise<void> {
    const now = Date.now();
    const expiredAllocations: string[] = [];
    
    for (const [allocationId, allocation] of this.allocations) {
      if (now > allocation.expiresAt) {
        expiredAllocations.push(allocationId);
        
        // Release allocated pairs back to the pool
        for (const pair of allocation.allocatedPairs) {
          if (this.pairs.has(pair.id)) {
            const releasedPair = { ...pair, isUsed: false };
            this.pairs.set(pair.id, releasedPair);
          }
        }
      }
    }
    
    for (const allocationId of expiredAllocations) {
      this.allocations.delete(allocationId);
    }
  }
  
  /**
   * Clean up expired reservations
   */
  private async cleanupExpiredReservations(): Promise<void> {
    const now = Date.now();
    const expiredReservations: string[] = [];
    
    for (const [reservationId, reservation] of this.reservations) {
      if (now > reservation.reservedUntil) {
        expiredReservations.push(reservationId);
      }
    }
    
    for (const reservationId of expiredReservations) {
      this.reservations.delete(reservationId);
    }
  }
  
  /**
   * Update channel health metrics
   */
  private async updateChannelHealth(): Promise<void> {
    for (const [channelId, channel] of this.channels) {
      const metrics = this.calculateChannelMetrics(channelId, channel);
      this.channelMetrics.set(channelId, metrics);
      
      // Update channel status based on health
      if (metrics.reliability < 0.5 && channel.status === EPRChannelStatus.ACTIVE) {
        await this.updateChannelStatus(channelId, EPRChannelStatus.DEGRADED);
      } else if (metrics.reliability > 0.8 && channel.status === EPRChannelStatus.DEGRADED) {
        await this.updateChannelStatus(channelId, EPRChannelStatus.ACTIVE);
      }
    }
  }
  
  /**
   * Calculate channel metrics
   */
  private calculateChannelMetrics(channelId: ChannelId, channel: EPRChannel): ChannelMetrics {
    const now = Date.now();
    const availablePairs = this.getAvailablePairs(channelId, 0);
    const totalPairs = channel.eprPairs.length;
    
    const avgFidelity = totalPairs > 0 ? 
      channel.eprPairs.reduce((sum, p) => sum + p.fidelity, 0) / totalPairs : 0;
    
    const usageRate = channel.usageCount / Math.max(1, (now - channel.createdAt) / 1000);
    const errorRate = 1 - avgFidelity;
    const reliability = Math.max(0, 1 - errorRate * 2);
    
    return {
      channelId,
      status: channel.status,
      fidelity: avgFidelity,
      pairCount: totalPairs,
      usageRate,
      errorRate,
      latency: 1.0, // Default latency in ms
      lastActivity: channel.lastUsed,
      reliability
    };
  }
  
  /**
   * Optimize resource allocation
   */
  private async optimizeResourceAllocation(): Promise<void> {
    if (!this.config.adaptivePooling) return;
    
    // Adjust generation targets based on usage patterns
    for (const [channelId, channel] of this.channels) {
      const metrics = this.channelMetrics.get(channelId);
      if (!metrics) continue;
      
      const currentTarget = this.generationRequests.get(channelId) || 0;
      let newTarget = currentTarget;
      
      // Increase target if usage is high
      if (metrics.usageRate > 10 && channel.availablePairs < this.config.maxPairsPerChannel * 0.5) {
        newTarget = Math.min(this.config.maxPairsPerChannel, currentTarget * 1.2);
      }
      
      // Decrease target if usage is low
      if (metrics.usageRate < 1 && channel.availablePairs > this.config.maxPairsPerChannel * 0.8) {
        newTarget = Math.max(10, currentTarget * 0.8);
      }
      
      if (newTarget !== currentTarget) {
        this.generationRequests.set(channelId, Math.floor(newTarget));
      }
    }
  }
  
  // =============================================================================
  // UTILITY METHODS
  // =============================================================================
  
  /**
   * Mark a pair as used
   */
  private markPairAsUsed(pairId: QuantumReferenceId, usedBy: string): void {
    const pair = this.pairs.get(pairId);
    if (pair) {
      const updatedPair = { ...pair, isUsed: true, usedAt: Date.now(), usedBy };
      this.pairs.set(pairId, updatedPair);
    }
  }
  
  /**
   * Remove a pair and clean up references
   */
  private async removePair(pairId: QuantumReferenceId): Promise<void> {
    const pair = this.pairs.get(pairId);
    if (!pair) return;
    
    // Remove from QMM
    try {
      await this.qmm.releaseQuantumState(pair.stateA);
      await this.qmm.releaseQuantumState(pair.stateB);
    } catch (error) {
      console.error(`Failed to release quantum states for pair ${pairId}:`, error);
    }
    
    // Remove from pairs map
    this.pairs.delete(pairId);
    
    // Update channel
    for (const [channelId, channel] of this.channels) {
      const updatedPairs = channel.eprPairs.filter(p => p.id !== pairId);
      if (updatedPairs.length !== channel.eprPairs.length) {
        const updatedChannel = {
          ...channel,
          eprPairs: updatedPairs,
          totalPairs: updatedPairs.length,
          availablePairs: updatedPairs.filter(p => !p.isUsed).length
        };
        this.channels.set(channelId, updatedChannel);
        break;
      }
    }
  }
  
  /**
   * Schedule generation for a channel
   */
  private scheduleGeneration(channelId: ChannelId, additionalPairs: number): void {
    const currentTarget = this.generationRequests.get(channelId) || 0;
    const newTarget = Math.min(
      this.config.maxPairsPerChannel,
      currentTarget + additionalPairs
    );
    this.generationRequests.set(channelId, newTarget);
  }
  
  /**
   * Initialize metrics
   */
  private initializeMetrics(): EPRPoolMetrics {
    return {
      totalChannels: 0,
      activeChannels: 0,
      totalPairs: 0,
      availablePairs: 0,
      allocatedPairs: 0,
      expiredPairs: 0,
      averageFidelity: 0,
      purificationSuccess: 0,
      swappingSuccess: 0,
      resourceUtilization: 0,
      generationRate: 0,
      allocationRate: 0,
      expirationRate: 0,
      lastUpdate: Date.now()
    };
  }
  
  /**
   * Initialize channel metrics
   */
  private initializeChannelMetrics(channelId: ChannelId): ChannelMetrics {
    return {
      channelId,
      status: EPRChannelStatus.ACTIVE,
      fidelity: this.config.defaultFidelity,
      pairCount: 0,
      usageRate: 0,
      errorRate: 1 - this.config.defaultFidelity,
      latency: 1.0,
      lastActivity: Date.now(),
      reliability: 1.0
    };
  }
  
  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const now = Date.now();
    const timeDelta = (now - this.lastMetricsUpdate) / 1000; // seconds
    
    let totalPairs = 0;
    let availablePairs = 0;
    let allocatedPairs = 0;
    let totalFidelity = 0;
    let activeChannels = 0;
    
    for (const channel of this.channels.values()) {
      if (channel.status === EPRChannelStatus.ACTIVE) {
        activeChannels++;
      }
      
      totalPairs += channel.totalPairs;
      availablePairs += channel.availablePairs;
      
      for (const pair of channel.eprPairs) {
        totalFidelity += pair.fidelity;
        if (pair.isUsed) {
          allocatedPairs++;
        }
      }
    }
    
    this.metrics = {
      totalChannels: this.channels.size,
      activeChannels,
      totalPairs,
      availablePairs,
      allocatedPairs,
      expiredPairs: this.metrics.expiredPairs, // Cumulative
      averageFidelity: totalPairs > 0 ? totalFidelity / totalPairs : 0,
      purificationSuccess: this.metrics.purificationSuccess, // Cumulative
      swappingSuccess: this.metrics.swappingSuccess, // Cumulative
      resourceUtilization: totalPairs > 0 ? allocatedPairs / totalPairs : 0,
      generationRate: this.config.generationRate,
      allocationRate: this.allocations.size / timeDelta,
      expirationRate: 0, // Would be calculated from actual expirations
      lastUpdate: now
    };
    
    this.lastMetricsUpdate = now;
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    this.on('channelCreated', (event) => {
      console.log(`EPR channel created: ${event.channelId} between ${event.nodeA} and ${event.nodeB}`);
    });
    
    this.on('pairsGenerated', (event) => {
      console.log(`Generated ${event.count} EPR pairs for channel ${event.channelId}`);
    });
    
    this.on('pairsAllocated', (event) => {
      console.log(`Allocated ${event.pairCount} EPR pairs for session ${event.sessionId}`);
    });
    
    this.on('pairsExpired', (event) => {
      console.log(`Cleaned up ${event.count} expired EPR pairs`);
    });
  }
  
  // =============================================================================
  // PUBLIC API
  // =============================================================================
  
  /**
   * Get current metrics
   */
  getMetrics(): EPRPoolMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Get channel metrics
   */
  getChannelMetrics(channelId: ChannelId): ChannelMetrics | undefined {
    return this.channelMetrics.get(channelId);
  }
  
  /**
   * Get all channels
   */
  getAllChannels(): ReadonlyArray<EPRChannel> {
    return Array.from(this.channels.values());
  }
  
  /**
   * Get active allocations
   */
  getActiveAllocations(): ReadonlyArray<EPRAllocation> {
    return Array.from(this.allocations.values()).filter(a => a.isActive);
  }
  
  /**
   * Get active reservations
   */
  getActiveReservations(): ReadonlyArray<EPRReservation> {
    return Array.from(this.reservations.values()).filter(r => r.isActive);
  }
  
  /**
   * Shutdown the EPR pool manager
   */
  async shutdown(): Promise<void> {
    // Clear timers
    clearInterval(this.generationTimer);
    clearInterval(this.maintenanceTimer);
    clearInterval(this.metricsTimer);
    
    // Clean up resources
    for (const channelId of this.channels.keys()) {
      await this.removeChannel(channelId);
    }
    
    // Remove all event listeners
    this.removeAllListeners();
    
    console.log('EPR Pool Manager shutdown complete');
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

// Create singleton instance
export const eprPoolManager = new EPRPoolManager();

// Export for external use
export default eprPoolManager;