/**
 * SINGULARIS PRIME Quantum Memory Management Type System
 * 
 * This module defines the comprehensive type system for quantum memory management,
 * supporting the four coordinated modules:
 * - Quantum Memory Graph (QMG)
 * - Entanglement Manager (EM) 
 * - Decoherence-Aware GC (DAGC)
 * - Lifecycle/Measurement Manager (LMM)
 * 
 * Key features:
 * - No-cloning enforcement through QuantumHandle pattern
 * - Entanglement group management with union-find semantics
 * - Time-aware decoherence scheduling
 * - Quantum state lifecycle management
 * - Classical bridge for post-measurement states
 */

import { 
  QuantumState, 
  QuantumReferenceId, 
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  QuantumPurity,
  QuantumDimension
} from './quantum-types';

import { AIEntityId, ExplainabilityScore } from './ai-types';

// =============================================================================
// CORE QUANTUM HANDLE SYSTEM (No-Cloning Enforcement)
// =============================================================================

/**
 * QuantumHandle - Enforces no-cloning theorem through move semantics
 * Only one handle can exist per quantum state at any time
 */
export interface QuantumHandle<T extends QuantumState = QuantumState> {
  readonly id: QuantumReferenceId;
  readonly isValid: boolean;
  readonly isOwner: boolean;
  readonly isBorrowed: boolean;
  readonly borrowCount: number;
  readonly lastAccess: number;
  
  // Move semantics - transfers ownership
  move(): QuantumHandle<T>;
  
  // Borrow for ephemeral access (read-only views)
  borrow(): QuantumBorrowHandle<T>;
  
  // Access the quantum state (validates ownership)
  getState(): T | undefined;
  
  // Release ownership (for explicit deallocation)
  release(): void;
  
  // Type-level no-cloning enforcement
  readonly __quantumHandleNoClone: symbol;
}

/**
 * QuantumBorrowHandle - Ephemeral read-only view
 * Cannot be moved or transferred, automatically invalidates
 */
export interface QuantumBorrowHandle<T extends QuantumState = QuantumState> {
  readonly id: QuantumReferenceId;
  readonly isValid: boolean;
  readonly borrowStartTime: number;
  readonly maxBorrowDuration: number;
  
  // Read-only access to quantum state
  readonly state: T | undefined;
  
  // Release borrow early
  release(): void;
  
  // Type-level borrow constraint
  readonly __quantumBorrowNoTransfer: symbol;
}

/**
 * QuantumHandleRegistry - Central tracking of all quantum handles
 */
export interface QuantumHandleRegistry {
  readonly activeHandles: ReadonlyMap<QuantumReferenceId, QuantumHandle>;
  readonly borrowHandles: ReadonlyMap<QuantumReferenceId, QuantumBorrowHandle[]>;
  readonly totalStates: number;
  readonly totalBorrows: number;
  
  // Handle lifecycle
  createHandle<T extends QuantumState>(state: T): QuantumHandle<T>;
  moveHandle(fromId: QuantumReferenceId, toId: QuantumReferenceId): boolean;
  releaseHandle(id: QuantumReferenceId): boolean;
  
  // Validation and tracking
  validateHandle(id: QuantumReferenceId): boolean;
  detectCloning(id: QuantumReferenceId): boolean;
  getHandleMetrics(): QuantumHandleMetrics;
}

export interface QuantumHandleMetrics {
  readonly totalHandles: number;
  readonly activeBorrows: number;
  readonly invalidHandles: number;
  readonly averageBorrowDuration: number;
  readonly cloningAttempts: number;
  readonly lastCloningAttempt?: number;
}

// =============================================================================
// QUANTUM MEMORY GRAPH (QMG) - Central State Registry
// =============================================================================

/**
 * QuantumMemoryNode - Node in the quantum memory graph
 */
export interface QuantumMemoryNode {
  readonly id: QuantumReferenceId;
  readonly state: QuantumState;
  readonly handle: QuantumHandle;
  readonly entanglementGroupId?: EntanglementGroupId;
  readonly criticality: MemoryCriticality;
  readonly roots: ReadonlySet<QuantumReferenceId>; // GC roots
  readonly metadata: QuantumNodeMetadata;
  
  // Lifecycle tracking
  readonly createdAt: number;
  readonly lastAccess: number;
  readonly lastModification: number;
  readonly accessCount: number;
  
