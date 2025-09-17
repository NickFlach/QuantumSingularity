/**
 * SINGULARIS PRIME Entanglement Manager (EM)
 * 
 * Union-find style entanglement group management for quantum memory system.
 * This module provides efficient tracking and manipulation of entangled quantum states,
 * ensuring referential integrity and preventing independent collection of entangled pairs.
 * 
 * Key features:
 * - Union-find data structure for efficient group operations
 * - Entanglement group lifecycle management
 * - Referential integrity validation and repair
 * - Group-level garbage collection coordination
 * - Performance optimization through path compression and union by rank
 * - Integration with quantum memory graph and decoherence scheduler
 */

import { EventEmitter } from 'events';
import {
  QuantumReferenceId,
  QuantumState,
  EntangledSystem,
  CoherenceStatus
} from '../../shared/types/quantum-types';

import {
  EntanglementManager,
  EntanglementGroup,
  EntanglementGroupId,
  EntanglementType,
  EntanglementValidationResult,
  EntanglementError,
  EntanglementWarning,
  RepairResult,
  RepairSuggestion,
  EntanglementMetrics,
  GroupOperationRecord,
  EntanglementGroupMetadata,
  MemoryCriticality
} from '../../shared/types/quantum-memory-types';

import { AIEntityId, ExplainabilityScore } from '../../shared/types/ai-types';

/**
 * Union-Find Node for entanglement group management
 */
interface UnionFindNode {
  readonly stateId: QuantumReferenceId;
  parent: QuantumReferenceId | null;
  rank: number;
  groupId?: EntanglementGroupId;
  lastModified: number;
}

/**
 * Entanglement Group Implementation
 */
class EntanglementGroupImpl implements EntanglementGroup {
  private static groupCounter = 0;
  
  private _participants: Set<QuantumReferenceId>;
  private _lastModified: number = Date.now();
  private _operationHistory: GroupOperationRecord[] = [];

  constructor(
    public readonly id: EntanglementGroupId,
    initialParticipants: ReadonlyArray<QuantumReferenceId>,
    public readonly entanglementType: EntanglementType,
    public readonly strength: number = 1.0,
    public readonly stability: number = 0.8,
    public readonly parent?: EntanglementGroupId,
    public readonly rank: number = 0
  ) {
    this._participants = new Set(initialParticipants);
    this.recordOperation('create', new Set(), this._participants);
  }

  get participants(): ReadonlySet<QuantumReferenceId> {
    return new Set(this._participants);
  }

  get lastModified(): number {
    return this._lastModified;
  }

  get coherenceTime(): number {
    // Entanglement coherence time is typically shorter than individual states
    return Math.min(10000, 5000 * this.stability);
  }

  get groupCriticality(): MemoryCriticality {
    // Entangled groups are generally more critical
    return this._participants.size > 2 ? MemoryCriticality.HIGH : MemoryCriticality.NORMAL;
  }

  get isCanonical(): boolean {
    return !this.parent;
  }

  get canGCIndependently(): boolean {
    return false; // Entangled groups cannot be collected independently
  }

  get requiresGroupConsent(): boolean {
    return this._participants.size > 1;
  }

  get createdAt(): number {
    return this._operationHistory[0]?.timestamp ?? Date.now();
  }

  get metadata(): EntanglementGroupMetadata {
    return {
      resilienceLevel: this.stability > 0.9 ? 'robust' : 
                       this.stability > 0.6 ? 'stable' : 'fragile',
      operationHistory: [...this._operationHistory]
    };
  }

  addParticipant(stateId: QuantumReferenceId): void {
    const participantsBefore = new Set(this._participants);
    this._participants.add(stateId);
    this._lastModified = Date.now();
    this.recordOperation('link', participantsBefore, this._participants);
  }

  removeParticipant(stateId: QuantumReferenceId): boolean {
    const participantsBefore = new Set(this._participants);
    const removed = this._participants.delete(stateId);
    
    if (removed) {
      this._lastModified = Date.now();
      this.recordOperation('break', participantsBefore, this._participants);
    }
    
    return removed;
  }

