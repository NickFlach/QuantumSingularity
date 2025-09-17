/**
 * SINGULARIS PRIME Quantum Memory Manager (QMM)
 * 
 * Central coordinator for the quantum memory management system, integrating:
 * - Quantum Memory Graph (QMG) - Central state registry
 * - Entanglement Manager (EM) - Union-find entanglement groups
 * - Decoherence Scheduler (DAGC) - Time-aware garbage collection
 * - Lifecycle Manager (LMM) - State transitions and measurement
 * 
 * Core responsibilities:
 * - No-cloning enforcement through QuantumHandle pattern
 * - Centralized quantum state registry and lifecycle
 * - Entanglement-aware memory management
 * - Decoherence-scheduled garbage collection
 * - Classical state migration after measurement
 * - AI verification integration for explainability
 */

import { EventEmitter } from 'events';
import {
  QuantumState,
  QuantumReferenceId,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  QuantumPurity,
  QuantumDimension,
  QuantumError,
  QuantumErrorType
} from '../../shared/types/quantum-types';

import {
  QuantumHandle,
  QuantumBorrowHandle,
  QuantumHandleRegistry,
  QuantumMemoryNode,
  QuantumMemoryGraph,
  QuantumLifecycleManager,
  QuantumMemorySystem,
  MemoryCriticality,
  QuantumLifecyclePhase,
  ClassicalStateSnapshot,
  QuantumMemorySystemMetrics,
  QuantumMemoryExplainabilityReport,
  MemoryOperationTrace,
  EntanglementGroupId,
  EntanglementGroup,
  EntanglementManager,
  DecoherenceScheduler,
  GCPolicy,
  GCResult,
  HybridGCResult,
  StateTransitionResult,
  MeasurementResult,
  MeasurementSpec,
  ClassicalMigrationResult,
  QuantumNodeMetadata,
  QuantumOperationRecord,
  MeasurementEvent,
  EntanglementEvent,
  MemoryPressureMetrics
} from '../../shared/types/quantum-memory-types';

import { AIEntityId, ExplainabilityScore } from '../../shared/types/ai-types';

/**
 * Quantum Handle Implementation - Enforces no-cloning theorem
 */
class QuantumHandleImpl<T extends QuantumState = QuantumState> implements QuantumHandle<T> {
  private static handleCounter = 0;
  private static readonly activeHandles = new Map<QuantumReferenceId, QuantumHandleImpl>();
  
  public readonly __quantumHandleNoClone: symbol = Symbol('quantumHandleNoClone');
  
  private _isValid: boolean = true;
  private _isOwner: boolean = true;
  private _borrowCount: number = 0;
  private _lastAccess: number = Date.now();
  private _state: T | undefined;

  constructor(
    public readonly id: QuantumReferenceId,
    state: T
  ) {
    this._state = state;
    this._lastAccess = Date.now();
    
    // Enforce uniqueness - detect cloning attempts
    if (QuantumHandleImpl.activeHandles.has(id)) {
      throw new Error(`Quantum cloning detected! Handle for ${id} already exists`);
    }
    
    QuantumHandleImpl.activeHandles.set(id, this);
  }

  get isValid(): boolean {
    return this._isValid && this._state !== undefined;
  }

  get isOwner(): boolean {
    return this._isOwner && this._isValid;
  }

  get isBorrowed(): boolean {
    return this._borrowCount > 0;
  }

  get borrowCount(): number {
    return this._borrowCount;
  }

  get lastAccess(): number {
    return this._lastAccess;
  }

  move(): QuantumHandle<T> {
    if (!this._isValid || !this._isOwner) {
      throw new Error(`Cannot move invalid or non-owner handle ${this.id}`);
    }

    if (this._borrowCount > 0) {
      throw new Error(`Cannot move handle ${this.id} with active borrows`);
    }

    // Create new handle with ownership transfer
    const newHandle = new QuantumHandleImpl(this.id, this._state!);
    
    // Invalidate current handle
    this._isValid = false;
    this._isOwner = false;
    this._state = undefined;
    
    // Update registry
    QuantumHandleImpl.activeHandles.delete(this.id);
    QuantumHandleImpl.activeHandles.set(this.id, newHandle);
    
    return newHandle;
  }

