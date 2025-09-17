/**
 * SINGULARIS PRIME Network Latency Estimator
 * 
 * EWMA-based network latency tracking and prediction for distributed quantum networks.
 * This module provides intelligent latency estimation and prediction to optimize
 * quantum operation scheduling and coherence budget allocation across nodes.
 * 
 * Key features:
 * - Exponentially Weighted Moving Average (EWMA) for latency tracking
 * - Jitter and packet loss measurement
 * - Multi-path latency analysis and route optimization
 * - Adaptive measurement frequency based on network conditions
 * - Predictive modeling for quantum operation windows
 * - Integration with coherence budget management
 * 
 * Core responsibilities:
 * - Real-time latency measurement and tracking
 * - Network path analysis and optimization
 * - Latency prediction for quantum operation scheduling
 * - Quality of Service (QoS) monitoring and enforcement
 * - Integration with distributed quantum memory management
 */

import { EventEmitter } from 'events';
import {
  NodeId,
  ChannelId,
  SessionId,
  DistributedQuantumNode,
  LatencyMetrics,
  NetworkPosition,
  CoherenceBudget,
  DistributedError,
  DistributedErrorType
} from '../../shared/types/distributed-quantum-types';

// =============================================================================
// LATENCY MEASUREMENT TYPES
// =============================================================================

export interface LatencyMeasurement {
  readonly sourceNode: NodeId;
  readonly targetNode: NodeId;
  readonly timestamp: number;
  readonly rtt: number; // Round-trip time in milliseconds
  readonly oneWayLatency: number; // Estimated one-way latency
  readonly jitter: number; // Variance in latency
  readonly packetLoss: number; // 0-1, percentage of lost packets
  readonly measurementMethod: 'ping' | 'quantum_probe' | 'classical_timing' | 'hybrid';
  readonly reliability: number; // 0-1, confidence in measurement
  readonly networkPath: ReadonlyArray<NodeId>; // Route taken by measurement
}

export interface LatencyPrediction {
  readonly targetNode: NodeId;
  readonly predictedLatency: number;
  readonly confidenceInterval: [number, number]; // [min, max] expected latency
  readonly reliability: number; // 0-1, prediction confidence
  readonly validUntil: number; // Timestamp when prediction expires
  readonly factors: LatencyFactors;
}

export interface LatencyFactors {
  readonly networkLoad: number; // 0-1, current network utilization
  readonly timeOfDay: number; // Hour of day (0-23)
  readonly historicalTrend: 'improving' | 'stable' | 'degrading';
  readonly routeStability: number; // 0-1, how stable the network path is
  readonly interferenceLevel: number; // 0-1, environmental interference
}

export interface NetworkTopology {
  readonly nodes: ReadonlyMap<NodeId, NetworkNode>;
  readonly edges: ReadonlyMap<string, NetworkEdge>; // "nodeA:nodeB" -> edge
  readonly routingTable: ReadonlyMap<NodeId, ReadonlyMap<NodeId, NetworkPath>>;
  readonly lastUpdate: number;
}

export interface NetworkNode {
  readonly id: NodeId;
  readonly position: NetworkPosition;
  readonly connections: ReadonlySet<NodeId>;
  readonly capacity: NetworkCapacity;
  readonly reliability: number;
  readonly lastSeen: number;
}

export interface NetworkEdge {
  readonly nodeA: NodeId;
  readonly nodeB: NodeId;
  readonly bandwidth: number; // Mbps
  readonly baseLatency: number; // milliseconds
  readonly reliability: number; // 0-1
  readonly utilizationHistory: ReadonlyArray<UtilizationPoint>;
  readonly isActive: boolean;
}

export interface NetworkPath {
  readonly route: ReadonlyArray<NodeId>;
  readonly totalLatency: number;
  readonly reliability: number;
  readonly bandwidth: number; // Bottleneck bandwidth
  readonly hopCount: number;
  readonly lastVerified: number;
}

export interface NetworkCapacity {
  readonly maxConnections: number;
  readonly currentConnections: number;
  readonly maxBandwidth: number; // Mbps
  readonly availableBandwidth: number; // Mbps
  readonly processingDelay: number; // milliseconds
}

