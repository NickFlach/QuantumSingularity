# API Reference - Singularis Prime

## `singularis/quantum`

### QuantumState

Represents a quantum state vector.

```typescript
class QuantumState {
  constructor(dimensions: number);
  
  // Initialization
  initializeZero(): void;
  initializeOne(): void;
  initializeSuperposition(): void;
  initializeWithAmplitudes(amplitudes: Complex[]): void;
  
  // Operations
  applyGate(gate: QuantumGate, qubits?: number[]): void;
  measure(): number;
  measureMany(shots: number): number[];
  normalize(): void;
  
  // Properties
  getStateVector(): Complex[];
  getProbabilities(): number[];
  getDimensions(): number;
  norm(): number;
  
  // Advanced
  innerProduct(other: QuantumState): Complex;
  tensorProduct(other: QuantumState): QuantumState;
  partialTrace(subsystem: number[]): QuantumState;
  entanglementEntropy(subsystem: number[]): number;
}
```

### Gates

Standard quantum gates.

```typescript
namespace Gates {
  // Single-qubit gates
  const H: QuantumGate;           // Hadamard
  const X: QuantumGate;           // Pauli-X (NOT)
  const Y: QuantumGate;           // Pauli-Y
  const Z: QuantumGate;           // Pauli-Z
  const T: QuantumGate;           // T gate (π/4 phase)
  const S: QuantumGate;           // S gate (π/2 phase)
  
  // Rotation gates
  function RX(theta: number): QuantumGate;
  function RY(theta: number): QuantumGate;
  function RZ(theta: number): QuantumGate;
  function Phase(phi: number): QuantumGate;
  
  // Two-qubit gates
  const CNOT: QuantumGate;
  const CZ: QuantumGate;
  const SWAP: QuantumGate;
  function CPhase(phi: number): QuantumGate;
  
  // Custom gates
  function fromMatrix(matrix: Complex[][]): QuantumGate;
}
```

### QuantumCircuit

Build and execute quantum circuits.

```typescript
class QuantumCircuit {
  constructor(numQubits: number);
  
  // Add gates
  H(qubit: number): this;
  X(qubit: number): this;
  Y(qubit: number): this;
  Z(qubit: number): this;
  RX(qubit: number, theta: number): this;
  RY(qubit: number, theta: number): this;
  RZ(qubit: number, theta: number): this;
  CNOT(control: number, target: number): this;
  
  // Measurement
  measure(qubits: number[]): this;
  
  // Execution
  execute(shots?: number): ExecutionResult;
  
  // Visualization
  draw(): string;
  toQASM(): string;
  toPyQuil(): string;
  toCirq(): string;
}
```

### NoiseModels

Quantum noise simulation.

```typescript
namespace NoiseModels {
  function depolarizing(state: QuantumState, rate: number): QuantumState;
  function amplitudeDamping(state: QuantumState, rate: number): QuantumState;
  function phaseDamping(state: QuantumState, rate: number): QuantumState;
  function bitFlip(state: QuantumState, rate: number): QuantumState;
  function phaseFlip(state: QuantumState, rate: number): QuantumState;
}
```

### Hamiltonian

Hamiltonian operators for time evolution.

```typescript
class Hamiltonian {
  constructor(matrix: Complex[][]);
  
  // Evolution
  evolve(state: QuantumState, time: number): QuantumState;
  
  // Properties
  eigenvalues(): number[];
  eigenvectors(): QuantumState[];
  
  // Predefined Hamiltonians
  static pauliX(): Hamiltonian;
  static pauliY(): Hamiltonian;
  static pauliZ(): Hamiltonian;
  static ising(nSpins: number, J: number, h: number): Hamiltonian;
  static heisenberg(nSpins: number, J: number): Hamiltonian;
}
```

## `singularis/ai`

### CodeOptimizer

AI-powered code optimization.

```typescript
class CodeOptimizer {
  constructor(config?: OptimizerConfig);
  
  // Analysis
  analyzePerformance(file: string): Promise<PerformanceReport>;
  analyzeMemory(file: string): Promise<MemoryReport>;
  analyze(path: string): Promise<AnalysisReport>;
  
  // Suggestions
  suggestOptimizations(code: string): Promise<Optimization[]>;
  applyOptimization(code: string, opt: Optimization): string;
  
  // Batch operations
  analyzeProject(dir: string): Promise<ProjectReport>;
}

interface OptimizerConfig {
  model?: 'local' | 'gpt-4' | 'claude-3';
  apiKey?: string;
  incremental?: boolean;
  cacheDir?: string;
  parallel?: boolean;
  workers?: number;
}

interface PerformanceReport {
  hotspots: Hotspot[];
  suggestions: Suggestion[];
  metrics: PerformanceMetrics;
}
```