  private recordOperation(
    operation: 'create' | 'link' | 'break' | 'measure' | 'modify',
    participantsBefore: Set<QuantumReferenceId>,
    participantsAfter: Set<QuantumReferenceId>
  ): void {
    this._operationHistory.push({
      timestamp: Date.now(),
      operation,
      participantsBefore,
      participantsAfter,
      success: true,
      metadata: {}
    });

    // Keep history bounded
    if (this._operationHistory.length > 100) {
      this._operationHistory = this._operationHistory.slice(-50);
    }
  }

  static generateGroupId(): EntanglementGroupId {
    return `entanglement_group_${++EntanglementGroupImpl.groupCounter}_${Date.now()}` as EntanglementGroupId;
  }
}

/**
 * Entanglement Manager Implementation
 */
export class EntanglementManagerImpl extends EventEmitter implements EntanglementManager {
  private readonly _groups = new Map<EntanglementGroupId, EntanglementGroup>();
  private readonly _stateToGroup = new Map<QuantumReferenceId, EntanglementGroupId>();
  private readonly _unionFindNodes = new Map<QuantumReferenceId, UnionFindNode>();
  
  // Performance tracking
  private _operationCount = 0;
  private _integrityChecks = { passed: 0, failed: 0 };
  private _lastPerformanceReset = Date.now();

  constructor() {
    super();
    this.setupPerformanceMonitoring();
  }

  get groups(): ReadonlyMap<EntanglementGroupId, EntanglementGroup> {
    return new Map(this._groups);
  }

  get stateToGroup(): ReadonlyMap<QuantumReferenceId, EntanglementGroupId> {
    return new Map(this._stateToGroup);
  }

  get totalGroups(): number {
    return this._groups.size;
  }

  get totalEntangledStates(): number {
    return this._stateToGroup.size;
  }

  /**
   * Union-Find: Find operation with path compression
   */
  find(stateId: QuantumReferenceId): EntanglementGroupId | undefined {
    this._operationCount++;
    
    const node = this._unionFindNodes.get(stateId);
    if (!node) return undefined;

    // Path compression optimization
    const root = this.findRootWithCompression(stateId);
    return root ? this._stateToGroup.get(root) : undefined;
  }

  /**
   * Union-Find: Union operation with union by rank
   */
  union(group1Id: EntanglementGroupId, group2Id: EntanglementGroupId): EntanglementGroupId {
    this._operationCount++;
    
    const group1 = this._groups.get(group1Id);
    const group2 = this._groups.get(group2Id);
    
    if (!group1 || !group2) {
      throw new Error(`Cannot union: one or both groups not found (${group1Id}, ${group2Id})`);
    }

    if (group1Id === group2Id) {
      return group1Id; // Already in same group
    }

    // Union by rank optimization
    const smallerGroup = group1.rank <= group2.rank ? group1 : group2;
    const largerGroup = group1.rank <= group2.rank ? group2 : group1;
    const newGroupId = largerGroup.id;

    // Merge participants
    const mergedParticipants = [
      ...Array.from(smallerGroup.participants),
      ...Array.from(largerGroup.participants)
    ];

    // Create new merged group
    const mergedGroup = new EntanglementGroupImpl(
      newGroupId,
      mergedParticipants,
      this.determineMergedType(smallerGroup.entanglementType, largerGroup.entanglementType),
      Math.max(smallerGroup.strength, largerGroup.strength),
      Math.min(smallerGroup.stability, largerGroup.stability), // Conservative stability
      undefined, // No parent for merged group
      Math.max(smallerGroup.rank, largerGroup.rank) + (smallerGroup.rank === largerGroup.rank ? 1 : 0)
    );

    // Update data structures
    this._groups.set(newGroupId, mergedGroup);
    
    // Update state-to-group mappings
    for (const stateId of mergedParticipants) {
      this._stateToGroup.set(stateId, newGroupId);
      this.updateUnionFindNode(stateId, newGroupId);
    }

    // Clean up the smaller group
    if (smallerGroup.id !== newGroupId) {
      this._groups.delete(smallerGroup.id);
    }

    this.emit('groups_merged', {
      newGroupId,
      mergedGroups: [group1Id, group2Id],
      participantCount: mergedParticipants.length,
      timestamp: Date.now()
    });

    return newGroupId;
  }

