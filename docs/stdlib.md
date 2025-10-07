# Standard Library - Singularis Prime

## Overview

The Singularis Prime standard library provides a comprehensive set of modules for quantum simulation, AI-assisted development, distributed systems, and general programming tasks.

## Core Modules

### `singularis/quantum`

Quantum state manipulation and simulation.

```typescript
import { QuantumState, Gates, Measurement } from 'singularis/quantum';

// Create quantum state
const qubit = new QuantumState(2);
qubit.initializeSuperposition();

// Apply gates
qubit.applyGate(Gates.H);
qubit.applyGate(Gates.RZ(Math.PI / 4));

// Measure
const result = Measurement.measure(qubit);
```

**Key Classes:**
- `QuantumState` - Quantum state vector
- `Gates` - Standard quantum gates
- `Measurement` - Measurement operations
- `QuantumCircuit` - Circuit builder

### `singularis/ai`

AI-assisted development tools.

```typescript
import { CodeOptimizer, StaticAnalyzer } from 'singularis/ai';

// Optimize code
const optimizer = new CodeOptimizer();
const suggestions = await optimizer.analyze('./src/algorithm.ts');

// Static analysis
const analyzer = new StaticAnalyzer();
const issues = await analyzer.scan('./src/');
```

**Key Classes:**
- `CodeOptimizer` - Performance optimization
- `StaticAnalyzer` - Bug detection
- `CodeGenerator` - Code generation
- `TestGenerator` - Test generation

### `singularis/distributed`

Distributed systems primitives.

```typescript
import { ConsensusProtocol, DistributedLock } from 'singularis/distributed';

// Raft consensus
const raft = new ConsensusProtocol('raft');
await raft.propose({ key: 'value' });

// Distributed lock
const lock = new DistributedLock('resource-1');
await lock.acquire();
try {
  // Critical section
} finally {
  await lock.release();
}
```

**Key Classes:**
- `ConsensusProtocol` - Raft, Paxos implementations
- `DistributedLock` - Distributed locking
- `EventualConsistency` - Eventual consistency primitives
- `NetworkPartition` - Partition tolerance

## Collections

### Arrays

```typescript
import { Arrays } from 'singularis/collections';

const numbers = [1, 2, 3, 4, 5];

// Functional operations
const doubled = Arrays.map(numbers, n => n * 2);
const evens = Arrays.filter(numbers, n => n % 2 === 0);
const sum = Arrays.reduce(numbers, (a, b) => a + b, 0);

// Utilities
const chunks = Arrays.chunk(numbers, 2);        // [[1,2], [3,4], [5]]
const unique = Arrays.unique([1, 2, 2, 3]);     // [1, 2, 3]
const sorted = Arrays.sort([3, 1, 2]);          // [1, 2, 3]
```

### Maps and Sets

```typescript
import { Maps, Sets } from 'singularis/collections';

// Map operations
const map = new Map([['a', 1], ['b', 2]]);
const values = Maps.values(map);                 // [1, 2]
const inverted = Maps.invert(map);              // Map(1 => 'a', 2 => 'b')

// Set operations
const set1 = new Set([1, 2, 3]);
const set2 = new Set([2, 3, 4]);
const union = Sets.union(set1, set2);           // Set(1, 2, 3, 4)
const intersection = Sets.intersection(set1, set2); // Set(2, 3)
```

## Math and Numerics

### Complex Numbers

```typescript
import { Complex } from 'singularis/math';

const c1 = new Complex(3, 4);    // 3 + 4i
const c2 = new Complex(1, 2);    // 1 + 2i

// Operations
const sum = c1.add(c2);          // 4 + 6i
const product = c1.mul(c2);      // -5 + 10i
const magnitude = c1.abs();      // 5
const phase = c1.arg();          // 0.927 radians
```

### Linear Algebra

```typescript
import { Matrix, Vector } from 'singularis/math';

// Matrix operations
const m1 = Matrix.fromArray([[1, 2], [3, 4]]);
const m2 = Matrix.fromArray([[5, 6], [7, 8]]);

const product = m1.mul(m2);
const inverse = m1.inverse();
const determinant = m1.det();
const eigenvalues = m1.eigenvalues();

// Vector operations
const v1 = new Vector([1, 2, 3]);
const v2 = new Vector([4, 5, 6]);

const dot = v1.dot(v2);          // 32
const cross = v1.cross(v2);      // Vector
const norm = v1.norm();          // 3.74...
```

### Statistics