  borrow(): QuantumBorrowHandle<T> {
    if (!this._isValid || !this._state) {
      throw new Error(`Cannot borrow from invalid handle ${this.id}`);
    }

    this._borrowCount++;
    this._lastAccess = Date.now();

    return new QuantumBorrowHandleImpl(this.id, this._state, () => {
      this._borrowCount = Math.max(0, this._borrowCount - 1);
    });
  }

  getState(): T | undefined {
    if (!this._isValid || !this._isOwner) {
      return undefined;
    }
    
    this._lastAccess = Date.now();
    return this._state;
  }

  release(): void {
    if (this._borrowCount > 0) {
      throw new Error(`Cannot release handle ${this.id} with active borrows`);
    }

    this._isValid = false;
    this._isOwner = false;
    this._state = undefined;
    QuantumHandleImpl.activeHandles.delete(this.id);
  }

  static detectCloning(id: QuantumReferenceId): boolean {
    return QuantumHandleImpl.activeHandles.has(id);
  }

  static getActiveHandles(): ReadonlyMap<QuantumReferenceId, QuantumHandle> {
    return new Map(QuantumHandleImpl.activeHandles);
  }
}

/**
 * Quantum Borrow Handle Implementation
 */
class QuantumBorrowHandleImpl<T extends QuantumState = QuantumState> implements QuantumBorrowHandle<T> {
  public readonly __quantumBorrowNoTransfer: symbol = Symbol('quantumBorrowNoTransfer');
  
  private _isValid: boolean = true;
  private readonly _releaseCallback: () => void;
  private readonly _timeoutId: NodeJS.Timeout;

  constructor(
    public readonly id: QuantumReferenceId,
    private readonly _state: T,
    releaseCallback: () => void,
    public readonly maxBorrowDuration: number = 5000 // 5 seconds default
  ) {
    this._releaseCallback = releaseCallback;
    
    // Auto-release after timeout
    this._timeoutId = setTimeout(() => {
      if (this._isValid) {
        this.release();
      }
    }, maxBorrowDuration);
  }

  public readonly borrowStartTime: number = Date.now();

  get isValid(): boolean {
    return this._isValid;
  }

  get state(): T | undefined {
    return this._isValid ? this._state : undefined;
  }

  release(): void {
    if (this._isValid) {
      this._isValid = false;
      clearTimeout(this._timeoutId);
      this._releaseCallback();
    }
  }
}

/**
 * Quantum Handle Registry Implementation
 */
class QuantumHandleRegistryImpl implements QuantumHandleRegistry {
  private readonly handleMetrics = {
    totalHandles: 0,
    activeBorrows: 0,
    invalidHandles: 0,
    averageBorrowDuration: 0,
    cloningAttempts: 0,
    lastCloningAttempt: undefined as number | undefined
  };

  get activeHandles(): ReadonlyMap<QuantumReferenceId, QuantumHandle> {
    return QuantumHandleImpl.getActiveHandles();
  }

  get borrowHandles(): ReadonlyMap<QuantumReferenceId, QuantumBorrowHandle[]> {
    // This would need to be implemented with actual tracking
    return new Map();
  }

  get totalStates(): number {
    return this.activeHandles.size;
  }

  get totalBorrows(): number {
    return this.handleMetrics.activeBorrows;
  }

  createHandle<T extends QuantumState>(state: T): QuantumHandle<T> {
    try {
      const handle = new QuantumHandleImpl(state.id, state);
      this.handleMetrics.totalHandles++;
      return handle;
    } catch (error) {
      this.handleMetrics.cloningAttempts++;
      this.handleMetrics.lastCloningAttempt = Date.now();
      throw error;
    }
  }

