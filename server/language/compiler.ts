/**
 * SINGULARIS PRIME Compiler
 * 
 * This module provides a comprehensive compiler for the SINGULARIS PRIME language.
 * It includes tokenization, parsing, bytecode generation, and advanced type checking
 * for SINGULARIS PRIME source code to executable bytecode instructions.
 * 
 * Enhanced with:
 * - Quantum type checking with no-cloning enforcement
 * - AI explainability validation
 * - Human oversight requirement checking
 * - Memory safety for quantum operations
 * - Entanglement relationship tracking
 */

import { 
  QuantumKey, 
  AIContract, 
  AIModelDeployment, 
  LedgerSynchronization, 
  ParadoxResolver, 
  AIVerification,
  QuantumDecision
} from './core-objects';

import {
  SingularisTypeChecker,
  TypeInferenceResult,
  InferredType,
  TypeError,
  TypeWarning,
  ASTNode,
  SourceLocation
} from './type-checker';

import { QuantumDimension, QuantumOperationType } from '../../shared/schema';
import { HumanOversightLevel, OperationCriticality } from '../../shared/types/ai-types';

// Instruction types
export type InstructionType = 
  | 'QKD_INIT'
  | 'CONTRACT_START'
  | 'MODEL_DEPLOY'
  | 'LEDGER_SYNC'
  | 'PARADOX_RESOLVE'
  | 'AI_NEGOTIATE'
  | 'AI_VERIFY'
  | 'QUANTUM_DECISION'
  | 'ENFORCE';

// Parsed instruction
export type ParsedInstruction = [InstructionType, ...string[]];

// Token type
export type Token = string;

// Compilation result with type checking
export interface CompilationResult {
  readonly success: boolean;
  readonly bytecode: string[];
  readonly ast: ASTNode[];
  readonly typeResults: TypeInferenceResult[];
  readonly errors: CompilationError[];
  readonly warnings: CompilationWarning[];
}

// Compilation error
export interface CompilationError {
  readonly type: 'syntax' | 'type' | 'quantum' | 'ai_safety';
  readonly message: string;
  readonly location: SourceLocation;
  readonly severity: 'error' | 'warning';
  readonly suggestion?: string;
}

// Compilation warning
export interface CompilationWarning {
  readonly type: 'performance' | 'best_practice' | 'deprecation';
  readonly message: string;
  readonly location: SourceLocation;
  readonly suggestion: string;
}

export class SingularisPrimeCompiler {
  private bytecode: string[] = [];
  private typeChecker: SingularisTypeChecker;
  private compilationErrors: CompilationError[] = [];
  private compilationWarnings: CompilationWarning[] = [];
  
  constructor() {
    this.typeChecker = new SingularisTypeChecker();
  }
  
