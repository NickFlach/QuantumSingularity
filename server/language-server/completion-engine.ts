/**
 * SINGULARIS PRIME AI-Powered Completion Engine
 * 
 * This module provides intelligent code completion for the SINGULARIS PRIME language,
 * with quantum-aware suggestions, AI-driven recommendations, and context-sensitive
 * completions for quantum operations, AI contracts, and glyph constructs.
 * 
 * Features:
 * - Quantum-aware code completion with state-sensitive suggestions
 * - AI-driven completion using explainability analysis
 * - Context-sensitive suggestions based on current quantum state
 * - Glyph pattern recommendations and auto-completion
 * - Paradox resolution pattern suggestions
 * - Distributed quantum construct completion
 * - Performance-optimized completion caching
 */

import { EventEmitter } from 'events';
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  TextEdit,
  Position,
  Range
} from './lsp-server';
import {
  SingularisTypeChecker,
  TypeContext,
  InferredType
} from '../language/type-checker';
import {
  QuantumReferenceId,
  QuantumState,
  QuantumDimension,
  EntangledSystem,
  CoherenceStatus,
  isQubit,
  isQudit
} from '../../shared/types/quantum-types';
import {
  AIEntityId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality,
  isHighExplainability
} from '../../shared/types/ai-types';
import { quantumMemoryManager } from '../runtime/quantum-memory-manager';
import { aiVerificationService } from '../runtime/ai-verification-service';

// Completion context
export interface CompletionContext {
  readonly uri: string;
  readonly position: Position;
  readonly triggerCharacter?: string;
  readonly triggerKind: CompletionTriggerKind;
  readonly lineText: string;
  readonly wordAtPosition: string;
  readonly previousWord: string;
  readonly quantumContext?: QuantumCompletionContext;
  readonly aiContext?: AICompletionContext;
  readonly glyphContext?: GlyphCompletionContext;
}

// Completion trigger kinds
export enum CompletionTriggerKind {
  INVOKED = 1,        // Manually invoked (Ctrl+Space)
  TRIGGER_CHARACTER = 2, // Triggered by typing character
  INCOMPLETE = 3      // Re-trigger for incomplete completion
}

// Quantum-specific completion context
export interface QuantumCompletionContext {
  readonly availableStates: QuantumReferenceId[];
  readonly currentEntanglements: Map<QuantumReferenceId, QuantumReferenceId[]>;
  readonly coherenceStatus: Map<QuantumReferenceId, CoherenceStatus>;
  readonly suggestedDimension?: QuantumDimension;
  readonly operationHistory: string[];
}

// AI-specific completion context
export interface AICompletionContext {
  readonly availableEntities: AIEntityId[];
  readonly explainabilityRequirement: ExplainabilityScore;
  readonly oversightLevel: HumanOversightLevel;
  readonly criticality: OperationCriticality;
  readonly activeContracts: string[];
}

// Glyph-specific completion context
export interface GlyphCompletionContext {
  readonly availableGlyphs: string[];
  readonly currentBindings: Map<string, QuantumReferenceId>;
  readonly spatialDimensions: number;
  readonly animationContext: boolean;
}

// Completion provider configuration
export interface CompletionConfig {
  readonly enableQuantumCompletion: boolean;
  readonly enableAICompletion: boolean;
  readonly enableGlyphCompletion: boolean;
  readonly enableSnippets: boolean;
  readonly maxSuggestions: number;
  readonly cacheTimeout: number; // milliseconds
  readonly fuzzyMatchThreshold: number; // 0.0 - 1.0
  readonly prioritizeRecent: boolean;
}

// Completion scoring factors
export interface CompletionScore {
  readonly relevance: number;      // How relevant to current context (0-1)
  readonly frequency: number;      // How often used recently (0-1)
  readonly explainability: number; // How explainable the suggestion (0-1)
  readonly safety: number;         // How safe the operation (0-1)
  readonly performance: number;    // Performance impact (0-1, higher is better)
  readonly total: number;         // Weighted total score
}

/**
 * Intelligent Completion Engine for SINGULARIS PRIME
 */
