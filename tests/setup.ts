/**
 * SINGULARIS PRIME Test Setup
 * 
 * Global test configuration and setup for the comprehensive testing suite.
 * This file configures testing environment, mocks, and utilities for all test files.
 */

import '@testing-library/jest-dom';
import { expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// Mock WebSocket for testing
global.WebSocket = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  send: vi.fn(),
  readyState: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}));

// Mock fetch for HTTP requests
global.fetch = vi.fn();

// Setup global test environment
beforeAll(() => {
  // Configure test environment
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/singularis_test';
  
  // Mock quantum operations for deterministic testing
  vi.mock('@server/runtime/quantum-memory-manager', () => ({
    quantumMemoryManager: {
      allocateQuantumState: vi.fn(),
      deallocateQuantumState: vi.fn(),
      getQuantumState: vi.fn(),
      entangleStates: vi.fn(),
      measureState: vi.fn(),
      checkCoherence: vi.fn()
    }
  }));
  
  // Mock AI verification for consistent testing
  vi.mock('@server/runtime/ai-verification-service', () => ({
    aiVerificationService: {
      verifyExplainability: vi.fn(),
      enforceHumanOversight: vi.fn(),
      generateExplanation: vi.fn(),
      checkThreshold: vi.fn()
    }
  }));
});

afterAll(() => {
  // Cleanup global mocks
  vi.clearAllMocks();
});

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});

// Global test utilities
declare global {
  var testUtils: {
    createMockQuantumState: () => any;
    createMockAIContract: () => any;
    createMockGlyph: () => any;
    sleep: (ms: number) => Promise<void>;
  };
}

global.testUtils = {
  createMockQuantumState: () => ({
    id: 'test-quantum-id',
    amplitude: [0.707, 0.707],
    phase: [0, Math.PI/2],
    dimension: 2,
    coherenceTime: 1000,
    isEntangled: false
  }),
  
  createMockAIContract: () => ({
    id: 'test-ai-contract',
    explainabilityThreshold: 0.85,
    humanOversightRequired: true,
    complianceLevel: 'critical'
  }),
  
  createMockGlyph: () => ({
    id: 'test-glyph',
    type: 'quantum_binding',
    dimensions: [3, 3],
    parameters: { rotation: 0, scale: 1 }
  }),
  
  sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};