  moveHandle(fromId: QuantumReferenceId, toId: QuantumReferenceId): boolean {
    const handle = this.activeHandles.get(fromId);
    if (!handle) return false;

    try {
      const newHandle = handle.move();
      return true;
    } catch {
      return false;
    }
  }

  releaseHandle(id: QuantumReferenceId): boolean {
    const handle = this.activeHandles.get(id);
    if (!handle) return false;

    try {
      handle.release();
      return true;
    } catch {
      return false;
    }
  }

  validateHandle(id: QuantumReferenceId): boolean {
    const handle = this.activeHandles.get(id);
    return handle?.isValid ?? false;
  }

  detectCloning(id: QuantumReferenceId): boolean {
    return QuantumHandleImpl.detectCloning(id);
  }

  getHandleMetrics() {
    return { ...this.handleMetrics };
  }
}

/**
 * Quantum Memory Graph Implementation
 */
class QuantumMemoryGraphImpl implements QuantumMemoryGraph {
  private readonly _nodes = new Map<QuantumReferenceId, QuantumMemoryNode>();
  private readonly _entanglementGroups = new Map<EntanglementGroupId, EntanglementGroup>();
  private readonly _gcRoots = new Set<QuantumReferenceId>();
  private readonly _criticalStates = new Set<QuantumReferenceId>();
  private _totalMemoryUsage = 0;
  private readonly _decoherenceQueue: any[] = [];

  get nodes(): ReadonlyMap<QuantumReferenceId, QuantumMemoryNode> {
    return new Map(this._nodes);
  }

  get entanglementGroups(): ReadonlyMap<EntanglementGroupId, EntanglementGroup> {
    return new Map(this._entanglementGroups);
  }

  get gcRoots(): ReadonlySet<QuantumReferenceId> {
    return new Set(this._gcRoots);
  }

  get criticalStates(): ReadonlySet<QuantumReferenceId> {
    return new Set(this._criticalStates);
  }

  get totalMemoryUsage(): number {
    return this._totalMemoryUsage;
  }

  get decoherenceQueue(): ReadonlyArray<any> {
    return [...this._decoherenceQueue];
  }

  addNode(state: QuantumState, criticality: MemoryCriticality = MemoryCriticality.NORMAL): QuantumMemoryNode {
    const handleRegistry = new QuantumHandleRegistryImpl();
    const handle = handleRegistry.createHandle(state);
    
    const node: QuantumMemoryNode = {
      id: state.id,
      state,
      handle,
      entanglementGroupId: undefined,
      criticality,
      roots: new Set<QuantumReferenceId>(),
      metadata: this.createDefaultMetadata(),
      createdAt: Date.now(),
      lastAccess: Date.now(),
      lastModification: Date.now(),
      accessCount: 0,
      coherenceTime: 10000, // 10 second default
      decoherenceDeadline: Date.now() + 10000,
      isScheduledForGC: false,
      gcPriority: 1,
      classicalSnapshot: undefined
    };

    this._nodes.set(state.id, node);
    this._totalMemoryUsage += this.estimateNodeMemoryUsage(node);

    if (criticality === MemoryCriticality.CRITICAL || criticality === MemoryCriticality.PINNED) {
      this._criticalStates.add(state.id);
    }

    return node;
  }

  removeNode(id: QuantumReferenceId): boolean {
    const node = this._nodes.get(id);
    if (!node) return false;

    // Release the handle
    try {
      node.handle.release();
    } catch (error) {
      console.warn(`Warning: Failed to release handle for ${id}:`, error);
    }

    this._nodes.delete(id);
    this._gcRoots.delete(id);
    this._criticalStates.delete(id);
    this._totalMemoryUsage -= this.estimateNodeMemoryUsage(node);

    return true;
  }

  updateNode(id: QuantumReferenceId, updates: Partial<QuantumMemoryNode>): boolean {
    const node = this._nodes.get(id);
    if (!node) return false;

    const updatedNode = { ...node, ...updates, lastModification: Date.now() };
    this._nodes.set(id, updatedNode);
    return true;
  }

