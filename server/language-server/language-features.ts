/**
 * SINGULARIS PRIME Language Features Engine
 * 
 * This module provides advanced language features for the SINGULARIS PRIME LSP server,
 * including hover information, go-to-definition, find references, symbol search,
 * and quantum-aware navigation with distributed system support.
 * 
 * Features:
 * - Quantum-aware hover information with state details
 * - Go-to-definition across quantum entangled systems
 * - Find references with entanglement relationship tracking
 * - Symbol search with quantum state and AI entity filtering
 * - Code folding for complex quantum operations
 * - Rename support with quantum coherence preservation
 * - Document symbols with hierarchical quantum structure
 */

import { EventEmitter } from 'events';
import {
  Position,
  Range,
  Location,
  Hover,
  MarkupContent,
  MarkupKind
} from './lsp-server';
import {
  SingularisTypeChecker,
  TypeContext,
  InferredType,
  ASTNode,
  SourceLocation
} from '../language/type-checker';
import {
  QuantumReferenceId,
  QuantumState,
  QuantumDimension,
  EntangledSystem,
  CoherenceStatus,
  MeasurementStatus,
  isQubit,
  isQudit,
  isEntangled,
  isCoherent
} from '../../shared/types/quantum-types';
import {
  AIEntityId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality,
  AIContract,
  AIEntity,
  isHighExplainability
} from '../../shared/types/ai-types';
import { singularisExplainabilityEngine } from './explainability-engine';

// Document symbol types
export interface DocumentSymbol {
  readonly name: string;
  readonly detail?: string;
  readonly kind: SymbolKind;
  readonly range: Range;
  readonly selectionRange: Range;
  readonly children?: DocumentSymbol[];
  readonly metadata?: SymbolMetadata;
}

export enum SymbolKind {
  FILE = 1,
  MODULE = 2,
  NAMESPACE = 3,
  PACKAGE = 4,
  CLASS = 5,
  METHOD = 6,
  PROPERTY = 7,
  FIELD = 8,
  CONSTRUCTOR = 9,
  ENUM = 10,
  INTERFACE = 11,
  FUNCTION = 12,
  VARIABLE = 13,
  CONSTANT = 14,
  STRING = 15,
  NUMBER = 16,
  BOOLEAN = 17,
  ARRAY = 18,
  OBJECT = 19,
  KEY = 20,
  NULL = 21,
  ENUM_MEMBER = 22,
  STRUCT = 23,
  EVENT = 24,
  OPERATOR = 25,
  TYPE_PARAMETER = 26,
  
  // SINGULARIS PRIME specific symbols
  QUANTUM_STATE = 100,
  QUANTUM_GATE = 101,
  QUANTUM_MEASUREMENT = 102,
  AI_ENTITY = 103,
  AI_CONTRACT = 104,
  GLYPH = 105,
  PARADOX_RESOLVER = 106,
  DISTRIBUTED_NODE = 107
}

// Symbol metadata for enhanced information
export interface SymbolMetadata {
  readonly quantumInfo?: QuantumSymbolInfo;
  readonly aiInfo?: AISymbolInfo;
  readonly glyphInfo?: GlyphSymbolInfo;
  readonly distributedInfo?: DistributedSymbolInfo;
  readonly explainabilityScore?: ExplainabilityScore;
  readonly lastModified: number;
}

export interface QuantumSymbolInfo {
  readonly quantumId: QuantumReferenceId;
  readonly dimension: QuantumDimension;
  readonly coherenceStatus: CoherenceStatus;
  readonly entanglementPartners: QuantumReferenceId[];
  readonly measurementHistory: MeasurementRecord[];
}

export interface MeasurementRecord {
  readonly timestamp: number;
  readonly result: any;
  readonly probability: number;
}

export interface AISymbolInfo {
  readonly entityId: AIEntityId;
  readonly explainabilityScore: ExplainabilityScore;
  readonly oversightLevel: HumanOversightLevel;
  readonly activeContracts: string[];
  readonly safetyMetrics: AISafetyMetrics;
}