  // Decoherence management
  readonly coherenceTime: number;
  readonly decoherenceDeadline: number;
  readonly isScheduledForGC: boolean;
  readonly gcPriority: number;
  
  // Classical snapshot for post-measurement
  readonly classicalSnapshot?: ClassicalStateSnapshot;
}

export interface QuantumNodeMetadata {
  readonly algorithmicContext?: string;
  readonly sourceLocation?: { line: number; column: number; file: string };
  readonly operationHistory: ReadonlyArray<QuantumOperationRecord>;
  readonly entanglementHistory: ReadonlyArray<EntanglementEvent>;
  readonly measurementHistory: ReadonlyArray<MeasurementEvent>;
  readonly tags: ReadonlySet<string>;
  readonly userAnnotations: Record<string, any>;
}

export interface QuantumOperationRecord {
  readonly timestamp: number;
  readonly operation: string;
  readonly parameters: Record<string, any>;
  readonly success: boolean;
  readonly coherenceImpact: number;
  readonly entanglementChanged: boolean;
}

export interface MeasurementEvent {
  readonly timestamp: number;
  readonly basis: string;
  readonly outcome: any;
  readonly probability: number;
  readonly entanglementBroken: ReadonlyArray<QuantumReferenceId>;
  readonly classicalResult: any;
}

export enum MemoryCriticality {
  LOW = 'low',           // Can be collected aggressively
  NORMAL = 'normal',     // Standard collection policies
  HIGH = 'high',         // Requires careful handling
  CRITICAL = 'critical', // Requires human oversight to collect
  PINNED = 'pinned'      // Cannot be collected without explicit release
}

/**
 * QuantumMemoryGraph - Central registry and graph structure
 */
export interface QuantumMemoryGraph {
  readonly nodes: ReadonlyMap<QuantumReferenceId, QuantumMemoryNode>;
  readonly entanglementGroups: ReadonlyMap<EntanglementGroupId, EntanglementGroup>;
  readonly gcRoots: ReadonlySet<QuantumReferenceId>;
  readonly criticalStates: ReadonlySet<QuantumReferenceId>;
  readonly totalMemoryUsage: number;
  readonly decoherenceQueue: ReadonlyArray<DecoherenceScheduleEntry>;
  
  // Node lifecycle
  addNode(state: QuantumState, criticality?: MemoryCriticality): QuantumMemoryNode;
  removeNode(id: QuantumReferenceId): boolean;
  updateNode(id: QuantumReferenceId, updates: Partial<QuantumMemoryNode>): boolean;
  
  // Graph operations
  findConnectedComponent(id: QuantumReferenceId): ReadonlySet<QuantumReferenceId>;
  calculateMemoryPressure(): MemoryPressureMetrics;
  identifyGCCandidates(): ReadonlyArray<QuantumReferenceId>;
  
  // Traversal and analysis
  walkFromRoots(visitor: (node: QuantumMemoryNode) => void): void;
  findCycles(): ReadonlyArray<ReadonlyArray<QuantumReferenceId>>;
  getReachabilityMap(): ReadonlyMap<QuantumReferenceId, boolean>;
}

export interface MemoryPressureMetrics {
  readonly totalNodes: number;
  readonly entangledNodes: number;
  readonly coherentNodes: number;
  readonly decoheringNodes: number;
  readonly criticalNodes: number;
  readonly memoryUsageBytes: number;
  readonly averageCoherenceTime: number;
  readonly gcRecommendation: 'none' | 'gentle' | 'aggressive' | 'critical';
}

// =============================================================================
// ENTANGLEMENT MANAGER (EM) - Union-Find Style Groups
// =============================================================================

export type EntanglementGroupId = string & { readonly _brand: 'EntanglementGroup' };

/**
 * EntanglementGroup - Union-find style entanglement management
 */
export interface EntanglementGroup {
  readonly id: EntanglementGroupId;
  readonly participants: ReadonlySet<QuantumReferenceId>;
  readonly parent?: EntanglementGroupId; // Union-find parent
  readonly rank: number; // Union-find rank for optimization
  readonly entanglementType: EntanglementType;
  readonly strength: number; // Entanglement measure (0-1)
  readonly stability: number; // Resistance to decoherence (0-1)
  
