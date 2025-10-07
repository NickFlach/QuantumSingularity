# Troubleshooting Guide - Singularis Prime

## Installation Issues

### "Cannot find module 'singularis-prime'"

**Cause:** Package not installed or not in PATH

**Solution:**
```bash
# Install globally
npm install -g singularis-prime

# Or install locally
npm install singularis-prime

# Verify installation
npx singularis --version
```

### "Node version too old"

**Cause:** Node.js < 18

**Solution:**
```bash
# Check version
node --version

# Update Node.js (via nvm)
nvm install 18
nvm use 18

# Or download from https://nodejs.org
```

### Permission errors during installation

**Cause:** Insufficient permissions

**Solution:**
```bash
# macOS/Linux: Use sudo
sudo npm install -g singularis-prime

# Windows: Run as Administrator
# Or use npm config to change global folder
npm config set prefix ~/npm-global
export PATH=~/npm-global/bin:$PATH
```

## Compilation Errors

### "Type 'X' is not assignable to type 'Y'"

**Cause:** Type mismatch

**Solution:**
```typescript
// Check your types
const qubit: QuantumState = new QuantumState(2);  // Correct type

// Use type assertions if needed (carefully!)
const data = JSON.parse(str) as MyType;

// Or use type guards
if (isQuantumState(data)) {
  // TypeScript knows data is QuantumState here
}
```

### "Cannot find name 'QuantumState'"

**Cause:** Missing import

**Solution:**
```typescript
// Add the import
import { QuantumState } from 'singularis/quantum';

// Or check for typos
import { QuantumState } from 'singularis/quntum';  // Wrong!
import { QuantumState } from 'singularis/quantum';  // Correct
```

### "Circular dependency detected"

**Cause:** Files importing each other

**Solution:**
```typescript
// Avoid circular imports
// file-a.ts
import { B } from './file-b';  // ❌

// file-b.ts
import { A } from './file-a';  // ❌ Circular!

// Fix: Extract shared code to a third file
// shared.ts
export interface Shared { }

// file-a.ts
import { Shared } from './shared';

// file-b.ts
import { Shared } from './shared';
```

### "Out of memory" during compilation

**Cause:** Large codebase, insufficient memory

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=8192" npm run build

# Or split into smaller modules
# Compile incrementally
singularis build --incremental
```

## Runtime Errors

### "RangeError: Maximum call stack size exceeded"

**Cause:** Infinite recursion

**Solution:**
```typescript
// Check for infinite recursion
function factorial(n: number): number {
  return n * factorial(n - 1);  // ❌ No base case!
}

// Add base case
function factorial(n: number): number {
  if (n <= 1) return 1;           // ✅ Base case
  return n * factorial(n - 1);
}
```

### "TypeError: Cannot read property 'X' of undefined"

**Cause:** Accessing property on undefined/null

**Solution:**
```typescript
// Add null checks
const value = obj.prop.value;  // ❌ If obj or prop is undefined

// Use optional chaining
const value = obj?.prop?.value;  // ✅ Safe

// Or check explicitly
if (obj && obj.prop) {
  const value = obj.prop.value;
}
```

### "UnhandledPromiseRejectionWarning"

**Cause:** Async error not caught

**Solution:**
```typescript
// Add error handling
async function process() {
  const data = await fetchData();  // ❌ No error handling
}

