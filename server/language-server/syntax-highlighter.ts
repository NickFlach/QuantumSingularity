/**
 * SINGULARIS PRIME Enhanced Syntax Highlighter
 * 
 * This module provides advanced syntax highlighting for the SINGULARIS PRIME language,
 * with specialized support for quantum operations, glyph constructs, AI annotations,
 * and dynamic theme adaptation based on quantum coherence and AI safety states.
 * 
 * Features:
 * - Quantum token recognition and semantic highlighting
 * - Glyph syntax support with multi-dimensional visualization hints
 * - AI annotation highlighting with explainability indicators
 * - Dynamic theme adaptation based on system state
 * - Performance-optimized tokenization for large quantum codebases
 */

import {
  QuantumReferenceId,
  QuantumState,
  CoherenceStatus,
  MeasurementStatus
} from '../../shared/types/quantum-types';
import {
  AIEntity,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality
} from '../../shared/types/ai-types';
import { QuantumDimension, QuantumOperationType } from '../../shared/schema';
import { DocumentState } from './lsp-server';

// Token types for syntax highlighting
export enum TokenType {
  // Basic language constructs
  KEYWORD = 'keyword',
  IDENTIFIER = 'identifier',
  OPERATOR = 'operator',
  LITERAL = 'literal',
  STRING = 'string',
  NUMBER = 'number',
  COMMENT = 'comment',
  PUNCTUATION = 'punctuation',
  
  // Quantum-specific tokens
  QUANTUM_STATE = 'quantum.state',
  QUANTUM_GATE = 'quantum.gate',
  QUANTUM_MEASUREMENT = 'quantum.measurement',
  QUANTUM_ENTANGLEMENT = 'quantum.entanglement',
  QUANTUM_DIMENSION = 'quantum.dimension',
  QUANTUM_OPERATION = 'quantum.operation',
  QUANTUM_VARIABLE = 'quantum.variable',
  QUANTUM_HANDLE = 'quantum.handle',
  QUANTUM_BORROW = 'quantum.borrow',
  
  // Glyph-specific tokens
  GLYPH_IDENTIFIER = 'glyph.identifier',
  GLYPH_BINDING = 'glyph.binding',
  GLYPH_SPACE = 'glyph.space',
  GLYPH_TRANSFORM = 'glyph.transform',
  GLYPH_PATTERN = 'glyph.pattern',
  GLYPH_DIMENSION = 'glyph.dimension',
  GLYPH_COORDINATE = 'glyph.coordinate',
  GLYPH_ANIMATION = 'glyph.animation',
  
  // AI-specific tokens
  AI_CONTRACT = 'ai.contract',
  AI_MODEL = 'ai.model',
  AI_VERIFICATION = 'ai.verification',
  AI_EXPLAINABILITY = 'ai.explainability',
  AI_OVERSIGHT = 'ai.oversight',
  AI_ANNOTATION = 'ai.annotation',
  AI_SAFETY = 'ai.safety',
  AI_DECISION = 'ai.decision',
  
  // Paradox and resolution tokens
  PARADOX_RESOLVER = 'paradox.resolver',
  PARADOX_DETECTION = 'paradox.detection',
  TEMPORAL_DEPENDENCY = 'temporal.dependency',
  RECURSIVE_PATTERN = 'recursive.pattern',
  
  // Distributed quantum tokens
  DISTRIBUTED_NODE = 'distributed.node',
  DISTRIBUTED_CHANNEL = 'distributed.channel',
  DISTRIBUTED_SESSION = 'distributed.session',
  DISTRIBUTED_OPERATION = 'distributed.operation',
  EPR_PAIR = 'distributed.epr',
  
  // Special annotation tokens
  ANNOTATION_CRITICAL = 'annotation.critical',
  ANNOTATION_WARNING = 'annotation.warning',
  ANNOTATION_INFO = 'annotation.info',
  ANNOTATION_HINT = 'annotation.hint',
  
  // Type system tokens
  TYPE_QUANTUM = 'type.quantum',
  TYPE_CLASSICAL = 'type.classical',
  TYPE_HYBRID = 'type.hybrid',
  TYPE_GLYPH = 'type.glyph',
  TYPE_AI = 'type.ai'
}