  // Lifecycle
  readonly createdAt: number;
  readonly lastModified: number;
  readonly coherenceTime: number;
  readonly groupCriticality: MemoryCriticality;
  
  // Group properties
  readonly isCanonical: boolean; // True if this is the group representative
  readonly canGCIndependently: boolean; // False for entangled groups
  readonly requiresGroupConsent: boolean; // Requires all members for operations
  
  // Metadata
  readonly metadata: EntanglementGroupMetadata;
}

export interface EntanglementGroupMetadata {
  readonly algorithmicPurpose?: string;
  readonly entanglementProtocol?: string;
  readonly expectedLifetime?: number;
  readonly resilienceLevel: 'fragile' | 'stable' | 'robust';
  readonly operationHistory: ReadonlyArray<GroupOperationRecord>;
}

export interface GroupOperationRecord {
  readonly timestamp: number;
  readonly operation: 'create' | 'link' | 'break' | 'measure' | 'modify';
  readonly participantsBefore: ReadonlySet<QuantumReferenceId>;
  readonly participantsAfter: ReadonlySet<QuantumReferenceId>;
  readonly success: boolean;
  readonly metadata: Record<string, any>;
}

export enum EntanglementType {
  BELL_STATE = 'bell_state',       // Two-particle Bell states
  GHZ_STATE = 'ghz_state',         // Greenberger-Horne-Zeilinger states
  CLUSTER_STATE = 'cluster_state', // Cluster states for computation
  SPIN_CHAIN = 'spin_chain',       // Linear spin chains
  GRAPH_STATE = 'graph_state',     // General graph states
  CUSTOM = 'custom'                // Application-specific entanglement
}

/**
 * EntanglementManager - Union-find operations and group management
 */
export interface EntanglementManager {
  readonly groups: ReadonlyMap<EntanglementGroupId, EntanglementGroup>;
  readonly stateToGroup: ReadonlyMap<QuantumReferenceId, EntanglementGroupId>;
  readonly totalGroups: number;
  readonly totalEntangledStates: number;
  
  // Union-find operations
  find(stateId: QuantumReferenceId): EntanglementGroupId | undefined;
  union(group1: EntanglementGroupId, group2: EntanglementGroupId): EntanglementGroupId;
  split(groupId: EntanglementGroupId, participants: ReadonlySet<QuantumReferenceId>): EntanglementGroupId[];
  
  // Group operations
  createGroup(participants: ReadonlyArray<QuantumReferenceId>, type: EntanglementType): EntanglementGroup;
  addToGroup(groupId: EntanglementGroupId, stateId: QuantumReferenceId): boolean;
  removeFromGroup(groupId: EntanglementGroupId, stateId: QuantumReferenceId): boolean;
  
  // Validation and integrity
  validateGroupIntegrity(groupId: EntanglementGroupId): EntanglementValidationResult;
  repairBrokenEntanglements(): RepairResult;
  getGroupMetrics(): EntanglementMetrics;
}

export interface EntanglementValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<EntanglementError>;
  readonly warnings: ReadonlyArray<EntanglementWarning>;
  readonly repairSuggestions: ReadonlyArray<RepairSuggestion>;
}

export interface EntanglementError {
  readonly type: 'missing_participant' | 'invalid_relationship' | 'broken_symmetry' | 'rank_inconsistency';
  readonly message: string;
  readonly affectedStates: ReadonlyArray<QuantumReferenceId>;
  readonly severity: 'warning' | 'error' | 'critical';
}

export interface EntanglementWarning {
  readonly type: 'performance' | 'stability' | 'decoherence_risk';
  readonly message: string;
  readonly recommendation: string;
}

export interface RepairSuggestion {
  readonly action: 'merge_groups' | 'split_group' | 'update_relationships' | 'recalculate_ranks';
  readonly description: string;
  readonly affectedGroups: ReadonlyArray<EntanglementGroupId>;
  readonly estimatedCost: number;
}

export interface RepairResult {
  readonly success: boolean;
  readonly repairsPerformed: number;
  readonly errorsFixed: ReadonlyArray<EntanglementError>;
  readonly remainingIssues: ReadonlyArray<EntanglementError>;
  readonly performanceImpact: number;
}

