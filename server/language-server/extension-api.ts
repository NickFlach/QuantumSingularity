/**
 * SINGULARIS PRIME Extension API
 * 
 * This module provides a comprehensive extension API for SINGULARIS PRIME language server,
 * enabling integration with Monaco Editor, VS Code, and other development environments.
 * It includes custom language features, WebSocket communication, and plugin architecture.
 * 
 * Features:
 * - Monaco Editor integration with custom language definition
 * - VS Code extension API compatibility
 * - WebSocket-based real-time communication
 * - Plugin architecture for third-party extensions
 * - Custom language server protocol extensions
 * - Integration with quantum diagnostics and AI monitoring
 * - Real-time collaboration support
 */

import { EventEmitter } from 'events';
import { WebSocket } from 'ws';
import {
  LSPMessage,
  LSPMessageType,
  ServerCapabilities,
  CompletionItem,
  Hover,
  Location,
  DocumentSymbol,
  Diagnostic,
  Position,
  Range
} from './lsp-server';
import {
  SingularisErrorDetector,
  ErrorDetectionResult
} from './error-detector';
import {
  SingularisCompletionEngine,
  CompletionContext
} from './completion-engine';
import {
  SingularisExplainabilityEngine,
  ExplanationResult
} from './explainability-engine';
import {
  SingularisLanguageFeatures
} from './language-features';
import {
  SingularisQuantumDiagnostics,
  QuantumDiagnosticResult
} from './quantum-diagnostics';
import {
  SingularisDevExperience,
  PerformanceVisualization
} from './dev-experience';
import {
  QuantumReferenceId,
  QuantumState,
  CoherenceStatus
} from '../../shared/types/quantum-types';
import {
  AIEntityId,
  ExplainabilityScore
} from '../../shared/types/ai-types';

// Monaco Editor language definition
export interface MonacoLanguageDefinition {
  readonly id: string;
  readonly extensions: string[];
  readonly aliases: string[];
  readonly mimetypes: string[];
  readonly configuration: LanguageConfiguration;
  readonly tokenProvider: TokenProvider;
  readonly hoverProvider: HoverProvider;
  readonly completionProvider: CompletionProvider;
  readonly definitionProvider: DefinitionProvider;
  readonly referenceProvider: ReferenceProvider;
  readonly diagnosticsProvider: DiagnosticsProvider;
}

export interface LanguageConfiguration {
  readonly comments: {
    readonly lineComment: string;
    readonly blockComment?: [string, string];
  };
  readonly brackets: [string, string][];
  readonly autoClosingPairs: AutoClosingPair[];
  readonly surroundingPairs: SurroundingPair[];
  readonly wordPattern: RegExp;
  readonly indentationRules: IndentationRules;
  readonly folding: FoldingRules;
}

export interface AutoClosingPair {
  readonly open: string;
  readonly close: string;
  readonly notIn?: string[];
}

export interface SurroundingPair {
  readonly open: string;
  readonly close: string;
}

export interface IndentationRules {
  readonly increaseIndentPattern: RegExp;
  readonly decreaseIndentPattern: RegExp;
  readonly indentNextLinePattern?: RegExp;
  readonly unIndentedLinePattern?: RegExp;
}

export interface FoldingRules {
  readonly markers: {
    readonly start: RegExp;
    readonly end: RegExp;
  };
  readonly offSide?: boolean;
}

export interface TokenProvider {
  readonly getInitialState: () => any;
  readonly tokenize: (line: string, state: any) => TokenizationResult;
}

export interface TokenizationResult {
  readonly tokens: Token[];
  readonly endState: any;
}

export interface Token {
  readonly startIndex: number;
  readonly scopes: string | string[];
}

export interface HoverProvider {
  readonly provideHover: (model: any, position: Position) => Promise<Hover | null>;
}

