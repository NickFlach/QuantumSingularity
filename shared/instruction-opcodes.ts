/**
 * Shared Instruction Opcodes for SINGULARIS PRIME
 * 
 * This file provides a single source of truth for all instruction opcodes
 * used throughout the compiler and interpreter pipeline to prevent opcode
 * mismatches that break the Paradox Resolution Engine.
 */

// Core instruction types used by both compiler and interpreter
export type InstructionOpcode = 
  | 'QKD_INIT'
  | 'CONTRACT_START'
  | 'MODEL_DEPLOY'
  | 'LEDGER_SYNC'
  | 'AI_NEGOTIATE'
  | 'AI_VERIFY'
  | 'QUANTUM_DECISION'
  | 'ENFORCE'
  // Distributed Quantum Operations
  | 'WITH_NODE'
  | 'WITH_CHANNEL' 
  | 'ENTANGLE_REMOTE'
  | 'TELEPORT'
  | 'SWAP'
  | 'BARRIER'
  | 'SCHEDULE_WINDOW'
  // Paradox Resolution Engine Instructions (CANONICAL NAMES)
  | 'PARADOX_CHECK'
  | 'RESOLVE_PARADOX'
  | 'OPTIMIZE_LOOP'
  | 'RECURSIVE'
  | 'CONVERGENCE'
  | 'TEMPORAL_LOOP_CHECK'
  | 'CAUSAL_CONSISTENCY_CHECK'
  | 'QUANTUM_PARADOX_HANDLE'
  | 'SELF_OPTIMIZE'
  | 'RECURSIVE_EVAL'
  | 'MEMOIZE'
  | 'TAIL_CALL_OPTIMIZE'
  | 'STACK_OVERFLOW_CHECK'
  | 'ROLLBACK_POINT'
  | 'ENABLE_MONITORING'
  | 'DISABLE_MONITORING';

// Mapping of parser tokens to instruction opcodes
export const PARSER_TOKEN_TO_OPCODE: Record<string, InstructionOpcode> = {
  // Core operations
  'quantumKey': 'QKD_INIT',
  'contract': 'CONTRACT_START',
  'deployModel': 'MODEL_DEPLOY',
  'syncLedger': 'LEDGER_SYNC',
  'resolveParadox': 'RESOLVE_PARADOX',
  'negotiateAI': 'AI_NEGOTIATE',
  'verifyAI': 'AI_VERIFY',
  'quantumDecision': 'QUANTUM_DECISION',
  'enforce': 'ENFORCE',
  
  // Distributed operations
  'withNode': 'WITH_NODE',
  'withChannel': 'WITH_CHANNEL',
  'entangleRemote': 'ENTANGLE_REMOTE',
  'teleport': 'TELEPORT',
  'entanglementSwap': 'SWAP',
  'barrier': 'BARRIER',
  'scheduleWindow': 'SCHEDULE_WINDOW',
  
  // Paradox Resolution Engine (canonical opcodes)
  'paradoxCheck': 'PARADOX_CHECK',
  'optimizeLoop': 'OPTIMIZE_LOOP',
  'recursive': 'RECURSIVE',
  'convergence': 'CONVERGENCE',
  'temporalLoopCheck': 'TEMPORAL_LOOP_CHECK',
  'causalConsistencyCheck': 'CAUSAL_CONSISTENCY_CHECK',
  'quantumParadoxHandle': 'QUANTUM_PARADOX_HANDLE',
  'selfOptimize': 'SELF_OPTIMIZE',
  'recursiveEval': 'RECURSIVE_EVAL',
  'memoize': 'MEMOIZE',
  'tailCallOptimize': 'TAIL_CALL_OPTIMIZE',
  'stackOverflowCheck': 'STACK_OVERFLOW_CHECK',
  'rollbackPoint': 'ROLLBACK_POINT',
  'enableMonitoring': 'ENABLE_MONITORING',
  'disableMonitoring': 'DISABLE_MONITORING'
};

// Mapping of opcodes to execution method names
export const OPCODE_TO_EXECUTION_METHOD: Record<InstructionOpcode, string> = {
  'QKD_INIT': 'executeQuantumKeyInit',
  'CONTRACT_START': 'executeContractStart',
  'MODEL_DEPLOY': 'executeModelDeploy',
  'LEDGER_SYNC': 'executeLedgerSync',
  'AI_NEGOTIATE': 'executeAINegotiate',
  'AI_VERIFY': 'executeAIVerify',
  'QUANTUM_DECISION': 'executeQuantumDecision',
  'ENFORCE': 'executeEnforce',
  
  // Distributed operations
  'WITH_NODE': 'executeSetTargetNode',
  'WITH_CHANNEL': 'executeSetChannel',
  'ENTANGLE_REMOTE': 'executeEntangleRemote',
  'TELEPORT': 'executeTeleportState',
  'SWAP': 'executeEntanglementSwap',
  'BARRIER': 'executeBarrierSync',
  'SCHEDULE_WINDOW': 'executeScheduleWindow',
  
  // Paradox Resolution Engine (canonical method names)
  'PARADOX_CHECK': 'executeParadoxCheck',
  'RESOLVE_PARADOX': 'executeResolveParadox',
  'OPTIMIZE_LOOP': 'executeOptimizeLoop',
  'RECURSIVE': 'executeRecursive',
  'CONVERGENCE': 'executeConvergence',
  'TEMPORAL_LOOP_CHECK': 'executeTemporalLoopCheck',
  'CAUSAL_CONSISTENCY_CHECK': 'executeCausalConsistencyCheck',
  'QUANTUM_PARADOX_HANDLE': 'executeQuantumParadoxHandle',
  'SELF_OPTIMIZE': 'executeSelfOptimize',
  'RECURSIVE_EVAL': 'executeRecursiveEval',
  'MEMOIZE': 'executeMemoize',
  'TAIL_CALL_OPTIMIZE': 'executeTailCallOptimize',
  'STACK_OVERFLOW_CHECK': 'executeStackOverflowCheck',
  'ROLLBACK_POINT': 'executeRollbackPoint',
  'ENABLE_MONITORING': 'executeEnableMonitoring',
  'DISABLE_MONITORING': 'executeDisableMonitoring'
};

// Validation helpers
export function isValidOpcode(opcode: string): opcode is InstructionOpcode {
  return Object.values(PARSER_TOKEN_TO_OPCODE).includes(opcode as InstructionOpcode);
}

export function getOpcodeFromToken(token: string): InstructionOpcode | null {
  return PARSER_TOKEN_TO_OPCODE[token] || null;
}

export function getExecutionMethodName(opcode: InstructionOpcode): string {
  return OPCODE_TO_EXECUTION_METHOD[opcode];
}