export interface EntanglementMetrics {
  readonly totalGroups: number;
  readonly averageGroupSize: number;
  readonly largestGroupSize: number;
  readonly averageEntanglementStrength: number;
  readonly groupStabilityDistribution: Record<string, number>;
  readonly unionFindOperationsPerSecond: number;
  readonly integrityChecksPassed: number;
  readonly integrityChecksFailed: number;
}

// =============================================================================
// DECOHERENCE-AWARE GC (DAGC) - Time-Aware Garbage Collection
// =============================================================================

/**
 * DecoherenceScheduler - Time-aware quantum garbage collection
 */
export interface DecoherenceScheduler {
  readonly activeTimers: ReadonlyMap<QuantumReferenceId, DecoherenceTimer>;
  readonly scheduleQueue: ReadonlyArray<DecoherenceScheduleEntry>;
  readonly gcCandidates: ReadonlySet<QuantumReferenceId>;
  readonly criticalStates: ReadonlySet<QuantumReferenceId>;
  
  // Scheduling operations
  scheduleDecoherence(stateId: QuantumReferenceId, coherenceTime: number): DecoherenceTimer;
  rescheduleDecoherence(stateId: QuantumReferenceId, newCoherenceTime: number): boolean;
  cancelDecoherence(stateId: QuantumReferenceId): boolean;
  
  // GC operations
  triggerGC(policy: GCPolicy): GCResult;
  identifyGCCandidates(criteria: GCCriteria): ReadonlyArray<QuantumReferenceId>;
  performHybridGC(): HybridGCResult;
  
  // Timer management
  processTimerQueue(): TimerProcessingResult;
  resetActivityTimer(stateId: QuantumReferenceId): boolean;
  getNextDecoherenceEvent(): DecoherenceScheduleEntry | undefined;
}

export interface DecoherenceTimer {
  readonly stateId: QuantumReferenceId;
  readonly scheduledTime: number;
  readonly coherenceDeadline: number;
  readonly priority: GCPriority;
  readonly timerType: 'decoherence' | 'idle_timeout' | 'forced_gc';
  readonly isActive: boolean;
  readonly resetCount: number;
  readonly lastActivityReset: number;
  
  // Callbacks
  readonly onDecoherence: DecoherenceCallback;
  readonly onPreGC: PreGCCallback;
  readonly onPostGC: PostGCCallback;
}

export interface DecoherenceScheduleEntry {
  readonly stateId: QuantumReferenceId;
  readonly scheduledTime: number;
  readonly priority: GCPriority;
  readonly estimatedDuration: number;
  readonly dependencies: ReadonlySet<QuantumReferenceId>;
  readonly canParallelize: boolean;
  readonly requiresOversight: boolean;
}

export enum GCPriority {
  LOW = 0,        // Background collection
  NORMAL = 1,     // Standard priority
  HIGH = 2,       // Urgent collection needed
  CRITICAL = 3,   // Memory pressure critical
  IMMEDIATE = 4   // Immediate collection required
}

export interface GCPolicy {
  readonly memoryThreshold: number;      // Memory usage threshold (0-1)
  readonly coherenceThreshold: number;   // Coherence time threshold (ms)
  readonly idleThreshold: number;        // Idle time threshold (ms)
  readonly respectEntanglement: boolean; // Honor entanglement group constraints
  readonly requireOversight: boolean;    // Require human oversight for critical states
  readonly maxGCDuration: number;        // Maximum GC duration (ms)
  readonly parallelCollection: boolean;  // Allow parallel collection
}

export interface GCCriteria {
  readonly includeDecoherent: boolean;
  readonly includeIdle: boolean;
  readonly includeLowCriticality: boolean;
  readonly respectPinned: boolean;
  readonly minimumAge: number;
  readonly maximumCoherence: number;
  readonly excludeEntangled: boolean;
}

export interface GCResult {
  readonly success: boolean;
  readonly statesCollected: ReadonlyArray<QuantumReferenceId>;
  readonly memoryFreed: number;
  readonly gcDuration: number;
  readonly entanglementGroupsAffected: ReadonlyArray<EntanglementGroupId>;
  readonly errors: ReadonlyArray<GCError>;
  readonly warnings: ReadonlyArray<GCWarning>;
  readonly oversightRequired: ReadonlyArray<QuantumReferenceId>;
}

