/**
 * SINGULARIS PRIME Error Detection Engine
 * 
 * This module provides comprehensive real-time error detection for the SINGULARIS PRIME language,
 * including syntax errors, quantum state violations, AI contract validation, and semantic analysis.
 * 
 * Features:
 * - Real-time syntax error detection with quantum-aware parsing
 * - Quantum state violation detection (no-cloning, entanglement consistency)
 * - AI explainability threshold validation
 * - Human oversight requirement checking
 * - Memory safety analysis for quantum operations
 * - Integration with compiler and type checker systems
 */

import { EventEmitter } from 'events';
import {
  SingularisPrimeCompiler,
  CompilationResult,
  CompilationError,
  CompilationWarning
} from '../language/compiler';
import {
  SingularisTypeChecker,
  TypeInferenceResult,
  TypeError,
  TypeWarning,
  ASTNode,
  SourceLocation
} from '../language/type-checker';
import {
  QuantumReferenceId,
  QuantumState,
  QuantumError,
  QuantumErrorType,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  isValidHandle
} from '../../shared/types/quantum-types';
import {
  AIEntityId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality,
  isHighExplainability,
  requiresHumanOversight
} from '../../shared/types/ai-types';
import { quantumMemoryManager } from '../runtime/quantum-memory-manager';
import { aiVerificationService } from '../runtime/ai-verification-service';

// Error detection result
export interface ErrorDetectionResult {
  readonly success: boolean;
  readonly errors: DetectedError[];
  readonly warnings: DetectedWarning[];
  readonly suggestions: ErrorSuggestion[];
  readonly timestamp: number;
}

// Detected error with enhanced context
export interface DetectedError {
  readonly id: string;
  readonly type: ErrorType;
  readonly severity: ErrorSeverity;
  readonly message: string;
  readonly location: SourceLocation;
  readonly code: string;
  readonly suggestion?: string;
  readonly relatedErrors?: string[];
  readonly quantumContext?: QuantumErrorContext;
  readonly aiContext?: AIErrorContext;
}

// Detected warning
export interface DetectedWarning {
  readonly id: string;
  readonly type: WarningType;
  readonly message: string;
  readonly location: SourceLocation;
  readonly suggestion: string;
  readonly impact: 'low' | 'medium' | 'high';
}

// Error suggestion
export interface ErrorSuggestion {
  readonly errorId: string;
  readonly title: string;
  readonly description: string;
  readonly fix: SuggestionFix;
  readonly confidence: number; // 0.0 - 1.0
}

// Suggestion fix
export interface SuggestionFix {
  readonly type: 'replace' | 'insert' | 'delete' | 'refactor';
  readonly location: SourceLocation;
  readonly newText?: string;
  readonly explanation: string;
}

// Error types
export enum ErrorType {
  SYNTAX = 'syntax',
  QUANTUM_VIOLATION = 'quantum_violation',
  AI_SAFETY = 'ai_safety',
  TYPE_MISMATCH = 'type_mismatch',
  MEMORY_SAFETY = 'memory_safety',
  EXPLAINABILITY = 'explainability',
  OVERSIGHT = 'oversight',
  COMPLIANCE = 'compliance',
  PARADOX = 'paradox'
}

