# Type System - Singularis Prime

## Overview

Singularis Prime features a powerful static type system with type inference, generics, and advanced type features. The type system ensures correctness at compile time while maintaining developer productivity.

## Basic Types

### Primitive Types

```typescript
// Numbers
let integer: number = 42;
let float: number = 3.14;
let hex: number = 0xFF;
let binary: number = 0b1010;

// Strings
let str: string = "Hello";
let template: string = `Value: ${integer}`;

// Booleans
let flag: boolean = true;

// Null and Undefined
let nothing: null = null;
let undef: undefined = undefined;
```

### Arrays and Tuples

```typescript
// Arrays
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Tuples (fixed-length, typed arrays)
let tuple: [string, number] = ["age", 42];
let triple: [string, number, boolean] = ["active", 10, true];

// Readonly arrays
let readonly: ReadonlyArray<number> = [1, 2, 3];
```

### Objects

```typescript
// Object types
let point: { x: number; y: number } = { x: 10, y: 20 };

// Optional properties
let config: { host: string; port?: number } = { host: "localhost" };

// Readonly properties
let immutable: { readonly id: string } = { id: "abc" };
```

## Type Inference

```typescript
// TypeScript infers types automatically
let x = 42;              // inferred as number
let name = "Alice";      // inferred as string
let items = [1, 2, 3];   // inferred as number[]

// Context-based inference
const numbers = [1, 2, 3];
numbers.map(n => n * 2); // n inferred as number

// Return type inference
function add(a: number, b: number) {
  return a + b;          // return type inferred as number
}
```

## Union and Intersection Types

### Union Types

```typescript
// Value can be one of multiple types
let value: string | number;
value = "hello";         // OK
value = 42;              // OK

// Type narrowing
function process(input: string | number) {
  if (typeof input === "string") {
    return input.toUpperCase();  // string methods available
  } else {
    return input.toFixed(2);     // number methods available
  }
}
```

### Intersection Types

```typescript
// Type combining multiple types
interface Named {
  name: string;
}

interface Aged {
  age: number;
}

type Person = Named & Aged;

const person: Person = {
  name: "Alice",
  age: 30
};
```

## Generics

### Generic Functions

```typescript
// Generic identity function
function identity<T>(value: T): T {
  return value;
}

const num = identity(42);        // T inferred as number
const str = identity("hello");   // T inferred as string

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}
```

### Generic Interfaces

```typescript
interface Box<T> {
  value: T;
  get(): T;
  set(value: T): void;
}

const numberBox: Box<number> = {
  value: 42,
  get() { return this.value; },
  set(v) { this.value = v; }
};
```

### Generic Constraints

```typescript
// Constrain type parameter
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(item: T): void {
  console.log(item.length);
}

logLength("hello");      // OK (string has length)
logLength([1, 2, 3]);    // OK (array has length)
// logLength(42);        // Error: number doesn't have length
```

## Advanced Types

### Mapped Types

```typescript
// Transform all properties
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface Point {
  x: number;
  y: number;
}

type ReadonlyPoint = Readonly<Point>;
// { readonly x: number; readonly y: number; }

type PartialPoint = Partial<Point>;
// { x?: number; y?: number; }
```

### Conditional Types

```typescript
// Type depends on condition
type IsString<T> = T extends string ? true : false;

type Test1 = IsString<string>;  // true
type Test2 = IsString<number>;  // false

// Extract function return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getValue(): number {
  return 42;
}

type ValueType = ReturnType<typeof getValue>;  // number
```

### Template Literal Types

```typescript
// String literal types with template syntax
type Color = "red" | "green" | "blue";
type Quantity = "one" | "two";

type ColoredQuantity = `${Quantity} ${Color}`;
// "one red" | "one green" | "one blue" | "two red" | ...
```

## Type Guards

### Built-in Type Guards

```typescript
// typeof
function processValue(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase());
  } else {
    console.log(value.toFixed(2));
  }
}

// instanceof
class Animal {}
class Dog extends Animal {}

function process(animal: Animal) {
  if (animal instanceof Dog) {
    // animal is Dog here
  }
}
```

### Custom Type Guards

```typescript
// User-defined type guard
interface Bird {
  fly(): void;
}

interface Fish {
  swim(): void;
}

function isBird(pet: Bird | Fish): pet is Bird {
  return (pet as Bird).fly !== undefined;
}

function move(pet: Bird | Fish) {
  if (isBird(pet)) {
    pet.fly();      // TypeScript knows pet is Bird
  } else {
    pet.swim();     // TypeScript knows pet is Fish
  }
}
```

## Discriminated Unions

```typescript
// Tagged unions for type-safe pattern matching
interface Success {
  type: 'success';
  value: number;
}

interface Failure {
  type: 'error';
  error: string;
}

type Result = Success | Failure;

function handleResult(result: Result) {
  switch (result.type) {
    case 'success':
      console.log(result.value);   // value available
      break;
    case 'error':
      console.log(result.error);   // error available
      break;
  }
}
```