export class SingularisCompletionEngine extends EventEmitter {
  private typeChecker: SingularisTypeChecker;
  private config: CompletionConfig;
  private completionCache: Map<string, CompletionItem[]> = new Map();
  private usageHistory: Map<string, number> = new Map();
  private lastCacheUpdate: number = 0;
  
  // Completion databases
  private quantumCompletions: Map<string, CompletionItem[]> = new Map();
  private aiCompletions: Map<string, CompletionItem[]> = new Map();
  private glyphCompletions: Map<string, CompletionItem[]> = new Map();
  private snippetCompletions: CompletionItem[] = [];

  constructor(config: Partial<CompletionConfig> = {}) {
    super();
    
    this.typeChecker = new SingularisTypeChecker();
    this.config = {
      enableQuantumCompletion: true,
      enableAICompletion: true,
      enableGlyphCompletion: true,
      enableSnippets: true,
      maxSuggestions: 50,
      cacheTimeout: 30000, // 30 seconds
      fuzzyMatchThreshold: 0.3,
      prioritizeRecent: true,
      ...config
    };
    
    this.initializeCompletionDatabases();
  }

  /**
   * Provide completions for given context
   */
  public async provideCompletions(context: CompletionContext): Promise<CompletionItem[]> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(context);
      const cached = this.getCachedCompletions(cacheKey);
      if (cached) {
        return cached;
      }
      
      const completions: CompletionItem[] = [];
      
      // 1. Quantum-specific completions
      if (this.config.enableQuantumCompletion) {
        const quantumCompletions = await this.provideQuantumCompletions(context);
        completions.push(...quantumCompletions);
      }
      
      // 2. AI-specific completions
      if (this.config.enableAICompletion) {
        const aiCompletions = await this.provideAICompletions(context);
        completions.push(...aiCompletions);
      }
      
      // 3. Glyph-specific completions
      if (this.config.enableGlyphCompletion) {
        const glyphCompletions = await this.provideGlyphCompletions(context);
        completions.push(...glyphCompletions);
      }
      
      // 4. Language keywords and built-ins
      const languageCompletions = this.provideLanguageCompletions(context);
      completions.push(...languageCompletions);
      
      // 5. Code snippets
      if (this.config.enableSnippets) {
        const snippetCompletions = this.provideSnippetCompletions(context);
        completions.push(...snippetCompletions);
      }
      
      // 6. Context-aware variable completions
      const variableCompletions = await this.provideVariableCompletions(context);
      completions.push(...variableCompletions);
      
      // Sort and filter by relevance
      const scoredCompletions = this.scoreAndFilterCompletions(completions, context);
      const finalCompletions = scoredCompletions.slice(0, this.config.maxSuggestions);
      
      // Cache results
      this.cacheCompletions(cacheKey, finalCompletions);
      
      // Update usage tracking
      this.trackCompletionContext(context);
      
      this.emit('completionsProvided', {
        context,
        completions: finalCompletions,
        count: finalCompletions.length
      });
      