  findConnectedComponent(id: QuantumReferenceId): ReadonlySet<QuantumReferenceId> {
    const visited = new Set<QuantumReferenceId>();
    const component = new Set<QuantumReferenceId>();
    const queue = [id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      component.add(currentId);

      const node = this._nodes.get(currentId);
      if (!node) continue;

      // Add entangled states to the component
      for (const entangledId of node.state.entangledWith) {
        if (!visited.has(entangledId)) {
          queue.push(entangledId);
        }
      }
    }

    return component;
  }

  calculateMemoryPressure(): MemoryPressureMetrics {
    const totalNodes = this._nodes.size;
    let entangledNodes = 0;
    let coherentNodes = 0;
    let decoheringNodes = 0;
    let criticalNodes = this._criticalStates.size;
    let totalCoherenceTime = 0;

    for (const node of this._nodes.values()) {
      if (node.state.entangledWith.size > 0) entangledNodes++;
      
      switch (node.state.coherence) {
        case CoherenceStatus.COHERENT:
          coherentNodes++;
          break;
        case CoherenceStatus.DECOHERING:
          decoheringNodes++;
          break;
      }
      
      totalCoherenceTime += node.coherenceTime;
    }

    const averageCoherenceTime = totalNodes > 0 ? totalCoherenceTime / totalNodes : 0;
    const memoryUsageBytes = this._totalMemoryUsage;
    
    // Determine GC recommendation based on pressure
    let gcRecommendation: 'none' | 'gentle' | 'aggressive' | 'critical' = 'none';
    if (decoheringNodes / totalNodes > 0.5) gcRecommendation = 'critical';
    else if (memoryUsageBytes > 100 * 1024 * 1024) gcRecommendation = 'aggressive'; // 100MB threshold
    else if (decoheringNodes / totalNodes > 0.25) gcRecommendation = 'gentle';

    return {
      totalNodes,
      entangledNodes,
      coherentNodes,
      decoheringNodes,
      criticalNodes,
      memoryUsageBytes,
      averageCoherenceTime,
      gcRecommendation
    };
  }

  identifyGCCandidates(): ReadonlyArray<QuantumReferenceId> {
    const candidates: QuantumReferenceId[] = [];
    const now = Date.now();

    for (const [id, node] of this._nodes) {
      // Skip critical and pinned states
      if (this._criticalStates.has(id)) continue;
      
      // Skip entangled states that cannot be collected independently
      if (node.entanglementGroupId && node.state.entangledWith.size > 0) continue;
      
      // Candidates: decoherent states or idle states past deadline
      if (node.state.coherence === CoherenceStatus.DECOHERENT ||
          (now > node.decoherenceDeadline && node.lastAccess < now - 30000)) {
        candidates.push(id);
      }
    }

    return candidates.sort((a, b) => {
      const nodeA = this._nodes.get(a)!;
      const nodeB = this._nodes.get(b)!;
      return nodeA.gcPriority - nodeB.gcPriority;
    });
  }

  walkFromRoots(visitor: (node: QuantumMemoryNode) => void): void {
    const visited = new Set<QuantumReferenceId>();
    
    for (const rootId of this._gcRoots) {
      this.walkFromNode(rootId, visited, visitor);
    }
  }

  findCycles(): ReadonlyArray<ReadonlyArray<QuantumReferenceId>> {
    // Simplified cycle detection - in a real implementation,
    // this would use a proper algorithm like DFS with color marking
    return [];
  }

  getReachabilityMap(): ReadonlyMap<QuantumReferenceId, boolean> {
    const reachable = new Map<QuantumReferenceId, boolean>();
    const visited = new Set<QuantumReferenceId>();
    
    // Mark all nodes as unreachable initially
    for (const id of this._nodes.keys()) {
      reachable.set(id, false);
    }
    
    // Walk from roots and mark reachable nodes
    for (const rootId of this._gcRoots) {
      this.markReachable(rootId, visited, reachable);
    }
    
    return reachable;
  }