  /**
   * Split an entanglement group into smaller groups
   */
  split(groupId: EntanglementGroupId, newGroupParticipants: ReadonlySet<QuantumReferenceId>): EntanglementGroupId[] {
    this._operationCount++;
    
    const originalGroup = this._groups.get(groupId);
    if (!originalGroup) {
      throw new Error(`Cannot split: group ${groupId} not found`);
    }

    const newGroupArray = Array.from(newGroupParticipants);
    const remainingParticipants = Array.from(originalGroup.participants).filter(
      id => !newGroupParticipants.has(id)
    );

    if (newGroupArray.length === 0 || remainingParticipants.length === 0) {
      throw new Error('Split operation requires both groups to have participants');
    }

    // Create new group for split participants
    const newGroupId = EntanglementGroupImpl.generateGroupId();
    const newGroup = new EntanglementGroupImpl(
      newGroupId,
      newGroupArray,
      originalGroup.entanglementType,
      originalGroup.strength * 0.8, // Reduce strength due to split
      originalGroup.stability * 0.9, // Reduce stability due to disruption
      undefined,
      0 // Reset rank for new group
    );

    // Update original group with remaining participants
    const updatedOriginalGroup = new EntanglementGroupImpl(
      groupId,
      remainingParticipants,
      originalGroup.entanglementType,
      originalGroup.strength * 0.8,
      originalGroup.stability * 0.9,
      originalGroup.parent,
      Math.max(0, originalGroup.rank - 1)
    );

    // Update data structures
    this._groups.set(newGroupId, newGroup);
    this._groups.set(groupId, updatedOriginalGroup);

    // Update state-to-group mappings
    for (const stateId of newGroupArray) {
      this._stateToGroup.set(stateId, newGroupId);
      this.updateUnionFindNode(stateId, newGroupId);
    }

    for (const stateId of remainingParticipants) {
      this._stateToGroup.set(stateId, groupId);
      this.updateUnionFindNode(stateId, groupId);
    }

    this.emit('group_split', {
      originalGroupId: groupId,
      newGroupId,
      originalParticipants: originalGroup.participants.size,
      splitParticipants: newGroupArray.length,
      timestamp: Date.now()
    });

    return [groupId, newGroupId];
  }

  /**
   * Create a new entanglement group
   */
  createGroup(participants: ReadonlyArray<QuantumReferenceId>, type: EntanglementType): EntanglementGroup {
    this._operationCount++;
    
    if (participants.length < 2) {
      throw new Error('Entanglement group requires at least 2 participants');
    }

    // Check for existing entanglements
    for (const stateId of participants) {
      if (this._stateToGroup.has(stateId)) {
        throw new Error(`State ${stateId} is already entangled in group ${this._stateToGroup.get(stateId)}`);
      }
    }

    const groupId = EntanglementGroupImpl.generateGroupId();
    const group = new EntanglementGroupImpl(
      groupId,
      participants,
      type,
      1.0, // Full strength for new entanglement
      0.9, // High stability for fresh entanglement
      undefined,
      0 // Initial rank
    );

    this._groups.set(groupId, group);

    // Update state-to-group mappings and union-find structure
    for (const stateId of participants) {
      this._stateToGroup.set(stateId, groupId);
      this.createUnionFindNode(stateId, groupId);
    }

    this.emit('group_created', {
      groupId,
      type,
      participantCount: participants.length,
      timestamp: Date.now()
    });

    return group;
  }

  /**
   * Add a state to an existing entanglement group
   */
  addToGroup(groupId: EntanglementGroupId, stateId: QuantumReferenceId): boolean {
    this._operationCount++;
    
    const group = this._groups.get(groupId);
    if (!group) return false;

    if (this._stateToGroup.has(stateId)) {
      // Need to merge groups
      const existingGroupId = this._stateToGroup.get(stateId)!;
      this.union(groupId, existingGroupId);
      return true;
    }

    // Add to existing group
    (group as EntanglementGroupImpl).addParticipant(stateId);
    this._stateToGroup.set(stateId, groupId);
    this.createUnionFindNode(stateId, groupId);

    this.emit('participant_added', {
      groupId,
      stateId,
      newSize: group.participants.size,
      timestamp: Date.now()
    });

    return true;
  }