// Token modification flags
export enum TokenModifier {
  DEPRECATED = 'deprecated',
  READONLY = 'readonly',
  STATIC = 'static',
  ASYNC = 'async',
  MODIFICATION = 'modification',
  DOCUMENTATION = 'documentation',
  DEFAULT_LIBRARY = 'defaultLibrary',
  
  // Quantum-specific modifiers
  ENTANGLED = 'entangled',
  MEASURED = 'measured',
  COHERENT = 'coherent',
  DECOHERENT = 'decoherent',
  HIGH_DIMENSIONAL = 'highDimensional',
  DISTRIBUTED = 'distributed',
  
  // AI-specific modifiers
  EXPLAINABLE = 'explainable',
  REQUIRES_OVERSIGHT = 'requiresOversight',
  HIGH_CONFIDENCE = 'highConfidence',
  LOW_CONFIDENCE = 'lowConfidence',
  SAFETY_CRITICAL = 'safetyCritical',
  
  // Glyph-specific modifiers
  MULTI_DIMENSIONAL = 'multiDimensional',
  ANIMATED = 'animated',
  INTERACTIVE = 'interactive',
  BOUND = 'bound',
  UNBOUND = 'unbound'
}

// Highlighting theme configuration
export interface HighlightingTheme {
  name: string;
  baseTheme: 'light' | 'dark';
  quantumCoherenceIndicator: boolean;
  aiSafetyIndicator: boolean;
  glyphVisualization: boolean;
  performanceIndicators: boolean;
  
  colors: {
    [TokenType.QUANTUM_STATE]: string;
    [TokenType.QUANTUM_GATE]: string;
    [TokenType.QUANTUM_MEASUREMENT]: string;
    [TokenType.GLYPH_IDENTIFIER]: string;
    [TokenType.AI_CONTRACT]: string;
    [TokenType.AI_EXPLAINABILITY]: string;
    [TokenType.PARADOX_RESOLVER]: string;
    [TokenType.DISTRIBUTED_NODE]: string;
    [key: string]: string;
  };
  
  modifierStyles: {
    [TokenModifier.ENTANGLED]: {
      textDecoration?: string;
      backgroundColor?: string;
      border?: string;
    };
    [TokenModifier.REQUIRES_OVERSIGHT]: {
      textDecoration?: string;
      backgroundColor?: string;
      border?: string;
    };
    [key: string]: {
      textDecoration?: string;
      backgroundColor?: string;
      border?: string;
      opacity?: number;
    };
  };
}

// Token position and metadata
export interface Token {
  line: number;
  startCharacter: number;
  length: number;
  tokenType: TokenType;
  tokenModifiers: TokenModifier[];
  metadata?: {
    quantumId?: QuantumReferenceId;
    explainabilityScore?: ExplainabilityScore;
    coherenceStatus?: CoherenceStatus;
    oversightLevel?: HumanOversightLevel;
    glyphId?: string;
    aiEntityId?: string;
    distributedNodeId?: string;
  };
}

// Semantic highlighting information
export interface SemanticHighlighting {
  tokens: Token[];
  legend: {
    tokenTypes: string[];
    tokenModifiers: string[];
  };
  version: number;
}

// Quantum coherence-based theme adaptation
export interface CoherenceThemeState {
  averageCoherence: number;
  decoherenceRate: number;
  entanglementStrength: number;
  measurementProbability: number;
}

// AI safety-based theme adaptation
export interface AISafetyThemeState {
  averageExplainability: ExplainabilityScore;
  oversightRequirements: HumanOversightLevel;
  safetyViolations: number;
  complianceScore: number;
}

/**
 * Enhanced Syntax Highlighter for SINGULARIS PRIME
 */
export class SingularisSyntaxHighlighter {
  private themes: Map<string, HighlightingTheme> = new Map();
  private currentTheme: string = 'quantum-default';
  private tokenCache: Map<string, Token[]> = new Map();
  private coherenceState: CoherenceThemeState = {
    averageCoherence: 1.0,
    decoherenceRate: 0.0,
    entanglementStrength: 0.0,
    measurementProbability: 0.0
  };
  private aiSafetyState: AISafetyThemeState = {
    averageExplainability: 0.85 as ExplainabilityScore,
    oversightRequirements: HumanOversightLevel.NONE,
    safetyViolations: 0,
    complianceScore: 1.0
  };
  