export interface HybridGCResult extends GCResult {
  readonly refCountCollected: ReadonlyArray<QuantumReferenceId>;
  readonly tracingCollected: ReadonlyArray<QuantumReferenceId>;
  readonly groupAwareAdjustments: ReadonlyArray<EntanglementGroupId>;
  readonly performanceMetrics: GCPerformanceMetrics;
}

export interface GCError {
  readonly type: 'entanglement_violation' | 'critical_state_protection' | 'oversight_timeout' | 'memory_leak';
  readonly message: string;
  readonly stateId: QuantumReferenceId;
  readonly recoveryAction: string;
}

export interface GCWarning {
  readonly type: 'performance' | 'premature_collection' | 'decoherence_risk';
  readonly message: string;
  readonly recommendation: string;
}

export interface GCPerformanceMetrics {
  readonly totalTime: number;
  readonly refCountTime: number;
  readonly tracingTime: number;
  readonly groupOperationTime: number;
  readonly statesScanned: number;
  readonly entanglementChecks: number;
  readonly memoryThroughput: number;
}

export interface TimerProcessingResult {
  readonly timersProcessed: number;
  readonly decoherenceEventsTriggered: number;
  readonly gcEventsTriggered: number;
  readonly errorsEncountered: ReadonlyArray<TimerError>;
  readonly nextProcessingTime: number;
}

export interface TimerError {
  readonly stateId: QuantumReferenceId;
  readonly errorType: 'timer_expired' | 'invalid_state' | 'callback_failure';
  readonly message: string;
  readonly timestamp: number;
}

// =============================================================================
// LIFECYCLE/MEASUREMENT MANAGER (LMM) - State Transitions
// =============================================================================

/**
 * QuantumLifecycleManager - Manages quantum state transitions and measurement
 */
export interface QuantumLifecycleManager {
  readonly stateTransitions: ReadonlyMap<QuantumReferenceId, StateTransitionHistory>;
  readonly measurementQueue: ReadonlyArray<PendingMeasurement>;
  readonly classicalStore: ReadonlyMap<QuantumReferenceId, ClassicalStateSnapshot>;
  
  // Lifecycle operations
  transitionState(stateId: QuantumReferenceId, newPhase: QuantumLifecyclePhase): StateTransitionResult;
  scheduleMeasurement(stateId: QuantumReferenceId, measurement: MeasurementSpec): PendingMeasurement;
  performMeasurement(measurementId: string): MeasurementResult;
  
  // Classical bridge
  migrateToClassical(stateId: QuantumReferenceId): ClassicalMigrationResult;
  getClassicalSnapshot(stateId: QuantumReferenceId): ClassicalStateSnapshot | undefined;
  
  // Superposition management
  cleanupSuperposition(stateId: QuantumReferenceId): SuperpositionCleanupResult;
  updateEntanglementCorrelations(measurementResult: MeasurementResult): CorrelationUpdateResult;
}

export enum QuantumLifecyclePhase {
  CREATED = 'created',           // Initial state creation
  COHERENT = 'coherent',         // Active quantum superposition
  DECOHERING = 'decohering',     // Losing coherence
  DECOHERENT = 'decoherent',     // Lost quantum properties
  MEASURED = 'measured',         // Post-measurement collapse
  CLASSICAL = 'classical',       // Migrated to classical storage
  DESTROYED = 'destroyed'        // State destroyed/collected
}

export interface StateTransitionHistory {
  readonly stateId: QuantumReferenceId;
  readonly transitions: ReadonlyArray<StateTransition>;
  readonly currentPhase: QuantumLifecyclePhase;
  readonly phaseStartTime: number;
  readonly totalLifetime: number;
  readonly measurementCount: number;
}

export interface StateTransition {
  readonly timestamp: number;
  readonly fromPhase: QuantumLifecyclePhase;
  readonly toPhase: QuantumLifecyclePhase;
  readonly trigger: TransitionTrigger;
  readonly success: boolean;
  readonly metadata: Record<string, any>;
}

export enum TransitionTrigger {
  NATURAL_DECOHERENCE = 'natural_decoherence',
  MEASUREMENT = 'measurement',
  ENVIRONMENTAL_INTERACTION = 'environmental_interaction',
  EXPLICIT_DESTRUCTION = 'explicit_destruction',
  GARBAGE_COLLECTION = 'garbage_collection',
  ENTANGLEMENT_BREAK = 'entanglement_break',
  FORCED_TRANSITION = 'forced_transition'
}