```typescript
import { Stats } from 'singularis/math';

const data = [1, 2, 3, 4, 5];

const mean = Stats.mean(data);           // 3
const median = Stats.median(data);       // 3
const stddev = Stats.stddev(data);       // 1.41...
const variance = Stats.variance(data);   // 2
```

## Async and Concurrency

### Promises

```typescript
import { Async } from 'singularis/async';

// Parallel execution
const results = await Async.parallel([
  async () => fetchUser(),
  async () => fetchPosts(),
  async () => fetchComments()
]);

// Sequential execution
const result = await Async.sequence([
  async () => step1(),
  async () => step2(),
  async () => step3()
]);

// Timeout
const value = await Async.timeout(fetchData(), 5000);

// Retry with exponential backoff
const data = await Async.retry(
  () => unreliableAPI(),
  { maxAttempts: 3, backoff: 'exponential' }
);
```

### Rate Limiting

```typescript
import { RateLimiter } from 'singularis/async';

// Limit to 10 requests per second
const limiter = new RateLimiter({ rate: 10, per: 'second' });

for (const item of items) {
  await limiter.acquire();
  await process(item);
}
```

## Cryptography

### Hashing

```typescript
import { Hash } from 'singularis/crypto';

// SHA-256
const hash = await Hash.sha256('message');

// SHA-3
const hash3 = await Hash.sha3_256('message');

// BLAKE2
const blake = await Hash.blake2b('message');
```

### Post-Quantum Cryptography

```typescript
import { PQC } from 'singularis/crypto';

// Lattice-based key exchange
const keyPair = await PQC.generateKeyPair('kyber');
const sharedSecret = await PQC.keyExchange(
  keyPair.privateKey,
  otherPartyPublicKey
);

// Digital signatures
const signKeyPair = await PQC.generateSigningKeyPair('dilithium');
const signature = await PQC.sign(message, signKeyPair.privateKey);
const valid = await PQC.verify(message, signature, signKeyPair.publicKey);
```

## File System

### Reading and Writing

```typescript
import { FS } from 'singularis/fs';

// Read file
const content = await FS.readFile('./data.txt', 'utf-8');

// Write file
await FS.writeFile('./output.txt', 'content');

// Append
await FS.appendFile('./log.txt', 'new entry\n');

// Check existence
const exists = await FS.exists('./file.txt');

// Directory operations
await FS.mkdir('./new-dir');
const files = await FS.readdir('./dir');
```

### Path Utilities

```typescript
import { Path } from 'singularis/fs';

const fullPath = Path.join('/home', 'user', 'file.txt');
const dirname = Path.dirname(fullPath);        // '/home/user'
const basename = Path.basename(fullPath);      // 'file.txt'
const ext = Path.extname(fullPath);           // '.txt'
const absolute = Path.resolve('./relative');
```

## Networking

### HTTP Client

```typescript
import { HTTP } from 'singularis/net';

// GET request
const response = await HTTP.get('https://api.example.com/data');
const json = await response.json();

// POST request
const result = await HTTP.post('https://api.example.com/create', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
});

// With retry and timeout
const data = await HTTP.get(url, {
  timeout: 5000,
  retry: { maxAttempts: 3 }
});
```

### WebSocket

```typescript
import { WebSocket } from 'singularis/net';

// Connect
const ws = new WebSocket('wss://server.example.com');

// Events
ws.on('open', () => console.log('Connected'));
ws.on('message', (data) => console.log('Received:', data));
ws.on('close', () => console.log('Disconnected'));

// Send
ws.send(JSON.stringify({ type: 'ping' }));

// Close
ws.close();
```

## Testing

### Assertions

```typescript
import { assert, expect } from 'singularis/test';

// Assertions
assert.equal(actual, expected);
assert.deepEqual(obj1, obj2);
assert.throws(() => throwingFunction());

// Expect API
expect(value).toBe(42);
expect(array).toHaveLength(3);
expect(fn).toThrow();
```

### Mocking

```typescript
import { mock, spy } from 'singularis/test';

// Mock function
const mockFn = mock.fn();
mockFn.mockReturnValue(42);
mockFn();
expect(mockFn).toHaveBeenCalled();

// Spy on object method
const obj = { method() { return 'real'; } };
const spyFn = spy.on(obj, 'method');
obj.method();
expect(spyFn).toHaveBeenCalled();
```

## Logging

### Logger