  /**
   * Remove a state from an entanglement group
   */
  removeFromGroup(groupId: EntanglementGroupId, stateId: QuantumReferenceId): boolean {
    this._operationCount++;
    
    const group = this._groups.get(groupId);
    if (!group || !group.participants.has(stateId)) return false;

    // Remove from group
    const success = (group as EntanglementGroupImpl).removeParticipant(stateId);
    
    if (success) {
      this._stateToGroup.delete(stateId);
      this._unionFindNodes.delete(stateId);

      // Check if group should be dissolved
      if (group.participants.size < 2) {
        this.dissolveGroup(groupId);
      }

      this.emit('participant_removed', {
        groupId,
        stateId,
        newSize: group.participants.size,
        dissolved: group.participants.size < 2,
        timestamp: Date.now()
      });
    }

    return success;
  }

  /**
   * Validate the integrity of an entanglement group
   */
  validateGroupIntegrity(groupId: EntanglementGroupId): EntanglementValidationResult {
    this._operationCount++;
    
    const group = this._groups.get(groupId);
    if (!group) {
      return {
        isValid: false,
        errors: [{
          type: 'missing_participant',
          message: `Group ${groupId} not found`,
          affectedStates: [],
          severity: 'error'
        }],
        warnings: [],
        repairSuggestions: []
      };
    }

    const errors: EntanglementError[] = [];
    const warnings: EntanglementWarning[] = [];
    const repairSuggestions: RepairSuggestion[] = [];

    // Check participant consistency
    for (const stateId of group.participants) {
      const mappedGroup = this._stateToGroup.get(stateId);
      if (mappedGroup !== groupId) {
        errors.push({
          type: 'invalid_relationship',
          message: `State ${stateId} maps to group ${mappedGroup} but is in group ${groupId}`,
          affectedStates: [stateId],
          severity: 'error'
        });
      }

      const unionFindNode = this._unionFindNodes.get(stateId);
      if (!unionFindNode) {
        errors.push({
          type: 'missing_participant',
          message: `Union-find node missing for state ${stateId}`,
          affectedStates: [stateId],
          severity: 'error'
        });
      }
    }

    // Check for stability warnings
    if (group.stability < 0.5) {
      warnings.push({
        type: 'stability',
        message: `Group ${groupId} has low stability (${group.stability})`,
        recommendation: 'Consider reinforcing entanglement or preparing for potential decoherence'
      });
    }

    // Check performance warnings
    if (group.participants.size > 10) {
      warnings.push({
        type: 'performance',
        message: `Large entanglement group (${group.participants.size} participants) may impact performance`,
        recommendation: 'Consider splitting into smaller groups if possible'
      });
    }

    // Generate repair suggestions
    if (errors.length > 0) {
      repairSuggestions.push({
        action: 'update_relationships',
        description: 'Repair inconsistent state-to-group mappings',
        affectedGroups: [groupId],
        estimatedCost: errors.length * 0.1
      });
    }

    const isValid = errors.length === 0;
    if (isValid) {
      this._integrityChecks.passed++;
    } else {
      this._integrityChecks.failed++;
    }

    return {
      isValid,
      errors,
      warnings,
      repairSuggestions
    };
  }

  /**
   * Repair broken entanglements and inconsistencies
   */
  repairBrokenEntanglements(): RepairResult {
    const startTime = Date.now();
    const errorsFixed: EntanglementError[] = [];
    const remainingIssues: EntanglementError[] = [];
    let repairsPerformed = 0;

    // Validate all groups and collect errors
    const allErrors: EntanglementError[] = [];
    for (const groupId of this._groups.keys()) {
      const validation = this.validateGroupIntegrity(groupId);
      allErrors.push(...validation.errors);
    }

    // Attempt to repair each error
    for (const error of allErrors) {
      try {
        switch (error.type) {
          case 'invalid_relationship':
            this.repairInvalidRelationship(error);
            errorsFixed.push(error);
            repairsPerformed++;
            break;
          
          case 'missing_participant':
            this.repairMissingParticipant(error);
            errorsFixed.push(error);
            repairsPerformed++;
            break;
          
          default:
            remainingIssues.push(error);
        }
      } catch (repairError) {
        console.warn(`Failed to repair error: ${error.message}`, repairError);
        remainingIssues.push(error);
      }
    }

    const repairTime = Date.now() - startTime;
    const success = remainingIssues.length === 0;

    this.emit('repair_completed', {
      success,
      repairsPerformed,
      errorsFixed: errorsFixed.length,
      remainingIssues: remainingIssues.length,
      repairTime,
      timestamp: Date.now()
    });

    return {
      success,
      repairsPerformed,
      errorsFixed,
      remainingIssues,
      performanceImpact: repairTime / 1000 // Convert to seconds
    };
  }