export interface StateTransitionResult {
  readonly success: boolean;
  readonly previousPhase: QuantumLifecyclePhase;
  readonly newPhase: QuantumLifecyclePhase;
  readonly entanglementImpact: EntanglementImpact;
  readonly classicalSnapshot?: ClassicalStateSnapshot;
  readonly errors: ReadonlyArray<TransitionError>;
}

export interface EntanglementImpact {
  readonly affectedStates: ReadonlyArray<QuantumReferenceId>;
  readonly brokenEntanglements: ReadonlyArray<EntanglementGroupId>;
  readonly newCorrelations: ReadonlyArray<EntanglementCorrelation>;
  readonly groupsDestroyed: ReadonlyArray<EntanglementGroupId>;
}

export interface EntanglementCorrelation {
  readonly state1: QuantumReferenceId;
  readonly state2: QuantumReferenceId;
  readonly correlationType: string;
  readonly strength: number;
  readonly isClassical: boolean;
}

export interface TransitionError {
  readonly type: 'invalid_transition' | 'entanglement_constraint' | 'measurement_failure' | 'lifecycle_violation';
  readonly message: string;
  readonly recoveryAction: string;
}

export interface PendingMeasurement {
  readonly id: string;
  readonly stateId: QuantumReferenceId;
  readonly measurementSpec: MeasurementSpec;
  readonly scheduledTime: number;
  readonly priority: number;
  readonly requesterInfo: RequesterInfo;
  readonly status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
}

export interface MeasurementSpec {
  readonly basis: string;
  readonly observables: ReadonlyArray<string>;
  readonly precision: number;
  readonly repeats: number;
  readonly collapseOnMeasurement: boolean;
  readonly preserveEntanglement: boolean;
  readonly metadata: Record<string, any>;
}

export interface RequesterInfo {
  readonly entityId?: AIEntityId;
  readonly operationId?: string;
  readonly sourceLocation?: { line: number; column: number; file: string };
  readonly priority: 'low' | 'normal' | 'high' | 'urgent';
}

export interface MeasurementResult {
  readonly measurementId: string;
  readonly stateId: QuantumReferenceId;
  readonly timestamp: number;
  readonly outcome: any;
  readonly probability: number;
  readonly basis: string;
  readonly collapseOccurred: boolean;
  readonly entanglementBroken: ReadonlyArray<QuantumReferenceId>;
  readonly classicalSnapshot: ClassicalStateSnapshot;
  readonly metadata: Record<string, any>;
}

export interface ClassicalStateSnapshot {
  readonly originalStateId: QuantumReferenceId;
  readonly snapshotTime: number;
  readonly finalOutcome: any;
  readonly probability: number;
  readonly measurementHistory: ReadonlyArray<MeasurementEvent>;
  readonly entanglementHistory: ReadonlyArray<EntanglementEvent>;
  readonly operationHistory: ReadonlyArray<QuantumOperationRecord>;
  readonly isImmutable: true;
  readonly explainabilityData: ClassicalExplainabilityData;
}

export interface ClassicalExplainabilityData {
  readonly algorithmicTrace: ReadonlyArray<string>;
  readonly decisionPoints: ReadonlyArray<DecisionPoint>;
  readonly quantumContributions: ReadonlyArray<QuantumContribution>;
  readonly explainabilityScore: ExplainabilityScore;
}

export interface DecisionPoint {
  readonly timestamp: number;
  readonly decision: string;
  readonly quantumInfluence: number;
  readonly classicalParameters: Record<string, any>;
  readonly confidence: number;
}

export interface QuantumContribution {
  readonly stateId: QuantumReferenceId;
  readonly contribution: number;
  readonly phase: QuantumLifecyclePhase;
  readonly entanglementRole: string;
}

export interface ClassicalMigrationResult {
  readonly success: boolean;
  readonly snapshot: ClassicalStateSnapshot;
  readonly quantumStateDestroyed: boolean;
  readonly memoryFreed: number;
  readonly migrationTime: number;
  readonly errors: ReadonlyArray<MigrationError>;
}

export interface MigrationError {
  readonly type: 'incomplete_measurement' | 'entanglement_constraint' | 'data_loss' | 'verification_failure';
  readonly message: string;
  readonly suggestion: string;
}