### StaticAnalyzer

Static code analysis and bug detection.

```typescript
class StaticAnalyzer {
  constructor(config?: AnalyzerConfig);
  
  // Scanning
  scan(path: string): Promise<Issue[]>;
  scanFile(file: string): Promise<Issue[]>;
  
  // Fixing
  fix(issue: Issue): Promise<string>;
  autoFix(path: string): Promise<FixReport>;
  
  // Metrics
  getMetrics(path: string): Promise<CodeMetrics>;
}

interface Issue {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
  fix?: string;
}
```

### CodeGenerator

AI-powered code generation.

```typescript
class CodeGenerator {
  constructor(config?: GeneratorConfig);
  
  // Generation
  generate(description: string): Promise<string>;
  generateFunction(signature: string, description: string): Promise<string>;
  generateClass(name: string, description: string): Promise<string>;
  
  // Refinement
  refine(code: string, feedback: string): Promise<string>;
  improve(code: string, focus: string[]): Promise<string>;
  
  // Explanation
  explain(code: string): Promise<string>;
  document(code: string): Promise<string>;
}
```

### TestGenerator

Automated test generation.

```typescript
class TestGenerator {
  constructor(config?: TestConfig);
  
  // Generation
  generateTests(file: string, functionName: string): Promise<string>;
  generateTestSuite(dir: string): Promise<TestSuite>;
  
  // Coverage
  findUncoveredCode(dir: string): Promise<UncoveredCode[]>;
  generateForGaps(gaps: UncoveredCode[]): Promise<string>;
}
```

## `singularis/distributed`

### ConsensusProtocol

Distributed consensus.

```typescript
class ConsensusProtocol {
  constructor(algorithm: 'raft' | 'paxos' | 'bft');
  
  // Operations
  propose(value: any): Promise<ConsensusResult>;
  query(): Promise<any>;
  
  // Membership
  addNode(node: NodeInfo): Promise<void>;
  removeNode(nodeId: string): Promise<void>;
  
  // Status
  getLeader(): string | null;
  getStatus(): ConsensusStatus;
}

interface ConsensusResult {
  accepted: boolean;
  value: any;
  term: number;
}
```

### DistributedLock

Distributed locking primitive.

```typescript
class DistributedLock {
  constructor(resourceId: string, config?: LockConfig);
  
  // Locking
  acquire(): Promise<boolean>;
  release(): Promise<void>;
  tryAcquire(timeout: number): Promise<boolean>;
  
  // Status
  isLocked(): boolean;
  getOwner(): string | null;
}

interface LockConfig {
  ttl?: number;           // Lock time-to-live (ms)
  retry?: RetryConfig;
  fencing?: boolean;
}
```

### EventualConsistency

Eventual consistency primitives.

```typescript
class EventualConsistency {
  constructor(config?: ConsistencyConfig);
  
  // Operations
  put(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  
  // Conflict resolution
  setResolver(resolver: ConflictResolver): void;
  
  // Synchronization
  sync(): Promise<void>;
  getVectorClock(): VectorClock;
}

type ConflictResolver = (local: any, remote: any) => any;
```

## `singularis/math`

### Complex

Complex number operations.

```typescript
class Complex {
  constructor(real: number, imag: number);
  
  // Properties
  real: number;
  imag: number;
  
  // Operations
  add(other: Complex): Complex;
  sub(other: Complex): Complex;
  mul(other: Complex): Complex;
  div(other: Complex): Complex;
  
  // Functions
  abs(): number;
  arg(): number;
  conj(): Complex;
  exp(): Complex;
  log(): Complex;
  pow(n: number): Complex;
  sqrt(): Complex;
  
  // Static methods
  static fromPolar(r: number, theta: number): Complex;
  static I: Complex;  // Imaginary unit
}
```

### Matrix

Matrix operations.

```typescript
class Matrix {
  constructor(data: number[][] | Complex[][]);
  
  // Operations
  add(other: Matrix): Matrix;
  mul(other: Matrix): Matrix;
  transpose(): Matrix;
  conjugate(): Matrix;
  adjoint(): Matrix;
  
  // Properties
  det(): number | Complex;
  trace(): number | Complex;
  rank(): number;
  
  // Decompositions
  eigenvalues(): (number | Complex)[];
  eigenvectors(): Vector[];
  svd(): SVDResult;
  qr(): QRResult;
  
  // Static methods
  static identity(size: number): Matrix;
  static zero(rows: number, cols: number): Matrix;
  static fromArray(data: number[][]): Matrix;
}
```

