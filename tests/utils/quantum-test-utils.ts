/**
 * Quantum Testing Utilities
 * 
 * Utilities for testing quantum operations, state management, and entanglement
 * in a deterministic and controlled manner.
 */

import { vi } from 'vitest';
import {
  QuantumState,
  QuantumReferenceId,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  QuantumDimension
} from '@shared/types/quantum-types';

export interface MockQuantumState extends QuantumState {
  id: QuantumReferenceId;
  amplitude: number[];
  phase: number[];
  dimension: QuantumDimension;
  coherenceTime: number;
  isEntangled: boolean;
  entanglementPartners?: QuantumReferenceId[];
  measurementBasis?: string;
  lastOperation?: string;
  createdAt: number;
}

export class QuantumTestHarness {
  private mockStates: Map<QuantumReferenceId, MockQuantumState> = new Map();
  private entanglementGroups: Map<string, Set<QuantumReferenceId>> = new Map();
  private operationHistory: Array<{
    operation: string;
    states: QuantumReferenceId[];
    timestamp: number;
    result: any;
  }> = [];

  /**
   * Create a mock quantum state for testing
   */
  createQuantumState(dimension: QuantumDimension = 2): MockQuantumState {
    const id = `quantum-test-${Date.now()}-${Math.random()}` as QuantumReferenceId;
    
    const state: MockQuantumState = {
      id,
      amplitude: this.generateRandomAmplitudes(dimension),
      phase: this.generateRandomPhases(dimension),
      dimension,
      coherenceTime: 1000 + Math.random() * 9000, // 1-10 seconds
      isEntangled: false,
      entanglementPartners: [],
      measurementBasis: 'computational',
      lastOperation: 'creation',
      createdAt: Date.now(),
      // QuantumState interface properties
      type: 'pure',
      basis: 'computational',
      fidelity: 0.95 + Math.random() * 0.05
    };

    this.mockStates.set(id, state);
    this.recordOperation('create_state', [id], state);
    
    return state;
  }

  /**
   * Create entangled quantum states
   */
  createEntangledPair(): [MockQuantumState, MockQuantumState] {
    const state1 = this.createQuantumState(2);
    const state2 = this.createQuantumState(2);
    
    // Create Bell state |00⟩ + |11⟩
    state1.amplitude = [0.707, 0, 0, 0.707];
    state1.phase = [0, 0, 0, 0];
    state2.amplitude = [0.707, 0, 0, 0.707];
    state2.phase = [0, 0, 0, 0];
    
    // Mark as entangled
    state1.isEntangled = true;
    state2.isEntangled = true;
    state1.entanglementPartners = [state2.id];
    state2.entanglementPartners = [state1.id];
    
    // Create entanglement group
    const groupId = `entanglement-${Date.now()}`;
    this.entanglementGroups.set(groupId, new Set([state1.id, state2.id]));
    
    this.recordOperation('entangle', [state1.id, state2.id], { groupId });
    
    return [state1, state2];
  }

  /**
   * Simulate quantum state measurement
   */
  measureQuantumState(stateId: QuantumReferenceId, basis: string = 'computational'): {
    result: number;
    collapsedState: MockQuantumState;
    probability: number;
  } {
    const state = this.mockStates.get(stateId);
    if (!state) {
      throw new Error(`Quantum state ${stateId} not found`);
    }

    // Simulate probabilistic measurement
    const random = Math.random();
    let cumulativeProbability = 0;
    let measurementResult = 0;
    
    for (let i = 0; i < state.amplitude.length; i++) {
      const probability = state.amplitude[i] ** 2;
      cumulativeProbability += probability;
      
      if (random <= cumulativeProbability) {
        measurementResult = i;
        break;
      }
    }

    // Collapse state to measurement result
    const collapsedAmplitude = new Array(state.amplitude.length).fill(0);
    collapsedAmplitude[measurementResult] = 1;
    
    const collapsedState: MockQuantumState = {
      ...state,
      amplitude: collapsedAmplitude,
      phase: new Array(state.phase.length).fill(0),
      lastOperation: 'measurement',
      measurementBasis: basis
    };

    this.mockStates.set(stateId, collapsedState);
    
    const probability = state.amplitude[measurementResult] ** 2;
    this.recordOperation('measure', [stateId], { result: measurementResult, probability });
    
    return {
      result: measurementResult,
      collapsedState,
      probability
    };
  }