export interface AISafetyMetrics {
  readonly complianceScore: number;
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly lastVerification: number;
}

export interface GlyphSymbolInfo {
  readonly glyphId: string;
  readonly dimensions: number;
  readonly boundQuantumStates: QuantumReferenceId[];
  readonly spatialMapping: SpatialMapping;
}

export interface SpatialMapping {
  readonly coordinates: number[];
  readonly transformations: string[];
  readonly animationState: string;
}

export interface DistributedSymbolInfo {
  readonly nodeId: string;
  readonly channelId?: string;
  readonly sessionId?: string;
  readonly networkLatency: number;
  readonly coherenceBudget: number;
}

// Reference information
export interface ReferenceContext {
  readonly uri: string;
  readonly range: Range;
  readonly isDefinition: boolean;
  readonly isDeclaration: boolean;
  readonly isAssignment: boolean;
  readonly contextType: 'quantum' | 'ai' | 'glyph' | 'generic';
  readonly metadata?: ReferenceMetadata;
}

export interface ReferenceMetadata {
  readonly usage: 'read' | 'write' | 'modify' | 'measure' | 'entangle';
  readonly impact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  readonly quantumSafety?: boolean;
  readonly explainabilityImpact?: number;
}

// Workspace symbol information
export interface WorkspaceSymbol {
  readonly name: string;
  readonly kind: SymbolKind;
  readonly location: Location;
  readonly containerName?: string;
  readonly metadata?: SymbolMetadata;
}

// Code action types
export interface CodeAction {
  readonly title: string;
  readonly kind?: CodeActionKind;
  readonly diagnostics?: any[];
  readonly isPreferred?: boolean;
  readonly edit?: WorkspaceEdit;
  readonly command?: Command;
}

export enum CodeActionKind {
  EMPTY = '',
  QUICK_FIX = 'quickfix',
  REFACTOR = 'refactor',
  REFACTOR_EXTRACT = 'refactor.extract',
  REFACTOR_INLINE = 'refactor.inline',
  REFACTOR_REWRITE = 'refactor.rewrite',
  SOURCE = 'source',
  SOURCE_ORGANIZE_IMPORTS = 'source.organizeImports',
  
  // SINGULARIS PRIME specific actions
  QUANTUM_OPTIMIZE = 'singularis.quantum.optimize',
  AI_EXPLAINABILITY = 'singularis.ai.explainability',
  GLYPH_VISUALIZATION = 'singularis.glyph.visualization',
  PARADOX_RESOLVE = 'singularis.paradox.resolve'
}

export interface WorkspaceEdit {
  readonly changes?: Map<string, TextEdit[]>;
  readonly documentChanges?: TextDocumentEdit[];
}

export interface TextDocumentEdit {
  readonly textDocument: { uri: string; version: number; };
  readonly edits: TextEdit[];
}

export interface TextEdit {
  readonly range: Range;
  readonly newText: string;
}

export interface Command {
  readonly title: string;
  readonly command: string;
  readonly arguments?: any[];
}

// Language features configuration
export interface LanguageFeaturesConfig {
  readonly enableHover: boolean;
  readonly enableDefinition: boolean;
  readonly enableReferences: boolean;
  readonly enableSymbols: boolean;
  readonly enableCodeActions: boolean;
  readonly enableQuantumFeatures: boolean;
  readonly enableAIFeatures: boolean;
  readonly enableExplainability: boolean;
  readonly maxSymbolsPerDocument: number;
  readonly cacheTimeout: number; // milliseconds
}

/**
 * Language Features Engine for SINGULARIS PRIME
 */