  private createDefaultMetadata(): QuantumNodeMetadata {
    return {
      operationHistory: [],
      entanglementHistory: [],
      measurementHistory: [],
      tags: new Set(),
      userAnnotations: {}
    };
  }

  private estimateNodeMemoryUsage(node: QuantumMemoryNode): number {
    // Simplified memory estimation
    const baseSize = 1024; // 1KB base size
    const dimensionMultiplier = Math.log2(node.state.dimension);
    const entanglementOverhead = node.state.entangledWith.size * 512;
    
    return Math.floor(baseSize * dimensionMultiplier + entanglementOverhead);
  }

  private walkFromNode(
    nodeId: QuantumReferenceId, 
    visited: Set<QuantumReferenceId>, 
    visitor: (node: QuantumMemoryNode) => void
  ): void {
    if (visited.has(nodeId)) return;
    
    const node = this._nodes.get(nodeId);
    if (!node) return;
    
    visited.add(nodeId);
    visitor(node);
    
    // Walk entangled states
    for (const entangledId of node.state.entangledWith) {
      this.walkFromNode(entangledId, visited, visitor);
    }
  }

  private markReachable(
    nodeId: QuantumReferenceId,
    visited: Set<QuantumReferenceId>,
    reachable: Map<QuantumReferenceId, boolean>
  ): void {
    if (visited.has(nodeId)) return;
    
    visited.add(nodeId);
    reachable.set(nodeId, true);
    
    const node = this._nodes.get(nodeId);
    if (!node) return;
    
    // Mark entangled states as reachable
    for (const entangledId of node.state.entangledWith) {
      this.markReachable(entangledId, visited, reachable);
    }
  }
}

/**
 * Main Quantum Memory System Implementation
 */
export class QuantumMemoryManager extends EventEmitter implements QuantumMemorySystem {
  private static instance: QuantumMemoryManager | null = null;
  
  public readonly memoryGraph: QuantumMemoryGraph;
  public readonly handleRegistry: QuantumHandleRegistry;
  private _entanglementManager: EntanglementManager | null = null;
  private _decoherenceScheduler: DecoherenceScheduler | null = null;
  private _lifecycleManager: QuantumLifecycleManager | null = null;
  
  private isInitialized = false;
  private operationCounter = 0;

  constructor() {
    super();
    this.memoryGraph = new QuantumMemoryGraphImpl();
    this.handleRegistry = new QuantumHandleRegistryImpl();
  }

  // Lazy initialization for dependent managers
  get entanglementManager(): EntanglementManager {
    if (!this._entanglementManager) {
      throw new Error('EntanglementManager not yet initialized');
    }
    return this._entanglementManager;
  }

  get decoherenceScheduler(): DecoherenceScheduler {
    if (!this._decoherenceScheduler) {
      throw new Error('DecoherenceScheduler not yet initialized');
    }
    return this._decoherenceScheduler;
  }

  get lifecycleManager(): QuantumLifecycleManager {
    if (!this._lifecycleManager) {
      throw new Error('LifecycleManager not yet initialized');
    }
    return this._lifecycleManager;
  }

  /**
   * Singleton pattern for global access
   */
  public static getInstance(): QuantumMemoryManager {
    if (!QuantumMemoryManager.instance) {
      QuantumMemoryManager.instance = new QuantumMemoryManager();
    }
    return QuantumMemoryManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.emit('system_initializing', { timestamp: Date.now() });
    
    // Note: The dependent managers would be initialized here
    // when their implementations are complete
    
    this.isInitialized = true;
    this.emit('system_initialized', { timestamp: Date.now() });
    
    console.log('Quantum Memory Management System initialized');
  }

  async shutdown(): Promise<void> {
    this.emit('system_shutting_down', { timestamp: Date.now() });
    
    // Release all handles and clean up
    for (const id of this.handleRegistry.activeHandles.keys()) {
      try {
        this.handleRegistry.releaseHandle(id);
      } catch (error) {
        console.warn(`Warning: Failed to release handle ${id} during shutdown:`, error);
      }
    }
    
    this.isInitialized = false;
    this.emit('system_shutdown', { timestamp: Date.now() });
    
    console.log('Quantum Memory Management System shutdown complete');
  }