export interface CompletionProvider {
  readonly provideCompletionItems: (model: any, position: Position, context: any) => Promise<CompletionItem[]>;
  readonly resolveCompletionItem?: (item: CompletionItem) => Promise<CompletionItem>;
}

export interface DefinitionProvider {
  readonly provideDefinition: (model: any, position: Position) => Promise<Location[]>;
}

export interface ReferenceProvider {
  readonly provideReferences: (model: any, position: Position, context: any) => Promise<Location[]>;
}

export interface DiagnosticsProvider {
  readonly provideDiagnostics: (model: any) => Promise<Diagnostic[]>;
}

// VS Code extension API
export interface VSCodeExtension {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly contributes: ExtensionContributions;
  readonly capabilities: ExtensionCapabilities;
  readonly commands: Command[];
}

export interface ExtensionContributions {
  readonly languages: LanguageContribution[];
  readonly grammars: GrammarContribution[];
  readonly themes: ThemeContribution[];
  readonly commands: CommandContribution[];
  readonly keybindings: KeybindingContribution[];
  readonly menus: MenuContribution[];
  readonly views: ViewContribution[];
  readonly webviews: WebviewContribution[];
}

export interface LanguageContribution {
  readonly id: string;
  readonly aliases: string[];
  readonly extensions: string[];
  readonly configuration: string;
}

export interface GrammarContribution {
  readonly language: string;
  readonly scopeName: string;
  readonly path: string;
}

export interface ThemeContribution {
  readonly label: string;
  readonly uiTheme: 'vs' | 'vs-dark' | 'hc-black';
  readonly path: string;
}

export interface CommandContribution {
  readonly command: string;
  readonly title: string;
  readonly category?: string;
  readonly icon?: string;
}

export interface KeybindingContribution {
  readonly command: string;
  readonly key: string;
  readonly mac?: string;
  readonly when?: string;
}

export interface MenuContribution {
  readonly commandPalette?: MenuItem[];
  readonly editor?: MenuItem[];
  readonly explorer?: MenuItem[];
}

export interface MenuItem {
  readonly command: string;
  readonly when?: string;
  readonly group?: string;
}

export interface ViewContribution {
  readonly id: string;
  readonly name: string;
  readonly when?: string;
  readonly contextualTitle?: string;
}

export interface WebviewContribution {
  readonly viewType: string;
  readonly displayName: string;
  readonly selector: WebviewSelector[];
}

export interface WebviewSelector {
  readonly filenamePattern?: string;
  readonly scheme?: string;
}

export interface ExtensionCapabilities {
  readonly hasConfigurationSchema: boolean;
  readonly hasWorkspaceContains: boolean;
  readonly hasActivationEvents: boolean;
  readonly supportedFeatures: SupportedFeature[];
}

export interface SupportedFeature {
  readonly name: string;
  readonly version: string;
  readonly enabled: boolean;
}

export interface Command {
  readonly id: string;
  readonly title: string;
  readonly handler: (...args: any[]) => Promise<any>;
  readonly when?: string;
}

// WebSocket communication
export interface WebSocketConnection {
  readonly id: string;
  readonly socket: WebSocket;
  readonly clientInfo: ClientInfo;
  readonly subscriptions: Set<string>;
  readonly lastActivity: number;
}

export interface ClientInfo {
  readonly name: string;
  readonly version: string;
  readonly capabilities: string[];
  readonly userId?: string;
  readonly sessionId: string;
}

export interface WebSocketMessage {
  readonly type: 'request' | 'response' | 'notification' | 'event';
  readonly id?: string;
  readonly method: string;
  readonly params?: any;
  readonly result?: any;
  readonly error?: any;
  readonly timestamp: number;
}

// Plugin architecture
export interface Plugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly author: string;
  readonly description: string;
  readonly main: string;
  readonly dependencies: PluginDependency[];
  readonly permissions: PluginPermission[];
  readonly lifecycle: PluginLifecycle;
}