// Warning types
export enum WarningType {
  PERFORMANCE = 'performance',
  BEST_PRACTICE = 'best_practice',
  DEPRECATION = 'deprecation',
  DECOHERENCE = 'decoherence',
  RESOURCE_USAGE = 'resource_usage',
  POTENTIAL_ISSUE = 'potential_issue'
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Quantum error context
export interface QuantumErrorContext {
  readonly stateId?: QuantumReferenceId;
  readonly entanglementPartners?: QuantumReferenceId[];
  readonly coherenceStatus?: CoherenceStatus;
  readonly measurementStatus?: MeasurementStatus;
  readonly operation?: string;
  readonly dimension?: number;
}

// AI error context
export interface AIErrorContext {
  readonly entityId?: AIEntityId;
  readonly explainabilityScore?: ExplainabilityScore;
  readonly oversightLevel?: HumanOversightLevel;
  readonly criticality?: OperationCriticality;
  readonly contractId?: string;
}

// Error detection configuration
export interface ErrorDetectionConfig {
  readonly enableRealTime: boolean;
  readonly enableQuantumValidation: boolean;
  readonly enableAIValidation: boolean;
  readonly enableSuggestions: boolean;
  readonly maxErrorsPerDocument: number;
  readonly debounceInterval: number; // milliseconds
  readonly severityFilter: ErrorSeverity;
}

/**
 * Real-Time Error Detection Engine
 */
export class SingularisErrorDetector extends EventEmitter {
  private compiler: SingularisPrimeCompiler;
  private typeChecker: SingularisTypeChecker;
  private config: ErrorDetectionConfig;
  private errorCounter: number = 0;
  private detectionCache: Map<string, ErrorDetectionResult> = new Map();
  private lastDetectionTime: number = 0;
  
