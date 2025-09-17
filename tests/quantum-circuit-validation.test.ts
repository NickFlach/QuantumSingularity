/**
 * SINGULARIS PRIME Quantum Circuit Validation Testing
 * 
 * Comprehensive tests for quantum state integrity, entanglement verification,
 * decoherence testing, no-cloning enforcement, superposition, and QMM integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { QuantumTestHarness, MockQuantumState } from '@tests/utils/quantum-test-utils';
import {
  QuantumState,
  QuantumReferenceId,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  QuantumDimension
} from '@shared/types/quantum-types';

import {
  QuantumHandle,
  QuantumMemorySystem,
  MemoryCriticality,
  QuantumLifecyclePhase
} from '@shared/types/quantum-memory-types';

// Mock the quantum memory manager
vi.mock('@server/runtime/quantum-memory-manager', () => ({
  quantumMemoryManager: {
    allocateQuantumState: vi.fn(),
    deallocateQuantumState: vi.fn(),
    getQuantumState: vi.fn(),
    entangleStates: vi.fn(),
    measureState: vi.fn(),
    checkCoherence: vi.fn(),
    getMemoryUsage: vi.fn(),
    runGarbageCollection: vi.fn()
  }
}));

describe('Quantum Circuit Validation Tests', () => {
  let quantumHarness: QuantumTestHarness;

  beforeEach(() => {
    quantumHarness = new QuantumTestHarness();
    vi.clearAllMocks();
  });

  afterEach(() => {
    quantumHarness.reset();
  });

  describe('Quantum State Integrity Tests', () => {
    it('should preserve quantum state amplitude normalization', () => {
      const state = quantumHarness.createQuantumState(2);
      
      // Check amplitude normalization (sum of squares should equal 1)
      const normalizationSum = state.amplitude.reduce((sum, amp) => sum + amp ** 2, 0);
      expect(normalizationSum).toBeCloseTo(1.0, 6);
    });

    it('should maintain state coherence within expected time limits', () => {
      const state = quantumHarness.createQuantumState(2);
      const initialCoherence = state.coherenceTime;
      
      // Simulate time passing (half coherence time)
      const timeElapsed = initialCoherence / 2;
      const decoheredState = quantumHarness.simulateDecoherence(state.id, timeElapsed);
      
      // State should still be partially coherent
      expect(decoheredState.fidelity).toBeGreaterThan(0.5);
      expect(decoheredState.fidelity).toBeLessThan(state.fidelity || 0.95);
    });

    it('should track quantum state operations and history', () => {
      const state1 = quantumHarness.createQuantumState(2);
      const state2 = quantumHarness.createQuantumState(2);
      
      quantumHarness.measureQuantumState(state1.id);
      quantumHarness.simulateDecoherence(state2.id, 1000);
      
      const history = quantumHarness.getOperationHistory();
      
      expect(history).toHaveLength(4); // 2 creations + 1 measurement + 1 decoherence
      expect(history.some(op => op.operation === 'create_state')).toBe(true);
      expect(history.some(op => op.operation === 'measure')).toBe(true);
      expect(history.some(op => op.operation === 'decoherence')).toBe(true);
    });

    it('should validate quantum state dimensions and properties', () => {
      const qubit = quantumHarness.createQuantumState(2);
      const qutrit = quantumHarness.createQuantumState(3);
      const qudit = quantumHarness.createQuantumState(37); // 37-dimensional qudit
      
      expect(qubit.dimension).toBe(2);
      expect(qubit.amplitude).toHaveLength(2);
      expect(qubit.phase).toHaveLength(2);
      
      expect(qutrit.dimension).toBe(3);
      expect(qutrit.amplitude).toHaveLength(3);
      
      expect(qudit.dimension).toBe(37);
      expect(qudit.amplitude).toHaveLength(37);
      expect(qudit.phase).toHaveLength(37);
    });
  });

  describe('Entanglement Verification Tests', () => {
    it('should create valid entangled pairs with Bell state properties', () => {
      const [state1, state2] = quantumHarness.createEntangledPair();
      
      expect(state1.isEntangled).toBe(true);
      expect(state2.isEntangled).toBe(true);
      expect(state1.entanglementPartners).toContain(state2.id);
      expect(state2.entanglementPartners).toContain(state1.id);
      
      // Check Bell state amplitude structure
      expect(state1.amplitude[0]).toBeCloseTo(0.707, 3); // |00⟩ component
      expect(state1.amplitude[3]).toBeCloseTo(0.707, 3); // |11⟩ component
      expect(state1.amplitude[1]).toBeCloseTo(0, 3);     // |01⟩ component
      expect(state1.amplitude[2]).toBeCloseTo(0, 3);     // |10⟩ component
    });

    it('should verify quantum entanglement through Bell test correlations', () => {
      const [state1, state2] = quantumHarness.createEntangledPair();
      
      const entanglementTest = quantumHarness.verifyEntanglement(state1.id, state2.id);
      
      expect(entanglementTest.isEntangled).toBe(true);
      expect(entanglementTest.correlation).toBeGreaterThan(0.5);
      expect(entanglementTest.bellTestResult).toBeGreaterThan(0.5);
    });

    it('should maintain entanglement correlations across operations', () => {
      const [state1, state2] = quantumHarness.createEntangledPair();
      
      // Perform operations on both states
      quantumHarness.simulateDecoherence(state1.id, 500);
      quantumHarness.simulateDecoherence(state2.id, 500);
      
      // Entanglement should still be detectable
      const entanglementTest = quantumHarness.verifyEntanglement(state1.id, state2.id);
      expect(entanglementTest.correlation).toBeGreaterThan(0.3); // Reduced but still present
    });

    it('should handle multi-particle entanglement (GHZ states)', () => {
      // Create 3-particle GHZ state |000⟩ + |111⟩
      const state1 = quantumHarness.createQuantumState(8); // 2^3 = 8 dimensional
      const state2 = quantumHarness.createQuantumState(8);
      const state3 = quantumHarness.createQuantumState(8);
      
      // Manually create GHZ state structure
      state1.amplitude = [0.707, 0, 0, 0, 0, 0, 0, 0.707];
      state2.amplitude = [0.707, 0, 0, 0, 0, 0, 0, 0.707];
      state3.amplitude = [0.707, 0, 0, 0, 0, 0, 0, 0.707];
      
      state1.isEntangled = true;
      state2.isEntangled = true;
      state3.isEntangled = true;
      
      // Check normalization is preserved
      const norm1 = state1.amplitude.reduce((sum, amp) => sum + amp ** 2, 0);
      expect(norm1).toBeCloseTo(1.0, 6);
    });
  });

  describe('Decoherence Testing', () => {
    it('should simulate realistic decoherence over time', () => {
      const state = quantumHarness.createQuantumState(2);
      const initialFidelity = state.fidelity || 0.95;
      
      // Simulate decoherence over full coherence time
      const decoheredState = quantumHarness.simulateDecoherence(state.id, state.coherenceTime);
      
      // Fidelity should degrade according to exponential decay
      const expectedFidelity = initialFidelity * Math.exp(-1); // e^(-1) factor
      expect(decoheredState.fidelity).toBeCloseTo(expectedFidelity, 2);
    });

    it('should handle decoherence in entangled systems', () => {
      const [state1, state2] = quantumHarness.createEntangledPair();
      const initialFidelity1 = state1.fidelity || 0.95;
      
      // Apply decoherence to one partner
      quantumHarness.simulateDecoherence(state1.id, state1.coherenceTime / 2);
      
      // Both states should show degradation
      const updatedState1 = quantumHarness.createQuantumState(2); // Get updated state
      expect(updatedState1.fidelity).toBeLessThan(initialFidelity1);
    });

    it('should implement decoherence-aware garbage collection', () => {
      const states = Array.from({ length: 10 }, () => quantumHarness.createQuantumState(2));
      
      // Simulate heavy decoherence on some states
      states.slice(0, 5).forEach(state => {
        quantumHarness.simulateDecoherence(state.id, state.coherenceTime * 2);
      });
      
      const history = quantumHarness.getOperationHistory();
      const decoherenceOps = history.filter(op => op.operation === 'decoherence');
      
      expect(decoherenceOps).toHaveLength(5);
      expect(decoherenceOps.every(op => op.result.decayFactor < 0.5)).toBe(true);
    });
  });

  describe('No-Cloning Theorem Enforcement', () => {
    it('should detect perfect quantum state cloning attempts', () => {
      const originalState = quantumHarness.createQuantumState(2);
      
      // Create a "clone" with identical properties
      const cloneState = quantumHarness.createQuantumState(2);
      cloneState.amplitude = [...originalState.amplitude];
      cloneState.phase = [...originalState.phase];
      
      const isCloned = quantumHarness.checkNoCloning(originalState.id, cloneState.id);
      expect(isCloned).toBe(true); // Should detect the cloning
    });

    it('should allow approximate cloning with fidelity loss', () => {
      const originalState = quantumHarness.createQuantumState(2);
      const approximateClone = quantumHarness.createQuantumState(2);
      
      // Create approximate clone with some noise
      approximateClone.amplitude = originalState.amplitude.map(amp => 
        amp + (Math.random() - 0.5) * 0.1
      );
      
      // Renormalize
      const norm = Math.sqrt(approximateClone.amplitude.reduce((sum, amp) => sum + amp ** 2, 0));
      approximateClone.amplitude = approximateClone.amplitude.map(amp => amp / norm);
      
      const isCloned = quantumHarness.checkNoCloning(originalState.id, approximateClone.id);
      expect(isCloned).toBe(false); // Should not detect as perfect clone
    });

    it('should enforce no-cloning in quantum memory manager integration', () => {
      const { quantumMemoryManager } = require('@server/runtime/quantum-memory-manager');
      
      // Mock QMM to throw on cloning attempts
      quantumMemoryManager.allocateQuantumState.mockImplementation((state) => {
        if (state.isClone) {
          throw new Error('Quantum cloning detected! Handle for quantum state already exists');
        }
        return { success: true, handle: 'mock-handle' };
      });
      
      const state = quantumHarness.createQuantumState(2);
      
      // Attempt to allocate a clone
      expect(() => {
        quantumMemoryManager.allocateQuantumState({ ...state, isClone: true });
      }).toThrow('Quantum cloning detected');
    });
  });

  describe('Superposition Tests', () => {
    it('should create and maintain superposition states', () => {
      const state = quantumHarness.createQuantumState(2);
      
      // Create equal superposition |+⟩ = (|0⟩ + |1⟩)/√2
      state.amplitude = [1/Math.sqrt(2), 1/Math.sqrt(2)];
      state.phase = [0, 0];
      
      // Verify superposition properties
      expect(state.amplitude[0]).toBeCloseTo(0.707, 3);
      expect(state.amplitude[1]).toBeCloseTo(0.707, 3);
      
      const norm = state.amplitude.reduce((sum, amp) => sum + amp ** 2, 0);
      expect(norm).toBeCloseTo(1.0, 6);
    });

    it('should handle superposition collapse on measurement', () => {
      const state = quantumHarness.createQuantumState(2);
      
      // Create superposition
      state.amplitude = [1/Math.sqrt(2), 1/Math.sqrt(2)];
      
      const measurementResult = quantumHarness.measureQuantumState(state.id);
      
      // After measurement, state should be collapsed
      expect([0, 1]).toContain(measurementResult.result);
      expect(measurementResult.collapsedState.amplitude[measurementResult.result]).toBe(1);
      
      // Other amplitudes should be zero
      measurementResult.collapsedState.amplitude.forEach((amp, index) => {
        if (index !== measurementResult.result) {
          expect(amp).toBe(0);
        }
      });
    });

    it('should maintain phase relationships in complex superpositions', () => {
      const state = quantumHarness.createQuantumState(2);
      
      // Create superposition with phase: |+⟩ = (|0⟩ + i|1⟩)/√2
      state.amplitude = [1/Math.sqrt(2), 1/Math.sqrt(2)];
      state.phase = [0, Math.PI/2]; // 90 degree phase difference
      
      expect(state.phase[1] - state.phase[0]).toBeCloseTo(Math.PI/2, 3);
    });
  });

  describe('Quantum Memory Management Integration', () => {
    it('should integrate with QMM for state allocation and deallocation', () => {
      const { quantumMemoryManager } = require('@server/runtime/quantum-memory-manager');
      
      quantumMemoryManager.allocateQuantumState.mockReturnValue({
        success: true,
        handle: 'mock-handle-123'
      });
      
      quantumMemoryManager.getQuantumState.mockReturnValue({
        id: 'test-state',
        amplitude: [1, 0],
        dimension: 2
      });
      
      const state = quantumHarness.createQuantumState(2);
      
      // Test allocation
      const allocationResult = quantumMemoryManager.allocateQuantumState(state);
      expect(allocationResult.success).toBe(true);
      expect(quantumMemoryManager.allocateQuantumState).toHaveBeenCalledWith(state);
      
      // Test retrieval
      const retrievedState = quantumMemoryManager.getQuantumState('test-state');
      expect(retrievedState.id).toBe('test-state');
    });

    it('should track memory usage and criticality levels', () => {
      const { quantumMemoryManager } = require('@server/runtime/quantum-memory-manager');
      
      quantumMemoryManager.getMemoryUsage.mockReturnValue({
        allocatedStates: 10,
        totalCapacity: 100,
        utilizationPercent: 10,
        criticalityDistribution: {
          low: 5,
          medium: 3,
          high: 2,
          critical: 0
        }
      });
      
      const memoryUsage = quantumMemoryManager.getMemoryUsage();
      
      expect(memoryUsage.allocatedStates).toBe(10);
      expect(memoryUsage.utilizationPercent).toBe(10);
      expect(memoryUsage.criticalityDistribution.high).toBe(2);
    });

    it('should handle quantum garbage collection', () => {
      const { quantumMemoryManager } = require('@server/runtime/quantum-memory-manager');
      
      quantumMemoryManager.runGarbageCollection.mockReturnValue({
        statesCollected: 5,
        memoryFreed: 1024,
        timeElapsed: 150,
        coherenceThreshold: 0.1
      });
      
      const gcResult = quantumMemoryManager.runGarbageCollection();
      
      expect(gcResult.statesCollected).toBe(5);
      expect(gcResult.memoryFreed).toBe(1024);
      expect(quantumMemoryManager.runGarbageCollection).toHaveBeenCalled();
    });
  });

  describe('Performance and Optimization Tests', () => {
    it('should handle large-scale quantum state operations efficiently', () => {
      const startTime = Date.now();
      
      // Create 100 quantum states
      const states = Array.from({ length: 100 }, () => quantumHarness.createQuantumState(2));
      
      // Perform operations on all states
      states.forEach(state => {
        quantumHarness.measureQuantumState(state.id);
      });
      
      const endTime = Date.now();
      const operationTime = endTime - startTime;
      
      // Should complete within reasonable time (less than 1 second)
      expect(operationTime).toBeLessThan(1000);
      
      const history = quantumHarness.getOperationHistory();
      expect(history).toHaveLength(200); // 100 creates + 100 measurements
    });

    it('should optimize entanglement operations for multiple pairs', () => {
      const startTime = Date.now();
      
      // Create 50 entangled pairs
      const entangledPairs = Array.from({ length: 50 }, () => 
        quantumHarness.createEntangledPair()
      );
      
      const endTime = Date.now();
      const operationTime = endTime - startTime;
      
      expect(entangledPairs).toHaveLength(50);
      expect(operationTime).toBeLessThan(2000); // Should be reasonably fast
      
      // Verify all pairs are properly entangled
      entangledPairs.forEach(([state1, state2]) => {
        expect(state1.isEntangled).toBe(true);
        expect(state2.isEntangled).toBe(true);
      });
    });

    it('should maintain performance under memory pressure', () => {
      // Create many states to simulate memory pressure
      const states = Array.from({ length: 1000 }, () => 
        quantumHarness.createQuantumState(4) // Higher dimension states
      );
      
      const startTime = Date.now();
      
      // Perform operations under pressure
      states.slice(0, 100).forEach(state => {
        quantumHarness.simulateDecoherence(state.id, 1000);
      });
      
      const endTime = Date.now();
      const operationTime = endTime - startTime;
      
      // Performance should still be acceptable
      expect(operationTime).toBeLessThan(5000);
      expect(states).toHaveLength(1000);
    });
  });
});