export class SingularisLanguageFeatures extends EventEmitter {
  private typeChecker: SingularisTypeChecker;
  private config: LanguageFeaturesConfig;
  private symbolCache: Map<string, DocumentSymbol[]> = new Map();
  private definitionCache: Map<string, Location[]> = new Map();
  private referenceCache: Map<string, ReferenceContext[]> = new Map();
  private lastCacheUpdate: number = 0;

  constructor(config: Partial<LanguageFeaturesConfig> = {}) {
    super();
    
    this.typeChecker = new SingularisTypeChecker();
    this.config = {
      enableHover: true,
      enableDefinition: true,
      enableReferences: true,
      enableSymbols: true,
      enableCodeActions: true,
      enableQuantumFeatures: true,
      enableAIFeatures: true,
      enableExplainability: true,
      maxSymbolsPerDocument: 1000,
      cacheTimeout: 60000, // 1 minute
      ...config
    };
  }

  /**
   * Provide hover information for position
   */
  public async provideHover(uri: string, position: Position, content?: string): Promise<Hover | null> {
    try {
      if (!this.config.enableHover) return null;
      
      const wordInfo = this.getWordAtPosition(content || '', position);
      if (!wordInfo) return null;
      
      const { word, range } = wordInfo;
      
      // Get type information
      const typeContext = this.typeChecker.getContext();
      
      // Check for quantum states
      if (this.config.enableQuantumFeatures) {
        const quantumHover = await this.provideQuantumHover(word, typeContext);
        if (quantumHover) return quantumHover;
      }
      
      // Check for AI entities
      if (this.config.enableAIFeatures) {
        const aiHover = await this.provideAIHover(word, typeContext);
        if (aiHover) return aiHover;
      }
      
      // Check for variables and functions
      const variableHover = this.provideVariableHover(word, typeContext);
      if (variableHover) return variableHover;
      
      // Check for keywords
      const keywordHover = this.provideKeywordHover(word);
      if (keywordHover) return keywordHover;
      
      return null;
      
    } catch (error) {
      console.error('[LanguageFeatures] Error providing hover:', error);
      return null;
    }
  }

  /**
   * Provide quantum-specific hover information
   */
  private async provideQuantumHover(word: string, context: TypeContext): Promise<Hover | null> {
    // Check if it's a quantum state
    for (const [stateId, state] of context.quantumStates) {
      if (stateId === word) {
        const dimension = state.dimension || QuantumDimension.QUBIT;
        const coherenceStatus = state.coherence || CoherenceStatus.COHERENT;
        const measurementStatus = state.measurement || MeasurementStatus.UNMEASURED;
        
        // Check for entanglement
        const entangledPartners: string[] = [];
        for (const [, entanglement] of context.entanglements) {
          if (entanglement.participants.includes(stateId as QuantumReferenceId)) {
            entangledPartners.push(...entanglement.participants.filter(p => p !== stateId));
          }
        }
        
        let markdownContent = `**Quantum State: ${word}**\n\n`;
        markdownContent += `- **Dimension**: ${dimension}D ${dimension === QuantumDimension.QUBIT ? '(Qubit)' : `(Qudit-${dimension})`}\n`;
        markdownContent += `- **Coherence**: ${coherenceStatus}\n`;
        markdownContent += `- **Measurement**: ${measurementStatus}\n`;
        
        if (entangledPartners.length > 0) {
          markdownContent += `- **Entangled with**: ${entangledPartners.join(', ')}\n`;
          markdownContent += `- ⚠️ **Note**: Measuring this state will affect entangled partners\n`;
        }
        
        markdownContent += `\n---\n*Quantum states exist in superposition until measured*`;
        
        // Get explainability information if available
        if (this.config.enableExplainability) {
          try {
            const explanation = await singularisExplainabilityEngine.explainConstruct(
              `quantum state ${word}`,
              { line: 1, column: 1 },
              {
                quantumStates: [stateId as QuantumReferenceId],
                currentCoherence: coherenceStatus
              }
            );
            
            if (explanation.explainabilityScore >= 0.7) {
              markdownContent += `\n\n**Explanation**: ${explanation.formats.summary}`;
            }
          } catch (error) {
            // Explanation generation failed, continue without it
          }
        }
        
        return {
          contents: {
            kind: MarkupKind.MARKDOWN,
            value: markdownContent
          }
        };
      }
    }
    
    // Check for quantum operations
    if (['qubit', 'qudit', 'entangle', 'measure', 'teleport'].includes(word)) {
      return this.provideQuantumOperationHover(word);
    }
    
    return null;
  }

