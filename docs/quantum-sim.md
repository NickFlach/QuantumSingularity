# Quantum Simulation - Singularis Prime

## Overview

Singularis Prime provides classical simulation of quantum algorithms and quantum state evolution. This is useful for:

- **Algorithm Development** - Test quantum algorithms before running on real quantum hardware
- **Education** - Learn quantum computing concepts
- **Research** - Explore quantum phenomena and protocols
- **Prototyping** - Rapid development of quantum applications

> **Note:** This is a classical simulation of quantum systems, not actual quantum computing. Performance is limited by classical computing constraints.

## Quantum States

### Creating Quantum States

```typescript
import { QuantumState } from 'singularis-quantum';

// Single qubit (2 dimensions)
const qubit = new QuantumState(2);

// Multi-dimensional quantum state
const qudit = new QuantumState(37);

// Initialize in computational basis |0⟩
qubit.initializeZero();

// Initialize in superposition
qubit.initializeSuperposition();

// Custom initialization
const amplitudes = [
  { real: 0.707, imag: 0 },    // √(1/2)
  { real: 0.707, imag: 0 }     // √(1/2)
];
qubit.initializeWithAmplitudes(amplitudes);
```

### State Properties

```typescript
// Get state vector
const stateVector = qubit.getStateVector();

// Normalize state
qubit.normalize();

// Calculate probabilities
const probabilities = qubit.getProbabilities();

// Inner product
const overlap = qubit.innerProduct(otherQubit);
```

## Quantum Gates

### Single-Qubit Gates

```typescript
import { Gates } from 'singularis-quantum';

// Pauli gates
qubit.applyGate(Gates.X);  // NOT gate
qubit.applyGate(Gates.Y);  // Pauli-Y
qubit.applyGate(Gates.Z);  // Phase flip

// Hadamard gate (creates superposition)
qubit.applyGate(Gates.H);

// Rotation gates
qubit.applyGate(Gates.RX(Math.PI / 4));  // Rotate around X
qubit.applyGate(Gates.RY(Math.PI / 4));  // Rotate around Y
qubit.applyGate(Gates.RZ(Math.PI / 4));  // Rotate around Z

// Phase gate
qubit.applyGate(Gates.Phase(Math.PI / 2));

// T gate
qubit.applyGate(Gates.T);
```

### Two-Qubit Gates

```typescript
// CNOT gate (controlled-NOT)
const system = QuantumState.tensor(qubit1, qubit2);
system.applyGate(Gates.CNOT, [0, 1]);  // Control: 0, Target: 1

// Controlled-Z
system.applyGate(Gates.CZ, [0, 1]);

// SWAP gate
system.applyGate(Gates.SWAP, [0, 1]);

// Controlled phase
system.applyGate(Gates.CPhase(Math.PI / 2), [0, 1]);
```

### Custom Gates

```typescript
// Define custom gate from matrix
const customGate = Gates.fromMatrix([
  [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
  [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
]);

qubit.applyGate(customGate);
```

## Measurement

### Computational Basis Measurement

```typescript
// Measure in computational basis
const measurement = qubit.measure();
console.log(`Measured: ${measurement}`);  // 0 or 1

// Measure multiple times (statistics)
const results = qubit.measureMany(1000);
console.log(`Results: ${results}`);  // Distribution
```

### Partial Measurement

```typescript
// Measure only specific qubits
const system = QuantumState.tensor(qubit1, qubit2);
const [result, collapsedState] = system.measureQubit(0);
```

### Expectation Values

```typescript
// Calculate expectation value of observable
const observable = Gates.Z;
const expectation = qubit.expectationValue(observable);
console.log(`⟨Z⟩ = ${expectation}`);
```

## Quantum Algorithms

### Quantum Fourier Transform

```typescript
import { Algorithms } from 'singularis-quantum';

// Apply QFT to n-qubit system
const nQubits = 4;
const state = new QuantumState(2 ** nQubits);
state.initializeSuperposition();

Algorithms.quantumFourierTransform(state, nQubits);
```

### Grover's Algorithm

```typescript
// Grover's search algorithm
const database = Array.from({ length: 16 }, (_, i) => i);
const target = 7;

const result = Algorithms.groverSearch(database, target);
console.log(`Found: ${result}`);
```

### Phase Estimation

```typescript
// Quantum phase estimation
const unitary = Gates.T;  // Gate with phase π/4
const eigenstate = new QuantumState(2);
eigenstate.initializeZero();

const estimatedPhase = Algorithms.phaseEstimation(
  unitary,
  eigenstate,
  precision: 8  // 8 bits of precision
);
```

## Entanglement

### Creating Entangled States

```typescript
// Bell state (maximally entangled)
const qubit1 = new QuantumState(2);
const qubit2 = new QuantumState(2);

qubit1.applyGate(Gates.H);
const system = QuantumState.tensor(qubit1, qubit2);
system.applyGate(Gates.CNOT, [0, 1]);

// Now qubit1 and qubit2 are entangled
```