export interface SuperpositionCleanupResult {
  readonly success: boolean;
  readonly componentsRemoved: number;
  readonly memoryFreed: number;
  readonly entanglementPreserved: boolean;
  readonly classicalComponentsPreserved: ReadonlyArray<any>;
}

export interface CorrelationUpdateResult {
  readonly correlationsUpdated: number;
  readonly entanglementGroupsModified: ReadonlyArray<EntanglementGroupId>;
  readonly newClassicalCorrelations: ReadonlyArray<EntanglementCorrelation>;
  readonly quantumStatesToUpdate: ReadonlyArray<QuantumReferenceId>;
}

export interface EntanglementEvent {
  readonly timestamp: number;
  readonly eventType: 'created' | 'broken' | 'measured' | 'modified';
  readonly participants: ReadonlyArray<QuantumReferenceId>;
  readonly entanglementType: EntanglementType;
  readonly strength: number;
  readonly metadata: Record<string, any>;
}

// =============================================================================
// CALLBACK TYPES AND EVENT SYSTEM
// =============================================================================

export type DecoherenceCallback = (stateId: QuantumReferenceId, coherenceStatus: CoherenceStatus) => void;
export type PreGCCallback = (candidateStates: ReadonlyArray<QuantumReferenceId>) => boolean;
export type PostGCCallback = (result: GCResult) => void;

// =============================================================================
// INTEGRATION INTERFACES
// =============================================================================

/**
 * QuantumMemorySystem - Main integration interface
 */
export interface QuantumMemorySystem {
  readonly memoryGraph: QuantumMemoryGraph;
  readonly entanglementManager: EntanglementManager;
  readonly decoherenceScheduler: DecoherenceScheduler;
  readonly lifecycleManager: QuantumLifecycleManager;
  readonly handleRegistry: QuantumHandleRegistry;
  
  // System-wide operations
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  performSystemGC(): Promise<HybridGCResult>;
  getSystemMetrics(): QuantumMemorySystemMetrics;
  
  // Explainability integration
  generateExplainabilityReport(stateId: QuantumReferenceId): QuantumMemoryExplainabilityReport;
  getMemoryOperationTrace(operationId: string): MemoryOperationTrace;
}

export interface QuantumMemorySystemMetrics {
  readonly totalMemoryUsage: number;
  readonly activeStates: number;
  readonly entangledStates: number;
  readonly decoherentStates: number;
  readonly classicalSnapshots: number;
  readonly gcEfficiency: number;
  readonly averageStateLifetime: number;
  readonly entanglementIntegrity: number;
  readonly memoryFragmentation: number;
  readonly systemHealth: 'healthy' | 'degraded' | 'critical';
}

export interface QuantumMemoryExplainabilityReport {
  readonly stateId: QuantumReferenceId;
  readonly currentPhase: QuantumLifecyclePhase;
  readonly memoryUsage: number;
  readonly entanglementStatus: string;
  readonly operationHistory: ReadonlyArray<ExplainableOperation>;
  readonly decisionTrace: ReadonlyArray<string>;
  readonly riskFactors: ReadonlyArray<RiskFactor>;
  readonly explainabilityScore: ExplainabilityScore;
}

export interface ExplainableOperation {
  readonly timestamp: number;
  readonly operation: string;
  readonly purpose: string;
  readonly quantumEffect: string;
  readonly confidence: number;
  readonly parameters: Record<string, any>;
}

export interface RiskFactor {
  readonly type: 'decoherence' | 'entanglement_break' | 'measurement_collapse' | 'memory_leak';
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly probability: number;
  readonly mitigation: string;
}

export interface MemoryOperationTrace {
  readonly operationId: string;
  readonly timestamp: number;
  readonly operation: string;
  readonly statesInvolved: ReadonlyArray<QuantumReferenceId>;
  readonly memoryChanges: ReadonlyArray<MemoryChange>;
  readonly entanglementChanges: ReadonlyArray<EntanglementEvent>;
  readonly explainabilityData: Record<string, any>;
}

export interface MemoryChange {
  readonly stateId: QuantumReferenceId;
  readonly changeType: 'created' | 'modified' | 'destroyed' | 'migrated';
  readonly memoryDelta: number;
  readonly coherenceChange: number;
  readonly criticality: MemoryCriticality;
}