  /**
   * Simulate decoherence over time
   */
  simulateDecoherence(stateId: QuantumReferenceId, timeElapsed: number): MockQuantumState {
    const state = this.mockStates.get(stateId);
    if (!state) {
      throw new Error(`Quantum state ${stateId} not found`);
    }

    const decayFactor = Math.exp(-timeElapsed / state.coherenceTime);
    const noiseFactor = 1 - decayFactor;
    
    // Apply decoherence to amplitudes
    const decoheredAmplitude = state.amplitude.map(amp => 
      amp * decayFactor + (Math.random() - 0.5) * noiseFactor * 0.1
    );
    
    // Normalize amplitudes
    const norm = Math.sqrt(decoheredAmplitude.reduce((sum, amp) => sum + amp ** 2, 0));
    const normalizedAmplitude = decoheredAmplitude.map(amp => amp / norm);
    
    const decoheredState: MockQuantumState = {
      ...state,
      amplitude: normalizedAmplitude,
      lastOperation: 'decoherence',
      fidelity: (state.fidelity || 0.95) * decayFactor
    };

    this.mockStates.set(stateId, decoheredState);
    this.recordOperation('decoherence', [stateId], { timeElapsed, decayFactor });
    
    return decoheredState;
  }

  /**
   * Check if no-cloning theorem is violated
   */
  checkNoCloning(originalId: QuantumReferenceId, cloneId: QuantumReferenceId): boolean {
    const original = this.mockStates.get(originalId);
    const clone = this.mockStates.get(cloneId);
    
    if (!original || !clone) return false;
    
    // Perfect clones are impossible for unknown quantum states
    const amplitudeDiff = original.amplitude.map((amp, i) => 
      Math.abs(amp - clone.amplitude[i])
    ).reduce((sum, diff) => sum + diff, 0);
    
    return amplitudeDiff < 0.001; // Threshold for "perfect" cloning
  }

  /**
   * Verify entanglement correlations
   */
  verifyEntanglement(stateId1: QuantumReferenceId, stateId2: QuantumReferenceId): {
    isEntangled: boolean;
    correlation: number;
    bellTestResult: number;
  } {
    const state1 = this.mockStates.get(stateId1);
    const state2 = this.mockStates.get(stateId2);
    
    if (!state1 || !state2) {
      throw new Error('States not found for entanglement verification');
    }

    // Simplified Bell test simulation
    const measurements = [];
    for (let i = 0; i < 100; i++) {
      const m1 = this.measureQuantumState(stateId1).result;
      const m2 = this.measureQuantumState(stateId2).result;
      measurements.push({ m1, m2 });
    }
    
    // Calculate correlation
    const correlatedMeasurements = measurements.filter(m => m.m1 === m.m2).length;
    const correlation = correlatedMeasurements / measurements.length;
    
    // Bell inequality test (simplified)
    const bellTestResult = Math.abs(correlation - 0.5) * 2;
    const isEntangled = bellTestResult > 0.5; // Violation of local realism
    
    this.recordOperation('verify_entanglement', [stateId1, stateId2], {
      correlation,
      bellTestResult,
      isEntangled
    });
    
    return { isEntangled, correlation, bellTestResult };
  }

  /**
   * Get operation history for analysis
   */
  getOperationHistory(): typeof this.operationHistory {
    return [...this.operationHistory];
  }

  /**
   * Clear all test states and reset harness
   */
  reset(): void {
    this.mockStates.clear();
    this.entanglementGroups.clear();
    this.operationHistory = [];
  }

  /**
   * Generate random normalized amplitudes
   */
  private generateRandomAmplitudes(dimension: number): number[] {
    const amplitudes = Array.from({ length: dimension }, () => Math.random());
    const norm = Math.sqrt(amplitudes.reduce((sum, amp) => sum + amp ** 2, 0));
    return amplitudes.map(amp => amp / norm);
  }

  /**
   * Generate random phases
   */
  private generateRandomPhases(dimension: number): number[] {
    return Array.from({ length: dimension }, () => Math.random() * 2 * Math.PI);
  }

  /**
   * Record operation for testing analysis
   */
  private recordOperation(operation: string, states: QuantumReferenceId[], result: any): void {
    this.operationHistory.push({
      operation,
      states: [...states],
      timestamp: Date.now(),
      result
    });
  }
}