// Wrap in try-catch
async function process() {
  try {
    const data = await fetchData();
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}

// Or use .catch()
fetchData()
  .then(data => process(data))
  .catch(error => console.error(error));
```

## Quantum Simulation Issues

### "Out of memory" during quantum simulation

**Cause:** Too many qubits (exponential memory growth)

**Solution:**
```typescript
// Reduce qubit count
const state = new QuantumState(20);  // Instead of 30

// Or use approximation
const simulator = new QuantumSimulator({
  method: 'mps',
  bondDimension: 100
});

// Or use sparse operations
const simulator = new QuantumSimulator({ sparse: true });
```

### Quantum simulation is very slow

**Cause:** Large state vector, inefficient operations

**Solution:**
```typescript
// Enable GPU acceleration
const simulator = new QuantumSimulator({ backend: 'cuda' });

// Use sparse operations
const simulator = new QuantumSimulator({ sparse: true });

// Batch operations
circuit.batchGates([
  { gate: Gates.H, qubit: 0 },
  { gate: Gates.CNOT, qubits: [0, 1] }
]);  // Faster than individual gates

// Reduce qubit count if possible
```

### Incorrect quantum simulation results

**Cause:** Denormalized state, numerical precision errors

**Solution:**
```typescript
// Normalize state
state.normalize();

// Check for numerical errors
if (Math.abs(state.norm() - 1.0) > 1e-10) {
  console.warn('State not normalized!');
}

// Use higher precision
const simulator = new QuantumSimulator({ precision: 'double' });
```

### "Gate dimensions don't match state dimensions"

**Cause:** Applying wrong-size gate to state

**Solution:**
```typescript
// Check dimensions
const qubit = new QuantumState(2);  // 2 dimensions (1 qubit)
qubit.applyGate(Gates.H);           // ✅ 2x2 gate

const qudit = new QuantumState(3);  // 3 dimensions (1 qutrit)
// qudit.applyGate(Gates.H);        // ❌ 2x2 gate doesn't fit

// Use correct gate
const gate3 = Gates.fromMatrix([...]);  // 3x3 gate
qudit.applyGate(gate3);                 // ✅
```

## AI Integration Issues

### "AI model not found"

**Cause:** Model not installed

**Solution:**
```bash
# Check installed models
singularis ai list

# Install missing model
singularis ai install gpt-4

# Or use different model
singularis ai install claude-3
```

### "API key invalid or missing"

**Cause:** Missing or incorrect API key

**Solution:**
```bash
# Set API key in environment
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Or in .env file
echo "OPENAI_API_KEY=sk-..." >> .env

# Verify
echo $OPENAI_API_KEY
```

### AI suggestions are not helpful

**Cause:** Model not trained on your codebase

**Solution:**
```typescript
// Train on your codebase
const optimizer = new MLOptimizer();
await optimizer.train({
  codebase: './src/',
  epochs: 100
});

// Or provide more context
const suggestions = await optimizer.suggest(code, {
  context: 'performance-critical loop',
  style: 'functional'
});
```

### AI analysis is too slow

**Cause:** Using cloud models with high latency

**Solution:**
```typescript
// Use local model
const analyzer = new CodeOptimizer({ model: 'local' });

// Enable caching
const analyzer = new CodeOptimizer({
  cache: true,
  cacheDir: '.cache/analysis'
});

// Incremental analysis
const analyzer = new CodeOptimizer({ incremental: true });
```

## Distributed Systems Issues

### "Connection timeout"

**Cause:** Network issues or slow nodes

**Solution:**
```typescript
// Increase timeout
const client = new DistributedClient({
  timeout: 10000  // 10 seconds instead of default 5
});

// Enable retries
const client = new DistributedClient({
  retry: {
    maxAttempts: 3,
    backoff: 'exponential'
  }
});
```

### "Consensus not reached"

**Cause:** Too many node failures or network partitions

**Solution:**
```typescript
// Check quorum requirements
const raft = new RaftConsensus({
  minimumNodes: 3,  // Need at least 3 nodes
  quorum: 2         // Need 2 to agree
});

// Increase timeout for slow networks
const raft = new RaftConsensus({
  electionTimeout: 300,  // Longer timeout
  heartbeatInterval: 100
});
```

### "Split brain" scenario

**Cause:** Network partition causing multiple leaders

**Solution:**
```typescript
// Use Byzantine fault tolerance
const consensus = new ConsensusProtocol('bft');

// Or implement fencing
const leader = new LeaderElection({
  fencing: true,
  fenceToken: generateToken()
});
```

## Performance Issues

### Application startup is slow

**Cause:** Loading large modules, no caching

**Solution:**
```typescript
// Lazy load heavy modules
const QuantumSim = await import('singularis/quantum');

// Enable module caching
// package.json
{
  "singularis": {
    "cache": {
      "enabled": true,
      "dir": ".cache"
    }
  }
}

// Precompile in production
npm run build  // Compiles ahead of time
```

### High memory usage

**Cause:** Memory leaks, large data structures

**Solution:**
```typescript
// Profile memory
const memBefore = process.memoryUsage().heapUsed;
// ... your code ...
const memAfter = process.memoryUsage().heapUsed;
console.log(`Used ${(memAfter - memBefore) / 1024 / 1024} MB`);

// Fix common leaks
// 1. Clear event listeners
emitter.removeListener('event', handler);

// 2. Clear timers
clearInterval(intervalId);
clearTimeout(timeoutId);

// 3. Nullify large objects
largeObject = null;

// 4. Use WeakMap for caches
const cache = new WeakMap();  // Allows GC
```

### CPU usage is high

**Cause:** Inefficient algorithms, infinite loops

**Solution:**
```typescript
// Profile CPU
const start = process.cpuUsage();
// ... your code ...
const usage = process.cpuUsage(start);
console.log(`CPU: ${usage.user / 1000}ms user, ${usage.system / 1000}ms system`);

// Optimize hot paths
// Use profiler to find bottlenecks
singularis profile ./src/app.ts

// Check for infinite loops
// Add loop guards
let iterations = 0;
while (condition) {
  if (iterations++ > 10000) {
    throw new Error('Too many iterations');
  }
  // ... loop body ...
}
```

## Testing Issues

### Tests timeout

**Cause:** Slow async operations

**Solution:**
```typescript
// Increase timeout
test('slow operation', async () => {
  await slowOperation();
}, 30000);  // 30 second timeout

// Or use async/await properly
test('multiple operations', async () => {
  // ❌ Not waiting
  fetchData();
  
  // ✅ Wait for completion
  await fetchData();
});
```

### Tests pass locally but fail in CI

**Cause:** Environment differences, race conditions

**Solution:**
```typescript
// Make tests deterministic
// 1. Mock random values
jest.spyOn(Math, 'random').mockReturnValue(0.5);

// 2. Mock time
jest.useFakeTimers();
jest.setSystemTime(new Date('2025-01-01'));

// 3. Avoid flaky timing
// ❌ Flaky
test('async operation', async () => {
  triggerAsync();
  await sleep(100);  // Race condition!
  expect(result).toBe(42);
});

// ✅ Wait for actual completion
test('async operation', async () => {
  const promise = triggerAsync();
  await promise;
  expect(result).toBe(42);
});
```

## Debugging Tips

### Enable debug logging

```bash
# Set debug environment variable
DEBUG=singularis:* npm start

# Or in code
import { Logger } from 'singularis/log';

const log = new Logger('MyApp', { level: 'debug' });
log.debug('Detailed debug info');
```

### Use the debugger

```typescript
// Add breakpoint
debugger;

// Or use VSCode launch configuration
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug",
  "program": "${workspaceFolder}/src/index.ts",
  "preLaunchTask": "npm: build",
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

### Inspect state

```typescript
// Log quantum state
console.log('State vector:', qubit.getStateVector());
console.log('Probabilities:', qubit.getProbabilities());

// Visualize
const circuit = new QuantumCircuit(3);
console.log(circuit.draw());
```

## Getting Help

### Before asking for help

1. **Check this troubleshooting guide**
2. **Search [GitHub Issues](https://github.com/yourusername/quantum-singularity/issues)**
3. **Read the relevant documentation**
4. **Try to create a minimal reproduction**

### How to report issues

Include:
1. **Version**: `singularis --version`
2. **Environment**: OS, Node version
3. **Minimal reproduction**: Smallest code that shows the problem
4. **Expected behavior**: What you expected to happen
5. **Actual behavior**: What actually happened
6. **Error messages**: Full error text and stack trace

```bash
# Get environment info
singularis info

# Create bug report template
singularis bug-report > bug.md
```

### Where to get help

- **GitHub Issues**: Bug reports and feature requests
- **Discord**: https://discord.gg/singularis-prime
- **Stack Overflow**: Tag `singularis-prime`
- **Email**: support@singularis-prime.dev

---

**Related Documentation:**
- [FAQ](./FAQ.md) - Common questions
- [Performance Guide](./performance.md) - Optimization tips
- [API Reference](./api-reference.md) - Complete API docs