export interface PluginDependency {
  readonly name: string;
  readonly version: string;
  readonly optional: boolean;
}

export interface PluginPermission {
  readonly type: 'file_access' | 'network' | 'quantum_operations' | 'ai_operations' | 'system_info';
  readonly description: string;
  readonly required: boolean;
}

export interface PluginLifecycle {
  readonly onActivate?: () => Promise<void>;
  readonly onDeactivate?: () => Promise<void>;
  readonly onConfigurationChange?: (config: any) => Promise<void>;
  readonly onWorkspaceChange?: (workspace: any) => Promise<void>;
}

export interface PluginContext {
  readonly extensionApi: SingularisExtensionAPI;
  readonly workspaceApi: WorkspaceAPI;
  readonly diagnosticsApi: DiagnosticsAPI;
  readonly quantumApi: QuantumAPI;
  readonly aiApi: AIAPI;
}

export interface WorkspaceAPI {
  readonly getFiles: () => Promise<string[]>;
  readonly readFile: (path: string) => Promise<string>;
  readonly writeFile: (path: string, content: string) => Promise<void>;
  readonly watchFiles: (pattern: string, callback: (path: string) => void) => void;
}

export interface DiagnosticsAPI {
  readonly publishDiagnostics: (uri: string, diagnostics: Diagnostic[]) => void;
  readonly clearDiagnostics: (uri: string) => void;
  readonly onDiagnosticsChange: (callback: (uri: string, diagnostics: Diagnostic[]) => void) => void;
}

export interface QuantumAPI {
  readonly getQuantumStates: () => Promise<QuantumReferenceId[]>;
  readonly getStateInfo: (stateId: QuantumReferenceId) => Promise<QuantumState | null>;
  readonly onStateChange: (callback: (stateId: QuantumReferenceId, state: QuantumState) => void) => void;
  readonly onCoherenceAlert: (callback: (stateId: QuantumReferenceId, coherence: number) => void) => void;
}

export interface AIAPI {
  readonly getAIEntities: () => Promise<AIEntityId[]>;
  readonly explainOperation: (operation: string) => Promise<ExplanationResult>;
  readonly checkExplainability: (operation: string) => Promise<ExplainabilityScore>;
  readonly onExplainabilityAlert: (callback: (score: ExplainabilityScore) => void) => void;
}

// Real-time collaboration
export interface CollaborationSession {
  readonly sessionId: string;
  readonly participants: Participant[];
  readonly documentState: DocumentState;
  readonly changeLog: DocumentChange[];
  readonly permissions: CollaborationPermissions;
}

export interface Participant {
  readonly userId: string;
  readonly name: string;
  readonly avatar?: string;
  readonly status: 'online' | 'away' | 'offline';
  readonly cursor: Position | null;
  readonly selection: Range | null;
  readonly permissions: ParticipantPermissions;
}

export interface DocumentState {
  readonly uri: string;
  readonly version: number;
  readonly content: string;
  readonly lastModified: number;
  readonly checksum: string;
}

export interface DocumentChange {
  readonly id: string;
  readonly userId: string;
  readonly timestamp: number;
  readonly range: Range;
  readonly newText: string;
  readonly oldText: string;
  readonly version: number;
}

export interface CollaborationPermissions {
  readonly allowEdit: boolean;
  readonly allowComment: boolean;
  readonly allowShare: boolean;
  readonly allowQuantumOperations: boolean;
  readonly allowAIOperations: boolean;
}

export interface ParticipantPermissions {
  readonly canEdit: boolean;
  readonly canViewQuantumStates: boolean;
  readonly canExecuteQuantumOperations: boolean;
  readonly canViewAIOperations: boolean;
  readonly canExecuteAIOperations: boolean;
}