  // Language patterns for tokenization
  private patterns = {
    quantum: {
      keywords: [
        'quantumKey', 'qubit', 'qutrit', 'qudit', 'entangle', 'measure',
        'superposition', 'coherence', 'decoherence', 'teleport', 'bell',
        'hadamard', 'cnot', 'pauli', 'rotation', 'phase', 'amplitude',
        'fidelity', 'purity', 'density', 'evolution', 'hamiltonian'
      ],
      operations: [
        'createState', 'applyGate', 'measureState', 'entangleStates',
        'teleportState', 'evolveSystem', 'purifyState', 'correctErrors',
        'mitigateErrors', 'optimizeCircuit', 'simulateEvolution'
      ],
      handles: [
        'QuantumHandle', 'QuantumBorrowHandle', 'move', 'borrow', 'release'
      ]
    },
    
    glyph: {
      keywords: [
        'glyph', 'bind', 'unbind', 'transform', 'animate', 'space',
        'coordinate', 'dimension', 'pattern', 'composition', 'interaction'
      ],
      operations: [
        'createGlyph', 'bindToQuantum', 'transformGlyph', 'animateGlyph',
        'composeGlyphs', 'optimizeGlyph', 'renderGlyph', 'interactiveGlyph'
      ],
      spaces: [
        'GlyphSpace', 'NDimensionalSpace', 'QuantumGlyphSpace',
        'InteractiveSpace', 'AnimatedSpace'
      ]
    },
    
    ai: {
      keywords: [
        'contract', 'deployModel', 'aiEntity', 'explainability', 'oversight',
        'verification', 'compliance', 'safety', 'decision', 'confidence'
      ],
      annotations: [
        '@Explainable', '@RequiresOversight', '@SafetyCritical', '@HighConfidence',
        '@LowConfidence', '@HumanApproval', '@QuantumSafe', '@DistributedSafe'
      ],
      verification: [
        'verifyExplainability', 'checkOversight', 'validateSafety',
        'assessCompliance', 'auditDecision', 'monitorConfidence'
      ]
    },
    
    paradox: {
      keywords: [
        'paradox', 'resolver', 'temporal', 'recursive', 'loop', 'optimization',
        'self-optimization', 'resolution', 'strategy', 'detection'
      ],
      operations: [
        'detectParadox', 'resolveParadox', 'optimizeLoop', 'handleRecursion',
        'preventParadox', 'analyzeStrategy', 'validateResolution'
      ]
    },
    
    distributed: {
      keywords: [
        'node', 'channel', 'session', 'epr', 'teleportation', 'swapping',
        'synchronization', 'coordination', 'latency', 'fidelity'
      ],
      operations: [
        'connectNode', 'createChannel', 'startSession', 'generateEPR',
        'teleportQuantumState', 'swapEntanglement', 'synchronizeNodes'
      ]
    }
  };
  
  constructor() {
    this.initializeDefaultThemes();
  }
  