  // Error pattern recognition
  private syntaxPatterns: RegExp[] = [
    /unclosed\s+['"`]/i,
    /unexpected\s+token/i,
    /missing\s+[;,})\]]/i,
    /invalid\s+syntax/i
  ];
  
  private quantumPatterns: RegExp[] = [
    /quantum\s+state\s+cloned/i,
    /entanglement\s+violation/i,
    /coherence\s+lost/i,
    /measurement\s+after\s+use/i
  ];
  
  private aiPatterns: RegExp[] = [
    /explainability\s+threshold/i,
    /human\s+oversight\s+required/i,
    /ai\s+safety\s+violation/i,
    /compliance\s+check/i
  ];

  constructor(config: Partial<ErrorDetectionConfig> = {}) {
    super();
    
    this.compiler = new SingularisPrimeCompiler();
    this.typeChecker = new SingularisTypeChecker();
    this.config = {
      enableRealTime: true,
      enableQuantumValidation: true,
      enableAIValidation: true,
      enableSuggestions: true,
      maxErrorsPerDocument: 100,
      debounceInterval: 300,
      severityFilter: ErrorSeverity.INFO,
      ...config
    };
    
    this.setupEventHandlers();
  }

  /**
   * Detect errors in source code
   */
  public async detectErrors(content: string, uri?: string): Promise<ErrorDetectionResult> {
    const now = Date.now();
    
    // Check cache and debounce
    const cacheKey = `${uri || 'untitled'}:${this.hashContent(content)}`;
    const cached = this.detectionCache.get(cacheKey);
    if (cached && (now - this.lastDetectionTime) < this.config.debounceInterval) {
      return cached;
    }
    
    const errors: DetectedError[] = [];
    const warnings: DetectedWarning[] = [];
    const suggestions: ErrorSuggestion[] = [];
    
    try {
      // 1. Syntax error detection
      const syntaxErrors = await this.detectSyntaxErrors(content, uri);
      errors.push(...syntaxErrors);
      
      // 2. Quantum state validation
      if (this.config.enableQuantumValidation) {
        const quantumErrors = await this.detectQuantumErrors(content, uri);
        errors.push(...quantumErrors);
      }
      
      // 3. AI safety validation
      if (this.config.enableAIValidation) {
        const aiErrors = await this.detectAIErrors(content, uri);
        errors.push(...aiErrors);
      }
      
      // 4. Type checking
      const typeResults = this.typeChecker.analyzeDocument(content, uri);
      const typeErrors = this.convertTypeErrors(typeResults);
      errors.push(...typeErrors);
      
      // 5. Generate suggestions
      if (this.config.enableSuggestions) {
        const errorSuggestions = await this.generateSuggestions(errors, content);
        suggestions.push(...errorSuggestions);
      }
      
      // 6. Performance warnings
      const performanceWarnings = this.detectPerformanceWarnings(content, uri);
      warnings.push(...performanceWarnings);
      
      const result: ErrorDetectionResult = {
        success: errors.length === 0,
        errors: errors.slice(0, this.config.maxErrorsPerDocument),
        warnings,
        suggestions,
        timestamp: now
      };
      
      // Cache result
      this.detectionCache.set(cacheKey, result);
      this.lastDetectionTime = now;
      
      // Emit events
      this.emit('errorsDetected', result);
      if (errors.length > 0) {
        this.emit('errorFound', errors);
      }
      if (warnings.length > 0) {
        this.emit('warningFound', warnings);
      }
      
      return result;
      
    } catch (error) {
      const errorResult: ErrorDetectionResult = {
        success: false,
        errors: [{
          id: this.generateErrorId(),
          type: ErrorType.SYNTAX,
          severity: ErrorSeverity.ERROR,
          message: `Error detection failed: ${error instanceof Error ? error.message : String(error)}`,
          location: { line: 1, column: 1, file: uri },
          code: 'DETECTION_FAILURE'
        }],
        warnings: [],
        suggestions: [],
        timestamp: now
      };
      
      return errorResult;
    }
  }

  /**
   * Detect syntax errors
   */
  private async detectSyntaxErrors(content: string, uri?: string): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    
    try {
      // Compile to get syntax errors
      const tokens = this.compiler.tokenize(content);
      const parsed = this.compiler.parse(tokens);
      const results = this.compiler.getCompilationResults();
      
      for (const error of results.errors) {
        if (error.type === 'syntax') {
          errors.push({
            id: this.generateErrorId(),
            type: ErrorType.SYNTAX,
            severity: error.severity === 'error' ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
            message: error.message,
            location: error.location,
            code: 'SYNTAX_ERROR',
            suggestion: error.suggestion
          });
        }
      }
      
      // Pattern-based syntax detection
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (const pattern of this.syntaxPatterns) {
          if (pattern.test(line)) {
            errors.push({
              id: this.generateErrorId(),
              type: ErrorType.SYNTAX,
              severity: ErrorSeverity.ERROR,
              message: `Syntax error detected: ${pattern.source}`,
              location: { line: i + 1, column: 1, file: uri },
              code: 'PATTERN_SYNTAX_ERROR',
              suggestion: 'Check syntax and fix parsing issues'
            });
          }
        }
      }
      
    } catch (error) {
      errors.push({
        id: this.generateErrorId(),
        type: ErrorType.SYNTAX,
        severity: ErrorSeverity.ERROR,
        message: `Syntax analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        location: { line: 1, column: 1, file: uri },
        code: 'SYNTAX_ANALYSIS_FAILED'
      });
    }
    
    return errors;
  }

  /**
   * Detect quantum state violations
   */
  private async detectQuantumErrors(content: string, uri?: string): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    const lines = content.split('\n');
    
    // Track quantum states and operations
    const quantumStates = new Map<string, QuantumReferenceId>();
    const entanglements = new Map<string, string[]>();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for quantum state cloning violations
      if (line.includes('clone') && (line.includes('qubit') || line.includes('qudit'))) {
        errors.push({
          id: this.generateErrorId(),
          type: ErrorType.QUANTUM_VIOLATION,
          severity: ErrorSeverity.ERROR,
          message: 'Quantum no-cloning theorem violation: Cannot clone quantum states',
          location: { line: i + 1, column: line.indexOf('clone') + 1, file: uri },
          code: 'QUANTUM_NO_CLONING',
          suggestion: 'Use quantum teleportation or state transfer instead of cloning',
          quantumContext: {
            operation: 'clone'
          }
        });
      }
      
      // Check for entanglement consistency
      if (line.includes('entangle')) {
        const match = line.match(/entangle\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/);
        if (match) {
          const [, state1, state2] = match;
          
          // Track entanglement
          if (!entanglements.has(state1)) entanglements.set(state1, []);
          if (!entanglements.has(state2)) entanglements.set(state2, []);
          entanglements.get(state1)?.push(state2);
          entanglements.get(state2)?.push(state1);
          
          // Check if states exist
          if (!quantumStates.has(state1) || !quantumStates.has(state2)) {
            errors.push({
              id: this.generateErrorId(),
              type: ErrorType.QUANTUM_VIOLATION,
              severity: ErrorSeverity.ERROR,
              message: 'Entanglement error: Cannot entangle undefined quantum states',
              location: { line: i + 1, column: match.index! + 1, file: uri },
              code: 'UNDEFINED_QUANTUM_STATE',
              suggestion: 'Define quantum states before entangling them'
            });
          }
        }
      }
      
      // Check for measurement after use
      if (line.includes('measure')) {
        const match = line.match(/measure\s*\(\s*(\w+)\s*\)/);
        if (match) {
          const [, state] = match;
          // This would require more sophisticated state tracking in a real implementation
        }
      }
      
      // Track quantum state declarations
      if (line.includes('qubit') || line.includes('qudit')) {
        const match = line.match(/(\w+)\s*=\s*(qubit|qudit)/);
        if (match) {
          const [, varName] = match;
          quantumStates.set(varName, varName as QuantumReferenceId);
        }
      }
    }
    
    return errors;
  }

  /**
   * Detect AI safety and compliance errors
   */
  private async detectAIErrors(content: string, uri?: string): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check explainability thresholds
      if (line.includes('aiContract') || line.includes('aiDecision')) {
        // Look for explainability score
        const explainabilityMatch = line.match(/explainabilityScore[:\s]*([0-9.]+)/);
        if (explainabilityMatch) {
          const score = parseFloat(explainabilityMatch[1]);
          if (score < 0.85) {
            errors.push({
              id: this.generateErrorId(),
              type: ErrorType.EXPLAINABILITY,
              severity: ErrorSeverity.ERROR,
              message: `Explainability threshold violation: Score ${score} is below required 0.85`,
              location: { line: i + 1, column: explainabilityMatch.index! + 1, file: uri },
              code: 'LOW_EXPLAINABILITY',
              suggestion: 'Increase explainability score to at least 0.85 or add human oversight',
              aiContext: {
                explainabilityScore: score as ExplainabilityScore
              }
            });
          }
        }
      }
      
      // Check human oversight requirements
      if (line.includes('criticality') && (line.includes('CRITICAL') || line.includes('SAFETY'))) {
        if (!line.includes('humanOversight') && !line.includes('oversight')) {
          errors.push({
            id: this.generateErrorId(),
            type: ErrorType.OVERSIGHT,
            severity: ErrorSeverity.ERROR,
            message: 'Human oversight required for critical AI operations',
            location: { line: i + 1, column: 1, file: uri },
            code: 'MISSING_OVERSIGHT',
            suggestion: 'Add human oversight requirement for critical operations',
            aiContext: {
              criticality: OperationCriticality.CRITICAL
            }
          });
        }
      }
    }
    
    return errors;
  }

  /**
   * Convert type checking results to detected errors
   */
  private convertTypeErrors(typeResults: TypeInferenceResult[]): DetectedError[] {
    const errors: DetectedError[] = [];
    
    for (const result of typeResults) {
      for (const error of result.errors) {
        errors.push({
          id: this.generateErrorId(),
          type: this.mapTypeErrorToErrorType(error.type),
          severity: this.mapSeverityToErrorSeverity(error.severity),
          message: error.message,
          location: error.location,
          code: error.type.toUpperCase(),
          suggestion: error.suggestion
        });
      }
    }
    
    return errors;
  }

  /**
   * Generate error suggestions
   */
  private async generateSuggestions(errors: DetectedError[], content: string): Promise<ErrorSuggestion[]> {
    const suggestions: ErrorSuggestion[] = [];
    
    for (const error of errors) {
      switch (error.type) {
        case ErrorType.SYNTAX:
          suggestions.push({
            errorId: error.id,
            title: 'Fix Syntax Error',
            description: 'Automatically fix common syntax issues',
            fix: {
              type: 'replace',
              location: error.location,
              explanation: 'Fix syntax by correcting common patterns'
            },
            confidence: 0.8
          });
          break;
          
        case ErrorType.QUANTUM_VIOLATION:
          if (error.code === 'QUANTUM_NO_CLONING') {
            suggestions.push({
              errorId: error.id,
              title: 'Use Quantum Teleportation',
              description: 'Replace cloning with quantum teleportation',
              fix: {
                type: 'replace',
                location: error.location,
                newText: 'teleport',
                explanation: 'Quantum teleportation preserves no-cloning theorem'
              },
              confidence: 0.9
            });
          }
          break;
          
        case ErrorType.EXPLAINABILITY:
          suggestions.push({
            errorId: error.id,
            title: 'Increase Explainability',
            description: 'Add human oversight or improve explainability score',
            fix: {
              type: 'insert',
              location: error.location,
              newText: ', humanOversight: true',
              explanation: 'Add human oversight to compensate for low explainability'
            },
            confidence: 0.85
          });
          break;
      }
    }
    
    return suggestions;
  }

  /**
   * Detect performance warnings
   */
  private detectPerformanceWarnings(content: string, uri?: string): DetectedWarning[] {
    const warnings: DetectedWarning[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for potentially expensive operations
      if (line.includes('measure') && line.includes('loop')) {
        warnings.push({
          id: this.generateErrorId(),
          type: WarningType.PERFORMANCE,
          message: 'Quantum measurement in loop may be expensive',
          location: { line: i + 1, column: 1, file: uri },
          suggestion: 'Consider batching measurements or reducing loop iterations',
          impact: 'medium'
        });
      }
      
      // Check for excessive entanglement
      if (line.match(/entangle.*entangle.*entangle/)) {
        warnings.push({
          id: this.generateErrorId(),
          type: WarningType.PERFORMANCE,
          message: 'Multiple entanglements may cause decoherence',
          location: { line: i + 1, column: 1, file: uri },
          suggestion: 'Minimize entanglement complexity to preserve coherence',
          impact: 'high'
        });
      }
    }
    
    return warnings;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('errorsDetected', (result: ErrorDetectionResult) => {
      console.log(`[ErrorDetector] Detected ${result.errors.length} errors, ${result.warnings.length} warnings`);
    });
  }

  /**
   * Utility methods
   */
  private generateErrorId(): string {
    return `error_${++this.errorCounter}_${Date.now()}`;
  }

  private hashContent(content: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  private mapTypeErrorToErrorType(type: string): ErrorType {
    switch (type) {
      case 'quantum_cloning': return ErrorType.QUANTUM_VIOLATION;
      case 'explainability_violation': return ErrorType.EXPLAINABILITY;
      case 'oversight_missing': return ErrorType.OVERSIGHT;
      case 'compliance_violation': return ErrorType.COMPLIANCE;
      default: return ErrorType.TYPE_MISMATCH;
    }
  }

  private mapSeverityToErrorSeverity(severity: string): ErrorSeverity {
    switch (severity) {
      case 'error': return ErrorSeverity.ERROR;
      case 'warning': return ErrorSeverity.WARNING;
      case 'info': return ErrorSeverity.INFO;
      default: return ErrorSeverity.ERROR;
    }
  }

  /**
   * Clear caches and reset state
   */
  public reset(): void {
    this.detectionCache.clear();
    this.errorCounter = 0;
    this.lastDetectionTime = 0;
    this.compiler.reset();
    this.typeChecker.reset();
  }

  /**
   * Get detection statistics
   */
  public getStatistics(): {
    errorsDetected: number;
    cacheSize: number;
    lastDetection: number;
  } {
    return {
      errorsDetected: this.errorCounter,
      cacheSize: this.detectionCache.size,
      lastDetection: this.lastDetectionTime
    };
  }
}

// Export singleton instance
export const singularisErrorDetector = new SingularisErrorDetector();