```typescript
import { Logger } from 'singularis/log';

// Create logger
const log = new Logger('MyApp');

// Log levels
log.debug('Debug message');
log.info('Info message');
log.warn('Warning message');
log.error('Error message');

// Structured logging
log.info('User logged in', { userId: '123', ip: '192.168.1.1' });

// Child loggers
const childLog = log.child({ module: 'Auth' });
childLog.info('Authentication successful');
```

## Configuration

### Environment Variables

```typescript
import { Env } from 'singularis/config';

// Get with default
const port = Env.get('PORT', '3000');

// Required variable (throws if missing)
const apiKey = Env.require('API_KEY');

// Parse as number
const timeout = Env.getNumber('TIMEOUT', 5000);

// Parse as boolean
const debug = Env.getBoolean('DEBUG', false);
```

### Config Files

```typescript
import { Config } from 'singularis/config';

// Load config
const config = await Config.load('./config.json');

// Get nested values
const dbHost = config.get('database.host', 'localhost');
const dbPort = config.get('database.port', 5432);

// Environment-specific config
const config = await Config.load({
  default: './config.json',
  development: './config.dev.json',
  production: './config.prod.json'
});
```

## Validation

### Schema Validation

```typescript
import { Schema } from 'singularis/validation';

// Define schema
const userSchema = Schema.object({
  name: Schema.string().min(1).max(100),
  email: Schema.string().email(),
  age: Schema.number().min(0).max(120).optional()
});

// Validate
const result = userSchema.validate(data);
if (result.valid) {
  // Use result.value (typed)
} else {
  console.error(result.errors);
}
```

## Date and Time

### Date Utilities

```typescript
import { DateTime } from 'singularis/time';

// Current time
const now = DateTime.now();

// Parse
const date = DateTime.parse('2025-10-07');

// Format
const formatted = date.format('YYYY-MM-DD HH:mm:ss');

// Arithmetic
const tomorrow = now.addDays(1);
const lastWeek = now.subtractWeeks(1);

// Comparison
const isBefore = date1.isBefore(date2);
const isAfter = date1.isAfter(date2);
```

### Duration

```typescript
import { Duration } from 'singularis/time';

const duration = Duration.minutes(30);
const inSeconds = duration.asSeconds();    // 1800
const inHours = duration.asHours();        // 0.5

// Arithmetic
const total = duration1.add(duration2);
```

## String Utilities

```typescript
import { Str } from 'singularis/string';

// Case conversion
Str.camelCase('hello-world');      // 'helloWorld'
Str.snakeCase('helloWorld');       // 'hello_world'
Str.kebabCase('helloWorld');       // 'hello-world'
Str.pascalCase('hello-world');     // 'HelloWorld'

// Manipulation
Str.truncate('long text', 10);     // 'long te...'
Str.pad('42', 5, '0');             // '00042'
Str.repeat('*', 3);                // '***'

// Analysis
Str.contains('hello', 'ell');      // true
Str.startsWith('hello', 'hel');    // true
Str.endsWith('hello', 'lo');       // true
```

## Random

```typescript
import { Random } from 'singularis/random';

// Random numbers
const int = Random.int(1, 100);              // Random integer [1, 100]
const float = Random.float(0, 1);            // Random float [0, 1)

// Random selection
const item = Random.choice([1, 2, 3, 4, 5]);
const items = Random.sample([1, 2, 3, 4, 5], 2);

// Shuffle
const shuffled = Random.shuffle([1, 2, 3, 4, 5]);

// Random string
const id = Random.string(16, 'alphanumeric');
const hex = Random.hex(32);
```

## Performance

### Profiling

```typescript
import { Profiler } from 'singularis/perf';

// Time execution
const duration = await Profiler.time(async () => {
  await expensiveOperation();
});
console.log(`Took ${duration}ms`);

// Memory usage
const memBefore = Profiler.memoryUsage();
// ... operation ...
const memAfter = Profiler.memoryUsage();
console.log(`Used ${memAfter - memBefore} bytes`);
```

### Benchmarking

```typescript
import { Benchmark } from 'singularis/perf';

// Compare implementations
const results = await Benchmark.compare({
  'Method A': () => methodA(),
  'Method B': () => methodB()
}, { iterations: 10000 });

console.log(results);
// {
//   'Method A': { avgTime: 0.5, opsPerSec: 2000000 },
//   'Method B': { avgTime: 0.3, opsPerSec: 3333333 }
// }
```

---

**Complete API Reference:**
- [API Reference](./api-reference.md) - Detailed API documentation
- [Type System](./type-system.md) - Advanced type features
- [Performance Guide](./performance.md) - Optimization techniques