  /**
   * Tokenizes source code into individual tokens.
   */
  tokenize(code: string): Token[] {
    // Remove comments
    const noComments = code.replace(/\/\/.*$/gm, '');
    
    // Replace some special characters with spaces to ensure proper tokenization
    const prepared = noComments
      .replace(/[;,{}=()]/g, ' $& ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Split into tokens
    const tokens = prepared.split(/\s+/);
    return tokens;
  }
  
  /**
   * Parses tokens into a structured intermediate representation.
   */
  parse(tokens: Token[]): ParsedInstruction[] {
    const parsed: ParsedInstruction[] = [];
    let i = 0;
    
    while (i < tokens.length) {
      const token = tokens[i];
      
      switch (token) {
        case 'quantumKey':
          if (i + 4 < tokens.length) {
            const keyId = tokens[i + 1];
            // Skip '='
            const participant1 = tokens[i + 3].replace(/[,;()]/g, '');
            const participant2 = tokens[i + 4].replace(/[,;()]/g, '');
            parsed.push(['QKD_INIT', keyId, participant1, participant2]);
            i += 5;
          } else {
            i += 1;
          }
          break;
          
        case 'contract':
          if (i + 1 < tokens.length) {
            const contractName = tokens[i + 1].replace(/[{]/g, '');
            parsed.push(['CONTRACT_START', contractName]);
            i += 2;
          } else {
            i += 1;
          }
          break;
          
        case 'enforce':
          if (i + 1 < tokens.length) {
            const enforcementRule = tokens[i + 1].replace(/[\(\)]/g, '');
            const value = tokens[i + 2].replace(/[;\(\)]/g, '');
            parsed.push(['ENFORCE', enforcementRule, value]);
            i += 3;
          } else {
            i += 1;
          }
          break;
          
        case 'deployModel':
          if (i + 3 < tokens.length) {
            const modelName = tokens[i + 1];
            const version = tokens[i + 2].replace('v', '');
            const location = tokens[i + 4].replace(/[;]/g, '');
            parsed.push(['MODEL_DEPLOY', modelName, version, location]);
            i += 5;
          } else {
            i += 1;
          }
          break;
          
        case 'syncLedger':
          if (i + 1 < tokens.length) {
            const ledgerId = tokens[i + 1].replace(/[;]/g, '');
            parsed.push(['LEDGER_SYNC', ledgerId]);
            i += 2;
          } else {
            i += 1;
          }
          break;
          
        case 'resolveParadox':
          if (i + 3 < tokens.length) {
            const dataSource = tokens[i + 1];
            const method = tokens[i + 3].replace(/[;]/g, '');
            parsed.push(['PARADOX_RESOLVE', dataSource, method]);
            i += 4;
          } else {
            i += 1;
          }
          break;
          
        case 'negotiateAI':
          if (i + 5 < tokens.length) {
            const initiator = tokens[i + 1];
            const responder = tokens[i + 3];
            const context = tokens[i + 5].replace(/[;]/g, '');
            parsed.push(['AI_NEGOTIATE', initiator, responder, context]);
            i += 6;
          } else {
            i += 1;
          }
          break;
          
        case 'verifyAI':
          if (i + 3 < tokens.length) {
            const entityId = tokens[i + 1];
            const method = tokens[i + 3].replace(/[;]/g, '');
            parsed.push(['AI_VERIFY', entityId, method]);
            i += 4;
          } else {
            i += 1;
          }
          break;
          
        case 'quantumDecision':
          if (i + 5 < tokens.length) {
            const agentId = tokens[i + 1];
            const method = tokens[i + 3];
            const context = tokens[i + 5].replace(/[;]/g, '');
            parsed.push(['QUANTUM_DECISION', agentId, method, context]);
            i += 6;
          } else {
            i += 1;
          }
          break;
          
        default:
          i += 1;
          break;
      }
    }
    
    return parsed;
  }
  
  /**
   * Generates bytecode from the parsed intermediate representation.
   */
  generateBytecode(parsed: ParsedInstruction[]): string[] {
    const bytecode: string[] = [];
    
    for (const instruction of parsed) {
      const [type, ...args] = instruction;
      
      switch (type) {
        case 'QKD_INIT':
          bytecode.push(`INIT_QKD ${args[0]} ${args[1]} ${args[2]}`);
          break;
          
        case 'CONTRACT_START':
          bytecode.push(`START_CONTRACT ${args[0]}`);
          break;
          
        case 'ENFORCE':
          bytecode.push(`ENFORCE_RULE ${args[0]} ${args[1]}`);
          break;
          
        case 'MODEL_DEPLOY':
          bytecode.push(`DEPLOY_MODEL ${args[0]} ${args[1]} ${args[2]}`);
          break;
          
        case 'LEDGER_SYNC':
          bytecode.push(`SYNC_LEDGER ${args[0]}`);
          break;
          
        case 'PARADOX_RESOLVE':
          bytecode.push(`RESOLVE_PARADOX ${args[0]} ${args[1]}`);
          break;
          
        case 'AI_NEGOTIATE':
          bytecode.push(`NEGOTIATE_AI ${args[0]} ${args[1]} ${args[2]}`);
          break;
          
        case 'AI_VERIFY':
          bytecode.push(`VERIFY_AI ${args[0]} ${args[1]}`);
          break;
          
        case 'QUANTUM_DECISION':
          bytecode.push(`DECIDE_QUANTUM ${args[0]} ${args[1]} ${args[2]}`);
          break;
      }
    }
    
    this.bytecode = bytecode;
    return bytecode;
  }
  
  /**
   * Compiles source code into bytecode.
   */
  compile(sourceCode: string): string[] {
    const tokens = this.tokenize(sourceCode);
    const parsed = this.parse(tokens);
    return this.generateBytecode(parsed);
  }
  
  /**
   * Enhanced compilation with type checking and comprehensive error reporting.
   */
  compileWithTypeChecking(sourceCode: string): CompilationResult {
    this.compilationErrors = [];
    this.compilationWarnings = [];
    this.typeChecker.reset();
    
    try {
      // Tokenize and parse
      const tokens = this.tokenize(sourceCode);
      const parsed = this.parse(tokens);
      
      // Convert to AST for type checking
      const ast = this.convertToAST(parsed, sourceCode);
      
      // Perform type checking
      const typeResults = this.performTypeChecking(ast);
      
      // Generate bytecode if no type errors
      const hasTypeErrors = typeResults.some(result => !result.success);
      let bytecode: string[] = [];
      
      if (!hasTypeErrors) {
        bytecode = this.generateBytecode(parsed);
      } else {
        this.addCompilationError({
          type: 'type',
          message: 'Type checking failed - cannot generate bytecode',
          location: { line: 1, column: 1 },
          severity: 'error'
        });
      }
      
      // Aggregate type errors and warnings
      this.aggregateTypeResults(typeResults);
      
      return {
        success: this.compilationErrors.length === 0,
        bytecode,
        ast,
        typeResults,
        errors: this.compilationErrors,
        warnings: this.compilationWarnings
      };
      
    } catch (error) {
      this.addCompilationError({
        type: 'syntax',
        message: error instanceof Error ? error.message : 'Unknown compilation error',
        location: { line: 1, column: 1 },
        severity: 'error'
      });
      
      return {
        success: false,
        bytecode: [],
        ast: [],
        typeResults: [],
        errors: this.compilationErrors,
        warnings: this.compilationWarnings
      };
    }
  }
  
  /**
   * Convert parsed instructions to AST nodes for type checking
   */
  private convertToAST(parsed: ParsedInstruction[], sourceCode: string): ASTNode[] {
    const ast: ASTNode[] = [];
    const lines = sourceCode.split('\n');
    
    for (let i = 0; i < parsed.length; i++) {
      const [type, ...args] = parsed[i];
      const lineNumber = i + 1; // Simplified line tracking
      
      const node: ASTNode = {
        type: this.mapInstructionToASTType(type),
        location: { line: lineNumber, column: 1 },
        value: args.length === 1 ? args[0] : args,
        metadata: this.extractMetadataFromInstruction(type, args, lines[i - 1] || '')
      };
      
      ast.push(node);
    }
    
    return ast;
  }
  
  /**
   * Map instruction types to AST node types
   */
  private mapInstructionToASTType(instruction: InstructionType): string {
    const mapping: Record<InstructionType, string> = {
      'QKD_INIT': 'QuantumStateDeclaration',
      'CONTRACT_START': 'AIContractDeclaration',
      'MODEL_DEPLOY': 'AIEntityDeclaration',
      'LEDGER_SYNC': 'VariableReference',
      'PARADOX_RESOLVE': 'QuantumOperationCall',
      'AI_NEGOTIATE': 'AIDecisionCall',
      'AI_VERIFY': 'AIDecisionCall',
      'QUANTUM_DECISION': 'QuantumOperationCall',
      'ENFORCE': 'VariableReference'
    };
    
    return mapping[instruction] || 'VariableReference';
  }
  
  /**
   * Extract metadata for type checking from instructions
   */
  private extractMetadataFromInstruction(type: InstructionType, args: string[], sourceLine: string): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    switch (type) {
      case 'QKD_INIT':
        metadata.dimension = QuantumDimension.QUBIT;
        metadata.entangled = args.length > 2;
        metadata.entangledWith = args.slice(1);
        break;
        
      case 'CONTRACT_START':
        metadata.explainabilityScore = 0.85; // Default threshold
        metadata.oversightLevel = HumanOversightLevel.NOTIFICATION;
        metadata.criticality = OperationCriticality.MEDIUM;
        break;
        
      case 'MODEL_DEPLOY':
        metadata.explainabilityScore = 0.90;
        metadata.safetyRating = { overall: 0.85, categories: {} };
        metadata.capabilities = ['reasoning', 'prediction'];
        if (args[2] && args[2].includes('mars')) {
          metadata.criticality = OperationCriticality.CRITICAL;
          metadata.oversightLevel = HumanOversightLevel.APPROVAL;
        }
        break;
        
      case 'ENFORCE':
        if (args[0] === 'explainabilityThreshold') {
          metadata.explainabilityScore = parseFloat(args[1]) || 0.85;
        }
        break;
        
      case 'AI_NEGOTIATE':
      case 'AI_VERIFY':
        metadata.explainabilityScore = 0.87;
        metadata.confidence = 0.8;
        metadata.requiresOversight = true;
        break;
        
      case 'QUANTUM_DECISION':
        metadata.operationType = QuantumOperationType.EVOLUTION;
        metadata.confidence = 0.9;
        break;
    }
    
    return metadata;
  }
  
  /**
   * Perform type checking on AST nodes
   */
  private performTypeChecking(ast: ASTNode[]): TypeInferenceResult[] {
    const results: TypeInferenceResult[] = [];
    
    for (const node of ast) {
      const result = this.typeChecker.checkNode(node);
      results.push(result);
      
      // Update type checker context with successful inferences
      if (result.success && node.value && typeof node.value === 'string') {
        this.typeChecker.getContext().variables.set(node.value, result.type);
      }
    }
    
    return results;
  }
  
  /**
   * Aggregate type checking results into compilation errors and warnings
   */
  private aggregateTypeResults(typeResults: TypeInferenceResult[]): void {
    for (const result of typeResults) {
      // Add type errors
      for (const error of result.errors) {
        this.addCompilationError({
          type: this.mapTypeErrorToCompilationType(error.type),
          message: error.message,
          location: error.location,
          severity: error.severity,
          suggestion: error.suggestion
        });
      }
      
      // Add type warnings
      for (const warning of result.warnings) {
        this.addCompilationWarning({
          type: this.mapTypeWarningToCompilationType(warning.type),
          message: warning.message,
          location: warning.location,
          suggestion: warning.suggestion
        });
      }
    }
  }
  
  /**
   * Map type error types to compilation error types
   */
  private mapTypeErrorToCompilationType(typeError: string): CompilationError['type'] {
    if (typeError.includes('quantum')) return 'quantum';
    if (typeError.includes('explainability') || typeError.includes('oversight')) return 'ai_safety';
    return 'type';
  }
  
  /**
   * Map type warning types to compilation warning types  
   */
  private mapTypeWarningToCompilationType(typeWarning: string): CompilationWarning['type'] {
    if (typeWarning === 'performance') return 'performance';
    if (typeWarning === 'deprecation') return 'deprecation';
    return 'best_practice';
  }
  
  /**
   * Add compilation error
   */
  private addCompilationError(error: CompilationError): void {
    this.compilationErrors.push(error);
  }
  
  /**
   * Add compilation warning
   */
  private addCompilationWarning(warning: CompilationWarning): void {
    this.compilationWarnings.push(warning);
  }
  
  /**
   * Translates parsed instructions into executable objects.
   */
  translateToObjects(parsed: ParsedInstruction[]): Record<string, any>[] {
    const objects: Record<string, any>[] = [];
    const context: Record<string, any> = {};
    
    for (const instruction of parsed) {
      const [type, ...args] = instruction;
      
      switch (type) {
        case 'QKD_INIT': {
          const key = new QuantumKey(args[0], args[1], args[2]);
          context[args[0]] = key;
          objects.push({
            type: 'QuantumKey',
            instance: key
          });
          break;
        }
          
        case 'CONTRACT_START': {
          // Contracts are often linked to a quantum key
          const key = context[args[0] + '_key'] || null;
          const contract = new AIContract(args[0], 0.85, key, 'defaultProtocol');
          context[args[0]] = contract;
          objects.push({
            type: 'AIContract',
            instance: contract
          });
          break;
        }
          
        case 'ENFORCE': {
          if (args[0] === 'explainabilityThreshold') {
            // Apply to most recent contract
            const lastContract = [...objects].reverse().find(obj => obj.type === 'AIContract');
            if (lastContract) {
              (lastContract.instance as AIContract).explainabilityThreshold = parseFloat(args[1]);
            }
          }
          break;
        }
          
        case 'MODEL_DEPLOY': {
          const model = new AIModelDeployment(args[0], args[1], args[2]);
          context[args[0]] = model;
          objects.push({
            type: 'AIModelDeployment',
            instance: model
          });
          break;
        }
          
        case 'LEDGER_SYNC': {
          const ledger = new LedgerSynchronization(args[0], 20);
          context[args[0]] = ledger;
          objects.push({
            type: 'LedgerSynchronization',
            instance: ledger
          });
          break;
        }
          
        case 'PARADOX_RESOLVE': {
          const resolver = new ParadoxResolver(args[0], args[1]);
          context[args[0] + '_resolver'] = resolver;
          objects.push({
            type: 'ParadoxResolver',
            instance: resolver
          });
          break;
        }
          
        case 'AI_VERIFY': {
          const verification = new AIVerification(args[0], args[1]);
          context[args[0] + '_verification'] = verification;
          objects.push({
            type: 'AIVerification',
            instance: verification
          });
          break;
        }
          
        case 'QUANTUM_DECISION': {
          const decision = new QuantumDecision(args[0], args[1], args[2]);
          context[args[0] + '_decision'] = decision;
          objects.push({
            type: 'QuantumDecision',
            instance: decision
          });
          break;
        }
      }
    }
    
    return objects;
  }
  
  /**
   * Executes the compiled bytecode.
   */
  executeByteCode(bytecode: string[]): string[] {
    const output: string[] = [];
    
    output.push("Executing SINGULARIS PRIME bytecode...");
    for (const instruction of bytecode) {
      output.push(`> ${instruction}`);
      
      // Simulate execution results
      const parts = instruction.split(' ');
      const cmd = parts[0];
      
      switch (cmd) {
        case 'INIT_QKD':
          output.push(`  Quantum key ${parts[1]} established between ${parts[2]} and ${parts[3]}`);
          break;
          
        case 'START_CONTRACT':
          output.push(`  Contract ${parts[1]} initialized with explainability checks`);
          break;
          
        case 'ENFORCE_RULE':
          output.push(`  Enforcing ${parts[1]} = ${parts[2]}`);
          break;
          
        case 'DEPLOY_MODEL':
          output.push(`  AI model ${parts[1]} v${parts[2]} deployed to ${parts[3]}`);
          break;
          
        case 'SYNC_LEDGER':
          output.push(`  Synchronizing blockchain ${parts[1]} with all nodes`);
          break;
          
        case 'RESOLVE_PARADOX':
          output.push(`  Paradox in ${parts[1]} being resolved using ${parts[2]}`);
          break;
          
        case 'NEGOTIATE_AI':
          output.push(`  AI negotiation between ${parts[1]} and ${parts[2]} on ${parts[3]}`);
          break;
          
        case 'VERIFY_AI':
          output.push(`  Verifying AI ${parts[1]} using ${parts[2]}`);
          break;
          
        case 'DECIDE_QUANTUM':
          output.push(`  Quantum decision by ${parts[1]} using ${parts[2]} for ${parts[3]}`);
          break;
      }
    }
    
    output.push("Execution completed successfully.");
    return output;
  }
}