  /**
   * Provide AI-specific hover information
   */
  private async provideAIHover(word: string, context: TypeContext): Promise<Hover | null> {
    // Check if it's an AI entity
    for (const [entityId, entity] of context.aiEntities) {
      if (entityId === word) {
        let markdownContent = `**AI Entity: ${word}**\n\n`;
        markdownContent += `- **Type**: ${entity.modelType}\n`;
        markdownContent += `- **Explainability**: ${entity.explainabilityScore} ${entity.explainabilityScore >= 0.85 ? '✓' : '⚠️'}\n`;
        markdownContent += `- **Oversight**: ${entity.oversightLevel}\n`;
        markdownContent += `- **Safety Rating**: ${entity.safetyRating.overall}\n`;
        
        if (!isHighExplainability(entity.explainabilityScore)) {
          markdownContent += `\n⚠️ **Warning**: Low explainability score. Human oversight recommended.`;
        }
        
        markdownContent += `\n\n---\n*AI entities must meet explainability thresholds (≥0.85)*`;
        
        return {
          contents: {
            kind: MarkupKind.MARKDOWN,
            value: markdownContent
          }
        };
      }
    }
    
    // Check for AI operations
    if (['aiContract', 'aiDecision', 'aiEntity', 'aiVerify'].includes(word)) {
      return this.provideAIOperationHover(word);
    }
    
    return null;
  }

  /**
   * Provide variable hover information
   */
  private provideVariableHover(word: string, context: TypeContext): Hover | null {
    const variable = context.variables.get(word);
    if (variable) {
      let markdownContent = `**Variable: ${word}**\n\n`;
      markdownContent += `- **Type**: ${variable.name} (${variable.kind})\n`;
      
      if (variable.constraints.length > 0) {
        markdownContent += `- **Constraints**: ${variable.constraints.map(c => c.description).join(', ')}\n`;
      }
      
      if (variable.dependencies.length > 0) {
        markdownContent += `- **Dependencies**: ${variable.dependencies.map(d => d.dependentOn).join(', ')}\n`;
      }
      
      return {
        contents: {
          kind: MarkupKind.MARKDOWN,
          value: markdownContent
        }
      };
    }
    
    return null;
  }

  /**
   * Provide keyword hover information
   */
  private provideKeywordHover(word: string): Hover | null {
    const keywordInfo: Record<string, string> = {
      'quantumKey': 'Creates quantum encryption key using QKD protocol',
      'qubit': 'Creates 2-dimensional quantum state (0|⟩, 1|⟩, or superposition)',
      'qudit': 'Creates d-dimensional quantum state where d > 2',
      'entangle': 'Creates quantum entanglement between states',
      'measure': 'Collapses quantum superposition to classical state',
      'teleport': 'Transfers quantum state using entanglement',
      'aiContract': 'Creates AI agreement with safety constraints',
      'aiEntity': 'Defines AI model with capabilities and limitations',
      'aiDecision': 'Makes explainable AI decision with confidence scoring',
      'glyph': 'Creates multi-dimensional visualization construct',
      'bind': 'Binds glyph to quantum state for visualization'
    };
    
    const info = keywordInfo[word];
    if (info) {
      return {
        contents: {
          kind: MarkupKind.MARKDOWN,
          value: `**${word}**: ${info}`
        }
      };
    }
    
    return null;
  }