  async performSystemGC(): Promise<HybridGCResult> {
    const gcStart = Date.now();
    const candidates = this.memoryGraph.identifyGCCandidates();
    
    const refCountCollected: QuantumReferenceId[] = [];
    const tracingCollected: QuantumReferenceId[] = [];
    const groupAwareAdjustments: EntanglementGroupId[] = [];
    let memoryFreed = 0;
    
    // Collect non-entangled candidates first (ref-count style)
    for (const candidateId of candidates) {
      const node = this.memoryGraph.nodes.get(candidateId);
      if (!node) continue;
      
      if (node.state.entangledWith.size === 0) {
        if (this.memoryGraph.removeNode(candidateId)) {
          refCountCollected.push(candidateId);
          memoryFreed += 1024; // Simplified memory calculation
        }
      }
    }
    
    const gcDuration = Date.now() - gcStart;
    
    return {
      success: true,
      statesCollected: [...refCountCollected, ...tracingCollected],
      memoryFreed,
      gcDuration,
      entanglementGroupsAffected: groupAwareAdjustments,
      errors: [],
      warnings: [],
      oversightRequired: [],
      refCountCollected,
      tracingCollected,
      groupAwareAdjustments,
      performanceMetrics: {
        totalTime: gcDuration,
        refCountTime: gcDuration * 0.6,
        tracingTime: gcDuration * 0.3,
        groupOperationTime: gcDuration * 0.1,
        statesScanned: candidates.length,
        entanglementChecks: 0,
        memoryThroughput: memoryFreed / (gcDuration / 1000)
      }
    };
  }

  getSystemMetrics(): QuantumMemorySystemMetrics {
    const memoryPressure = this.memoryGraph.calculateMemoryPressure();
    const totalStates = this.memoryGraph.nodes.size;
    
    let entangledStates = 0;
    let decoherentStates = 0;
    let totalLifetime = 0;
    const now = Date.now();

    for (const node of this.memoryGraph.nodes.values()) {
      if (node.state.entangledWith.size > 0) entangledStates++;
      if (node.state.coherence === CoherenceStatus.DECOHERENT) decoherentStates++;
      totalLifetime += now - node.createdAt;
    }

    const averageStateLifetime = totalStates > 0 ? totalLifetime / totalStates : 0;
    const gcEfficiency = 0.85; // Would be calculated from actual GC performance
    const entanglementIntegrity = 0.95; // Would be calculated from integrity checks
    const memoryFragmentation = 0.15; // Would be calculated from memory analysis

    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (memoryPressure.gcRecommendation === 'critical') systemHealth = 'critical';
    else if (memoryPressure.gcRecommendation === 'aggressive') systemHealth = 'degraded';

    return {
      totalMemoryUsage: memoryPressure.memoryUsageBytes,
      activeStates: totalStates,
      entangledStates,
      decoherentStates,
      classicalSnapshots: 0, // Would be maintained by lifecycle manager
      gcEfficiency,
      averageStateLifetime,
      entanglementIntegrity,
      memoryFragmentation,
      systemHealth
    };
  }

  generateExplainabilityReport(stateId: QuantumReferenceId): QuantumMemoryExplainabilityReport {
    const node = this.memoryGraph.nodes.get(stateId);
    if (!node) {
      throw new Error(`No quantum state found with ID: ${stateId}`);
    }

    const operationHistory = node.metadata.operationHistory.map(op => ({
      timestamp: op.timestamp,
      operation: op.operation,
      purpose: `Quantum operation: ${op.operation}`,
      quantumEffect: `Coherence impact: ${op.coherenceImpact}`,
      confidence: op.success ? 0.95 : 0.5,
      parameters: op.parameters
    }));

    const riskFactors = this.assessRiskFactors(node);
    const explainabilityScore = this.calculateExplainabilityScore(node);

    return {
      stateId,
      currentPhase: this.mapCoherenceToPhase(node.state.coherence),
      memoryUsage: 1024, // Simplified
      entanglementStatus: node.state.entangledWith.size > 0 ? 'entangled' : 'independent',
      operationHistory,
      decisionTrace: [`State created at ${new Date(node.createdAt).toISOString()}`],
      riskFactors,
      explainabilityScore
    };
  }