## Quantum-Specific Types

### Quantum State Types

```typescript
// Complex numbers
interface Complex {
  real: number;
  imag: number;
}

// Quantum state
interface QuantumState {
  dimensions: number;
  amplitudes: Complex[];
  normalized: boolean;
}

// Quantum gate
interface QuantumGate {
  dimensions: number;
  matrix: Complex[][];
  unitary: boolean;
}
```

### Type-Safe Quantum Operations

```typescript
// Ensure dimension compatibility
type CompatibleGate<N extends number> = {
  dimensions: N;
  apply<S extends QuantumState>(state: S & { dimensions: N }): S;
};

// Enforce unitarity
type UnitaryMatrix<N extends number> = {
  matrix: Complex[][];
  isUnitary: true;
  dimensions: N;
};
```

## Utility Types

### Built-in Utilities

```typescript
// Partial - make all properties optional
type PartialPoint = Partial<{ x: number; y: number }>;
// { x?: number; y?: number }

// Required - make all properties required
type RequiredPoint = Required<{ x?: number; y?: number }>;
// { x: number; y: number }

// Pick - select subset of properties
type XOnly = Pick<{ x: number; y: number }, 'x'>;
// { x: number }

// Omit - exclude properties
type NoY = Omit<{ x: number; y: number }, 'y'>;
// { x: number }

// Record - create object type
type PageInfo = Record<'home' | 'about', { title: string }>;
// { home: { title: string }; about: { title: string } }
```

### Custom Utilities

```typescript
// Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// Non-nullable
type NonNullable<T> = T extends null | undefined ? never : T;

// Extract function parameters
type Parameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;
```

## Type Narrowing

### Control Flow Analysis

```typescript
function example(value: string | number | null) {
  if (value === null) {
    return;              // value is null
  }
  
  if (typeof value === "string") {
    console.log(value.toUpperCase());  // value is string
    return;
  }
  
  // value is number here (other options eliminated)
  console.log(value.toFixed(2));
}
```

### Assertion Functions

```typescript
// Assert function narrows type
function assertIsNumber(value: any): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error('Not a number');
  }
}

function process(value: unknown) {
  assertIsNumber(value);
  // value is number here
  console.log(value.toFixed(2));
}
```

## Best Practices

### 1. Prefer Type Inference

```typescript
// Good: Let TypeScript infer
const numbers = [1, 2, 3];

// Unnecessary: Explicit annotation
const numbers: number[] = [1, 2, 3];
```

### 2. Use Strict Mode

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### 3. Avoid `any`

```typescript
// Bad: Loses type safety
function process(data: any) {
  return data.value;
}

// Good: Use generics
function process<T extends { value: number }>(data: T) {
  return data.value;
}
```

### 4. Use Union Types Over Overloads

```typescript
// Good: Single signature with union
function format(value: string | number): string {
  return typeof value === 'string' ? value : value.toString();
}

// Less ideal: Function overloads
function format(value: string): string;
function format(value: number): string;
function format(value: any): string {
  return typeof value === 'string' ? value : value.toString();
}
```

### 5. Nominal Typing with Branded Types

```typescript
// Create nominal types
type UserId = string & { readonly brand: unique symbol };
type ProductId = string & { readonly brand: unique symbol };

function getUserId(id: string): UserId {
  return id as UserId;
}

function getProduct(id: ProductId): Product {
  // ...
}

const userId = getUserId("123");
// getProduct(userId);  // Error: UserId not assignable to ProductId
```

## Type-Level Programming

### Recursive Types

```typescript
// Tree structure
type Tree<T> =
  | { type: 'leaf'; value: T }
  | { type: 'node'; left: Tree<T>; right: Tree<T> };

// JSON type
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
```

### Type-Level Computations

```typescript
// Length of tuple
type Length<T extends any[]> = T['length'];

type ThreeItems = [1, 2, 3];
type Len = Length<ThreeItems>;  // 3

// Head and tail
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer T] ? T : never;

type Items = [1, 2, 3];
type First = Head<Items>;   // 1
type Rest = Tail<Items>;    // [2, 3]
```

## Error Messages

### Helpful Type Errors

```typescript
// Good: Clear error message
type MustBePositive<N extends number> = 
  N extends infer _ ? (N extends 0 ? never : N) : never;

// Usage provides clear error
type Valid = MustBePositive<42>;     // OK
// type Invalid = MustBePositive<0>;  // Error: never
```

## Performance Considerations

1. **Type complexity** - Complex types slow compilation
2. **Inference depth** - Deep inference can be expensive
3. **Union size** - Large unions slow type checking
4. **Recursive types** - Deep recursion hits limits

---

**Next Steps:**
- [Core Syntax](./syntax.md) - Language syntax reference
- [Standard Library](./stdlib.md) - Built-in types and functions
- [API Reference](./api-reference.md) - Complete API documentation