  /**
   * Initialize default highlighting themes
   */
  private initializeDefaultThemes(): void {
    // Quantum Default Theme
    this.themes.set('quantum-default', {
      name: 'Quantum Default',
      baseTheme: 'dark',
      quantumCoherenceIndicator: true,
      aiSafetyIndicator: true,
      glyphVisualization: true,
      performanceIndicators: true,
      
      colors: {
        [TokenType.QUANTUM_STATE]: '#00D4FF',       // Bright cyan for quantum states
        [TokenType.QUANTUM_GATE]: '#FF6B6B',       // Coral for quantum gates
        [TokenType.QUANTUM_MEASUREMENT]: '#4ECDC4', // Teal for measurements
        [TokenType.GLYPH_IDENTIFIER]: '#FFE66D',    // Golden yellow for glyphs
        [TokenType.AI_CONTRACT]: '#A8E6CF',         // Light green for AI contracts
        [TokenType.AI_EXPLAINABILITY]: '#FF8B94',   // Light pink for explainability
        [TokenType.PARADOX_RESOLVER]: '#C7CEEA',    // Lavender for paradox resolvers
        [TokenType.DISTRIBUTED_NODE]: '#B4F8C8',    // Light mint for distributed nodes
        [TokenType.KEYWORD]: '#FF79C6',             // Pink for keywords
        [TokenType.STRING]: '#F1FA8C',              // Yellow for strings
        [TokenType.NUMBER]: '#BD93F9',              // Purple for numbers
        [TokenType.COMMENT]: '#6272A4'              // Gray for comments
      },
      
      modifierStyles: {
        [TokenModifier.ENTANGLED]: {
          textDecoration: 'underline wavy #00D4FF',
          backgroundColor: 'rgba(0, 212, 255, 0.1)'
        },
        [TokenModifier.REQUIRES_OVERSIGHT]: {
          border: '1px solid #FF8B94',
          backgroundColor: 'rgba(255, 139, 148, 0.15)'
        },
        [TokenModifier.HIGH_DIMENSIONAL]: {
          textDecoration: 'overline #FFE66D'
        },
        [TokenModifier.SAFETY_CRITICAL]: {
          backgroundColor: 'rgba(255, 107, 107, 0.2)',
          border: '2px solid #FF6B6B'
        },
        [TokenModifier.COHERENT]: {
          backgroundColor: 'rgba(0, 212, 255, 0.1)'
        },
        [TokenModifier.DECOHERENT]: {
          opacity: 0.6,
          textDecoration: 'line-through'
        }
      }
    });
    
    // Light Quantum Theme
    this.themes.set('quantum-light', {
      name: 'Quantum Light',
      baseTheme: 'light',
      quantumCoherenceIndicator: true,
      aiSafetyIndicator: true,
      glyphVisualization: true,
      performanceIndicators: true,
      
      colors: {
        [TokenType.QUANTUM_STATE]: '#0066CC',
        [TokenType.QUANTUM_GATE]: '#CC3300',
        [TokenType.QUANTUM_MEASUREMENT]: '#006699',
        [TokenType.GLYPH_IDENTIFIER]: '#CC6600',
        [TokenType.AI_CONTRACT]: '#009966',
        [TokenType.AI_EXPLAINABILITY]: '#CC0066',
        [TokenType.PARADOX_RESOLVER]: '#6600CC',
        [TokenType.DISTRIBUTED_NODE]: '#00CC66',
        [TokenType.KEYWORD]: '#0000FF',
        [TokenType.STRING]: '#009900',
        [TokenType.NUMBER]: '#CC00CC',
        [TokenType.COMMENT]: '#666666'
      },
      
      modifierStyles: {
        [TokenModifier.ENTANGLED]: {
          textDecoration: 'underline wavy #0066CC',
          backgroundColor: 'rgba(0, 102, 204, 0.1)'
        },
        [TokenModifier.REQUIRES_OVERSIGHT]: {
          border: '1px solid #CC0066',
          backgroundColor: 'rgba(204, 0, 102, 0.1)'
        },
        [TokenModifier.HIGH_DIMENSIONAL]: {
          textDecoration: 'overline #CC6600'
        },
        [TokenModifier.SAFETY_CRITICAL]: {
          backgroundColor: 'rgba(204, 51, 0, 0.15)',
          border: '2px solid #CC3300'
        },
        [TokenModifier.COHERENT]: {
          backgroundColor: 'rgba(0, 102, 204, 0.08)'
        },
        [TokenModifier.DECOHERENT]: {
          opacity: 0.5,
          textDecoration: 'line-through'
        }
      }
    });
  }
  
  /**
   * Tokenize source code into highlighted tokens
   */
  tokenize(content: string, documentState?: DocumentState): Token[] {
    const cacheKey = this.generateCacheKey(content, documentState);
    const cached = this.tokenCache.get(cacheKey);
    if (cached) return cached;
    
    const tokens: Token[] = [];
    const lines = content.split('\n');
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineTokens = this.tokenizeLine(line, lineIndex, documentState);
      tokens.push(...lineTokens);
    }
    
    // Cache the results
    this.tokenCache.set(cacheKey, tokens);
    
