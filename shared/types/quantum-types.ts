/**
 * SINGULARIS PRIME Quantum Type System
 * 
 * This module defines the quantum type system for the SINGULARIS PRIME language.
 * It enforces quantum mechanical principles at the type level, including:
 * - No-cloning theorem compliance
 * - Entanglement reference tracking
 * - Quantum state lifecycle management
 * - Decoherence prevention
 * - Memory safety for quantum operations
 */

import { QuantumDimension, QuantumOperationType } from '../schema';

// Re-export QuantumDimension for type-checker
export { QuantumDimension };

// Unique quantum reference ID for tracking entanglement
export type QuantumReferenceId = string & { readonly _brand: 'QuantumRef' };

// Quantum state purity
export enum QuantumPurity {
  PURE = 'pure',           // |ψ⟩ - pure quantum state
  MIXED = 'mixed',         // ρ - mixed state (statistical mixture)
  ENTANGLED = 'entangled'  // Entangled with other systems
}

// Quantum coherence status
export enum CoherenceStatus {
  COHERENT = 'coherent',       // Maintains quantum superposition
  DECOHERENT = 'decoherent',   // Lost quantum properties
  DECOHERING = 'decohering'    // Currently losing coherence
}

// Quantum measurement status
export enum MeasurementStatus {
  UNMEASURED = 'unmeasured',   // Quantum superposition intact
  MEASURED = 'measured',       // Classical state post-measurement
  PARTIALLY_MEASURED = 'partial' // Some properties measured
}

// Type-level enforcement of quantum properties
export interface QuantumTypeConstraints {
  // No-cloning: quantum states cannot be copied
  readonly cannotClone: true;
  // Reference uniqueness: each quantum state has unique reference
  readonly uniqueReference: true;
  // Entanglement tracking: maintains entanglement relationships
  readonly trackEntanglement: true;
}

/**
 * Base Quantum State Type
 * Enforces fundamental quantum mechanical constraints at type level
 */
export interface QuantumState<D extends QuantumDimension = QuantumDimension.QUBIT> 
  extends QuantumTypeConstraints {
  readonly id: QuantumReferenceId;
  readonly dimension: D;
  readonly purity: QuantumPurity;
  readonly coherence: CoherenceStatus;
  readonly measurementStatus: MeasurementStatus;
  readonly createdAt: number; // Timestamp for decoherence tracking
  readonly lastInteraction: number; // Last operation timestamp
  
  // Entanglement relationships
  readonly entangledWith: ReadonlySet<QuantumReferenceId>;
  
  // Type-level prevention of cloning (branded type)
  readonly __quantumNoClone: unique symbol;
}

/**
 * Qubit Type (2-level quantum system)
 */
export interface Qubit extends QuantumState<QuantumDimension.QUBIT> {
  readonly basis: 'computational' | 'hadamard' | 'circular';
  readonly amplitude: Complex; // Complex amplitude for |0⟩ state
  readonly phase: number; // Global phase
}

/**
 * Qudit Type (d-level quantum system)
 */
export interface Qudit<D extends QuantumDimension> extends QuantumState<D> {
  readonly levels: D;
  readonly amplitudes: ReadonlyArray<Complex>; // Amplitudes for each basis state
  readonly basis: string; // Basis representation
}

/**
 * Complex Number Type for Quantum Amplitudes
 */
export interface Complex {
  readonly real: number;
  readonly imaginary: number;
  readonly magnitude: number;
  readonly phase: number;
}

/**
 * Entangled Quantum System
 * Tracks multiple quantum states that share entanglement
 */
export interface EntangledSystem {
  readonly id: QuantumReferenceId;
  readonly participants: ReadonlyArray<QuantumReferenceId>;
  readonly entanglementType: 'bell_state' | 'ghz_state' | 'cluster_state' | 'custom';
  readonly strength: number; // Entanglement measure (0-1)
  readonly coherenceTime: number; // Expected decoherence time
  readonly createdAt: number;
  
  // Type-level entanglement constraints (branded type)
  readonly __quantumEntangled: unique symbol;
}

/**
 * Quantum Operation Type with Constraints
 */
export interface QuantumOperation<
  InputType = QuantumState | QuantumState[],
  OutputType = QuantumState | QuantumState[]
> {
  readonly operationType: QuantumOperationType;
  readonly unitary: boolean; // Whether operation is unitary (reversible)
  readonly inputDimensions: ReadonlyArray<QuantumDimension>;
  readonly outputDimensions: ReadonlyArray<QuantumDimension>;
  
  // Type-safe operation application (flexible for single states or arrays)
  apply(input: InputType): QuantumOperationResult<OutputType>;
  
  // Validation
  canApplyTo(state: QuantumState | QuantumState[]): boolean;
  preservesEntanglement(): boolean;
}

/**
 * Result of Quantum Operation with Error Handling
 */