      return finalCompletions;
      
    } catch (error) {
      console.error('[CompletionEngine] Error providing completions:', error);
      return [];
    }
  }

  /**
   * Provide quantum-specific completions
   */
  private async provideQuantumCompletions(context: CompletionContext): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];
    const word = context.wordAtPosition.toLowerCase();
    
    // Quantum state operations
    if (word.startsWith('qu') || context.triggerCharacter === 'q') {
      completions.push(
        {
          label: 'qubit',
          kind: CompletionItemKind.QUANTUM_STATE,
          detail: 'Create a 2-dimensional quantum state',
          documentation: 'Creates a qubit (2-dimensional quantum state) with superposition capabilities',
          insertText: 'qubit(${1:name})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'aa-qubit'
        },
        {
          label: 'qudit',
          kind: CompletionItemKind.QUANTUM_STATE,
          detail: 'Create a multi-dimensional quantum state',
          documentation: 'Creates a qudit (d-dimensional quantum state) where d > 2',
          insertText: 'qudit(${1:name}, ${2:dimension})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'ab-qudit'
        },
        {
          label: 'quantumKey',
          kind: CompletionItemKind.QUANTUM_STATE,
          detail: 'Create quantum encryption key',
          documentation: 'Creates a quantum key for secure communication using QKD',
          insertText: 'quantumKey(${1:keyId}, ${2:participant1}, ${3:participant2})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'ac-quantumKey'
        }
      );
    }
    
    // Quantum operations
    if (word.startsWith('en') || word.startsWith('me') || word.startsWith('te')) {
      completions.push(
        {
          label: 'entangle',
          kind: CompletionItemKind.QUANTUM_OPERATION,
          detail: 'Entangle quantum states',
          documentation: 'Creates entanglement between two or more quantum states',
          insertText: 'entangle(${1:state1}, ${2:state2})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'ba-entangle'
        },
        {
          label: 'measure',
          kind: CompletionItemKind.QUANTUM_MEASUREMENT,
          detail: 'Measure quantum state',
          documentation: 'Collapses quantum superposition and returns measurement result',
          insertText: 'measure(${1:state})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'bb-measure'
        },
        {
          label: 'teleport',
          kind: CompletionItemKind.QUANTUM_OPERATION,
          detail: 'Quantum teleportation',
          documentation: 'Teleports quantum state using entanglement and classical communication',
          insertText: 'teleport(${1:state}, ${2:destination})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'bc-teleport'
        }
      );
    }
    
    // Context-aware quantum completions
    if (context.quantumContext) {
      // Suggest available quantum states
      for (const stateId of context.quantumContext.availableStates) {
        completions.push({
          label: stateId,
          kind: CompletionItemKind.VARIABLE,
          detail: 'Available quantum state',
          documentation: `Quantum state: ${stateId}`,
          insertText: stateId,
          sortText: `da-${stateId}`
        });
      }
      
      // Suggest entanglement operations for available states
      if (context.quantumContext.availableStates.length >= 2) {
        const states = context.quantumContext.availableStates.slice(0, 2);
        completions.push({
          label: `entangle(${states.join(', ')})`,
          kind: CompletionItemKind.QUANTUM_OPERATION,
          detail: 'Entangle available states',
          documentation: `Entangle ${states.join(' and ')}`,
          insertText: `entangle(${states.join(', ')})`,
          sortText: 'ca-entangle-available'
        });
      }
    }
    
    return completions;
  }

  /**
   * Provide AI-specific completions
   */
  private async provideAICompletions(context: CompletionContext): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];
    const word = context.wordAtPosition.toLowerCase();
    
    // AI contract operations
    if (word.startsWith('ai') || word.startsWith('con')) {
      completions.push(
        {
          label: 'aiContract',
          kind: CompletionItemKind.AI_CONTRACT,
          detail: 'Create AI contract with safety constraints',
          documentation: 'Creates an AI contract with explainability and oversight requirements',
          insertText: `aiContract({
  name: "\${1:contractName}",
  explainabilityThreshold: \${2:0.85},
  oversightLevel: "\${3:approval}",
  criticality: "\${4:medium}"
})`,
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'aa-aiContract'
        },
        {
          label: 'aiEntity',
          kind: CompletionItemKind.AI_MODEL,
          detail: 'Create AI entity with capabilities',
          documentation: 'Creates an AI entity with defined capabilities and safety constraints',
          insertText: `aiEntity({
  name: "\${1:entityName}",
  modelType: "\${2:language_model}",
  explainabilityScore: \${3:0.85},
  oversightLevel: "\${4:notification}"
})`,
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'ab-aiEntity'
        }
      );
    }
    
    // AI decision and verification
    if (word.startsWith('dec') || word.startsWith('ver') || word.startsWith('exp')) {
      completions.push(
        {
          label: 'aiDecision',
          kind: CompletionItemKind.AI_DECISION,
          detail: 'Make explainable AI decision',
          documentation: 'Creates an AI decision with explainability requirements',
          insertText: 'aiDecision(${1:entity}, ${2:input}, { explainability: ${3:0.85} })',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'ba-aiDecision'
        },
        {
          label: 'aiVerify',
          kind: CompletionItemKind.AI_VERIFICATION,
          detail: 'Verify AI operation safety',
          documentation: 'Verifies AI operation meets safety and explainability requirements',
          insertText: 'aiVerify(${1:operation}, { threshold: ${2:0.85} })',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'bb-aiVerify'
        },
        {
          label: 'explainableAI',
          kind: CompletionItemKind.AI_EXPLAINABILITY,
          detail: 'Create explainable AI wrapper',
          documentation: 'Wraps AI operations with explainability guarantees',
          insertText: `explainableAI({
  operation: \${1:aiOperation},
  explainabilityThreshold: \${2:0.85},
  humanReviewRequired: \${3:true}
})`,
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'bc-explainableAI'
        }
      );
    }
    
    // Context-aware AI completions
    if (context.aiContext) {
      // Suggest oversight levels based on criticality
      if (context.aiContext.criticality === OperationCriticality.CRITICAL ||
          context.aiContext.criticality === OperationCriticality.SAFETY) {
        completions.push({
          label: 'humanOversight: true',
          kind: CompletionItemKind.AI_OVERSIGHT,
          detail: 'Required for critical operations',
          documentation: 'Human oversight is required for critical AI operations',
          insertText: 'humanOversight: true',
          sortText: 'ca-oversight-required'
        });
      }
      
      // Suggest explainability improvements
      if (context.aiContext.explainabilityRequirement < 0.85) {
        completions.push({
          label: 'explainabilityScore: 0.85',
          kind: CompletionItemKind.AI_EXPLAINABILITY,
          detail: 'Meet minimum explainability threshold',
          documentation: 'Increases explainability score to meet minimum requirements',
          insertText: 'explainabilityScore: 0.85',
          sortText: 'cb-explainability-fix'
        });
      }
    }
    
    return completions;
  }

  /**
   * Provide glyph-specific completions
   */
  private async provideGlyphCompletions(context: CompletionContext): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];
    const word = context.wordAtPosition.toLowerCase();
    
    // Glyph operations
    if (word.startsWith('gl') || word.startsWith('bi') || word.startsWith('tr')) {
      completions.push(
        {
          label: 'glyph',
          kind: CompletionItemKind.GLYPH,
          detail: 'Create multi-dimensional glyph',
          documentation: 'Creates a glyph for quantum state visualization and manipulation',
          insertText: `glyph({
  name: "\${1:glyphName}",
  dimensions: \${2:37},
  pattern: "\${3:rose_lattice}"
})`,
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'aa-glyph'
        },
        {
          label: 'bindToQuantum',
          kind: CompletionItemKind.GLYPH,
          detail: 'Bind glyph to quantum state',
          documentation: 'Creates binding between glyph and quantum state for visualization',
          insertText: 'bindToQuantum(${1:glyph}, ${2:quantumState})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'ab-bindToQuantum'
        },
        {
          label: 'transformGlyph',
          kind: CompletionItemKind.GLYPH,
          detail: 'Transform glyph in space',
          documentation: 'Applies transformation to glyph in multi-dimensional space',
          insertText: 'transformGlyph(${1:glyph}, ${2:transformation})',
          insertTextFormat: InsertTextFormat.SNIPPET,
          sortText: 'ac-transformGlyph'
        }
      );
    }
    
    return completions;
  }

  /**
   * Provide language keyword completions
   */
  private provideLanguageCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];
    const word = context.wordAtPosition.toLowerCase();
    
    const keywords = [
      'if', 'else', 'while', 'for', 'function', 'return', 'try', 'catch',
      'let', 'const', 'var', 'new', 'class', 'extends', 'import', 'export'
    ];
    
    for (const keyword of keywords) {
      if (keyword.toLowerCase().startsWith(word) || word.length === 0) {
        completions.push({
          label: keyword,
          kind: CompletionItemKind.KEYWORD,
          detail: `${keyword} keyword`,
          documentation: `SINGULARIS PRIME ${keyword} statement`,
          insertText: keyword,
          sortText: `zz-${keyword}`
        });
      }
    }
    
    return completions;
  }

  /**
   * Provide code snippet completions
   */
  private provideSnippetCompletions(context: CompletionContext): CompletionItem[] {
    const completions: CompletionItem[] = [];
    const word = context.wordAtPosition.toLowerCase();
    
    // Quantum entanglement snippet
    if (word.startsWith('ent') || word.startsWith('qu')) {
      completions.push({
        label: 'quantumEntanglement',
        kind: CompletionItemKind.SNIPPET,
        detail: 'Complete quantum entanglement setup',
        documentation: 'Creates two qubits, entangles them, and demonstrates Bell state measurement',
        insertText: `// Create entangled qubits
let qubit1 = qubit("alice");
let qubit2 = qubit("bob");

// Create Bell state
entangle(qubit1, qubit2);

// Measure for demonstration
let result1 = measure(qubit1);
let result2 = measure(qubit2);

// Results will be correlated`,
        insertTextFormat: InsertTextFormat.SNIPPET,
        sortText: 'snippet-quantum-entanglement'
      });
    }
    
    // AI contract snippet
    if (word.startsWith('ai') || word.startsWith('con')) {
      completions.push({
        label: 'aiContractTemplate',
        kind: CompletionItemKind.SNIPPET,
        detail: 'Complete AI contract with safety features',
        documentation: 'Creates a comprehensive AI contract with explainability and oversight',
        insertText: `// Create AI contract with safety constraints
let contract = aiContract({
  name: "\${1:contractName}",
  participants: {
    initiator: "\${2:aiEntity1}",
    responder: "\${3:aiEntity2}"
  },
  explainabilityThreshold: 0.85,
  oversightLevel: "approval",
  criticality: "medium",
  auditRequired: true
});

// Execute contract with verification
let result = aiVerify(contract);`,
        insertTextFormat: InsertTextFormat.SNIPPET,
        sortText: 'snippet-ai-contract'
      });
    }
    
    return completions;
  }

  /**
   * Provide variable completions based on context
   */
  private async provideVariableCompletions(context: CompletionContext): Promise<CompletionItem[]> {
    const completions: CompletionItem[] = [];
    
    try {
      // Get type context for current position
      const typeContext = this.typeChecker.getContext();
      
      // Add variable suggestions
      for (const [varName, inferredType] of typeContext.variables) {
        if (varName.toLowerCase().includes(context.wordAtPosition.toLowerCase()) || 
            context.wordAtPosition.length === 0) {
          completions.push({
            label: varName,
            kind: this.getCompletionKindForType(inferredType),
            detail: `${inferredType.kind}: ${inferredType.name}`,
            documentation: `Variable of type ${inferredType.name}`,
            insertText: varName,
            sortText: `var-${varName}`
          });
        }
      }
      
      // Add quantum state suggestions
      for (const [stateId] of typeContext.quantumStates) {
        completions.push({
          label: stateId,
          kind: CompletionItemKind.QUANTUM_VARIABLE,
          detail: 'Quantum state',
          documentation: `Quantum state: ${stateId}`,
          insertText: stateId,
          sortText: `quantum-${stateId}`
        });
      }
      
      // Add AI entity suggestions
      for (const [entityId] of typeContext.aiEntities) {
        completions.push({
          label: entityId,
          kind: CompletionItemKind.AI_MODEL,
          detail: 'AI entity',
          documentation: `AI entity: ${entityId}`,
          insertText: entityId,
          sortText: `ai-${entityId}`
        });
      }
      
    } catch (error) {
      console.error('[CompletionEngine] Error getting variable completions:', error);
    }
    
    return completions;
  }

  /**
   * Score and filter completions by relevance
   */
  private scoreAndFilterCompletions(completions: CompletionItem[], context: CompletionContext): CompletionItem[] {
    const scored = completions.map(completion => ({
      completion,
      score: this.calculateCompletionScore(completion, context)
    }));
    
    // Filter by threshold and sort by score
    const filtered = scored
      .filter(item => item.score.total >= this.config.fuzzyMatchThreshold)
      .sort((a, b) => b.score.total - a.score.total)
      .map(item => item.completion);
    
    return filtered;
  }

  /**
   * Calculate completion score based on multiple factors
   */
  private calculateCompletionScore(completion: CompletionItem, context: CompletionContext): CompletionScore {
    const word = context.wordAtPosition.toLowerCase();
    const label = completion.label.toLowerCase();
    
    // Relevance score (fuzzy matching)
    const relevance = this.calculateFuzzyMatch(word, label);
    
    // Frequency score (usage history)
    const frequency = this.getUsageFrequency(completion.label);
    
    // Explainability score (for AI completions)
    const explainability = completion.kind === CompletionItemKind.AI_CONTRACT ||
                          completion.kind === CompletionItemKind.AI_MODEL ? 0.85 : 1.0;
    
    // Safety score (quantum and AI safety considerations)
    const safety = this.calculateSafetyScore(completion);
    
    // Performance score
    const performance = this.calculatePerformanceScore(completion);
    
    // Weighted total
    const total = (relevance * 0.4) + (frequency * 0.2) + (explainability * 0.2) + 
                  (safety * 0.1) + (performance * 0.1);
    
    return { relevance, frequency, explainability, safety, performance, total };
  }

  /**
   * Initialize completion databases
   */
  private initializeCompletionDatabases(): void {
    // This would be populated from configuration or external sources
    // For now, we'll use the completions defined in the provider methods
  }

  /**
   * Utility methods
   */
  private generateCacheKey(context: CompletionContext): string {
    return `${context.uri}:${context.position.line}:${context.position.character}:${context.wordAtPosition}`;
  }

  private getCachedCompletions(cacheKey: string): CompletionItem[] | null {
    if (Date.now() - this.lastCacheUpdate > this.config.cacheTimeout) {
      this.completionCache.clear();
      this.lastCacheUpdate = Date.now();
      return null;
    }
    
    return this.completionCache.get(cacheKey) || null;
  }

  private cacheCompletions(cacheKey: string, completions: CompletionItem[]): void {
    this.completionCache.set(cacheKey, completions);
  }

  private calculateFuzzyMatch(search: string, target: string): number {
    if (search.length === 0) return 0.1;
    if (target.startsWith(search)) return 1.0;
    if (target.includes(search)) return 0.8;
    
    // Levenshtein distance for fuzzy matching
    const distance = this.levenshteinDistance(search, target);
    const maxLength = Math.max(search.length, target.length);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    for (let i = 0; i <= a.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= b.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[b.length][a.length];
  }

  private getUsageFrequency(label: string): number {
    const usage = this.usageHistory.get(label) || 0;
    const maxUsage = Math.max(...Array.from(this.usageHistory.values()));
    return maxUsage > 0 ? usage / maxUsage : 0;
  }

  private calculateSafetyScore(completion: CompletionItem): number {
    // Higher score for safer operations
    if (completion.kind === CompletionItemKind.AI_SAFETY) return 1.0;
    if (completion.kind === CompletionItemKind.AI_OVERSIGHT) return 0.9;
    if (completion.kind === CompletionItemKind.QUANTUM_STATE) return 0.8;
    return 0.7;
  }

  private calculatePerformanceScore(completion: CompletionItem): number {
    // Score based on expected performance impact
    if (completion.kind === CompletionItemKind.KEYWORD) return 1.0;
    if (completion.kind === CompletionItemKind.VARIABLE) return 0.9;
    if (completion.kind === CompletionItemKind.QUANTUM_MEASUREMENT) return 0.6; // Expensive
    return 0.8;
  }

  private getCompletionKindForType(type: InferredType): CompletionItemKind {
    switch (type.kind) {
      case 'quantum': return CompletionItemKind.QUANTUM_VARIABLE;
      case 'ai': return CompletionItemKind.AI_MODEL;
      case 'primitive': return CompletionItemKind.VARIABLE;
      case 'compound': return CompletionItemKind.STRUCT;
      default: return CompletionItemKind.VARIABLE;
    }
  }

  private trackCompletionContext(context: CompletionContext): void {
    // Track usage for frequency scoring
    const contextKey = `${context.triggerKind}:${context.wordAtPosition}`;
    const currentUsage = this.usageHistory.get(contextKey) || 0;
    this.usageHistory.set(contextKey, currentUsage + 1);
  }

  /**
   * Clear caches and reset state
   */
  public reset(): void {
    this.completionCache.clear();
    this.usageHistory.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Get completion statistics
   */
  public getStatistics(): {
    cacheSize: number;
    usageEntries: number;
    lastUpdate: number;
  } {
    return {
      cacheSize: this.completionCache.size,
      usageEntries: this.usageHistory.size,
      lastUpdate: this.lastCacheUpdate
    };
  }
}

// Export singleton instance
export const singularisCompletionEngine = new SingularisCompletionEngine();