export interface UtilizationPoint {
  readonly timestamp: number;
  readonly utilization: number; // 0-1
  readonly latency: number;
  readonly packetLoss: number;
}

// =============================================================================
// EWMA LATENCY TRACKER
// =============================================================================

export class EWMALatencyTracker {
  private readonly measurements = new Map<string, LatencyHistory>();
  private readonly alpha: number; // EWMA smoothing factor
  private readonly maxHistorySize: number;

  constructor(
    alpha: number = 0.125, // Standard TCP alpha value
    maxHistorySize: number = 1000
  ) {
    this.alpha = alpha;
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Update latency estimate with new measurement
   */
  updateLatency(measurement: LatencyMeasurement): LatencyMetrics {
    const key = this.getNodePairKey(measurement.sourceNode, measurement.targetNode);
    let history = this.measurements.get(key);

    if (!history) {
      history = {
        sourceNode: measurement.sourceNode,
        targetNode: measurement.targetNode,
        samples: [],
        ewmaLatency: measurement.rtt,
        ewmaJitter: 0,
        averageLatency: measurement.rtt,
        minLatency: measurement.rtt,
        maxLatency: measurement.rtt,
        packetLoss: measurement.packetLoss,
        reliability: measurement.reliability,
        lastMeasurement: measurement.timestamp,
        sampleCount: 0
      };
    }

    // Update EWMA
    const newLatency = this.alpha * measurement.rtt + (1 - this.alpha) * history.ewmaLatency;
    const jitterDelta = Math.abs(measurement.rtt - history.ewmaLatency);
    const newJitter = this.alpha * jitterDelta + (1 - this.alpha) * history.ewmaJitter;

    // Update history
    history.samples.push({
      timestamp: measurement.timestamp,
      rtt: measurement.rtt,
      jitter: measurement.jitter,
      packetLoss: measurement.packetLoss,
      reliability: measurement.reliability
    });

    // Keep history bounded
    if (history.samples.length > this.maxHistorySize) {
      history.samples = history.samples.slice(-this.maxHistorySize);
    }

    // Update aggregate statistics
    const allLatencies = history.samples.map(s => s.rtt);
    history.ewmaLatency = newLatency;
    history.ewmaJitter = newJitter;
    history.averageLatency = allLatencies.reduce((sum, lat) => sum + lat, 0) / allLatencies.length;
    history.minLatency = Math.min(...allLatencies);
    history.maxLatency = Math.max(...allLatencies);
    history.packetLoss = this.calculateWeightedAverage(history.samples.map(s => s.packetLoss));
    history.reliability = this.calculateWeightedAverage(history.samples.map(s => s.reliability));
    history.lastMeasurement = measurement.timestamp;
    history.sampleCount = history.samples.length;

    this.measurements.set(key, history);

    return {
      averageLatency: history.averageLatency,
      jitter: history.ewmaJitter,
      packetLoss: history.packetLoss,
      lastMeasurement: history.lastMeasurement,
      ewmaLatency: history.ewmaLatency,
      reliability: history.reliability
    };
  }

  /**
   * Get current latency metrics for a node pair
   */
  getLatencyMetrics(sourceNode: NodeId, targetNode: NodeId): LatencyMetrics | undefined {
    const key = this.getNodePairKey(sourceNode, targetNode);
    const history = this.measurements.get(key);
    
    if (!history) return undefined;

    return {
      averageLatency: history.averageLatency,
      jitter: history.ewmaJitter,
      packetLoss: history.packetLoss,
      lastMeasurement: history.lastMeasurement,
      ewmaLatency: history.ewmaLatency,
      reliability: history.reliability
    };
  }

  /**
   * Predict latency for future operations
   */
  predictLatency(
    sourceNode: NodeId, 
    targetNode: NodeId, 
    futureTime: number
  ): LatencyPrediction | undefined {
    const key = this.getNodePairKey(sourceNode, targetNode);
    const history = this.measurements.get(key);
    
    if (!history || history.samples.length < 3) return undefined;

    // Analyze trends in recent measurements
    const recentSamples = history.samples.slice(-20); // Last 20 samples
    const trend = this.analyzeTrend(recentSamples);
    
    // Calculate base prediction from EWMA
    let predictedLatency = history.ewmaLatency;
    
    // Apply trend adjustment
    const timeDelta = futureTime - history.lastMeasurement;
    const trendAdjustment = this.calculateTrendAdjustment(trend, timeDelta);
    predictedLatency += trendAdjustment;
    
    // Calculate confidence interval based on jitter
    const confidenceMargin = history.ewmaJitter * 2; // 2-sigma confidence
    const confidenceInterval: [number, number] = [
      Math.max(0, predictedLatency - confidenceMargin),
      predictedLatency + confidenceMargin
    ];
    
    // Calculate reliability based on sample size and consistency
    const reliability = Math.min(1.0, history.sampleCount / 100) * history.reliability;
    
    return {
      targetNode,
      predictedLatency,
      confidenceInterval,
      reliability,
      validUntil: futureTime + 30000, // Valid for 30 seconds
      factors: {
        networkLoad: this.estimateNetworkLoad(history),
        timeOfDay: new Date(futureTime).getHours(),
        historicalTrend: trend,
        routeStability: this.calculateRouteStability(history),
        interferenceLevel: history.ewmaJitter / history.averageLatency
      }
    };
  }

  /**
   * Get all tracked node pairs and their metrics
   */
  getAllMetrics(): ReadonlyMap<string, LatencyMetrics> {
    const metrics = new Map<string, LatencyMetrics>();
    
    for (const [key, history] of this.measurements) {
      metrics.set(key, {
        averageLatency: history.averageLatency,
        jitter: history.ewmaJitter,
        packetLoss: history.packetLoss,
        lastMeasurement: history.lastMeasurement,
        ewmaLatency: history.ewmaLatency,
        reliability: history.reliability
      });
    }
    
    return metrics;
  }

  private getNodePairKey(nodeA: NodeId, nodeB: NodeId): string {
    // Ensure consistent ordering for bidirectional links
    return nodeA < nodeB ? `${nodeA}:${nodeB}` : `${nodeB}:${nodeA}`;
  }

  private calculateWeightedAverage(values: number[]): number {
    if (values.length === 0) return 0;
    
    // Weight recent values more heavily
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (let i = 0; i < values.length; i++) {
      const weight = Math.pow(0.9, values.length - i - 1); // Exponential weighting
      weightedSum += values[i] * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private analyzeTrend(samples: LatencySample[]): 'improving' | 'stable' | 'degrading' {
    if (samples.length < 3) return 'stable';
    
    // Calculate linear regression slope
    const n = samples.length;
    const sumX = samples.reduce((sum, _, i) => sum + i, 0);
    const sumY = samples.reduce((sum, s) => sum + s.rtt, 0);
    const sumXY = samples.reduce((sum, s, i) => sum + i * s.rtt, 0);
    const sumX2 = samples.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Classify trend based on slope
    if (slope < -0.1) return 'improving';
    if (slope > 0.1) return 'degrading';
    return 'stable';
  }

  private calculateTrendAdjustment(trend: 'improving' | 'stable' | 'degrading', timeDelta: number): number {
    const timeFactorMs = timeDelta / 1000; // Convert to seconds
    
    switch (trend) {
      case 'improving':
        return -0.5 * timeFactorMs; // Small improvement over time
      case 'degrading':
        return 1.0 * timeFactorMs; // Gradual degradation
      case 'stable':
      default:
        return 0;
    }
  }

  private estimateNetworkLoad(history: LatencyHistory): number {
    // Estimate network load based on recent latency increases
    const recentSamples = history.samples.slice(-10);
    if (recentSamples.length < 2) return 0.5;
    
    const recentAvg = recentSamples.reduce((sum, s) => sum + s.rtt, 0) / recentSamples.length;
    const historicalAvg = history.averageLatency;
    
    const loadFactor = recentAvg / historicalAvg;
    return Math.max(0, Math.min(1, (loadFactor - 1) * 2)); // Normalize to 0-1
  }

  private calculateRouteStability(history: LatencyHistory): number {
    // Calculate route stability based on latency variance
    if (history.samples.length < 5) return 0.5;
    
    const variance = this.calculateVariance(history.samples.map(s => s.rtt));
    const coefficientOfVariation = Math.sqrt(variance) / history.averageLatency;
    
    // Lower variance = higher stability
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }
}

// =============================================================================
// LATENCY ESTIMATOR SERVICE
// =============================================================================

export class LatencyEstimator extends EventEmitter {
  private readonly ewmaTracker: EWMALatencyTracker;
  private readonly networkTopology: NetworkTopology;
  private readonly measurementScheduler: MeasurementScheduler;
  private readonly pathOptimizer: PathOptimizer;
  
  private isRunning = false;
  private measurementInterval: NodeJS.Timeout | null = null;

  constructor(
    ewmaAlpha: number = 0.125,
    measurementIntervalMs: number = 5000
  ) {
    super();
    
    this.ewmaTracker = new EWMALatencyTracker(ewmaAlpha);
    this.networkTopology = this.initializeNetworkTopology();
    this.measurementScheduler = new MeasurementScheduler(measurementIntervalMs);
    this.pathOptimizer = new PathOptimizer(this.networkTopology);
    
    this.setupEventHandlers();
  }

  /**
   * Start the latency estimation service
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.measurementScheduler.start(this.performMeasurement.bind(this));
    
    this.emit('latency_estimator_started', { timestamp: Date.now() });
    console.log('Latency Estimator started');
  }

  /**
   * Stop the latency estimation service
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    this.measurementScheduler.stop();
    
    this.emit('latency_estimator_stopped', { timestamp: Date.now() });
    console.log('Latency Estimator stopped');
  }

  /**
   * Record a latency measurement
   */
  recordMeasurement(measurement: LatencyMeasurement): LatencyMetrics {
    const metrics = this.ewmaTracker.updateLatency(measurement);
    
    // Update network topology if this is a new path
    this.updateNetworkTopology(measurement);
    
    this.emit('latency_measured', {
      sourceNode: measurement.sourceNode,
      targetNode: measurement.targetNode,
      latency: measurement.rtt,
      jitter: measurement.jitter,
      reliability: measurement.reliability,
      timestamp: measurement.timestamp
    });
    
    return metrics;
  }

  /**
   * Get current latency metrics between two nodes
   */
  getLatency(sourceNode: NodeId, targetNode: NodeId): LatencyMetrics | undefined {
    return this.ewmaTracker.getLatencyMetrics(sourceNode, targetNode);
  }

  /**
   * Predict latency for a future operation
   */
  predictLatency(
    sourceNode: NodeId, 
    targetNode: NodeId, 
    operationTime: number
  ): LatencyPrediction | undefined {
    return this.ewmaTracker.predictLatency(sourceNode, targetNode, operationTime);
  }

  /**
   * Find optimal path between two nodes
   */
  findOptimalPath(sourceNode: NodeId, targetNode: NodeId): NetworkPath | undefined {
    return this.pathOptimizer.findBestPath(sourceNode, targetNode);
  }

  /**
   * Get network topology information
   */
  getNetworkTopology(): NetworkTopology {
    return {
      nodes: new Map(this.networkTopology.nodes),
      edges: new Map(this.networkTopology.edges),
      routingTable: new Map(Array.from(this.networkTopology.routingTable.entries()).map(
        ([nodeId, routes]) => [nodeId, new Map(routes)]
      )),
      lastUpdate: this.networkTopology.lastUpdate
    };
  }

  /**
   * Update network topology with new node information
   */
  updateNodeInfo(node: NetworkNode): void {
    const mutableTopology = this.networkTopology as any;
    mutableTopology.nodes.set(node.id, node);
    mutableTopology.lastUpdate = Date.now();
    
    // Recompute routing table if significant changes
    this.pathOptimizer.recomputeRoutes();
    
    this.emit('topology_updated', {
      nodeId: node.id,
      timestamp: Date.now()
    });
  }

  /**
   * Get comprehensive latency statistics
   */
  getLatencyStatistics(): LatencyStatistics {
    const allMetrics = this.ewmaTracker.getAllMetrics();
    
    let totalLatency = 0;
    let totalJitter = 0;
    let totalPacketLoss = 0;
    let totalReliability = 0;
    let minLatency = Infinity;
    let maxLatency = 0;
    
    for (const metrics of allMetrics.values()) {
      totalLatency += metrics.averageLatency;
      totalJitter += metrics.jitter;
      totalPacketLoss += metrics.packetLoss;
      totalReliability += metrics.reliability;
      minLatency = Math.min(minLatency, metrics.averageLatency);
      maxLatency = Math.max(maxLatency, metrics.averageLatency);
    }
    
    const nodeCount = allMetrics.size;
    
    return {
      trackedConnections: nodeCount,
      averageLatency: nodeCount > 0 ? totalLatency / nodeCount : 0,
      averageJitter: nodeCount > 0 ? totalJitter / nodeCount : 0,
      averagePacketLoss: nodeCount > 0 ? totalPacketLoss / nodeCount : 0,
      averageReliability: nodeCount > 0 ? totalReliability / nodeCount : 0,
      minLatency: minLatency === Infinity ? 0 : minLatency,
      maxLatency,
      networkEfficiency: this.calculateNetworkEfficiency(),
      lastUpdate: Date.now()
    };
  }

  // Private helper methods

  private async performMeasurement(sourceNode: NodeId, targetNode: NodeId): Promise<void> {
    try {
      // Simulate latency measurement
      // In a real implementation, this would perform actual network probes
      const rtt = this.simulateLatencyMeasurement(sourceNode, targetNode);
      
      const measurement: LatencyMeasurement = {
        sourceNode,
        targetNode,
        timestamp: Date.now(),
        rtt,
        oneWayLatency: rtt / 2,
        jitter: Math.random() * 5, // Random jitter
        packetLoss: Math.random() * 0.01, // 0-1% packet loss
        measurementMethod: 'classical_timing',
        reliability: 0.95 + Math.random() * 0.05,
        networkPath: [sourceNode, targetNode] // Direct path for simulation
      };
      
      this.recordMeasurement(measurement);
      
    } catch (error) {
      this.emit('measurement_error', {
        sourceNode,
        targetNode,
        error: error instanceof Error ? error.message : 'Unknown measurement error',
        timestamp: Date.now()
      });
    }
  }

  private simulateLatencyMeasurement(sourceNode: NodeId, targetNode: NodeId): number {
    // Simulate realistic network latency based on node IDs
    const baseLatency = 10 + Math.random() * 40; // 10-50ms base latency
    const networkNoise = (Math.random() - 0.5) * 10; // ±5ms noise
    const loadFactor = 1 + Math.random() * 0.2; // 0-20% load increase
    
    return Math.max(1, baseLatency + networkNoise) * loadFactor;
  }

  private updateNetworkTopology(measurement: LatencyMeasurement): void {
    const mutableTopology = this.networkTopology as any;
    const edgeKey = `${measurement.sourceNode}:${measurement.targetNode}`;
    
    // Update or create edge
    const existingEdge = mutableTopology.edges.get(edgeKey);
    if (existingEdge) {
      // Update utilization history
      const newUtilization: UtilizationPoint = {
        timestamp: measurement.timestamp,
        utilization: 0.5, // Simulated utilization
        latency: measurement.rtt,
        packetLoss: measurement.packetLoss
      };
      
      existingEdge.utilizationHistory.push(newUtilization);
      if (existingEdge.utilizationHistory.length > 100) {
        existingEdge.utilizationHistory = existingEdge.utilizationHistory.slice(-100);
      }
    } else {
      // Create new edge
      const newEdge: NetworkEdge = {
        nodeA: measurement.sourceNode,
        nodeB: measurement.targetNode,
        bandwidth: 1000, // Simulated 1Gbps
        baseLatency: measurement.rtt,
        reliability: measurement.reliability,
        utilizationHistory: [{
          timestamp: measurement.timestamp,
          utilization: 0.5,
          latency: measurement.rtt,
          packetLoss: measurement.packetLoss
        }],
        isActive: true
      };
      
      mutableTopology.edges.set(edgeKey, newEdge);
    }
    
    mutableTopology.lastUpdate = Date.now();
  }

  private initializeNetworkTopology(): NetworkTopology {
    return {
      nodes: new Map(),
      edges: new Map(),
      routingTable: new Map(),
      lastUpdate: Date.now()
    };
  }

  private calculateNetworkEfficiency(): number {
    const allMetrics = this.ewmaTracker.getAllMetrics();
    if (allMetrics.size === 0) return 1.0;
    
    let totalEfficiency = 0;
    for (const metrics of allMetrics.values()) {
      // Efficiency based on latency vs. expected minimum
      const expectedMinLatency = 10; // 10ms ideal latency
      const efficiency = Math.max(0, Math.min(1, expectedMinLatency / metrics.averageLatency));
      totalEfficiency += efficiency;
    }
    
    return totalEfficiency / allMetrics.size;
  }

  private setupEventHandlers(): void {
    this.on('latency_measured', (event) => {
      console.log(`Latency measured: ${event.sourceNode} -> ${event.targetNode}: ${event.latency}ms`);
    });
    
    this.on('measurement_error', (event) => {
      console.warn(`Latency measurement failed: ${event.sourceNode} -> ${event.targetNode}: ${event.error}`);
    });
  }
}

// =============================================================================
// HELPER CLASSES
// =============================================================================

class MeasurementScheduler {
  private interval: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  private measurementCallback: ((sourceNode: NodeId, targetNode: NodeId) => Promise<void>) | null = null;

  constructor(intervalMs: number) {
    this.intervalMs = intervalMs;
  }

  start(callback: (sourceNode: NodeId, targetNode: NodeId) => Promise<void>): void {
    this.measurementCallback = callback;
    
    this.interval = setInterval(async () => {
      // In a real implementation, this would measure all active node pairs
      // For simulation, we'll just measure a few sample pairs
      const samplePairs = [
        ['node1' as NodeId, 'node2' as NodeId],
        ['node1' as NodeId, 'node3' as NodeId],
        ['node2' as NodeId, 'node3' as NodeId]
      ];
      
      for (const [sourceNode, targetNode] of samplePairs) {
        if (this.measurementCallback) {
          await this.measurementCallback(sourceNode, targetNode);
        }
      }
    }, this.intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.measurementCallback = null;
  }
}

class PathOptimizer {
  constructor(private readonly topology: NetworkTopology) {}

  findBestPath(sourceNode: NodeId, targetNode: NodeId): NetworkPath | undefined {
    // Simplified path finding - in reality would use Dijkstra's algorithm
    // For now, return direct path if available
    
    const edgeKey = sourceNode < targetNode ? 
      `${sourceNode}:${targetNode}` : 
      `${targetNode}:${sourceNode}`;
    
    const edge = this.topology.edges.get(edgeKey);
    if (!edge) return undefined;
    
    return {
      route: [sourceNode, targetNode],
      totalLatency: edge.baseLatency,
      reliability: edge.reliability,
      bandwidth: edge.bandwidth,
      hopCount: 1,
      lastVerified: Date.now()
    };
  }

  recomputeRoutes(): void {
    // Recompute optimal routes based on current topology
    console.log('Recomputing network routes based on topology changes');
  }
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface LatencyHistory {
  sourceNode: NodeId;
  targetNode: NodeId;
  samples: LatencySample[];
  ewmaLatency: number;
  ewmaJitter: number;
  averageLatency: number;
  minLatency: number;
  maxLatency: number;
  packetLoss: number;
  reliability: number;
  lastMeasurement: number;
  sampleCount: number;
}

interface LatencySample {
  timestamp: number;
  rtt: number;
  jitter: number;
  packetLoss: number;
  reliability: number;
}

export interface LatencyStatistics {
  readonly trackedConnections: number;
  readonly averageLatency: number;
  readonly averageJitter: number;
  readonly averagePacketLoss: number;
  readonly averageReliability: number;
  readonly minLatency: number;
  readonly maxLatency: number;
  readonly networkEfficiency: number;
  readonly lastUpdate: number;
}

// Export singleton instance
export const latencyEstimator = new LatencyEstimator();