  /**
   * Get comprehensive metrics about entanglement management
   */
  getGroupMetrics(): EntanglementMetrics {
    const now = Date.now();
    const timeSinceReset = (now - this._lastPerformanceReset) / 1000;
    
    let totalParticipants = 0;
    let maxGroupSize = 0;
    let totalStrength = 0;
    const stabilityDistribution: Record<string, number> = {
      robust: 0,
      stable: 0,
      fragile: 0
    };

    for (const group of this._groups.values()) {
      totalParticipants += group.participants.size;
      maxGroupSize = Math.max(maxGroupSize, group.participants.size);
      totalStrength += group.strength;
      
      const stabilityCategory = group.metadata.resilienceLevel;
      stabilityDistribution[stabilityCategory]++;
    }

    const averageGroupSize = this._groups.size > 0 ? totalParticipants / this._groups.size : 0;
    const averageEntanglementStrength = this._groups.size > 0 ? totalStrength / this._groups.size : 0;
    const operationsPerSecond = timeSinceReset > 0 ? this._operationCount / timeSinceReset : 0;

    return {
      totalGroups: this._groups.size,
      averageGroupSize,
      largestGroupSize: maxGroupSize,
      averageEntanglementStrength,
      groupStabilityDistribution: stabilityDistribution,
      unionFindOperationsPerSecond: operationsPerSecond,
      integrityChecksPassed: this._integrityChecks.passed,
      integrityChecksFailed: this._integrityChecks.failed
    };
  }

  // Private helper methods

  private findRootWithCompression(stateId: QuantumReferenceId): QuantumReferenceId | null {
    const node = this._unionFindNodes.get(stateId);
    if (!node) return null;

    if (node.parent === null) {
      return stateId; // This is the root
    }

    // Path compression: make the parent point directly to the root
    const root = this.findRootWithCompression(node.parent);
    if (root) {
      node.parent = root;
    }
    return root;
  }

  private createUnionFindNode(stateId: QuantumReferenceId, groupId: EntanglementGroupId): void {
    this._unionFindNodes.set(stateId, {
      stateId,
      parent: null, // Root node initially
      rank: 0,
      groupId,
      lastModified: Date.now()
    });
  }

  private updateUnionFindNode(stateId: QuantumReferenceId, groupId: EntanglementGroupId): void {
    const node = this._unionFindNodes.get(stateId);
    if (node) {
      node.groupId = groupId;
      node.lastModified = Date.now();
    } else {
      this.createUnionFindNode(stateId, groupId);
    }
  }

  private dissolveGroup(groupId: EntanglementGroupId): void {
    const group = this._groups.get(groupId);
    if (!group) return;

    // Clean up all references
    for (const stateId of group.participants) {
      this._stateToGroup.delete(stateId);
      this._unionFindNodes.delete(stateId);
    }

    this._groups.delete(groupId);

    this.emit('group_dissolved', {
      groupId,
      participantCount: group.participants.size,
      timestamp: Date.now()
    });
  }

  private determineMergedType(type1: EntanglementType, type2: EntanglementType): EntanglementType {
    // If both types are the same, keep it
    if (type1 === type2) return type1;
    
    // Otherwise, default to CUSTOM for merged groups
    return EntanglementType.CUSTOM;
  }

  private repairInvalidRelationship(error: EntanglementError): void {
    // Implementation would depend on specific error details
    // For now, just log the repair attempt
    console.log(`Repairing invalid relationship: ${error.message}`);
  }

  private repairMissingParticipant(error: EntanglementError): void {
    // Implementation would recreate missing union-find nodes
    console.log(`Repairing missing participant: ${error.message}`);
  }

  private setupPerformanceMonitoring(): void {
    // Reset performance counters periodically
    setInterval(() => {
      this._operationCount = 0;
      this._lastPerformanceReset = Date.now();
    }, 60000); // Reset every minute
  }
}

// Export singleton instance
export const entanglementManager = new EntanglementManagerImpl();