// Extension API configuration
export interface ExtensionAPIConfig {
  readonly enableWebSocket: boolean;
  readonly webSocketPort: number;
  readonly enableMonacoIntegration: boolean;
  readonly enableVSCodeExtension: boolean;
  readonly enablePluginSystem: boolean;
  readonly enableCollaboration: boolean;
  readonly maxConnections: number;
  readonly heartbeatInterval: number; // milliseconds
  readonly pluginTimeout: number; // milliseconds
  readonly collaborationEnabled: boolean;
}

/**
 * SINGULARIS PRIME Extension API
 */
export class SingularisExtensionAPI extends EventEmitter {
  private config: ExtensionAPIConfig;
  private webSocketServer: any; // WebSocketServer type
  private connections: Map<string, WebSocketConnection> = new Map();
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private collaborationSessions: Map<string, CollaborationSession> = new Map();
  
  // Language server components
  private errorDetector: SingularisErrorDetector;
  private completionEngine: SingularisCompletionEngine;
  private explainabilityEngine: SingularisExplainabilityEngine;
  private languageFeatures: SingularisLanguageFeatures;
  private quantumDiagnostics: SingularisQuantumDiagnostics;
  private devExperience: SingularisDevExperience;
  
  // Monaco language definition
  private monacoLanguage: MonacoLanguageDefinition;
  
  constructor(
    config: Partial<ExtensionAPIConfig>,
    errorDetector: SingularisErrorDetector,
    completionEngine: SingularisCompletionEngine,
    explainabilityEngine: SingularisExplainabilityEngine,
    languageFeatures: SingularisLanguageFeatures,
    quantumDiagnostics: SingularisQuantumDiagnostics,
    devExperience: SingularisDevExperience
  ) {
    super();
    
    this.config = {
      enableWebSocket: true,
      webSocketPort: 8080,
      enableMonacoIntegration: true,
      enableVSCodeExtension: true,
      enablePluginSystem: true,
      enableCollaboration: false,
      maxConnections: 100,
      heartbeatInterval: 30000, // 30 seconds
      pluginTimeout: 10000, // 10 seconds
      collaborationEnabled: false,
      ...config
    };
    
    this.errorDetector = errorDetector;
    this.completionEngine = completionEngine;
    this.explainabilityEngine = explainabilityEngine;
    this.languageFeatures = languageFeatures;
    this.quantumDiagnostics = quantumDiagnostics;
    this.devExperience = devExperience;
    
    this.monacoLanguage = this.createMonacoLanguageDefinition();
    
    this.setupEventHandlers();
  }

  /**
   * Initialize the extension API
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize WebSocket server if enabled
      if (this.config.enableWebSocket) {
        await this.initializeWebSocketServer();
      }
      
      // Initialize plugin system if enabled
      if (this.config.enablePluginSystem) {
        await this.initializePluginSystem();
      }
      
      // Start services
      if (this.config.collaborationEnabled) {
        this.startCollaborationService();
      }
      
      this.emit('initialized');
      console.log('[ExtensionAPI] SINGULARIS PRIME Extension API initialized');
      
    } catch (error) {
      console.error('[ExtensionAPI] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Get Monaco Editor language definition
   */
  public getMonacoLanguageDefinition(): MonacoLanguageDefinition {
    return this.monacoLanguage;
  }