### Measuring Entanglement

```typescript
// Calculate entanglement entropy
const entropy = system.entanglementEntropy([0]);  // Subsystem: qubit 0
console.log(`Entanglement entropy: ${entropy}`);

// Schmidt decomposition
const schmidt = system.schmidtDecomposition([0, 1]);
```

## Noise and Error Models

### Depolarizing Noise

```typescript
import { NoiseModels } from 'singularis-quantum';

// Apply depolarizing noise (models decoherence)
const noiseRate = 0.01;  // 1% error rate
const noisyQubit = NoiseModels.depolarizing(qubit, noiseRate);
```

### Amplitude Damping

```typescript
// Model energy relaxation
const dampingRate = 0.05;
const dampedQubit = NoiseModels.amplitudeDamping(qubit, dampingRate);
```

### Phase Damping

```typescript
// Model dephasing
const dephasingRate = 0.02;
const dephasedQubit = NoiseModels.phaseDamping(qubit, dephasingRate);
```

## Hamiltonian Evolution

### Time Evolution

```typescript
import { Hamiltonian } from 'singularis-quantum';

// Define Hamiltonian (Pauli-Z)
const H = Hamiltonian.fromMatrix([
  [{ real: 1, imag: 0 }, { real: 0, imag: 0 }],
  [{ real: 0, imag: 0 }, { real: -1, imag: 0 }]
]);

// Evolve state under Hamiltonian
const initialState = new QuantumState(2);
initialState.initializeSuperposition();

const time = 1.0;
const evolvedState = H.evolve(initialState, time);
```

### Common Hamiltonians

```typescript
// Pauli operators
const Hx = Hamiltonian.pauliX();
const Hy = Hamiltonian.pauliY();
const Hz = Hamiltonian.pauliZ();

// Ising model
const J = 1.0;  // Coupling strength
const h = 0.5;  // External field
const nSpins = 4;
const isingH = Hamiltonian.ising(nSpins, J, h);

// Heisenberg model
const heisenbergH = Hamiltonian.heisenberg(nSpins, J);
```

## Quantum Circuits

### Circuit Builder

```typescript
import { QuantumCircuit } from 'singularis-quantum';

// Create circuit with 3 qubits
const circuit = new QuantumCircuit(3);

// Add gates
circuit.H(0);                    // Hadamard on qubit 0
circuit.CNOT(0, 1);              // CNOT from 0 to 1
circuit.CNOT(1, 2);              // CNOT from 1 to 2
circuit.measure([0, 1, 2]);      // Measure all qubits

// Execute circuit
const results = circuit.execute(shots: 1000);
console.log(results);
```

### Circuit Visualization

```typescript
// Generate circuit diagram
const diagram = circuit.draw();
console.log(diagram);

// Export to QASM
const qasm = circuit.toQASM();
```

## Performance Considerations

### State Vector Limitations

The state vector grows exponentially with the number of qubits:
- **10 qubits:** 1024 complex amplitudes (~16 KB)
- **20 qubits:** 1,048,576 amplitudes (~16 MB)
- **30 qubits:** 1,073,741,824 amplitudes (~16 GB)

Classical simulation becomes impractical beyond ~30 qubits.

### Optimization Tips

1. **Use sparse operations** - For gates acting on few qubits
2. **Tensor network methods** - For specific types of states
3. **GPU acceleration** - Available via optional CUDA backend
4. **Approximate methods** - For large systems (e.g., MPS)

```typescript
// Enable optimizations
const config = {
  sparse: true,           // Use sparse matrix operations
  gpu: true,              // Use GPU if available
  approximation: 'MPS'    // Matrix Product State approximation
};

const simulator = new QuantumSimulator(config);
```

## Advanced Topics

### Quantum Error Correction

```typescript
import { ErrorCorrection } from 'singularis-quantum';

// 3-qubit bit flip code
const logical = new QuantumState(2);
const encoded = ErrorCorrection.bitFlipEncode(logical);

// Simulate error
encoded.applyGate(Gates.X, [1]);  // Flip qubit 1

// Detect and correct
const corrected = ErrorCorrection.bitFlipCorrect(encoded);
```

### Variational Algorithms

```typescript
// Variational Quantum Eigensolver (VQE)
const hamiltonian = Hamiltonian.heisenberg(4);
const ansatz = VariationalAnsatz.heuristicEfficientAnsatz(4);

const vqe = new VQE(hamiltonian, ansatz);
const groundStateEnergy = await vqe.minimize();
```

## Examples

See the [examples directory](../examples/) for complete working examples:
- [Hello Quantum](../examples/hello-quantum/) - Basic quantum gates
- [Quantum Teleportation](../examples/teleportation/) - Entanglement protocol
- [Shor's Algorithm](../examples/shors/) - Factoring algorithm

---

**Next Steps:**
- [AI Integration](./ai-integration.md) - AI-assisted quantum algorithm optimization
- [API Reference](./api-reference.md) - Complete API documentation
- [Performance Guide](./performance.md) - Optimization techniques