    return tokens;
  }
  
  /**
   * Tokenize a single line
   */
  private tokenizeLine(line: string, lineIndex: number, documentState?: DocumentState): Token[] {
    const tokens: Token[] = [];
    let position = 0;
    
    // Skip whitespace at the beginning
    const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
    position += leadingWhitespace.length;
    
    while (position < line.length) {
      const remaining = line.substring(position);
      
      // Try to match different token types
      let matched = false;
      
      // Comments
      if (remaining.startsWith('//') || remaining.startsWith('/*')) {
        const commentMatch = remaining.match(/^(\/\/.*|\/\*[\s\S]*?\*\/)/);
        if (commentMatch) {
          tokens.push({
            line: lineIndex,
            startCharacter: position,
            length: commentMatch[0].length,
            tokenType: TokenType.COMMENT,
            tokenModifiers: []
          });
          position += commentMatch[0].length;
          matched = true;
        }
      }
      
      // Strings
      if (!matched && (remaining.startsWith('"') || remaining.startsWith("'"))) {
        const quote = remaining[0];
        const stringMatch = remaining.match(new RegExp(`^${quote}([^${quote}\\\\]|\\\\.)*${quote}`));
        if (stringMatch) {
          tokens.push({
            line: lineIndex,
            startCharacter: position,
            length: stringMatch[0].length,
            tokenType: TokenType.STRING,
            tokenModifiers: []
          });
          position += stringMatch[0].length;
          matched = true;
        }
      }
      
      // Numbers
      if (!matched) {
        const numberMatch = remaining.match(/^(\d+\.?\d*([eE][+-]?\d+)?|0x[0-9a-fA-F]+|0b[01]+)/);
        if (numberMatch) {
          tokens.push({
            line: lineIndex,
            startCharacter: position,
            length: numberMatch[0].length,
            tokenType: TokenType.NUMBER,
            tokenModifiers: []
          });
          position += numberMatch[0].length;
          matched = true;
        }
      }
      
      // Identifiers, keywords, and special tokens
      if (!matched) {
        const identifierMatch = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
        if (identifierMatch) {
          const identifier = identifierMatch[0];
          const token = this.classifyIdentifier(
            identifier,
            lineIndex,
            position,
            documentState
          );
          tokens.push(token);
          position += identifier.length;
          matched = true;
        }
      }
      
      // Operators and punctuation
      if (!matched) {
        const operatorMatch = remaining.match(/^(\|\||&&|==|!=|<=|>=|<<|>>|\+\+|--|[+\-*/%=<>!&|^~?:;,.\[\]{}()])/);
        if (operatorMatch) {
          const tokenType = this.isOperator(operatorMatch[0]) ? TokenType.OPERATOR : TokenType.PUNCTUATION;
          tokens.push({
            line: lineIndex,
            startCharacter: position,
            length: operatorMatch[0].length,
            tokenType,
            tokenModifiers: []
          });
          position += operatorMatch[0].length;
          matched = true;
        }
      }
      
      // Skip unrecognized characters
      if (!matched) {
        position++;
      }
    }
    
    return tokens;
  }
  
  /**
   * Classify an identifier based on context and patterns
   */
  private classifyIdentifier(
    identifier: string,
    line: number,
    startCharacter: number,
    documentState?: DocumentState
  ): Token {
    const modifiers: TokenModifier[] = [];
    let tokenType: TokenType = TokenType.IDENTIFIER;
    let metadata: any = {};
    
    // Check quantum patterns
    if (this.patterns.quantum.keywords.includes(identifier)) {
      tokenType = TokenType.KEYWORD;
    } else if (this.patterns.quantum.operations.includes(identifier)) {
      tokenType = TokenType.QUANTUM_OPERATION;
    } else if (this.patterns.quantum.handles.includes(identifier)) {
      tokenType = TokenType.QUANTUM_HANDLE;
    } else if (identifier.includes('qubit') || identifier.includes('qudit') || identifier.includes('quantum')) {
      tokenType = TokenType.QUANTUM_VARIABLE;
      
      // Check if this quantum variable is entangled
      if (documentState?.quantumStates) {
        // Add entanglement detection logic here
        modifiers.push(TokenModifier.ENTANGLED);
      }
    }
    
    // Check glyph patterns
    else if (this.patterns.glyph.keywords.includes(identifier)) {
      tokenType = TokenType.KEYWORD;
    } else if (this.patterns.glyph.operations.includes(identifier)) {
      tokenType = TokenType.GLYPH_BINDING;
    } else if (this.patterns.glyph.spaces.includes(identifier)) {
      tokenType = TokenType.GLYPH_SPACE;
    } else if (identifier.includes('glyph') || identifier.includes('Glyph')) {
      tokenType = TokenType.GLYPH_IDENTIFIER;
      modifiers.push(TokenModifier.MULTI_DIMENSIONAL);
    }
    
    // Check AI patterns
    else if (this.patterns.ai.keywords.includes(identifier)) {
      tokenType = TokenType.KEYWORD;
    } else if (this.patterns.ai.verification.includes(identifier)) {
      tokenType = TokenType.AI_VERIFICATION;
    } else if (identifier.includes('contract') || identifier.includes('Contract')) {
      tokenType = TokenType.AI_CONTRACT;
      modifiers.push(TokenModifier.EXPLAINABLE);
    } else if (identifier.includes('explainability') || identifier.includes('Explainability')) {
      tokenType = TokenType.AI_EXPLAINABILITY;
      modifiers.push(TokenModifier.HIGH_CONFIDENCE);
    }
    
    // Check paradox patterns
    else if (this.patterns.paradox.keywords.includes(identifier)) {
      tokenType = TokenType.KEYWORD;
    } else if (this.patterns.paradox.operations.includes(identifier)) {
      tokenType = TokenType.PARADOX_RESOLVER;
    }
    
    // Check distributed patterns
    else if (this.patterns.distributed.keywords.includes(identifier)) {
      tokenType = TokenType.KEYWORD;
    } else if (this.patterns.distributed.operations.includes(identifier)) {
      tokenType = TokenType.DISTRIBUTED_OPERATION;
      modifiers.push(TokenModifier.DISTRIBUTED);
    }
    
    // Add contextual modifiers based on document state
    if (documentState) {
      this.addContextualModifiers(identifier, modifiers, documentState);
    }
    
    return {
      line,
      startCharacter,
      length: identifier.length,
      tokenType,
      tokenModifiers: modifiers,
      metadata
    };
  }
  
  /**
   * Add contextual modifiers based on document analysis
   */
  private addContextualModifiers(
    identifier: string,
    modifiers: TokenModifier[],
    documentState: DocumentState
  ): void {
    // Add quantum-specific modifiers
    if (documentState.quantumStates) {
      for (const [stateId, state] of documentState.quantumStates) {
        if (identifier.includes(stateId)) {
          if (state.coherenceStatus === CoherenceStatus.COHERENT) {
            modifiers.push(TokenModifier.COHERENT);
          } else if (state.coherenceStatus === CoherenceStatus.DECOHERENT) {
            modifiers.push(TokenModifier.DECOHERENT);
          }
          
          if (state.measurementStatus === MeasurementStatus.MEASURED) {
            modifiers.push(TokenModifier.MEASURED);
          }
          
          // Check for high-dimensional quantum systems
          if (state.dimension && state.dimension > 2) {
            modifiers.push(TokenModifier.HIGH_DIMENSIONAL);
          }
        }
      }
    }
    
    // Add AI-specific modifiers
    if (documentState.aiExplainability) {
      for (const [entityId, explainabilityData] of documentState.aiExplainability) {
        if (identifier.includes(entityId)) {
          if (explainabilityData.score >= 0.85) {
            modifiers.push(TokenModifier.HIGH_CONFIDENCE);
          } else if (explainabilityData.score < 0.6) {
            modifiers.push(TokenModifier.LOW_CONFIDENCE);
          }
          
          if (explainabilityData.requiresOversight) {
            modifiers.push(TokenModifier.REQUIRES_OVERSIGHT);
          }
          
          if (explainabilityData.safetyCritical) {
            modifiers.push(TokenModifier.SAFETY_CRITICAL);
          }
        }
      }
    }
  }
  
  /**
   * Check if a token is an operator
   */
  private isOperator(token: string): boolean {
    const operators = ['+', '-', '*', '/', '%', '=', '==', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '&', '|', '^', '~', '<<', '>>', '++', '--'];
    return operators.includes(token);
  }
  
  /**
   * Get semantic highlighting for a document
   */
  getSemanticHighlighting(documentState: DocumentState): SemanticHighlighting {
    const tokens = this.tokenize(documentState.document.content, documentState);
    
    // Convert to LSP semantic token format
    const legend = {
      tokenTypes: Object.values(TokenType),
      tokenModifiers: Object.values(TokenModifier)
    };
    
    return {
      tokens,
      legend,
      version: documentState.document.version
    };
  }
  
  /**
   * Update theme based on quantum coherence state
   */
  updateCoherenceState(state: CoherenceThemeState): void {
    this.coherenceState = state;
    this.adaptThemeToState();
  }
  
  /**
   * Update theme based on AI safety state
   */
  updateAISafetyState(state: AISafetyThemeState): void {
    this.aiSafetyState = state;
    this.adaptThemeToState();
  }
  
  /**
   * Adapt highlighting theme based on current system state
   */
  private adaptThemeToState(): void {
    const currentTheme = this.themes.get(this.currentTheme);
    if (!currentTheme) return;
    
    // Adapt colors based on coherence state
    if (currentTheme.quantumCoherenceIndicator) {
      // Fade quantum tokens if decoherence is high
      if (this.coherenceState.decoherenceRate > 0.1) {
        Object.assign(currentTheme.modifierStyles[TokenModifier.DECOHERENT], {
          opacity: 1.0 - this.coherenceState.decoherenceRate
        });
      }
      
      // Brighten entangled tokens based on entanglement strength
      if (this.coherenceState.entanglementStrength > 0.5) {
        Object.assign(currentTheme.modifierStyles[TokenModifier.ENTANGLED], {
          backgroundColor: `rgba(0, 212, 255, ${this.coherenceState.entanglementStrength * 0.3})`
        });
      }
    }
    
    // Adapt colors based on AI safety state
    if (currentTheme.aiSafetyIndicator) {
      // Enhance safety-critical highlighting if compliance is low
      if (this.aiSafetyState.complianceScore < 0.8) {
        Object.assign(currentTheme.modifierStyles[TokenModifier.SAFETY_CRITICAL], {
          backgroundColor: `rgba(255, 107, 107, ${0.3 - this.aiSafetyState.complianceScore * 0.1})`,
          border: `2px solid rgb(255, ${107 - this.aiSafetyState.safetyViolations * 20}, 107)`
        });
      }
      
      // Adjust explainability highlighting based on average score
      if (this.aiSafetyState.averageExplainability < 0.85) {
        Object.assign(currentTheme.modifierStyles[TokenModifier.LOW_CONFIDENCE], {
          textDecoration: 'underline wavy #FF8B94',
          backgroundColor: `rgba(255, 139, 148, ${0.2 - this.aiSafetyState.averageExplainability * 0.1})`
        });
      }
    }
  }
  
  /**
   * Generate cache key for tokenization results
   */
  private generateCacheKey(content: string, documentState?: DocumentState): string {
    const contentHash = this.simpleHash(content);
    const stateHash = documentState ? this.simpleHash(JSON.stringify(documentState.lastAnalysis)) : '0';
    const themeHash = this.currentTheme;
    return `${contentHash}-${stateHash}-${themeHash}`;
  }
  
  /**
   * Simple hash function for cache keys
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
  
  /**
   * Set current highlighting theme
   */
  setTheme(themeName: string): boolean {
    if (this.themes.has(themeName)) {
      this.currentTheme = themeName;
      this.adaptThemeToState();
      return true;
    }
    return false;
  }
  
  /**
   * Get current theme
   */
  getCurrentTheme(): HighlightingTheme | undefined {
    return this.themes.get(this.currentTheme);
  }
  
  /**
   * Add custom theme
   */
  addTheme(theme: HighlightingTheme): void {
    this.themes.set(theme.name, theme);
  }
  
  /**
   * Get all available themes
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }
  
  /**
   * Clear token cache
   */
  clearCache(): void {
    this.tokenCache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.tokenCache.size,
      hitRate: 0.85 // Placeholder - would need actual hit/miss tracking
    };
  }
}

export default SingularisSyntaxHighlighter;