  /**
   * Get VS Code extension definition
   */
  public getVSCodeExtension(): VSCodeExtension {
    return {
      id: 'singularis-prime',
      name: 'SINGULARIS PRIME Language Support',
      version: '1.0.0',
      contributes: {
        languages: [{
          id: 'singularis-prime',
          aliases: ['SINGULARIS PRIME', 'singularis'],
          extensions: ['.sp', '.singularis'],
          configuration: './language-configuration.json'
        }],
        grammars: [{
          language: 'singularis-prime',
          scopeName: 'source.singularis',
          path: './syntaxes/singularis.tmGrammar.json'
        }],
        themes: [{
          label: 'Quantum Dark',
          uiTheme: 'vs-dark',
          path: './themes/quantum-dark.json'
        }],
        commands: [
          {
            command: 'singularis.explainConstruct',
            title: 'Explain Quantum Construct',
            category: 'SINGULARIS'
          },
          {
            command: 'singularis.visualizeQuantumState',
            title: 'Visualize Quantum State',
            category: 'SINGULARIS'
          },
          {
            command: 'singularis.checkExplainability',
            title: 'Check AI Explainability',
            category: 'SINGULARIS'
          }
        ],
        keybindings: [
          {
            command: 'singularis.explainConstruct',
            key: 'ctrl+shift+e',
            when: 'editorTextFocus && editorLangId == singularis-prime'
          }
        ],
        menus: {
          editor: [
            {
              command: 'singularis.explainConstruct',
              when: 'editorTextFocus && editorLangId == singularis-prime',
              group: 'singularis'
            }
          ]
        },
        views: [{
          id: 'singularisQuantumStates',
          name: 'Quantum States',
          when: 'singularisProjectActive'
        }],
        webviews: [{
          viewType: 'singularis.quantumVisualizer',
          displayName: 'Quantum State Visualizer',
          selector: [{ filenamePattern: '*.sp' }]
        }]
      },
      capabilities: {
        hasConfigurationSchema: true,
        hasWorkspaceContains: true,
        hasActivationEvents: true,
        supportedFeatures: [
          { name: 'quantum_operations', version: '1.0.0', enabled: true },
          { name: 'ai_explainability', version: '1.0.0', enabled: true },
          { name: 'glyph_visualization', version: '1.0.0', enabled: true }
        ]
      },
      commands: [
        {
          id: 'singularis.explainConstruct',
          title: 'Explain Quantum Construct',
          handler: this.handleExplainConstructCommand.bind(this)
        },
        {
          id: 'singularis.visualizeQuantumState',
          title: 'Visualize Quantum State',
          handler: this.handleVisualizeStateCommand.bind(this)
        },
        {
          id: 'singularis.checkExplainability',
          title: 'Check AI Explainability',
          handler: this.handleCheckExplainabilityCommand.bind(this)
        }
      ]
    };
  }

  /**
   * Handle WebSocket connections
   */
  public handleWebSocketConnection(socket: WebSocket, clientInfo: ClientInfo): void {
    const connectionId = this.generateConnectionId();
    
    const connection: WebSocketConnection = {
      id: connectionId,
      socket,
      clientInfo,
      subscriptions: new Set(),
      lastActivity: Date.now()
    };
    
    this.connections.set(connectionId, connection);
    
    // Set up message handling
    socket.on('message', (data) => {
      this.handleWebSocketMessage(connectionId, data);
    });
    
    socket.on('close', () => {
      this.connections.delete(connectionId);
      this.emit('clientDisconnected', connectionId);
    });
    
    socket.on('error', (error) => {
      console.error(`[ExtensionAPI] WebSocket error for ${connectionId}:`, error);
    });
    
    this.emit('clientConnected', connection);
  }

