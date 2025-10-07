# Core Syntax - Singularis Prime

## Overview

Singularis Prime is a statically-typed, expression-oriented language with first-class support for quantum algorithm simulation, AI-assisted development, and distributed systems programming.

## Basic Syntax

### Variables and Types

```typescript
// Type inference
let x = 42;                    // number
let name = "Singularis";       // string
let active = true;             // boolean

// Explicit types
let count: number = 10;
let message: string = "Hello";
let items: Array<number> = [1, 2, 3];

// Type annotations
const add = (a: number, b: number): number => a + b;
```

### Functions

```typescript
// Function declaration
function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, n) => sum + n, 0);
}

// Arrow functions
const multiply = (a: number, b: number) => a * b;

// Generic functions
function identity<T>(value: T): T {
  return value;
}
```

### Control Flow

```typescript
// Conditionals
if (condition) {
  // code
} else if (otherCondition) {
  // code
} else {
  // code
}

// Pattern matching (proposed)
match value {
  | Some(x) => process(x)
  | None => handleEmpty()
}

// Loops
for (let i = 0; i < 10; i++) {
  // code
}

while (condition) {
  // code
}

// Async/await
async function fetchData(): Promise<Data> {
  const response = await fetch(url);
  return response.json();
}
```

## Advanced Features

### Quantum State Types

```typescript
// Quantum state representation
type QuantumState = {
  dimensions: number;
  amplitudes: Complex[];
  basis: string;
};

// Quantum operations
interface QuantumGate {
  apply(state: QuantumState): QuantumState;
  matrix: Matrix;
}
```

### AI Optimization Decorators

```typescript
// AI-assisted optimization
@optimize
function computeIntensive(data: number[]): number {
  // Compiler will profile and suggest optimizations
  return data.reduce((sum, n) => sum + n ** 2, 0);
}

// Performance profiling
@profile
async function criticalPath(): Promise<Result> {
  // Automatic performance tracking
  return await complexOperation();
}
```

### Distributed System Primitives

```typescript
// High-latency aware operations
@distributed
class DistributedCache {
  async get(key: string): Promise<Value> {
    // Automatic retry and timeout handling
    return await remoteGet(key);
  }
}

// Consensus integration
@consensus('raft')
class DistributedState {
  async update(key: string, value: any): Promise<void> {
    // Replicated across nodes
  }
}
```

## Type System

### Algebraic Data Types

```typescript
// Sum types
type Result<T, E> = 
  | { type: 'success', value: T }
  | { type: 'error', error: E };

// Product types
type Point = { x: number, y: number };

// Recursive types
type Tree<T> = 
  | { type: 'leaf', value: T }
  | { type: 'node', left: Tree<T>, right: Tree<T> };
```

### Generics and Constraints

```typescript
// Generic constraints
interface Comparable<T> {
  compareTo(other: T): number;
}

function max<T extends Comparable<T>>(a: T, b: T): T {
  return a.compareTo(b) > 0 ? a : b;
}

// Higher-kinded types (proposed)
type Functor<F<_>> = {
  map<A, B>(fa: F<A>, fn: (a: A) => B): F<B>;
};
```

## Module System

### Imports and Exports

```typescript
// Named exports
export function utility() { }
export const constant = 42;

// Default export
export default class MyClass { }

// Import
import { utility, constant } from './module';
import MyClass from './MyClass';

// Namespace import
import * as Utils from './utils';
```

### Package Management

```json
// package.json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "singularis-quantum": "^2.0.0",
    "singularis-distributed": "^1.5.0"
  }
}
```

## Comments and Documentation

```typescript
/**
 * Calculates the quantum state evolution under a given Hamiltonian.
 * 
 * @param initialState - The initial quantum state
 * @param hamiltonian - The Hamiltonian operator
 * @param time - Evolution time
 * @returns The evolved quantum state
 */
function evolveState(
  initialState: QuantumState,
  hamiltonian: Matrix,
  time: number
): QuantumState {
  // Implementation
}

// Single-line comments
// This is a comment

/* Multi-line comments
   Can span multiple lines
*/
```

## Error Handling

```typescript
// Try-catch
try {
  const result = riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
} finally {
  cleanup();
}

// Result type pattern
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { type: 'error', error: 'Division by zero' };
  }
  return { type: 'success', value: a / b };
}
```

## Best Practices

### Code Style

1. **Use TypeScript strict mode** - Enable all type checking
2. **Prefer immutability** - Use `const` over `let` when possible
3. **Explicit types** - Add type annotations for public APIs
4. **Async/await** - Use async/await over promises when possible
5. **Error handling** - Always handle errors explicitly

### Performance

1. **Profile before optimizing** - Use `@profile` decorator
2. **Lazy evaluation** - Defer expensive computations
3. **Memoization** - Cache results of pure functions
4. **Batch operations** - Minimize network round trips

---

For more detailed information, see:
- [Type System](./type-system.md) - Advanced type features
- [Standard Library](./stdlib.md) - Built-in functions and modules
- [Performance Guide](./performance.md) - Optimization techniques