  /**
   * Provide quantum operation hover details
   */
  private provideQuantumOperationHover(operation: string): Hover {
    const operationInfo: Record<string, string> = {
      'qubit': `**Qubit Creation**
      
Creates a 2-dimensional quantum state that can exist in:
- |0⟩ state (classical 0)
- |1⟩ state (classical 1)  
- Superposition: α|0⟩ + β|1⟩

⚠️ **Quantum Properties**:
- No-cloning theorem: Cannot be copied
- Measurement collapses superposition
- Can be entangled with other qubits`,

      'entangle': `**Quantum Entanglement**
      
Creates quantum correlation between states:
- Particles remain correlated regardless of distance
- Measuring one instantly affects the other
- Foundation for quantum cryptography and teleportation

⚠️ **Important**: Entanglement is fragile and can be destroyed by decoherence`,

      'measure': `**Quantum Measurement**
      
Collapses quantum superposition to definite value:
- Irreversibly changes quantum state
- Result is probabilistic based on amplitudes
- Destroys superposition (measurement problem)

⚠️ **Caution**: Measurement cannot be undone`
    };
    
    return {
      contents: {
        kind: MarkupKind.MARKDOWN,
        value: operationInfo[operation] || `**${operation}**: Quantum operation`
      }
    };
  }

  /**
   * Provide AI operation hover details
   */
  private provideAIOperationHover(operation: string): Hover {
    const operationInfo: Record<string, string> = {
      'aiContract': `**AI Contract**
      
Creates safety-constrained agreement between AI entities:
- Enforces explainability thresholds (≥85%)
- Requires human oversight for critical operations
- Includes audit trail and compliance checking
- Defines fallback procedures for failures`,

      'aiDecision': `**AI Decision**
      
Makes explainable AI decision with transparency:
- Includes confidence scoring and reasoning
- Must meet explainability requirements
- Provides alternative options analysis
- Supports human review and override`
    };
    
    return {
      contents: {
        kind: MarkupKind.MARKDOWN,
        value: operationInfo[operation] || `**${operation}**: AI operation`
      }
    };
  }

  /**
   * Find definition locations
   */
  public async provideDefinition(uri: string, position: Position, content?: string): Promise<Location[]> {
    try {
      if (!this.config.enableDefinition) return [];
      
      const wordInfo = this.getWordAtPosition(content || '', position);
      if (!wordInfo) return [];
      
      const { word } = wordInfo;
      const cacheKey = `${uri}:${word}:${position.line}:${position.character}`;
      
      // Check cache
      const cached = this.definitionCache.get(cacheKey);
      if (cached && this.isCacheValid()) {
        return cached;
      }
      
      const definitions: Location[] = [];
      const typeContext = this.typeChecker.getContext();
      
      // Find quantum state definitions
      if (this.config.enableQuantumFeatures) {
        for (const [stateId] of typeContext.quantumStates) {
          if (stateId === word) {
            // In a real implementation, this would track the actual definition location
            definitions.push({
              uri,
              range: { start: { line: 0, character: 0 }, end: { line: 0, character: word.length } }
            });
          }
        }
      }
      
      // Find AI entity definitions
      if (this.config.enableAIFeatures) {
        for (const [entityId] of context.aiEntities) {
          if (entityId === word) {
            definitions.push({
              uri,
              range: { start: { line: 0, character: 0 }, end: { line: 0, character: word.length } }
            });
          }
        }
      }
      
      // Cache results
      this.definitionCache.set(cacheKey, definitions);
      
      return definitions;
      
    } catch (error) {
      console.error('[LanguageFeatures] Error providing definition:', error);
      return [];
    }
  }