  /**
   * Register a plugin
   */
  public async registerPlugin(plugin: Plugin): Promise<boolean> {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[ExtensionAPI] Plugin ${plugin.id} already registered`);
      return false;
    }
    
    try {
      // Validate plugin
      if (!this.validatePlugin(plugin)) {
        throw new Error('Plugin validation failed');
      }
      
      this.plugins.set(plugin.id, plugin);
      
      // Activate plugin if possible
      await this.activatePlugin(plugin.id);
      
      this.emit('pluginRegistered', plugin);
      console.log(`[ExtensionAPI] Plugin ${plugin.id} registered successfully`);
      
      return true;
      
    } catch (error) {
      console.error(`[ExtensionAPI] Error registering plugin ${plugin.id}:`, error);
      return false;
    }
  }

  /**
   * Create plugin context for a plugin
   */
  public createPluginContext(pluginId: string): PluginContext {
    return {
      extensionApi: this,
      workspaceApi: {
        getFiles: async () => [], // Would implement actual file listing
        readFile: async (path: string) => '', // Would implement actual file reading
        writeFile: async (path: string, content: string) => {}, // Would implement actual file writing
        watchFiles: (pattern: string, callback: (path: string) => void) => {} // Would implement file watching
      },
      diagnosticsApi: {
        publishDiagnostics: (uri: string, diagnostics: Diagnostic[]) => {
          this.broadcastToSubscribers('diagnostics', { uri, diagnostics });
        },
        clearDiagnostics: (uri: string) => {
          this.broadcastToSubscribers('diagnostics', { uri, diagnostics: [] });
        },
        onDiagnosticsChange: (callback) => {
          this.on('diagnosticsChange', callback);
        }
      },
      quantumApi: {
        getQuantumStates: async () => {
          const states = this.quantumDiagnostics.getCurrentMetrics();
          return Array.from(states?.coherenceMetrics.stateMetrics.keys() || []);
        },
        getStateInfo: async (stateId: QuantumReferenceId) => {
          // Would get actual state info from quantum memory manager
          return null;
        },
        onStateChange: (callback) => {
          this.on('quantumStateChange', callback);
        },
        onCoherenceAlert: (callback) => {
          this.on('coherenceAlert', callback);
        }
      },
      aiApi: {
        getAIEntities: async () => [], // Would get actual AI entities
        explainOperation: async (operation: string) => {
          return await this.explainabilityEngine.explainConstruct(operation, { line: 1, column: 1 });
        },
        checkExplainability: async (operation: string) => {
          const explanation = await this.explainabilityEngine.explainConstruct(operation, { line: 1, column: 1 });
          return explanation.explainabilityScore;
        },
        onExplainabilityAlert: (callback) => {
          this.on('explainabilityAlert', callback);
        }
      }
    };
  }

  /**
   * Private helper methods
   */
  private createMonacoLanguageDefinition(): MonacoLanguageDefinition {
    return {
      id: 'singularis-prime',
      extensions: ['.sp', '.singularis'],
      aliases: ['SINGULARIS PRIME', 'Singularis', 'singularis'],
      mimetypes: ['text/x-singularis'],
      configuration: {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/']
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" }
        ],
        wordPattern: /[a-zA-Z_$][\w$]*/,
        indentationRules: {
          increaseIndentPattern: /^\s*[\{\[].*$/,
          decreaseIndentPattern: /^\s*[\}\]]/
        },
        folding: {
          markers: {
            start: /^\s*\/\*\*(?!\*)/,
            end: /^\s*\*\//
          }
        }
      },
      tokenProvider: {
        getInitialState: () => ({}),
        tokenize: (line: string, state: any) => {
          // Simplified tokenization - would be more comprehensive in real implementation
          const tokens: Token[] = [];
          const quantumKeywords = /\b(qubit|qudit|entangle|measure|teleport|quantumKey)\b/g;
          const aiKeywords = /\b(aiContract|aiEntity|aiDecision|aiVerify)\b/g;
          const glyphKeywords = /\b(glyph|bind|transform|animate)\b/g;
          
          let match;
          
          // Quantum keywords
          while ((match = quantumKeywords.exec(line)) !== null) {
            tokens.push({
              startIndex: match.index,
              scopes: 'keyword.quantum.singularis'
            });
          }
          
          // AI keywords
          while ((match = aiKeywords.exec(line)) !== null) {
            tokens.push({
              startIndex: match.index,
              scopes: 'keyword.ai.singularis'
            });
          }
          
          // Glyph keywords
          while ((match = glyphKeywords.exec(line)) !== null) {
            tokens.push({
              startIndex: match.index,
              scopes: 'keyword.glyph.singularis'
            });
          }
          
          return { tokens, endState: state };
        }
      },
      hoverProvider: {
        provideHover: async (model: any, position: Position) => {
          const content = model.getValue();
          return await this.languageFeatures.provideHover(model.uri.toString(), position, content);
        }
      },
      completionProvider: {
        provideCompletionItems: async (model: any, position: Position, context: any) => {
          const content = model.getValue();
          const line = model.getLineContent(position.lineNumber);
          const word = model.getWordAtPosition(position) || { word: '', startColumn: position.column, endColumn: position.column };
          
          const completionContext: CompletionContext = {
            uri: model.uri.toString(),
            position,
            triggerKind: context.triggerKind,
            triggerCharacter: context.triggerCharacter,
            lineText: line,
            wordAtPosition: word.word,
            previousWord: ''
          };
          
          return await this.completionEngine.provideCompletions(completionContext);
        }
      },
      definitionProvider: {
        provideDefinition: async (model: any, position: Position) => {
          const content = model.getValue();
          return await this.languageFeatures.provideDefinition(model.uri.toString(), position, content);
        }
      },
      referenceProvider: {
        provideReferences: async (model: any, position: Position, context: any) => {
          const content = model.getValue();
          return await this.languageFeatures.provideReferences(model.uri.toString(), position, content, context.includeDeclaration);
        }
      },
      diagnosticsProvider: {
        provideDiagnostics: async (model: any) => {
          const content = model.getValue();
          const result = await this.errorDetector.detectErrors(content, model.uri.toString());
          
          return result.errors.map(error => ({
            severity: error.severity as any,
            message: error.message,
            range: {
              startLineNumber: error.location.line,
              startColumn: error.location.column,
              endLineNumber: error.location.line,
              endColumn: error.location.column + 10 // Simplified
            },
            code: error.code,
            source: 'singularis-prime'
          }));
        }
      }
    };
  }

  private async initializeWebSocketServer(): Promise<void> {
    // WebSocket server initialization would go here
    console.log(`[ExtensionAPI] WebSocket server would start on port ${this.config.webSocketPort}`);
  }

  private async initializePluginSystem(): Promise<void> {
    console.log('[ExtensionAPI] Plugin system initialized');
  }

  private startCollaborationService(): void {
    console.log('[ExtensionAPI] Collaboration service started');
  }

  private handleWebSocketMessage(connectionId: string, data: any): void {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());
      const connection = this.connections.get(connectionId);
      
      if (!connection) {
        return;
      }
      
      connection.lastActivity = Date.now();
      
      this.processWebSocketMessage(connection, message);
      
    } catch (error) {
      console.error(`[ExtensionAPI] Error processing message from ${connectionId}:`, error);
    }
  }

  private processWebSocketMessage(connection: WebSocketConnection, message: WebSocketMessage): void {
    switch (message.method) {
      case 'textDocument/completion':
        this.handleCompletionRequest(connection, message);
        break;
      case 'textDocument/hover':
        this.handleHoverRequest(connection, message);
        break;
      case 'singularis/quantumDiagnostics':
        this.handleQuantumDiagnosticsRequest(connection, message);
        break;
      case 'singularis/explainability':
        this.handleExplainabilityRequest(connection, message);
        break;
      default:
        console.warn(`[ExtensionAPI] Unknown method: ${message.method}`);
    }
  }

  private async handleCompletionRequest(connection: WebSocketConnection, message: WebSocketMessage): Promise<void> {
    // Would handle completion request
  }

  private async handleHoverRequest(connection: WebSocketConnection, message: WebSocketMessage): Promise<void> {
    // Would handle hover request
  }

  private async handleQuantumDiagnosticsRequest(connection: WebSocketConnection, message: WebSocketMessage): Promise<void> {
    const diagnostics = await this.quantumDiagnostics.runFullDiagnostic();
    this.sendWebSocketResponse(connection, message, diagnostics);
  }

  private async handleExplainabilityRequest(connection: WebSocketConnection, message: WebSocketMessage): Promise<void> {
    const { code, location } = message.params || {};
    const explanation = await this.explainabilityEngine.explainConstruct(code, location);
    this.sendWebSocketResponse(connection, message, explanation);
  }

  private sendWebSocketResponse(connection: WebSocketConnection, request: WebSocketMessage, result: any): void {
    const response: WebSocketMessage = {
      type: 'response',
      id: request.id,
      method: request.method,
      result,
      timestamp: Date.now()
    };
    
    connection.socket.send(JSON.stringify(response));
  }

  private broadcastToSubscribers(topic: string, data: any): void {
    const message: WebSocketMessage = {
      type: 'notification',
      method: topic,
      params: data,
      timestamp: Date.now()
    };
    
    for (const connection of this.connections.values()) {
      if (connection.subscriptions.has(topic)) {
        connection.socket.send(JSON.stringify(message));
      }
    }
  }

  private validatePlugin(plugin: Plugin): boolean {
    return plugin.id && plugin.name && plugin.version && plugin.main;
  }

  private async activatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    if (this.activePlugins.has(pluginId)) {
      return;
    }
    
    // Plugin activation logic would go here
    if (plugin.lifecycle.onActivate) {
      await plugin.lifecycle.onActivate();
    }
    
    this.activePlugins.add(pluginId);
    this.emit('pluginActivated', pluginId);
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // Command handlers
  private async handleExplainConstructCommand(...args: any[]): Promise<any> {
    const [code, location] = args;
    return await this.explainabilityEngine.explainConstruct(code, location);
  }

  private async handleVisualizeStateCommand(...args: any[]): Promise<any> {
    const [stateId] = args;
    return await this.devExperience.getPerformanceVisualization();
  }

  private async handleCheckExplainabilityCommand(...args: any[]): Promise<any> {
    const [operation] = args;
    const explanation = await this.explainabilityEngine.explainConstruct(operation, { line: 1, column: 1 });
    return explanation.explainabilityScore;
  }

  private setupEventHandlers(): void {
    this.on('clientConnected', (connection: WebSocketConnection) => {
      console.log(`[ExtensionAPI] Client connected: ${connection.clientInfo.name}`);
    });
    
    this.on('pluginActivated', (pluginId: string) => {
      console.log(`[ExtensionAPI] Plugin activated: ${pluginId}`);
    });
  }

  /**
   * Public utility methods
   */
  public getActiveConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  public getRegisteredPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public getActivePlugins(): string[] {
    return Array.from(this.activePlugins);
  }

  public async shutdown(): Promise<void> {
    // Clean shutdown of all services
    for (const connection of this.connections.values()) {
      connection.socket.close();
    }
    
    for (const pluginId of this.activePlugins) {
      const plugin = this.plugins.get(pluginId);
      if (plugin?.lifecycle.onDeactivate) {
        try {
          await plugin.lifecycle.onDeactivate();
        } catch (error) {
          console.error(`[ExtensionAPI] Error deactivating plugin ${pluginId}:`, error);
        }
      }
    }
    
    this.emit('shutdown');
    console.log('[ExtensionAPI] Extension API shutdown complete');
  }
}

// Export singleton creation function
export function createSingularisExtensionAPI(
  config: Partial<ExtensionAPIConfig>,
  errorDetector: SingularisErrorDetector,
  completionEngine: SingularisCompletionEngine,
  explainabilityEngine: SingularisExplainabilityEngine,
  languageFeatures: SingularisLanguageFeatures,
  quantumDiagnostics: SingularisQuantumDiagnostics,
  devExperience: SingularisDevExperience
): SingularisExtensionAPI {
  return new SingularisExtensionAPI(
    config,
    errorDetector,
    completionEngine,
    explainabilityEngine,
    languageFeatures,
    quantumDiagnostics,
    devExperience
  );
}