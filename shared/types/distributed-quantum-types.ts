/**
 * SINGULARIS PRIME Distributed Quantum Networks (DQN) Type System
 * 
 * This module defines the comprehensive type system for distributed quantum computing
 * across multiple nodes, extending the core quantum types with network-aware constructs.
 * 
 * Key features:
 * - Multi-node quantum state management
 * - EPR channel and resource management
 * - Distributed entanglement groups
 * - Network latency and coherence budget tracking
 * - Cross-node teleportation protocols
 * - Fault tolerance and session management
 */

import {
  QuantumState,
  QuantumReferenceId,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  QuantumPurity,
  QuantumDimension,
  QuantumError,
  QuantumErrorType,
  Complex
} from './quantum-types';

import {
  QuantumHandle,
  QuantumBorrowHandle,
  QuantumMemoryNode,
  MemoryCriticality,
  EntanglementGroupId
} from './quantum-memory-types';

// =============================================================================
// DISTRIBUTED NETWORK IDENTIFIERS
// =============================================================================

export type NodeId = string & { readonly _brand: 'NodeId' };
export type ChannelId = string & { readonly _brand: 'ChannelId' };
export type SessionId = string & { readonly _brand: 'SessionId' };
export type NetworkAddress = string & { readonly _brand: 'NetworkAddress' };