  getMemoryOperationTrace(operationId: string): MemoryOperationTrace {
    // This would typically be stored during operations
    // For now, return a basic trace
    return {
      operationId,
      timestamp: Date.now(),
      operation: 'quantum_operation',
      statesInvolved: [],
      memoryChanges: [],
      entanglementChanges: [],
      explainabilityData: {}
    };
  }

  /**
   * Create a new quantum state with proper handle management
   */
  createQuantumState<T extends QuantumState>(
    state: T, 
    criticality: MemoryCriticality = MemoryCriticality.NORMAL
  ): QuantumHandle<T> {
    this.operationCounter++;
    
    // Add to memory graph
    const node = this.memoryGraph.addNode(state, criticality);
    
    // Emit creation event
    this.emit('quantum_state_created', {
      stateId: state.id,
      criticality,
      timestamp: Date.now(),
      operationId: this.operationCounter
    });
    
    return node.handle as QuantumHandle<T>;
  }

  /**
   * Safely destroy a quantum state
   */
  destroyQuantumState(stateId: QuantumReferenceId): boolean {
    const node = this.memoryGraph.nodes.get(stateId);
    if (!node) return false;

    // Check if state can be safely destroyed
    if (node.criticality === MemoryCriticality.PINNED) {
      throw new Error(`Cannot destroy pinned quantum state: ${stateId}`);
    }

    if (node.state.entangledWith.size > 0) {
      throw new Error(`Cannot independently destroy entangled quantum state: ${stateId}`);
    }

    const success = this.memoryGraph.removeNode(stateId);
    
    if (success) {
      this.emit('quantum_state_destroyed', {
        stateId,
        timestamp: Date.now(),
        operationId: ++this.operationCounter
      });
    }

    return success;
  }

  private mapCoherenceToPhase(coherence: CoherenceStatus): QuantumLifecyclePhase {
    switch (coherence) {
      case CoherenceStatus.COHERENT:
        return QuantumLifecyclePhase.COHERENT;
      case CoherenceStatus.DECOHERING:
        return QuantumLifecyclePhase.DECOHERING;
      case CoherenceStatus.DECOHERENT:
        return QuantumLifecyclePhase.DECOHERENT;
      default:
        return QuantumLifecyclePhase.CREATED;
    }
  }

  private assessRiskFactors(node: QuantumMemoryNode): any[] {
    const risks = [];
    const now = Date.now();

    if (now > node.decoherenceDeadline) {
      risks.push({
        type: 'decoherence',
        severity: 'high',
        probability: 0.9,
        mitigation: 'Perform measurement or extend coherence time'
      });
    }

    if (node.state.entangledWith.size > 0) {
      risks.push({
        type: 'entanglement_break',
        severity: 'medium',
        probability: 0.3,
        mitigation: 'Monitor entanglement integrity'
      });
    }

    return risks;
  }

  private calculateExplainabilityScore(node: QuantumMemoryNode): ExplainabilityScore {
    // Simplified explainability calculation
    let score = 0.8;
    
    if (node.metadata.operationHistory.length > 10) score -= 0.1;
    if (node.state.entangledWith.size > 2) score -= 0.1;
    if (node.state.coherence === CoherenceStatus.DECOHERENT) score += 0.1;
    
    return Math.max(0.0, Math.min(1.0, score)) as ExplainabilityScore;
  }
}

// Export singleton instance for global use
export const quantumMemoryManager = QuantumMemoryManager.getInstance();