export interface QuantumOperationResult<T extends QuantumState> {
  readonly success: boolean;
  readonly result?: T;
  readonly error?: QuantumError;
  readonly entanglementChanges: ReadonlyArray<EntanglementChange>;
  readonly coherenceImpact: number; // Impact on coherence (0-1)
}

/**
 * Quantum Error Types
 */
export enum QuantumErrorType {
  CLONING_ATTEMPTED = 'cloning_attempted',
  ENTANGLEMENT_BROKEN = 'entanglement_broken',
  DECOHERENCE_EXCEEDED = 'decoherence_exceeded',
  DIMENSION_MISMATCH = 'dimension_mismatch',
  INVALID_OPERATION = 'invalid_operation',
  MEASUREMENT_COLLAPSE = 'measurement_collapse'
}

export interface QuantumError {
  readonly type: QuantumErrorType;
  readonly message: string;
  readonly quantumStateId: QuantumReferenceId;
  readonly timestamp: number;
}

/**
 * Entanglement Change Record
 */
export interface EntanglementChange {
  readonly type: 'created' | 'broken' | 'modified';
  readonly systems: ReadonlyArray<QuantumReferenceId>;
  readonly newEntanglement?: EntangledSystem;
  readonly timestamp: number;
}

/**
 * Quantum Gate Types with Type Safety
 */
export interface QuantumGate<
  InputCount extends number = 1,
  OutputCount extends number = InputCount
> {
  readonly gateType: 'single_qubit' | 'two_qubit' | 'multi_qubit' | 'multi_qudit';
  readonly matrix: ReadonlyArray<ReadonlyArray<Complex>>; // Unitary matrix
  readonly inputCount: InputCount;
  readonly outputCount: OutputCount;
  readonly operationType: QuantumOperationType;
  readonly unitary: boolean;
  readonly inputDimensions: ReadonlyArray<QuantumDimension>;
  readonly outputDimensions: ReadonlyArray<QuantumDimension>;
  
  // Type-safe gate application
  apply<T extends QuantumState>(
    inputs: T[] & { length: InputCount }
  ): QuantumOperationResult<T[] & { length: OutputCount }>;
  
  // Validation methods for compatibility
  canApplyTo(states: QuantumState[]): boolean;
  preservesEntanglement(): boolean;
}

/**
 * Common Quantum Gates
 */
export interface PauliX extends QuantumGate<1, 1> {
  readonly gateType: 'single_qubit';
  readonly symbol: 'X';
}

export interface PauliY extends QuantumGate<1, 1> {
  readonly gateType: 'single_qubit';
  readonly symbol: 'Y';
}

export interface PauliZ extends QuantumGate<1, 1> {
  readonly gateType: 'single_qubit';
  readonly symbol: 'Z';
}

export interface Hadamard extends QuantumGate<1, 1> {
  readonly gateType: 'single_qubit';
  readonly symbol: 'H';
}

export interface CNOT extends QuantumGate<2, 2> {
  readonly gateType: 'two_qubit';
  readonly symbol: 'CNOT';
  readonly controlQubit: 0 | 1;
  readonly targetQubit: 0 | 1;
}

/**
 * Quantum Measurement Types
 */
export interface QuantumMeasurement<T extends QuantumState = QuantumState> {
  readonly measurementType: 'computational' | 'pauli_x' | 'pauli_y' | 'pauli_z' | 'custom';
  readonly basis: string;
  
  // Measurement destroys superposition - type-level constraint
  measure(state: T): MeasurementResult<T>;
}

export interface MeasurementResult<T extends QuantumState> {
  readonly outcome: number; // Measurement outcome
  readonly probability: number; // Probability of this outcome
  readonly postMeasurementState: T; // Collapsed state
  readonly entanglementEffects: ReadonlyArray<EntanglementChange>;
}

/**
 * Quantum Memory Management (Updated for QMM System)
 * Note: Quantum memory types now available from shared/types/quantum-memory-types
 * Import directly from quantum-memory-types to avoid circular dependencies
 */

/**
 * Legacy QuantumMemoryManager interface for backward compatibility
 * @deprecated Use QuantumMemorySystem from quantum-memory-types instead
 */
export interface LegacyQuantumMemoryManager {
  allocate<D extends QuantumDimension>(dimension: D): Promise<Qudit<D>>;
  deallocate(id: QuantumReferenceId): Promise<void>;
  
  // Entanglement management
  createEntanglement(
    states: ReadonlyArray<QuantumReferenceId>,
    type: EntangledSystem['entanglementType']
  ): Promise<EntangledSystem>;
  
  breakEntanglement(systemId: QuantumReferenceId): Promise<void>;
  
  // Coherence monitoring
  getCoherenceStatus(id: QuantumReferenceId): Promise<CoherenceStatus>;
  setDecoherenceTimeout(id: QuantumReferenceId, timeout: number): void;
  
  // Memory safety
  isValidReference(id: QuantumReferenceId): boolean;
  preventCloning(): void;
}