### Vector

Vector operations.

```typescript
class Vector {
  constructor(components: number[]);
  
  // Operations
  add(other: Vector): Vector;
  sub(other: Vector): Vector;
  scale(scalar: number): Vector;
  
  // Products
  dot(other: Vector): number;
  cross(other: Vector): Vector;  // 3D only
  
  // Properties
  norm(): number;
  normalize(): Vector;
  length: number;
  
  // Static methods
  static zero(dim: number): Vector;
}
```

### Stats

Statistical functions.

```typescript
namespace Stats {
  // Central tendency
  function mean(data: number[]): number;
  function median(data: number[]): number;
  function mode(data: number[]): number[];
  
  // Dispersion
  function variance(data: number[]): number;
  function stddev(data: number[]): number;
  function range(data: number[]): [number, number];
  
  // Correlation
  function covariance(x: number[], y: number[]): number;
  function correlation(x: number[], y: number[]): number;
  
  // Distributions
  function normal(mean: number, stddev: number): Distribution;
  function uniform(min: number, max: number): Distribution;
}
```

## `singularis/async`

### Async

Async utilities.

```typescript
namespace Async {
  // Execution
  function parallel<T>(tasks: (() => Promise<T>)[]): Promise<T[]>;
  function sequence<T>(tasks: (() => Promise<T>)[]): Promise<T[]>;
  function race<T>(promises: Promise<T>[]): Promise<T>;
  
  // Timing
  function timeout<T>(promise: Promise<T>, ms: number): Promise<T>;
  function delay(ms: number): Promise<void>;
  
  // Retry
  function retry<T>(
    fn: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T>;
  
  // Rate limiting
  function rateLimit<T>(
    fn: () => Promise<T>,
    rate: number,
    per: 'second' | 'minute'
  ): () => Promise<T>;
}

interface RetryConfig {
  maxAttempts: number;
  backoff?: 'linear' | 'exponential';
  baseDelay?: number;
}
```

### RateLimiter

Rate limiting primitive.

```typescript
class RateLimiter {
  constructor(config: RateLimitConfig);
  
  acquire(): Promise<void>;
  tryAcquire(): boolean;
  reset(): void;
}

interface RateLimitConfig {
  rate: number;
  per: 'second' | 'minute' | 'hour';
  burst?: number;
}
```

## `singularis/crypto`

### Hash

Cryptographic hashing.

```typescript
namespace Hash {
  // SHA family
  function sha256(data: string | Buffer): Promise<string>;
  function sha512(data: string | Buffer): Promise<string>;
  function sha3_256(data: string | Buffer): Promise<string>;
  function sha3_512(data: string | Buffer): Promise<string>;
  
  // Other algorithms
  function blake2b(data: string | Buffer, keyLength?: number): Promise<string>;
  function blake3(data: string | Buffer): Promise<string>;
}
```

### PQC

Post-quantum cryptography.

```typescript
namespace PQC {
  // Key generation
  function generateKeyPair(algorithm: 'kyber' | 'dilithium'): Promise<KeyPair>;
  function generateSigningKeyPair(algorithm: 'dilithium' | 'sphincs'): Promise<SigningKeyPair>;
  
  // Key exchange
  function keyExchange(
    privateKey: PrivateKey,
    publicKey: PublicKey
  ): Promise<SharedSecret>;
  
  // Digital signatures
  function sign(
    message: string | Buffer,
    privateKey: PrivateKey
  ): Promise<Signature>;
  
  function verify(
    message: string | Buffer,
    signature: Signature,
    publicKey: PublicKey
  ): Promise<boolean>;
}
```

## Type Definitions

### Common Types

```typescript
// Complex number
interface Complex {
  real: number;
  imag: number;
}

// Quantum gate
interface QuantumGate {
  matrix: Complex[][];
  dimensions: number;
  unitary: boolean;
}

// Execution result
interface ExecutionResult {
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  shots: number;
}

// Performance metrics
interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
}
```

---

**For more information:**
- [Core Syntax](./syntax.md) - Language syntax
- [Standard Library](./stdlib.md) - Built-in functions
- [Type System](./type-system.md) - Advanced types
- [Examples](../examples/) - Code examples
