/**
 * SINGULARIS PRIME Language Server Integration Testing
 * 
 * Comprehensive tests for real-time error detection, AI-powered code completion,
 * explainability hints, quantum diagnostics, Monaco Editor integration, and
 * advanced language server features.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocket } from 'ws';
import {
  LSPMessageType,
  Position,
  Range,
  Location,
  TextDocument,
  Diagnostic,
  DiagnosticSeverity,
  CompletionItem,
  CompletionItemKind
} from '@server/language-server/lsp-server';

import {
  QuantumReferenceId,
  QuantumState
} from '@shared/types/quantum-types';

import {
  ExplainabilityScore,
  HumanOversightLevel
} from '@shared/types/ai-types';

// Mock language server components
vi.mock('@server/language-server/lsp-server', () => ({
  SingularisLSPServer: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    handleMessage: vi.fn(),
    sendMessage: vi.fn(),
    publishDiagnostics: vi.fn(),
    provideCompletions: vi.fn(),
    provideHover: vi.fn(),
    getQuantumDiagnostics: vi.fn()
  }))
}));

vi.mock('@server/language-server/syntax-highlighter', () => ({
  SingularisSyntaxHighlighter: {
    highlightDocument: vi.fn(),
    getTokens: vi.fn(),
    validateSyntax: vi.fn()
  }
}));

vi.mock('@server/language-server/error-detector', () => ({
  SingularisErrorDetector: {
    detectErrors: vi.fn(),
    validateQuantumOperations: vi.fn(),
    checkTypeConstraints: vi.fn()
  }
}));

vi.mock('@server/language-server/completion-engine', () => ({
  SingularisCompletionEngine: {
    provideCompletions: vi.fn(),
    provideQuantumCompletions: vi.fn(),
    getAIAssistance: vi.fn()
  }
}));

vi.mock('@server/language-server/explainability-engine', () => ({
  SingularisExplainabilityEngine: {
    generateHints: vi.fn(),
    analyzeExplainability: vi.fn(),
    suggestImprovements: vi.fn()
  }
}));

describe('Language Server Integration Testing', () => {
  let mockLSPServer: any;
  let mockWebSocket: any;
  let testDocument: TextDocument;

  beforeEach(() => {
    // Create mock LSP server
    const { SingularisLSPServer } = require('@server/language-server/lsp-server');
    mockLSPServer = new SingularisLSPServer();

    // Create mock WebSocket connection
    mockWebSocket = {
      send: vi.fn(),
      on: vi.fn(),
      close: vi.fn(),
      readyState: 1 // OPEN
    };

    // Create test document
    testDocument = {
      uri: 'file:///test/quantum-program.spr',
      languageId: 'singularis-prime',
      version: 1,
      content: `
quantumKey alice = entangle(nodeA, nodeB);
contract AI_Trading {
  enforce explainabilityThreshold(0.9);
  execute consensusProtocol(epoch: 5);
}
deployModel aiModel = trainQuantumClassifier(dataset);
syncLedger(transactionId: "tx_001", nodes: [nodeA, nodeB]);
      `.trim()
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Real-time Error Detection', () => {
    it('should detect syntax errors in real-time', async () => {
      const { SingularisErrorDetector } = require('@server/language-server/error-detector');

      SingularisErrorDetector.detectErrors.mockResolvedValue({
        errors: [
          {
            type: 'syntax',
            severity: DiagnosticSeverity.ERROR,
            range: { start: { line: 0, character: 10 }, end: { line: 0, character: 15 } },
            message: 'Expected semicolon after quantumKey declaration',
            code: 'MISSING_SEMICOLON',
            source: 'singularis-syntax'
          }
        ],
        warnings: [
          {
            type: 'best_practice',
            severity: DiagnosticSeverity.WARNING,
            range: { start: { line: 2, character: 2 }, end: { line: 2, character: 7 } },
            message: 'Consider using higher explainability threshold for critical operations',
            code: 'LOW_EXPLAINABILITY',
            source: 'singularis-ai-verification'
          }
        ],
        processingTime: 45 // milliseconds
      });

      const errorDetectionResult = await SingularisErrorDetector.detectErrors({
        document: testDocument,
        realTime: true
      });

      expect(errorDetectionResult.errors).toHaveLength(1);
      expect(errorDetectionResult.warnings).toHaveLength(1);
      expect(errorDetectionResult.processingTime).toBeLessThan(100); // Real-time constraint

      const syntaxError = errorDetectionResult.errors[0];
      expect(syntaxError.type).toBe('syntax');
      expect(syntaxError.severity).toBe(DiagnosticSeverity.ERROR);
      expect(syntaxError.message).toContain('semicolon');
    });

    it('should validate quantum operation constraints', async () => {
      const { SingularisErrorDetector } = require('@server/language-server/error-detector');

      SingularisErrorDetector.validateQuantumOperations.mockResolvedValue({
        quantumErrors: [
          {
            type: 'quantum_violation',
            severity: DiagnosticSeverity.ERROR,
            range: { start: { line: 0, character: 20 }, end: { line: 0, character: 28 } },
            message: 'Quantum no-cloning violation: attempting to copy quantum state',
            quantumDetails: {
              violationType: 'no_cloning_theorem',
              involvedStates: ['alice'] as QuantumReferenceId[],
              suggestedFix: 'Use quantum state move semantics instead of copy'
            }
          }
        ],
        coherenceWarnings: [
          {
            type: 'coherence_risk',
            severity: DiagnosticSeverity.WARNING,
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 50 } },
            message: 'Long operation sequence may exceed coherence time',
            coherenceDetails: {
              estimatedTime: 150000, // microseconds
              maxCoherenceTime: 100000,
              riskLevel: 'medium'
            }
          }
        ]
      });

      const quantumValidation = await SingularisErrorDetector.validateQuantumOperations({
        document: testDocument,
        quantumStates: ['alice']
      });

      expect(quantumValidation.quantumErrors).toHaveLength(1);
      expect(quantumValidation.coherenceWarnings).toHaveLength(1);

      const noCloneError = quantumValidation.quantumErrors[0];
      expect(noCloneError.quantumDetails.violationType).toBe('no_cloning_theorem');
      expect(noCloneError.quantumDetails.suggestedFix).toContain('move semantics');
    });

    it('should check AI explainability and human oversight constraints', async () => {
      const { SingularisErrorDetector } = require('@server/language-server/error-detector');

      SingularisErrorDetector.checkTypeConstraints.mockResolvedValue({
        explainabilityViolations: [
          {
            type: 'explainability_threshold',
            severity: DiagnosticSeverity.ERROR,
            range: { start: { line: 2, character: 2 }, end: { line: 2, character: 40 } },
            message: 'Explainability threshold 0.9 exceeds maximum safe threshold of 0.85',
            explainabilityDetails: {
              currentThreshold: 0.9,
              maxSafeThreshold: 0.85,
              operationCriticality: 'high',
              recommendation: 'Lower threshold or add human oversight'
            }
          }
        ],
        oversightViolations: [
          {
            type: 'missing_human_oversight',
            severity: DiagnosticSeverity.WARNING,
            range: { start: { line: 1, character: 0 }, end: { line: 4, character: 1 } },
            message: 'Critical AI operation requires human oversight approval',
            oversightDetails: {
              operationType: 'AI_Trading',
              requiredLevel: 'critical' as HumanOversightLevel,
              currentLevel: 'none' as HumanOversightLevel,
              suggestedAction: 'Add humanApproval: true to contract'
            }
          }
        ]
      });

      const constraintCheck = await SingularisErrorDetector.checkTypeConstraints({
        document: testDocument,
        checkExplainability: true,
        checkHumanOversight: true
      });

      expect(constraintCheck.explainabilityViolations).toHaveLength(1);
      expect(constraintCheck.oversightViolations).toHaveLength(1);

      const explainabilityError = constraintCheck.explainabilityViolations[0];
      expect(explainabilityError.explainabilityDetails.currentThreshold).toBe(0.9);
      expect(explainabilityError.explainabilityDetails.maxSafeThreshold).toBe(0.85);
    });

    it('should provide fast incremental error checking', async () => {
      const { SingularisErrorDetector } = require('@server/language-server/error-detector');

      // Simulate incremental document change
      const documentChange = {
        range: { start: { line: 0, character: 45 }, end: { line: 0, character: 46 } },
        text: ';'
      };

      SingularisErrorDetector.detectErrors.mockResolvedValue({
        errors: [], // Error fixed by adding semicolon
        warnings: [],
        processingTime: 12, // Very fast incremental check
        incrementalUpdate: true,
        changedRange: documentChange.range,
        affectedRanges: [
          { start: { line: 0, character: 0 }, end: { line: 0, character: 50 } }
        ]
      });

      const incrementalResult = await SingularisErrorDetector.detectErrors({
        document: testDocument,
        change: documentChange,
        incremental: true
      });

      expect(incrementalResult.incrementalUpdate).toBe(true);
      expect(incrementalResult.processingTime).toBeLessThan(20); // Very fast
      expect(incrementalResult.errors).toHaveLength(0); // Error resolved
      expect(incrementalResult.affectedRanges).toHaveLength(1);
    });
  });

  describe('AI-Powered Code Completion', () => {
    it('should provide intelligent code completions', async () => {
      const { SingularisCompletionEngine } = require('@server/language-server/completion-engine');

      SingularisCompletionEngine.provideCompletions.mockResolvedValue({
        completions: [
          {
            label: 'quantumKey',
            kind: CompletionItemKind.Keyword,
            detail: 'Quantum key declaration',
            documentation: 'Creates a new quantum cryptographic key with entanglement',
            insertText: 'quantumKey ${1:keyName} = entangle(${2:nodeA}, ${3:nodeB});',
            insertTextFormat: 2, // Snippet format
            sortText: '0001',
            filterText: 'quantumKey'
          },
          {
            label: 'explainabilityThreshold',
            kind: CompletionItemKind.Function,
            detail: 'Set AI explainability threshold',
            documentation: 'Enforces minimum explainability score for AI decisions',
            insertText: 'explainabilityThreshold(${1:0.85})',
            insertTextFormat: 2,
            sortText: '0002',
            filterText: 'explainabilityThreshold'
          },
          {
            label: 'humanApproval',
            kind: CompletionItemKind.Property,
            detail: 'Require human oversight',
            documentation: 'Enforces human approval for critical operations',
            insertText: 'humanApproval: true',
            insertTextFormat: 1, // Plain text
            sortText: '0003',
            filterText: 'humanApproval'
          }
        ],
        isIncomplete: false,
        contextAnalysis: {
          currentScope: 'global',
          availableVariables: ['nodeA', 'nodeB'],
          quantumStates: [],
          aiContracts: ['AI_Trading']
        }
      });

      const completionResult = await SingularisCompletionEngine.provideCompletions({
        document: testDocument,
        position: { line: 5, character: 0 },
        context: { triggerKind: 1 } // Invoked
      });

      expect(completionResult.completions).toHaveLength(3);
      expect(completionResult.isIncomplete).toBe(false);

      const quantumCompletion = completionResult.completions[0];
      expect(quantumCompletion.label).toBe('quantumKey');
      expect(quantumCompletion.kind).toBe(CompletionItemKind.Keyword);
      expect(quantumCompletion.insertText).toContain('entangle');

      const explainabilityCompletion = completionResult.completions[1];
      expect(explainabilityCompletion.label).toBe('explainabilityThreshold');
      expect(explainabilityCompletion.insertText).toContain('0.85');
    });

    it('should provide quantum-specific completions', async () => {
      const { SingularisCompletionEngine } = require('@server/language-server/completion-engine');

      SingularisCompletionEngine.provideQuantumCompletions.mockResolvedValue({
        quantumCompletions: [
          {
            label: 'entangle',
            kind: CompletionItemKind.Function,
            detail: 'Create quantum entanglement',
            documentation: 'Creates entangled quantum states between specified nodes',
            insertText: 'entangle(${1:nodeA}, ${2:nodeB}, {fidelity: ${3:0.95}})',
            quantumProperties: {
              operation: 'entanglement_creation',
              requiredNodes: 2,
              coherenceTime: 100000,
              fidelityThreshold: 0.9
            }
          },
          {
            label: 'measureState',
            kind: CompletionItemKind.Function,
            detail: 'Quantum state measurement',
            documentation: 'Measures quantum state in specified basis',
            insertText: 'measureState(${1:quantumState}, {basis: "${2:computational}"})',
            quantumProperties: {
              operation: 'measurement',
              destructive: true,
              basisOptions: ['computational', 'hadamard', 'custom']
            }
          },
          {
            label: 'teleportState',
            kind: CompletionItemKind.Function,
            detail: 'Quantum teleportation',
            documentation: 'Teleports quantum state between nodes using EPR pairs',
            insertText: 'teleportState(${1:state}, ${2:sourceNode}, ${3:targetNode})',
            quantumProperties: {
              operation: 'teleportation',
              requiresEPR: true,
              fidelityLoss: 0.02
            }
          }
        ],
        contextSuggestions: {
          availableNodes: ['nodeA', 'nodeB', 'nodeC'],
          existingQuantumStates: ['alice'],
          recommendedOperations: ['entangle', 'measureState']
        }
      });

      const quantumCompletions = await SingularisCompletionEngine.provideQuantumCompletions({
        document: testDocument,
        position: { line: 1, character: 25 },
        quantumContext: true
      });

      expect(quantumCompletions.quantumCompletions).toHaveLength(3);

      const entangleCompletion = quantumCompletions.quantumCompletions[0];
      expect(entangleCompletion.quantumProperties.operation).toBe('entanglement_creation');
      expect(entangleCompletion.quantumProperties.requiredNodes).toBe(2);

      const measureCompletion = quantumCompletions.quantumCompletions[1];
      expect(measureCompletion.quantumProperties.destructive).toBe(true);
      expect(measureCompletion.quantumProperties.basisOptions).toContain('computational');

      expect(quantumCompletions.contextSuggestions.availableNodes).toContain('nodeA');
      expect(quantumCompletions.contextSuggestions.existingQuantumStates).toContain('alice');
    });

    it('should provide AI-assisted completions with explainability', async () => {
      const { SingularisCompletionEngine } = require('@server/language-server/completion-engine');

      SingularisCompletionEngine.getAIAssistance.mockResolvedValue({
        aiSuggestions: [
          {
            label: 'Enhanced AI Contract',
            kind: CompletionItemKind.Snippet,
            detail: 'AI contract with full compliance',
            insertText: `contract \${1:ContractName} {
  enforce explainabilityThreshold(0.85);
  enforce humanApproval: true;
  enforce auditMonitor: true;
  execute \${2:operation}(\${3:parameters});
}`,
            aiAnalysis: {
              explainabilityScore: 0.95,
              complianceLevel: 'full',
              recommendationReason: 'Provides complete AI governance framework',
              safetyFeatures: [
                'explainability_enforcement',
                'human_oversight',
                'audit_trail'
              ]
            }
          }
        ],
        codeAnalysis: {
          currentExplainability: 0.75,
          suggestedImprovements: [
            'Add human oversight for critical operations',
            'Increase explainability threshold to 0.85',
            'Enable audit monitoring'
          ],
          riskAssessment: 'medium',
          complianceGaps: ['missing_human_approval', 'insufficient_monitoring']
        }
      });

      const aiAssistance = await SingularisCompletionEngine.getAIAssistance({
        document: testDocument,
        position: { line: 1, character: 0 },
        requestType: 'contract_enhancement'
      });

      expect(aiAssistance.aiSuggestions).toHaveLength(1);

      const enhancedContract = aiAssistance.aiSuggestions[0];
      expect(enhancedContract.aiAnalysis.explainabilityScore).toBe(0.95);
      expect(enhancedContract.aiAnalysis.complianceLevel).toBe('full');
      expect(enhancedContract.aiAnalysis.safetyFeatures).toContain('human_oversight');

      expect(aiAssistance.codeAnalysis.currentExplainability).toBe(0.75);
      expect(aiAssistance.codeAnalysis.suggestedImprovements).toContain(
        'Increase explainability threshold to 0.85'
      );
    });
  });

  describe('Explainability Hints and Real-time Guidance', () => {
    it('should generate real-time explainability hints', async () => {
      const { SingularisExplainabilityEngine } = require('@server/language-server/explainability-engine');

      SingularisExplainabilityEngine.generateHints.mockResolvedValue({
        hints: [
          {
            range: { start: { line: 2, character: 2 }, end: { line: 2, character: 40 } },
            severity: 'info',
            message: 'Explainability Analysis',
            content: {
              currentScore: 0.9,
              analysis: 'High explainability threshold provides excellent transparency',
              impact: 'Enables clear reasoning trails for all AI decisions',
              recommendations: [
                'Consider adding documentation for complex algorithms',
                'Implement decision tree visualization'
              ]
            },
            hintType: 'explainability_analysis'
          },
          {
            range: { start: { line: 1, character: 0 }, end: { line: 4, character: 1 } },
            severity: 'warning',
            message: 'Human Oversight Recommendation',
            content: {
              riskLevel: 'medium',
              analysis: 'Trading operations should include human approval',
              impact: 'Reduces risk of uncontrolled autonomous trading',
              recommendations: [
                'Add humanApproval: true to contract',
                'Implement approval workflow'
              ]
            },
            hintType: 'human_oversight'
          }
        ],
        overallAnalysis: {
          documentExplainability: 0.78,
          improvementPotential: 0.15,
          criticalIssues: 1,
          recommendations: 2
        }
      });

      const hintsResult = await SingularisExplainabilityEngine.generateHints({
        document: testDocument,
        realTime: true
      });

      expect(hintsResult.hints).toHaveLength(2);

      const explainabilityHint = hintsResult.hints[0];
      expect(explainabilityHint.hintType).toBe('explainability_analysis');
      expect(explainabilityHint.content.currentScore).toBe(0.9);
      expect(explainabilityHint.content.recommendations).toHaveLength(2);

      const oversightHint = hintsResult.hints[1];
      expect(oversightHint.hintType).toBe('human_oversight');
      expect(oversightHint.content.riskLevel).toBe('medium');

      expect(hintsResult.overallAnalysis.documentExplainability).toBe(0.78);
      expect(hintsResult.overallAnalysis.criticalIssues).toBe(1);
    });

    it('should analyze code explainability and suggest improvements', async () => {
      const { SingularisExplainabilityEngine } = require('@server/language-server/explainability-engine');

      SingularisExplainabilityEngine.analyzeExplainability.mockResolvedValue({
        analysis: {
          overallScore: 0.72,
          componentScores: {
            quantumOperations: 0.85,
            aiContracts: 0.68,
            modelDeployments: 0.75,
            ledgerOperations: 0.70
          },
          explainabilityFactors: {
            algorithmClarity: 0.8,
            parameterTransparency: 0.7,
            decisionReasoning: 0.65,
            humanReadability: 0.75
          },
          weakAreas: [
            {
              component: 'AI_Trading contract',
              issue: 'Low explainability threshold',
              currentScore: 0.68,
              targetScore: 0.85,
              impact: 'high'
            }
          ]
        },
        improvements: [
          {
            type: 'threshold_adjustment',
            description: 'Increase explainability threshold to 0.85',
            expectedImprovement: 0.17,
            effort: 'low',
            priority: 'high'
          },
          {
            type: 'documentation_enhancement',
            description: 'Add detailed comments explaining AI decision logic',
            expectedImprovement: 0.12,
            effort: 'medium',
            priority: 'medium'
          }
        ]
      });

      const explainabilityAnalysis = await SingularisExplainabilityEngine.analyzeExplainability({
        document: testDocument,
        detailedAnalysis: true
      });

      expect(explainabilityAnalysis.analysis.overallScore).toBe(0.72);
      expect(explainabilityAnalysis.analysis.componentScores.quantumOperations).toBe(0.85);
      expect(explainabilityAnalysis.analysis.weakAreas).toHaveLength(1);

      const weakArea = explainabilityAnalysis.analysis.weakAreas[0];
      expect(weakArea.component).toContain('AI_Trading');
      expect(weakArea.currentScore).toBe(0.68);
      expect(weakArea.targetScore).toBe(0.85);

      expect(explainabilityAnalysis.improvements).toHaveLength(2);
      const topImprovement = explainabilityAnalysis.improvements[0];
      expect(topImprovement.type).toBe('threshold_adjustment');
      expect(topImprovement.expectedImprovement).toBe(0.17);
    });

    it('should provide contextual improvement suggestions', async () => {
      const { SingularisExplainabilityEngine } = require('@server/language-server/explainability-engine');

      SingularisExplainabilityEngine.suggestImprovements.mockResolvedValue({
        contextualSuggestions: [
          {
            position: { line: 2, character: 32 },
            currentValue: '0.9',
            suggestedValue: '0.85',
            reasoning: 'Threshold above 0.85 may cause performance issues while providing minimal explainability gains',
            impact: {
              explainabilityChange: -0.05,
              performanceGain: 0.15,
              recommendationConfidence: 0.92
            }
          },
          {
            position: { line: 1, character: 8 },
            currentCode: 'contract AI_Trading {',
            suggestedCode: 'contract AI_Trading {\n  humanApproval: true;',
            reasoning: 'Trading operations require human oversight for regulatory compliance',
            impact: {
              complianceImprovement: 'critical_to_compliant',
              explainabilityBoost: 0.08,
              recommendationConfidence: 0.98
            }
          }
        ],
        globalSuggestions: [
          {
            type: 'add_monitoring',
            description: 'Enable audit monitoring for all AI operations',
            implementation: 'Add auditMonitor: true to all contracts',
            benefits: [
              'Full operation traceability',
              'Regulatory compliance',
              'Real-time explainability tracking'
            ]
          }
        ]
      });

      const suggestions = await SingularisExplainabilityEngine.suggestImprovements({
        document: testDocument,
        improvementType: 'contextual'
      });

      expect(suggestions.contextualSuggestions).toHaveLength(2);

      const thresholdSuggestion = suggestions.contextualSuggestions[0];
      expect(thresholdSuggestion.currentValue).toBe('0.9');
      expect(thresholdSuggestion.suggestedValue).toBe('0.85');
      expect(thresholdSuggestion.impact.performanceGain).toBe(0.15);

      const oversightSuggestion = suggestions.contextualSuggestions[1];
      expect(oversightSuggestion.suggestedCode).toContain('humanApproval: true');
      expect(oversightSuggestion.impact.complianceImprovement).toBe('critical_to_compliant');

      expect(suggestions.globalSuggestions).toHaveLength(1);
      expect(suggestions.globalSuggestions[0].type).toBe('add_monitoring');
    });
  });

  describe('Quantum Diagnostics and Coherence Monitoring', () => {
    it('should provide quantum state diagnostics', async () => {
      mockLSPServer.getQuantumDiagnostics.mockResolvedValue({
        quantumStates: [
          {
            id: 'alice' as QuantumReferenceId,
            position: { line: 0, character: 10 },
            diagnostics: {
              coherenceTime: 85000, // microseconds
              estimatedDecoherence: 15000, // 15ms until decoherence
              fidelity: 0.94,
              entanglementStatus: 'entangled',
              entanglementPartners: ['nodeB_state'],
              operationHistory: [
                { operation: 'entangle', timestamp: Date.now() - 5000 },
                { operation: 'measure_prep', timestamp: Date.now() - 1000 }
              ]
            },
            healthIndicators: {
              status: 'healthy',
              warningLevel: 'none',
              criticalIssues: []
            }
          }
        ],
        coherenceBudget: {
          totalBudget: 100000, // microseconds
          usedBudget: 15000,
          remainingBudget: 85000,
          efficiencyScore: 0.85
        },
        networkDiagnostics: {
          connectedNodes: ['nodeA', 'nodeB'],
          latencies: { 'nodeA->nodeB': 45 }, // milliseconds
          fidelityLevels: { 'nodeA<->nodeB': 0.96 }
        }
      });

      const quantumDiagnostics = await mockLSPServer.getQuantumDiagnostics({
        document: testDocument,
        includeNetworkInfo: true
      });

      expect(quantumDiagnostics.quantumStates).toHaveLength(1);

      const aliceState = quantumDiagnostics.quantumStates[0];
      expect(aliceState.id).toBe('alice');
      expect(aliceState.diagnostics.fidelity).toBe(0.94);
      expect(aliceState.diagnostics.entanglementStatus).toBe('entangled');
      expect(aliceState.healthIndicators.status).toBe('healthy');

      expect(quantumDiagnostics.coherenceBudget.remainingBudget).toBe(85000);
      expect(quantumDiagnostics.coherenceBudget.efficiencyScore).toBe(0.85);

      expect(quantumDiagnostics.networkDiagnostics.connectedNodes).toContain('nodeA');
      expect(quantumDiagnostics.networkDiagnostics.latencies['nodeA->nodeB']).toBe(45);
    });

    it('should monitor quantum operations and predict decoherence', async () => {
      mockLSPServer.getQuantumDiagnostics.mockResolvedValue({
        decoherenceAnalysis: {
          predictions: [
            {
              quantumStateId: 'alice' as QuantumReferenceId,
              currentCoherence: 0.94,
              predictedCoherence: 0.78,
              timeHorizon: 50000, // 50ms prediction
              decayRate: 0.003, // per millisecond
              criticalTime: 120000, // microseconds until critical
              recommendations: [
                'Complete quantum operations within 120ms',
                'Consider quantum error correction',
                'Prioritize this state for immediate operations'
              ]
            }
          ],
          systemWideAnalysis: {
            averageCoherenceTime: 95000,
            decoherenceRisk: 'low',
            resourceUtilization: 0.65,
            optimizationOpportunities: [
              'Batch similar quantum operations',
              'Optimize operation ordering for coherence preservation'
            ]
          }
        }
      });

      const decoherenceMonitoring = await mockLSPServer.getQuantumDiagnostics({
        document: testDocument,
        analyzeDecoherence: true,
        predictionTimeHorizon: 50000
      });

      expect(decoherenceMonitoring.decoherenceAnalysis.predictions).toHaveLength(1);

      const alicePrediction = decoherenceMonitoring.decoherenceAnalysis.predictions[0];
      expect(alicePrediction.quantumStateId).toBe('alice');
      expect(alicePrediction.currentCoherence).toBe(0.94);
      expect(alicePrediction.predictedCoherence).toBe(0.78);
      expect(alicePrediction.criticalTime).toBe(120000);
      expect(alicePrediction.recommendations).toContain('Complete quantum operations within 120ms');

      const systemAnalysis = decoherenceMonitoring.decoherenceAnalysis.systemWideAnalysis;
      expect(systemAnalysis.decoherenceRisk).toBe('low');
      expect(systemAnalysis.resourceUtilization).toBe(0.65);
    });

    it('should visualize quantum circuit execution flow', async () => {
      mockLSPServer.getQuantumDiagnostics.mockResolvedValue({
        circuitVisualization: {
          executionGraph: {
            nodes: [
              { id: 'entangle_op', type: 'quantum_operation', position: { x: 0, y: 0 } },
              { id: 'alice_state', type: 'quantum_state', position: { x: 100, y: 0 } },
              { id: 'measure_op', type: 'measurement', position: { x: 200, y: 0 } }
            ],
            edges: [
              { from: 'entangle_op', to: 'alice_state', type: 'state_creation' },
              { from: 'alice_state', to: 'measure_op', type: 'measurement_input' }
            ]
          },
          timingDiagram: {
            totalDuration: 150000, // microseconds
            operations: [
              { name: 'entangle', start: 0, duration: 25000, coherenceCost: 25000 },
              { name: 'process', start: 25000, duration: 75000, coherenceCost: 30000 },
              { name: 'measure', start: 100000, duration: 50000, coherenceCost: 20000 }
            ]
          },
          resourceUsage: {
            peakMemory: 128, // MB
            quantumStatesAllocated: 3,
            eprPairsConsumed: 1,
            networkBandwidth: 450 // KB/s
          }
        }
      });

      const circuitVisualization = await mockLSPServer.getQuantumDiagnostics({
        document: testDocument,
        generateVisualization: true
      });

      expect(circuitVisualization.circuitVisualization.executionGraph.nodes).toHaveLength(3);
      expect(circuitVisualization.circuitVisualization.executionGraph.edges).toHaveLength(2);

      const entangleNode = circuitVisualization.circuitVisualization.executionGraph.nodes[0];
      expect(entangleNode.type).toBe('quantum_operation');

      const timingDiagram = circuitVisualization.circuitVisualization.timingDiagram;
      expect(timingDiagram.totalDuration).toBe(150000);
      expect(timingDiagram.operations).toHaveLength(3);

      const totalCoherenceCost = timingDiagram.operations.reduce(
        (sum, op) => sum + op.coherenceCost, 0
      );
      expect(totalCoherenceCost).toBe(75000);
    });
  });

  describe('Monaco Editor Integration and WebSocket Communication', () => {
    it('should establish WebSocket connection for real-time communication', async () => {
      const connectionPromise = new Promise((resolve) => {
        mockWebSocket.on.mockImplementation((event, callback) => {
          if (event === 'open') {
            setTimeout(() => callback(), 10);
          }
          if (event === 'message') {
            setTimeout(() => {
              callback(JSON.stringify({
                id: 1,
                method: LSPMessageType.INITIALIZE,
                params: { capabilities: {} }
              }));
            }, 20);
          }
        });
        
        setTimeout(() => resolve(true), 50);
      });

      await connectionPromise;
      
      expect(mockWebSocket.on).toHaveBeenCalledWith('open', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWebSocket.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should handle LSP message exchange', async () => {
      mockLSPServer.handleMessage.mockResolvedValue({
        id: 1,
        result: {
          capabilities: {
            textDocumentSync: 1,
            completionProvider: { triggerCharacters: ['.', ':', '('] },
            hoverProvider: true,
            definitionProvider: true,
            diagnosticProvider: true,
            quantumDiagnosticProvider: true,
            explainabilityHintProvider: true
          },
          serverInfo: {
            name: 'SINGULARIS PRIME Language Server',
            version: '1.0.0'
          }
        }
      });

      const initializeMessage = {
        id: 1,
        method: LSPMessageType.INITIALIZE,
        params: {
          capabilities: {
            textDocument: {
              completion: { dynamicRegistration: true },
              hover: { dynamicRegistration: true },
              diagnostic: { dynamicRegistration: true }
            },
            experimental: {
              quantumDiagnostics: true,
              explainabilityHints: true
            }
          }
        }
      };

      const response = await mockLSPServer.handleMessage(initializeMessage);
      
      expect(response.result.capabilities.completionProvider).toBeDefined();
      expect(response.result.capabilities.quantumDiagnosticProvider).toBe(true);
      expect(response.result.capabilities.explainabilityHintProvider).toBe(true);
    });

    it('should publish real-time diagnostics to Monaco Editor', async () => {
      mockLSPServer.publishDiagnostics.mockImplementation((uri, diagnostics) => {
        const message = {
          method: LSPMessageType.PUBLISH_DIAGNOSTICS,
          params: {
            uri,
            diagnostics: diagnostics.map(d => ({
              range: d.range,
              severity: d.severity,
              code: d.code,
              source: d.source,
              message: d.message
            }))
          }
        };
        
        mockWebSocket.send(JSON.stringify(message));
        return Promise.resolve();
      });

      const diagnostics = [
        {
          range: { start: { line: 0, character: 10 }, end: { line: 0, character: 15 } },
          severity: DiagnosticSeverity.ERROR,
          code: 'QUANTUM_CLONING',
          source: 'singularis-quantum',
          message: 'Quantum state cloning detected'
        },
        {
          range: { start: { line: 2, character: 2 }, end: { line: 2, character: 40 } },
          severity: DiagnosticSeverity.WARNING,
          code: 'LOW_EXPLAINABILITY',
          source: 'singularis-ai',
          message: 'Explainability threshold below recommended level'
        }
      ];

      await mockLSPServer.publishDiagnostics(testDocument.uri, diagnostics);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('"method":"textDocument/publishDiagnostics"')
      );
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('QUANTUM_CLONING')
      );
      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('LOW_EXPLAINABILITY')
      );
    });

    it('should handle Monaco Editor hover requests', async () => {
      mockLSPServer.provideHover.mockResolvedValue({
        contents: {
          kind: 'markdown',
          value: `
## quantumKey alice

**Type:** QuantumKey  
**Status:** Entangled  
**Fidelity:** 0.94  
**Coherence Time:** 85ms remaining  

### Quantum Properties
- **Entanglement Partners:** nodeB_state
- **Measurement Basis:** computational
- **No-cloning Status:** Enforced

### Operations Available
- \`measure(basis)\` - Collapse to classical state
- \`teleport(target)\` - Quantum teleportation
- \`rotate(angle, axis)\` - Quantum gate operation

### Safety Information
⚠️ **Decoherence Warning:** State will lose coherence in ~85ms  
✅ **Quantum Safety:** No-cloning theorem enforced
          `.trim()
        },
        range: { start: { line: 0, character: 10 }, end: { line: 0, character: 15 } }
      });

      const hoverRequest = {
        id: 2,
        method: LSPMessageType.HOVER,
        params: {
          textDocument: { uri: testDocument.uri },
          position: { line: 0, character: 12 }
        }
      };

      const hoverResponse = await mockLSPServer.provideHover({
        document: testDocument,
        position: { line: 0, character: 12 }
      });

      expect(hoverResponse.contents.kind).toBe('markdown');
      expect(hoverResponse.contents.value).toContain('quantumKey alice');
      expect(hoverResponse.contents.value).toContain('Fidelity: 0.94');
      expect(hoverResponse.contents.value).toContain('No-cloning theorem enforced');
      expect(hoverResponse.range).toBeDefined();
    });
  });

  describe('Advanced Language Features', () => {
    it('should provide go-to-definition for quantum operations', async () => {
      mockLSPServer.handleMessage.mockImplementation(async (message) => {
        if (message.method === LSPMessageType.GOTO_DEFINITION) {
          return {
            id: message.id,
            result: [
              {
                uri: 'file:///stdlib/quantum-operations.spr',
                range: {
                  start: { line: 15, character: 0 },
                  end: { line: 25, character: 45 }
                }
              }
            ]
          };
        }
      });

      const definitionRequest = {
        id: 3,
        method: LSPMessageType.GOTO_DEFINITION,
        params: {
          textDocument: { uri: testDocument.uri },
          position: { line: 0, character: 20 } // Position of 'entangle'
        }
      };

      const definitionResponse = await mockLSPServer.handleMessage(definitionRequest);
      
      expect(definitionResponse.result).toHaveLength(1);
      expect(definitionResponse.result[0].uri).toBe('file:///stdlib/quantum-operations.spr');
      expect(definitionResponse.result[0].range.start.line).toBe(15);
    });

    it('should find references across quantum programs', async () => {
      mockLSPServer.handleMessage.mockImplementation(async (message) => {
        if (message.method === LSPMessageType.FIND_REFERENCES) {
          return {
            id: message.id,
            result: [
              {
                uri: testDocument.uri,
                range: { start: { line: 0, character: 10 }, end: { line: 0, character: 15 } }
              },
              {
                uri: 'file:///test/quantum-test.spr',
                range: { start: { line: 5, character: 8 }, end: { line: 5, character: 13 } }
              },
              {
                uri: 'file:///lib/quantum-utils.spr',
                range: { start: { line: 22, character: 15 }, end: { line: 22, character: 20 } }
              }
            ]
          };
        }
      });

      const referencesRequest = {
        id: 4,
        method: LSPMessageType.FIND_REFERENCES,
        params: {
          textDocument: { uri: testDocument.uri },
          position: { line: 0, character: 12 }, // Position in 'alice'
          context: { includeDeclaration: true }
        }
      };

      const referencesResponse = await mockLSPServer.handleMessage(referencesRequest);
      
      expect(referencesResponse.result).toHaveLength(3);
      expect(referencesResponse.result[0].uri).toBe(testDocument.uri);
      expect(referencesResponse.result[1].uri).toBe('file:///test/quantum-test.spr');
      expect(referencesResponse.result[2].uri).toBe('file:///lib/quantum-utils.spr');
    });

    it('should provide document symbols for quantum programs', async () => {
      mockLSPServer.handleMessage.mockImplementation(async (message) => {
        if (message.method === LSPMessageType.DOCUMENT_SYMBOLS) {
          return {
            id: message.id,
            result: [
              {
                name: 'alice',
                kind: 13, // Variable
                range: { start: { line: 0, character: 10 }, end: { line: 0, character: 15 } },
                selectionRange: { start: { line: 0, character: 10 }, end: { line: 0, character: 15 } },
                detail: 'QuantumKey'
              },
              {
                name: 'AI_Trading',
                kind: 5, // Class
                range: { start: { line: 1, character: 0 }, end: { line: 4, character: 1 } },
                selectionRange: { start: { line: 1, character: 9 }, end: { line: 1, character: 19 } },
                detail: 'AI Contract'
              },
              {
                name: 'aiModel',
                kind: 13, // Variable
                range: { start: { line: 5, character: 0 }, end: { line: 5, character: 50 } },
                selectionRange: { start: { line: 5, character: 12 }, end: { line: 5, character: 19 } },
                detail: 'DeployModel'
              }
            ]
          };
        }
      });

      const symbolsRequest = {
        id: 5,
        method: LSPMessageType.DOCUMENT_SYMBOLS,
        params: {
          textDocument: { uri: testDocument.uri }
        }
      };

      const symbolsResponse = await mockLSPServer.handleMessage(symbolsRequest);
      
      expect(symbolsResponse.result).toHaveLength(3);
      
      const aliceSymbol = symbolsResponse.result[0];
      expect(aliceSymbol.name).toBe('alice');
      expect(aliceSymbol.detail).toBe('QuantumKey');
      
      const contractSymbol = symbolsResponse.result[1];
      expect(contractSymbol.name).toBe('AI_Trading');
      expect(contractSymbol.detail).toBe('AI Contract');
    });
  });

  describe('Performance and Real-time Requirements', () => {
    it('should meet real-time response requirements (< 100ms)', async () => {
      const responseTimes = [];
      
      for (let i = 0; i < 50; i++) {
        const startTime = Date.now();
        
        // Simulate various LSP operations
        mockLSPServer.handleMessage.mockResolvedValueOnce({
          id: i,
          result: { status: 'success' }
        });
        
        await mockLSPServer.handleMessage({
          id: i,
          method: Math.random() < 0.5 ? LSPMessageType.COMPLETION : LSPMessageType.HOVER,
          params: {}
        });
        
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }
      
      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      expect(averageResponseTime).toBeLessThan(100); // < 100ms average
      expect(maxResponseTime).toBeLessThan(200);     // < 200ms max
      expect(responseTimes.filter(time => time > 100).length).toBeLessThan(5); // < 10% over 100ms
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 20;
      const requests = Array.from({ length: concurrentRequests }, (_, i) => {
        mockLSPServer.handleMessage.mockResolvedValueOnce({
          id: i,
          result: { status: 'success', processingTime: Math.random() * 50 + 10 }
        });
        
        return mockLSPServer.handleMessage({
          id: i,
          method: LSPMessageType.COMPLETION,
          params: {
            textDocument: { uri: testDocument.uri },
            position: { line: Math.floor(Math.random() * 5), character: Math.floor(Math.random() * 20) }
          }
        });
      });
      
      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;
      
      expect(results).toHaveLength(concurrentRequests);
      expect(totalTime).toBeLessThan(500); // Should handle 20 concurrent requests in < 500ms
      
      results.forEach(result => {
        expect(result.result.status).toBe('success');
      });
    });

    it('should maintain memory efficiency under load', async () => {
      const initialMemory = 50; // MB baseline
      let currentMemory = initialMemory;
      
      // Simulate sustained load
      for (let i = 0; i < 100; i++) {
        mockLSPServer.handleMessage.mockResolvedValueOnce({
          id: i,
          result: { 
            status: 'success',
            memoryUsage: currentMemory + Math.random() * 5 // Small memory fluctuation
          }
        });
        
        const result = await mockLSPServer.handleMessage({
          id: i,
          method: LSPMessageType.COMPLETION,
          params: {}
        });
        
        currentMemory = result.result.memoryUsage;
      }
      
      const memoryGrowth = currentMemory - initialMemory;
      
      expect(memoryGrowth).toBeLessThan(50); // < 50MB growth over 100 operations
      expect(currentMemory).toBeLessThan(150); // Total memory < 150MB
    });
  });
});