/**
 * Quantum Circuit Type with Composition
 */
export interface QuantumCircuit {
  readonly id: QuantumReferenceId;
  readonly inputCount: number;
  readonly outputCount: number;
  readonly gates: ReadonlyArray<QuantumGate>;
  readonly depth: number; // Circuit depth
  
  // Type-safe circuit composition
  compose<T extends QuantumCircuit>(other: T): QuantumCircuit;
  
  // Execute circuit on quantum states
  execute<T extends QuantumState>(
    inputs: T[]
  ): Promise<QuantumOperationResult<T[]>>;
  
  // Circuit optimization
  optimize(): QuantumCircuit;
  
  // Fidelity estimation
  estimateFidelity(): number;
}

/**
 * Type Guards for Quantum Types
 */
export function isQubit(state: QuantumState): state is Qubit {
  return state.dimension === QuantumDimension.QUBIT;
}

export function isQudit<D extends QuantumDimension>(
  state: QuantumState,
  dimension: D
): boolean {
  return state.dimension === dimension;
}

export function isEntangled(state: QuantumState): boolean {
  return state.purity === QuantumPurity.ENTANGLED && state.entangledWith.size > 0;
}

export function isCoherent(state: QuantumState): boolean {
  return state.coherence === CoherenceStatus.COHERENT;
}

/**
 * Utility Types for Type-Level Quantum Constraints
 */

// Prevent cloning at type level
export type PreventCloning<T> = T & {
  readonly __quantumNoClone: unique symbol;
};

// Entanglement constraint
export type RequireEntanglement<T extends QuantumState> = T & {
  readonly purity: QuantumPurity.ENTANGLED;
  readonly entangledWith: ReadonlySet<QuantumReferenceId> & { size: number };
};

// Coherence constraint  
export type RequireCoherence<T extends QuantumState> = T & {
  readonly coherence: CoherenceStatus.COHERENT;
};

// Type-level operation constraints
export type QuantumOperationConstraint<
  Input extends QuantumState,
  Output extends QuantumState
> = {
  readonly preservesEntanglement: boolean;
  readonly preservesCoherence: boolean;
  readonly reversible: boolean;
  readonly input: Input;
  readonly output: Output;
};

/**
 * Advanced Type Mappings for Quantum Transformations
 */

// Map quantum states through operations
export type MapQuantumStates<
  States extends ReadonlyArray<QuantumState>,
  Operation extends QuantumOperation
> = {
  readonly [K in keyof States]: States[K] extends QuantumState 
    ? ReturnType<Operation['apply']> extends QuantumOperationResult<infer R>
      ? R
      : never
    : never;
};

// Compose quantum operations
export type ComposeOperations<
  Op1 extends QuantumOperation,
  Op2 extends QuantumOperation
> = QuantumOperation<
  Parameters<Op1['apply']>[0],
  ReturnType<Op2['apply']> extends QuantumOperationResult<infer R> ? R : never
>;

/**
 * Utility Functions for Quantum Memory Management
 */

// QuantumHandle utility functions
export function isValidHandle<T extends QuantumState>(handle: QuantumHandle<T> | undefined): handle is QuantumHandle<T> {
  return handle !== undefined && handle.isValid && handle.isOwner;
}

export function canBorrowHandle<T extends QuantumState>(handle: QuantumHandle<T>): boolean {
  return handle.isValid && !handle.isBorrowed;
}

// Quantum state lifecycle utilities
export function isScheduledForGC(phase: QuantumLifecyclePhase): boolean {
  return phase === QuantumLifecyclePhase.DECOHERENT || 
         phase === QuantumLifecyclePhase.DESTROYED;
}

export function canPerformOperation(state: QuantumState): boolean {
  return state.coherence === CoherenceStatus.COHERENT && 
         state.measurementStatus === MeasurementStatus.UNMEASURED;
}

export function requiresOversight(criticality: MemoryCriticality): boolean {
  return criticality === MemoryCriticality.CRITICAL || 
         criticality === MemoryCriticality.PINNED;
}

// Entanglement utilities
export function areEntangled(state1: QuantumState, state2: QuantumState): boolean {
  return state1.entangledWith.has(state2.id) && state2.entangledWith.has(state1.id);
}

export function getEntanglementPartners(state: QuantumState): ReadonlySet<QuantumReferenceId> {
  return state.entangledWith;
}

// Classical migration utilities
export function canMigrateToClassical(state: QuantumState): boolean {
  return state.measurementStatus === MeasurementStatus.MEASURED ||
         state.coherence === CoherenceStatus.DECOHERENT;
}

export function generateQuantumReferenceId(): QuantumReferenceId {
  return `qstate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` as QuantumReferenceId;
}

// Export type utilities
export {
  type QuantumState as QState,
  type EntangledSystem as Entangled,
  type QuantumOperation as QOp,
  type QuantumGate as QGate,
  type QuantumCircuit as QCircuit
};