  /**
   * Find all references
   */
  public async provideReferences(uri: string, position: Position, content?: string, includeDeclaration = false): Promise<ReferenceContext[]> {
    try {
      if (!this.config.enableReferences) return [];
      
      const wordInfo = this.getWordAtPosition(content || '', position);
      if (!wordInfo) return [];
      
      const { word } = wordInfo;
      const cacheKey = `${uri}:${word}:references:${includeDeclaration}`;
      
      // Check cache
      const cached = this.referenceCache.get(cacheKey);
      if (cached && this.isCacheValid()) {
        return cached;
      }
      
      const references: ReferenceContext[] = [];
      
      // Find references in the document (simplified implementation)
      if (content) {
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let index = line.indexOf(word);
          while (index !== -1) {
            const usage = this.determineUsageType(line, index, word);
            references.push({
              uri,
              range: {
                start: { line: i, character: index },
                end: { line: i, character: index + word.length }
              },
              isDefinition: usage === 'definition',
              isDeclaration: usage === 'declaration',
              isAssignment: usage === 'assignment',
              contextType: this.determineContextType(line),
              metadata: {
                usage: this.mapUsageToMetadata(usage),
                impact: this.calculateImpact(line, word),
                quantumSafety: this.checkQuantumSafety(line, word)
              }
            });
            
            index = line.indexOf(word, index + 1);
          }
        }
      }
      
      // Cache results
      this.referenceCache.set(cacheKey, references);
      
      return references;
      
    } catch (error) {
      console.error('[LanguageFeatures] Error providing references:', error);
      return [];
    }
  }

  /**
   * Provide document symbols
   */
  public async provideDocumentSymbols(uri: string, content: string): Promise<DocumentSymbol[]> {
    try {
      if (!this.config.enableSymbols) return [];
      
      const cacheKey = `${uri}:symbols`;
      const cached = this.symbolCache.get(cacheKey);
      if (cached && this.isCacheValid()) {
        return cached;
      }
      
      const symbols: DocumentSymbol[] = [];
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length && symbols.length < this.config.maxSymbolsPerDocument; i++) {
        const line = lines[i].trim();
        
        // Find quantum state declarations
        if (this.config.enableQuantumFeatures) {
          const quantumMatch = line.match(/(?:let|const|var)\s+(\w+)\s*=\s*(qubit|qudit)/);
          if (quantumMatch) {
            const [, name, type] = quantumMatch;
            symbols.push({
              name,
              kind: SymbolKind.QUANTUM_STATE,
              detail: `Quantum ${type}`,
              range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
              selectionRange: { start: { line: i, character: line.indexOf(name) }, end: { line: i, character: line.indexOf(name) + name.length } },
              metadata: {
                quantumInfo: {
                  quantumId: name as QuantumReferenceId,
                  dimension: type === 'qubit' ? QuantumDimension.QUBIT : QuantumDimension.QUDIT_3,
                  coherenceStatus: CoherenceStatus.COHERENT,
                  entanglementPartners: [],
                  measurementHistory: []
                },
                lastModified: Date.now()
              }
            });
          }
        }
        
        // Find AI entity declarations
        if (this.config.enableAIFeatures) {
          const aiMatch = line.match(/(?:let|const|var)\s+(\w+)\s*=\s*aiEntity/);
          if (aiMatch) {
            const [, name] = aiMatch;
            symbols.push({
              name,
              kind: SymbolKind.AI_ENTITY,
              detail: 'AI Entity',
              range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
              selectionRange: { start: { line: i, character: line.indexOf(name) }, end: { line: i, character: line.indexOf(name) + name.length } },
              metadata: {
                aiInfo: {
                  entityId: name as AIEntityId,
                  explainabilityScore: 0.85 as ExplainabilityScore,
                  oversightLevel: HumanOversightLevel.NOTIFICATION,
                  activeContracts: [],
                  safetyMetrics: {
                    complianceScore: 0.9,
                    riskLevel: 'low',
                    lastVerification: Date.now()
                  }
                },
                lastModified: Date.now()
              }
            });
          }
        }
        
        // Find function declarations
        const functionMatch = line.match(/function\s+(\w+)/);
        if (functionMatch) {
          const [, name] = functionMatch;
          symbols.push({
            name,
            kind: SymbolKind.FUNCTION,
            range: { start: { line: i, character: 0 }, end: { line: i, character: line.length } },
            selectionRange: { start: { line: i, character: line.indexOf(name) }, end: { line: i, character: line.indexOf(name) + name.length } },
            metadata: {
              lastModified: Date.now()
            }
          });
        }
      }
      
      // Cache results
      this.symbolCache.set(cacheKey, symbols);
      
      return symbols;
      
    } catch (error) {
      console.error('[LanguageFeatures] Error providing document symbols:', error);
      return [];
    }
  }

  /**
   * Utility methods
   */
  private getWordAtPosition(content: string, position: Position): { word: string; range: Range; } | null {
    const lines = content.split('\n');
    if (position.line >= lines.length) return null;
    
    const line = lines[position.line];
    if (position.character >= line.length) return null;
    
    // Find word boundaries
    let start = position.character;
    let end = position.character;
    
    // Move start backward to find word start
    while (start > 0 && /\w/.test(line[start - 1])) {
      start--;
    }
    
    // Move end forward to find word end
    while (end < line.length && /\w/.test(line[end])) {
      end++;
    }
    
    if (start === end) return null;
    
    const word = line.substring(start, end);
    const range = {
      start: { line: position.line, character: start },
      end: { line: position.line, character: end }
    };
    
    return { word, range };
  }

  private determineUsageType(line: string, index: number, word: string): 'definition' | 'declaration' | 'assignment' | 'reference' {
    const beforeWord = line.substring(0, index).trim();
    const afterWord = line.substring(index + word.length).trim();
    
    if (beforeWord.endsWith('let') || beforeWord.endsWith('const') || beforeWord.endsWith('var')) {
      return 'declaration';
    } else if (afterWord.startsWith('=') && !afterWord.startsWith('==') && !afterWord.startsWith('===')) {
      return 'assignment';
    } else if (beforeWord.includes('function')) {
      return 'definition';
    }
    
    return 'reference';
  }

  private determineContextType(line: string): 'quantum' | 'ai' | 'glyph' | 'generic' {
    if (line.includes('qubit') || line.includes('qudit') || line.includes('entangle') || line.includes('measure')) {
      return 'quantum';
    } else if (line.includes('aiEntity') || line.includes('aiContract') || line.includes('aiDecision')) {
      return 'ai';
    } else if (line.includes('glyph') || line.includes('bind')) {
      return 'glyph';
    }
    return 'generic';
  }

  private mapUsageToMetadata(usage: string): 'read' | 'write' | 'modify' | 'measure' | 'entangle' {
    switch (usage) {
      case 'assignment': return 'write';
      case 'definition': 
      case 'declaration': return 'write';
      default: return 'read';
    }
  }

  private calculateImpact(line: string, word: string): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (line.includes('measure')) return 'critical'; // Quantum measurement is irreversible
    if (line.includes('entangle')) return 'high'; // Entanglement affects multiple states
    if (line.includes('aiDecision')) return 'medium'; // AI decisions have implications
    return 'low';
  }

  private checkQuantumSafety(line: string, word: string): boolean {
    // Check for quantum safety violations
    if (line.includes('clone') && (line.includes('qubit') || line.includes('qudit'))) {
      return false; // No-cloning theorem violation
    }
    return true;
  }

  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.config.cacheTimeout;
  }

  /**
   * Public utility methods
   */
  public reset(): void {
    this.symbolCache.clear();
    this.definitionCache.clear();
    this.referenceCache.clear();
    this.lastCacheUpdate = 0;
  }

  public getStatistics(): {
    symbolsCached: number;
    definitionsCached: number;
    referencesCached: number;
  } {
    return {
      symbolsCached: this.symbolCache.size,
      definitionsCached: this.definitionCache.size,
      referencesCached: this.referenceCache.size
    };
  }
}

// Export singleton instance
export const singularisLanguageFeatures = new SingularisLanguageFeatures();