// ID generators
export function generateNodeId(name: string): NodeId {
  return `node_${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as NodeId;
}

export function generateChannelId(nodeA: NodeId, nodeB: NodeId): ChannelId {
  const sortedNodes = [nodeA, nodeB].sort();
  return `channel_${sortedNodes[0]}_${sortedNodes[1]}_${Date.now()}` as ChannelId;
}

export function generateSessionId(): SessionId {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as SessionId;
}

// =============================================================================
// DISTRIBUTED QUANTUM NODE TYPES
// =============================================================================

/**
 * Distributed Quantum Node - A participant in the quantum network
 */
export interface DistributedQuantumNode {
  readonly id: NodeId;
  readonly address: NetworkAddress;
  readonly capabilities: NodeCapabilities;
  readonly status: NodeStatus;
  readonly lastHeartbeat: number;
  readonly networkLatency: Map<NodeId, LatencyMetrics>;
  readonly localStates: ReadonlyMap<QuantumReferenceId, QuantumState>;
  readonly entanglementGroups: ReadonlyMap<EntanglementGroupId, DistributedEntanglementGroup>;
  readonly eprChannels: ReadonlyMap<ChannelId, EPRChannel>;
  readonly activeSessions: ReadonlyMap<SessionId, DistributedSession>;
  
  // Resource management
  readonly maxQubits: number;
  readonly availableQubits: number;
  readonly coherenceTime: number;
  readonly fidelityThreshold: number;
  
  // Network topology
  readonly connectedNodes: ReadonlySet<NodeId>;
  readonly routingTable: ReadonlyMap<NodeId, NodeId>; // destination -> next hop
  
  // Security and authentication
  readonly publicKey: string;
  readonly trustLevel: TrustLevel;
  readonly lastAuthenticated: number;
}

export interface NodeCapabilities {
  readonly canTeleport: boolean;
  readonly canPurify: boolean;
  readonly canSwapEntanglement: boolean;
  readonly maxEntangledStates: number;
  readonly supportedDimensions: ReadonlyArray<QuantumDimension>;
  readonly minFidelity: number;
  readonly maxLatency: number; // milliseconds
  readonly cryptographicProtocols: ReadonlyArray<string>;
}

export enum NodeStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  DEGRADED = 'degraded',
  SYNCHRONIZING = 'synchronizing',
  FAULT = 'fault'
}

export enum TrustLevel {
  UNTRUSTED = 'untrusted',
  VERIFIED = 'verified',
  TRUSTED = 'trusted',
  CRITICAL = 'critical'
}

export interface LatencyMetrics {
  readonly averageLatency: number; // milliseconds
  readonly jitter: number;
  readonly packetLoss: number; // 0-1
  readonly lastMeasurement: number;
  readonly ewmaLatency: number; // exponentially weighted moving average
  readonly reliability: number; // 0-1
}

// =============================================================================
// DISTRIBUTED QUANTUM HANDLES
// =============================================================================

/**
 * Distributed Quantum Handle - Extends QuantumHandle for network-aware state management
 */
export interface DistributedQuantumHandle<T extends QuantumState = QuantumState> 
  extends QuantumHandle<T> {
  readonly nodeId: NodeId;
  readonly isLocal: boolean;
  readonly networkMetadata: NetworkMetadata;
  
  // Distributed operations
  teleportTo(targetNode: NodeId, channel: ChannelId): Promise<TeleportationResult>;
  createRemoteEntanglement(targetNode: NodeId, targetState: QuantumReferenceId): Promise<EntanglementResult>;
  migrateToNode(targetNode: NodeId): Promise<MigrationResult>;
  
  // Network-aware access
  getStateWithLatency(): Promise<{ state: T | undefined; latency: number }>;
  estimateCoherenceRemaining(): number;
  getNetworkPosition(): NetworkPosition;
  
  // Type-level distributed constraints
  readonly __distributedQuantumHandle: symbol;
}

export interface NetworkMetadata {
  readonly createdAt: number;
  readonly lastSync: number;
  readonly syncFrequency: number;
  readonly coherenceBudget: CoherenceBudget;
  readonly networkPath: ReadonlyArray<NodeId>;
  readonly reliability: number;
  readonly estimatedLifetime: number;
}

export interface CoherenceBudget {
  readonly totalBudget: number; // microseconds
  readonly usedBudget: number;
  readonly remainingBudget: number;
  readonly networkOverhead: number;
  readonly decoherenceRate: number;
  readonly lastUpdate: number;
  readonly perOperationBudget: number; // microseconds per operation
}

export interface NetworkPosition {
  readonly nodeId: NodeId;
  readonly localAddress: string;
  readonly networkDistance: Map<NodeId, number>; // hops
  readonly topologyRole: 'leaf' | 'hub' | 'gateway' | 'isolated';
}

// =============================================================================
// EPR CHANNELS AND RESOURCE MANAGEMENT
// =============================================================================

/**
 * EPR Channel - Quantum communication channel between two nodes
 */
export interface EPRChannel {
  readonly id: ChannelId;
  readonly nodeA: NodeId;
  readonly nodeB: NodeId;
  readonly status: ChannelStatus;
  readonly fidelity: number; // 0-1
  readonly createdAt: number;
  readonly lastUsed: number;
  readonly usageCount: number;
  readonly maxUsage: number;
  
  // EPR pair pool
  readonly eprPairs: ReadonlyArray<EPRPair>;
  readonly availablePairs: number;
  readonly totalPairs: number;
  readonly generationRate: number; // pairs per second
  
  // Quality metrics
  readonly entanglementStrength: number;
  readonly coherenceTime: number;
  readonly errorRate: number;
  readonly purificationLevel: number;
  
  // Protocol support
  readonly supportedProtocols: ReadonlyArray<QuantumProtocol>;
  readonly authentication: ChannelAuthentication;
  readonly encryption: ChannelEncryption;
}

export enum ChannelStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  DEGRADED = 'degraded',
  FAILED = 'failed',
  MAINTENANCE = 'maintenance'
}

export interface EPRPair {
  readonly id: QuantumReferenceId;
  readonly stateA: QuantumReferenceId; // qubit on node A
  readonly stateB: QuantumReferenceId; // qubit on node B
  readonly entanglementType: 'bell_state' | 'maximally_entangled';
  readonly fidelity: number;
  readonly createdAt: number;
  readonly coherenceTime: number;
  readonly isUsed: boolean;
  readonly purificationHistory: ReadonlyArray<PurificationStep>;
}

export interface PurificationStep {
  readonly timestamp: number;
  readonly protocol: 'breeding' | 'distillation' | 'hashing';
  readonly inputFidelity: number;
  readonly outputFidelity: number;
  readonly success: boolean;
  readonly resourceCost: number;
}

export enum QuantumProtocol {
  TELEPORTATION = 'teleportation',
  SUPER_DENSE_CODING = 'super_dense_coding',
  QUANTUM_KEY_DISTRIBUTION = 'qkd',
  DISTRIBUTED_COMPUTING = 'distributed_computing',
  ENTANGLEMENT_SWAPPING = 'entanglement_swapping',
  QUANTUM_ERROR_CORRECTION = 'quantum_error_correction'
}

export interface ChannelAuthentication {
  readonly method: 'quantum_signature' | 'classical_cert' | 'hybrid';
  readonly publicKeyA: string;
  readonly publicKeyB: string;
  readonly lastAuthenticated: number;
  readonly trustScore: number;
}

export interface ChannelEncryption {
  readonly enabled: boolean;
  readonly algorithm: string;
  readonly keyRotationPeriod: number;
  readonly lastKeyRotation: number;
}

// =============================================================================
// DISTRIBUTED ENTANGLEMENT GROUPS
// =============================================================================

/**
 * Distributed Entanglement Group - Multi-node entangled quantum systems
 */
export interface DistributedEntanglementGroup extends EntangledSystem {
  readonly distributedId: EntanglementGroupId;
  readonly participatingNodes: ReadonlyMap<NodeId, ReadonlyArray<QuantumReferenceId>>;
  readonly topology: EntanglementTopology;
  readonly consistency: GroupConsistency;
  readonly synchronization: GroupSynchronization;
  
  // Network properties
  readonly maxLatency: number;
  readonly minFidelity: number;
  readonly coherenceBound: number;
  readonly networkSpan: number; // maximum distance between nodes
  
  // Fault tolerance
  readonly redundancy: number;
  readonly repairCapability: RepairCapability;
  readonly isolationStrategy: IsolationStrategy;
  
  // Type-level distributed entanglement constraints
  readonly __distributedEntangled: symbol;
}

export interface EntanglementTopology {
  readonly type: 'star' | 'linear' | 'ring' | 'mesh' | 'tree' | 'custom';
  readonly centralNode?: NodeId; // for star topology
  readonly adjacencyMatrix: ReadonlyArray<ReadonlyArray<boolean>>;
  readonly shortestPaths: ReadonlyMap<[NodeId, NodeId], ReadonlyArray<NodeId>>;
  readonly diameter: number; // maximum shortest path length
}

export interface GroupConsistency {
  readonly level: 'weak' | 'strong' | 'sequential' | 'linearizable';
  readonly lastConsistencyCheck: number;
  readonly inconsistencyCount: number;
  readonly repairAttempts: number;
  readonly maximumInconsistencyTime: number;
}

export interface GroupSynchronization {
  readonly clockSync: ClockSynchronization;
  readonly stateSync: StateSynchronization;
  readonly operationOrdering: OperationOrdering;
}

export interface ClockSynchronization {
  readonly protocol: 'ntp' | 'ptp' | 'quantum_clock';
  readonly accuracy: number; // nanoseconds
  readonly lastSync: number;
  readonly driftRate: number;
  readonly maxOffset: number;
}

export interface StateSynchronization {
  readonly frequency: number; // Hz
  readonly lastSync: number;
  readonly deltaCompression: boolean;
  readonly checksumVerification: boolean;
  readonly conflictResolution: 'last_write_wins' | 'vector_clock' | 'quantum_voting';
}

export interface OperationOrdering {
  readonly protocol: 'lamport' | 'vector_clock' | 'quantum_causal';
  readonly globalClock: number;
  readonly causalityViolations: number;
  readonly pendingOperations: ReadonlyArray<DistributedOperation>;
}

export enum RepairCapability {
  NONE = 'none',
  BASIC = 'basic',           // Can detect and report errors
  CORRECTING = 'correcting', // Can correct single errors
  TOLERANT = 'tolerant'      // Can tolerate multiple errors
}

export enum IsolationStrategy {
  ABORT = 'abort',           // Abort all operations on fault
  DEGRADE = 'degrade',       // Continue with reduced capability
  ISOLATE = 'isolate',       // Isolate faulty nodes
  REPAIR = 'repair'          // Attempt repair and continue
}

// =============================================================================
// DISTRIBUTED OPERATIONS AND PROTOCOLS
// =============================================================================

/**
 * Distributed Quantum Operation - Operations spanning multiple nodes
 */
export interface DistributedOperation {
  readonly id: string;
  readonly operationId: string; // Alias for id for compatibility
  readonly type: DistributedOperationType;
  readonly involvedNodes: ReadonlySet<NodeId>;
  readonly requiredChannels: ReadonlySet<ChannelId>;
  readonly sessionId: SessionId;
  readonly priority: OperationPriority;
  readonly deadline: number;
  readonly coherenceBudget: CoherenceBudget;
  
  // Direct operation parameters (for backwards compatibility)
  readonly sourceStates?: ReadonlyArray<QuantumReferenceId>;
  readonly targetNodes?: ReadonlyArray<NodeId>;
  readonly channels?: ReadonlyArray<ChannelId>;
  readonly fidelityThreshold?: number;
  readonly timeoutMs?: number;
  readonly additionalParams?: Record<string, any>;
  
  // Operation parameters (structured)
  readonly parameters: DistributedOperationParameters;
  readonly preconditions: ReadonlyArray<OperationPrecondition>;
  readonly postconditions: ReadonlyArray<OperationPostcondition>;
  
  // Execution tracking
  readonly status: OperationStatus;
  readonly progress: OperationProgress;
  readonly errors: ReadonlyArray<DistributedError>;
  readonly startTime?: number;
  readonly endTime?: number;
  
  // Fault tolerance
  readonly retryPolicy: RetryPolicy;
  readonly fallbackStrategy: FallbackStrategy;
  readonly rollbackCapability: boolean;
}

export enum DistributedOperationType {
  TELEPORTATION = 'teleportation',
  ENTANGLEMENT_SWAPPING = 'entanglement_swapping',
  DISTRIBUTED_MEASUREMENT = 'distributed_measurement',
  QUANTUM_ERROR_CORRECTION = 'quantum_error_correction',
  EPR_GENERATION = 'epr_generation',
  STATE_MIGRATION = 'state_migration',
  BARRIER_SYNCHRONIZATION = 'barrier_synchronization'
}

export enum OperationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

export interface DistributedOperationParameters {
  readonly sourceStates: ReadonlyArray<QuantumReferenceId>;
  readonly targetNodes: ReadonlyArray<NodeId>;
  readonly channels: ReadonlyArray<ChannelId>;
  readonly fidelityThreshold: number;
  readonly timeoutMs: number;
  readonly additionalParams: Record<string, any>;
}

// Additional interface for missing properties in DistributedOperation
export interface DistributedOperationExtended extends DistributedOperation {
  readonly sourceStates?: ReadonlyArray<QuantumReferenceId>;
  readonly targetNodes?: ReadonlyArray<NodeId>;
  readonly channels?: ReadonlyArray<ChannelId>;
  readonly fidelityThreshold?: number;
  readonly timeoutMs?: number;
  readonly additionalParams?: Record<string, any>;
}

export interface OperationPrecondition {
  readonly type: 'state_coherent' | 'channel_available' | 'node_online' | 'fidelity_sufficient';
  readonly target: QuantumReferenceId | NodeId | ChannelId;
  readonly condition: any;
  readonly critical: boolean;
}

export interface OperationPostcondition {
  readonly type: 'state_entangled' | 'state_teleported' | 'fidelity_maintained' | 'consistency_preserved';
  readonly target: QuantumReferenceId | NodeId | ChannelId;
  readonly expectedValue: any;
  readonly tolerance: number;
}

export enum OperationStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled',
  ROLLED_BACK = 'rolled_back'
}

export interface OperationProgress {
  readonly phase: string;
  readonly completionPercent: number;
  readonly currentStep: string;
  readonly estimatedTimeRemaining: number;
  readonly resourcesUsed: ResourceUsage;
  readonly lastUpdate: number;
}

export interface ResourceUsage {
  readonly qubits: number;
  readonly eprPairs: number;
  readonly networkBandwidth: number; // bytes
  readonly computeCycles: number;
  readonly coherenceTime: number; // microseconds
}

export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffStrategy: 'linear' | 'exponential' | 'adaptive';
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
  readonly retryableErrors: ReadonlySet<DistributedErrorType>;
}

export enum FallbackStrategy {
  ABORT = 'abort',
  CLASSICAL = 'classical',
  DEGRADED = 'degraded',
  ALTERNATIVE_PATH = 'alternative_path',
  WAIT_AND_RETRY = 'wait_and_retry',
  RETRY = 'retry'
}

// =============================================================================
// DISTRIBUTED SESSION MANAGEMENT
// =============================================================================

/**
 * Distributed Session - Manages multi-node quantum computation sessions
 */
export interface DistributedSession {
  readonly id: SessionId;
  readonly projectId: number;
  readonly coordinatorNodeId: NodeId;
  readonly participantNodes: ReadonlySet<NodeId>;
  readonly coordinator: NodeId;
  readonly capabilities: SessionCapabilities;
  readonly requirements: SessionRequirements;
  readonly status: SessionStatus;
  readonly createdAt: number;
  readonly lastActivity: number;
  readonly updatedAt: number;
  readonly timeWindow: TimeWindow;
  
  // Resource allocation
  readonly allocatedResources: ReadonlyMap<NodeId, AllocatedResources>;
  readonly reservedChannels: ReadonlySet<ChannelId>;
  readonly globalCoherenceBudget: CoherenceBudget;
  
  // Additional properties needed by session manager
  readonly maxNodes: number;
  readonly maxQubits: number;
  readonly supportedProtocols: ReadonlyArray<QuantumProtocol>;
  readonly minFidelity: number;
  readonly maxLatency: number;
  readonly minNodes: number;
  readonly requiredProtocols: ReadonlyArray<QuantumProtocol>;
  readonly fidelityThreshold: number;
  readonly latencyThreshold: number;
  readonly coherenceTime: number;
  readonly reliabilityTarget: number;
  readonly securityLevel: SecurityLevel;
  
  // Time management
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly bufferTime: number;
  readonly extensions: number;
  readonly maxExtensions: number;
  
  // Security
  readonly authMethod: string;
  readonly sessionKey: string;
  readonly keyRotationPeriod: number;
  readonly lastAuthentication: number;
  readonly encryptionLevel: EncryptionLevel;
  
  // QoS targets
  readonly latencyTarget: number;
  readonly throughputTarget: string;
  readonly availabilityTarget: string;
  readonly reliabilityTargetQos: string;
  readonly fidelityTarget: string;
  readonly consistencyLevel: string;
  
  // Monitoring flags
  readonly metricsCollection: boolean;
  readonly realTimeAlerts: boolean;
  readonly performanceLogging: boolean;
  readonly securityAuditing: boolean;
  readonly quantumStateLogging: boolean;
  readonly networkTracing: boolean;
  
  // Fault tolerance
  readonly nodeFaultTolerance: number;
  readonly channelFaultTolerance: number;
  readonly automaticRecovery: boolean;
  readonly checkpointFrequency: number;
  readonly rollbackCapability: boolean;
  readonly gracefulDegradation: boolean;
  
  // Security and trust (maintain compatibility)
  readonly authentication: SessionAuthentication;
  readonly trustRequirements: TrustRequirements;
  
  // Quality of service (maintain compatibility)
  readonly qosParameters: QoSParameters;
  readonly monitoring: SessionMonitoring;
  readonly faultTolerance: SessionFaultTolerance;
}

export interface SessionCapabilities {
  readonly maxNodes: number;
  readonly maxQubits: number;
  readonly supportedProtocols: ReadonlySet<QuantumProtocol>;
  readonly minFidelity: number;
  readonly maxLatency: number;
  readonly errorCorrection: boolean;
  readonly purificationCapability: boolean;
}

export interface SessionRequirements {
  readonly minNodes: number;
  readonly requiredProtocols: ReadonlySet<QuantumProtocol>;
  readonly fidelityThreshold: number;
  readonly latencyThreshold: number;
  readonly coherenceTime: number;
  readonly reliabilityTarget: number;
  readonly securityLevel: SecurityLevel;
}

export enum SessionStatus {
  INITIALIZING = 'initializing',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TERMINATING = 'terminating',
  TERMINATED = 'terminated',
  ERROR = 'error'
}

// Alias for compatibility with session-manager.ts
export const DistributedSessionStatus = SessionStatus;

export interface TimeWindow {
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly bufferTime: number;
  readonly extensions: number;
  readonly maxExtensions: number;
}

export interface AllocatedResources {
  readonly nodeId: NodeId;
  readonly qubits: number;
  readonly memory: number; // bytes
  readonly compute: number; // FLOPS
  readonly bandwidth: number; // bytes/sec
  readonly coherenceTime: number; // microseconds
  readonly priority: OperationPriority;
  readonly allocatedAt: number; // timestamp when allocated
}

export interface SessionAuthentication {
  readonly method: 'quantum_id' | 'classical_pki' | 'hybrid';
  readonly participants: ReadonlyMap<NodeId, ParticipantCredentials>;
  readonly sessionKey: string;
  readonly keyRotationPeriod: number;
  readonly lastAuthentication: number;
}

export interface ParticipantCredentials {
  readonly nodeId: NodeId;
  readonly publicKey: string;
  readonly certificate: string;
  readonly trustLevel: TrustLevel;
  readonly lastVerified: number;
  readonly permissions: ReadonlySet<Permission>;
}

export enum Permission {
  READ_STATE = 'read_state',
  WRITE_STATE = 'write_state',
  CREATE_ENTANGLEMENT = 'create_entanglement',
  TELEPORT = 'teleport',
  MEASURE = 'measure',
  COORDINATE = 'coordinate',
  ADMIN = 'admin'
}

export enum EncryptionLevel {
  NONE = 'none',
  CLASSICAL = 'classical',
  QUANTUM = 'quantum',
  HYBRID = 'hybrid'
}

export enum SecurityLevel {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
  TOP_SECRET = 'top_secret'
}

export interface TrustRequirements {
  readonly minTrustLevel: TrustLevel;
  readonly requiredCertifications: ReadonlySet<string>;
  readonly backgroundCheckRequired: boolean;
  readonly auditTrail: boolean;
  readonly realTimeMonitoring: boolean;
}

export interface QoSParameters {
  readonly latencyTarget: number; // milliseconds
  readonly throughputTarget: number; // operations/sec
  readonly availabilityTarget: number; // 0-1
  readonly reliabilityTarget: number; // 0-1
  readonly fidelityTarget: number; // 0-1
  readonly consistencyLevel: 'eventual' | 'strong' | 'linearizable';
}

export interface SessionMonitoring {
  readonly metricsCollection: boolean;
  readonly realTimeAlerts: boolean;
  readonly performanceLogging: boolean;
  readonly securityAuditing: boolean;
  readonly quantumStateLogging: boolean;
  readonly networkTracing: boolean;
}

export interface SessionFaultTolerance {
  readonly nodeFaultTolerance: number; // max failed nodes
  readonly channelFaultTolerance: number; // max failed channels
  readonly automaticRecovery: boolean;
  readonly checkpointFrequency: number; // seconds
  readonly rollbackCapability: boolean;
  readonly gracefulDegradation: boolean;
}

// =============================================================================
// ERROR HANDLING AND RESULTS
// =============================================================================

export enum DistributedErrorType {
  NETWORK_TIMEOUT = 'network_timeout',
  NODE_UNREACHABLE = 'node_unreachable',
  CHANNEL_DEGRADED = 'channel_degraded',
  AUTHENTICATION_FAILED = 'authentication_failed',
  COHERENCE_EXCEEDED = 'coherence_exceeded',
  FIDELITY_INSUFFICIENT = 'fidelity_insufficient',
  SYNCHRONIZATION_FAILED = 'synchronization_failed',
  RESOURCE_EXHAUSTED = 'resource_exhausted',
  PROTOCOL_VIOLATION = 'protocol_violation',
  CONSISTENCY_VIOLATION = 'consistency_violation'
}

export interface DistributedError extends QuantumError {
  readonly distributedType: DistributedErrorType;
  readonly nodeId: NodeId;
  readonly sessionId?: SessionId;
  readonly channelId?: ChannelId;
  readonly networkDiagnostics: NetworkDiagnostics;
}

export interface NetworkDiagnostics {
  readonly latency: number;
  readonly packetLoss: number;
  readonly bandwidth: number;
  readonly jitter: number;
  readonly lastSuccessfulOperation: number;
  readonly errorRate: number;
  readonly recoveryTime: number;
}

// Operation Results
export interface TeleportationResult {
  readonly success: boolean;
  readonly targetNode: NodeId;
  readonly newStateId: QuantumReferenceId;
  readonly fidelity: number;
  readonly latency: number;
  readonly classicalBits: ReadonlyArray<number>;
  readonly error?: DistributedError;
}

export interface EntanglementResult {
  readonly success: boolean;
  readonly entanglementId: EntanglementGroupId;
  readonly participants: ReadonlyArray<QuantumReferenceId>;
  readonly fidelity: number;
  readonly coherenceTime: number;
  readonly error?: DistributedError;
}

export interface MigrationResult {
  readonly success: boolean;
  readonly sourceNode: NodeId;
  readonly targetNode: NodeId;
  readonly newStateId: QuantumReferenceId;
  readonly migrationTime: number;
  readonly dataIntegrity: boolean;
  readonly error?: DistributedError;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Type guards for distributed quantum types
 */
export function isDistributedQuantumHandle(handle: any): handle is DistributedQuantumHandle {
  return handle && typeof handle === 'object' && '__distributedQuantumHandle' in handle;
}

export function isDistributedEntanglementGroup(group: any): group is DistributedEntanglementGroup {
  return group && typeof group === 'object' && '__distributedEntangled' in group;
}

export function isValidNodeId(id: string): id is NodeId {
  return id.startsWith('node_') && id.length > 10;
}

export function isValidChannelId(id: string): id is ChannelId {
  return id.startsWith('channel_') && id.length > 15;
}

export function isValidSessionId(id: string): id is SessionId {
  return id.startsWith('session_') && id.length > 15;
}

/**
 * Network topology utilities
 */
export function calculateNetworkDistance(nodeA: NodeId, nodeB: NodeId, topology: EntanglementTopology): number {
  // Implementation would use the adjacency matrix to calculate shortest path
  return 0; // Placeholder
}

export function findOptimalPath(source: NodeId, target: NodeId, nodes: ReadonlyMap<NodeId, DistributedQuantumNode>): ReadonlyArray<NodeId> {
  // Implementation would use Dijkstra's algorithm considering latency and reliability
  return []; // Placeholder
}

export function estimateOperationTime(operation: DistributedOperation, network: ReadonlyMap<NodeId, DistributedQuantumNode>): number {
  // Implementation would consider network latency, operation complexity, and resource availability
  return 0; // Placeholder
}