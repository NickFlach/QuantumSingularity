/**
 * SINGULARIS PRIME AI Type System
 * 
 * This module defines the AI type system for the SINGULARIS PRIME language.
 * It enforces AI safety principles at the type level, including:
 * - Explainability thresholds for all AI operations
 * - Human oversight requirements for critical decisions
 * - Audit trail compliance for AI governance
 * - Type-safe AI negotiation protocols
 * - Verification and validation constraints
 * - Ethical AI decision boundaries
 */

import { QuantumReferenceId } from './quantum-types';

// Unique AI entity ID for tracking and governance
export type AIEntityId = string & { readonly _brand: 'AIEntity' };

// Unique contract ID for AI agreements
export type AIContractId = string & { readonly _brand: 'AIContract' };

// Explainability score (0.0 - 1.0, where 1.0 is fully explainable)
export type ExplainabilityScore = number & { 
  readonly _brand: 'ExplainabilityScore';
  readonly _min: 0.0;
  readonly _max: 1.0;
};

// Human oversight requirement levels
export enum HumanOversightLevel {
  NONE = 'none',                    // Fully autonomous
  NOTIFICATION = 'notification',    // Human informed but not required
  APPROVAL = 'approval',           // Human approval required
  SUPERVISION = 'supervision',     // Human actively supervising
  CONTROL = 'control'              // Human in direct control
}

// AI operation criticality levels
export enum OperationCriticality {
  LOW = 'low',           // Non-critical operations
  MEDIUM = 'medium',     // Standard operations
  HIGH = 'high',         // Important operations
  CRITICAL = 'critical', // Mission-critical operations
  SAFETY = 'safety'      // Safety-critical operations
}

// AI governance compliance status
export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  UNDER_REVIEW = 'under_review',
  EXEMPTED = 'exempted'
}

// AI decision confidence levels
export enum ConfidenceLevel {
  VERY_LOW = 'very_low',     // < 0.3
  LOW = 'low',               // 0.3 - 0.5
  MEDIUM = 'medium',         // 0.5 - 0.7
  HIGH = 'high',             // 0.7 - 0.9
  VERY_HIGH = 'very_high'    // > 0.9
}

/**
 * Core AI Entity Type with Safety Constraints
 */
export interface AIEntity {
  readonly id: AIEntityId;
  readonly name: string;
  readonly version: string;
  readonly modelType: 'language_model' | 'decision_tree' | 'neural_network' | 'quantum_ai' | 'hybrid';
  readonly capabilities: ReadonlyArray<AICapability>;
  readonly safetyRating: SafetyRating;
  readonly explainabilityScore: ExplainabilityScore;
  readonly createdAt: number;
  readonly lastValidated: number;
  
  // Governance constraints
  readonly oversightLevel: HumanOversightLevel;
  readonly complianceStatus: ComplianceStatus;
  readonly auditTrailRequired: boolean;
  
  // Type-level safety constraints (branded types)
  readonly __aiSafetyVerified: unique symbol;
  readonly __aiExplainable: unique symbol;
}

/**
 * AI Capability Definition
 */
export interface AICapability {
  readonly name: string;
  readonly category: 'reasoning' | 'prediction' | 'classification' | 'generation' | 'optimization';
  readonly riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  readonly explainabilityRequirement: ExplainabilityScore;
  readonly humanOversightRequired: boolean;
}

/**
 * AI Safety Rating
 */
export interface SafetyRating {
  readonly overall: number; // 0.0 - 1.0
  readonly categories: {
    readonly alignment: number;
    readonly robustness: number;
    readonly privacy: number;
    readonly fairness: number;
    readonly transparency: number;
  };
  readonly certifiedBy: string;
  readonly validUntil: number;
}

/**
 * AI Contract with Type-Level Safety Enforcement
 */
export interface AIContract {
  readonly id: AIContractId;
  readonly name: string;
  readonly participants: {
    readonly initiator: AIEntityId;
    readonly responder: AIEntityId;
    readonly humanSupervisor?: string; // Required for high-criticality operations
  };
  
  // Contract terms with type safety
  readonly terms: AIContractTerms;
  readonly explainabilityThreshold: ExplainabilityScore;
  readonly oversightLevel: HumanOversightLevel;
  readonly criticality: OperationCriticality;
  
  // Execution constraints
  readonly maxExecutionTime: number; // milliseconds
  readonly fallbackProcedure: FallbackProcedure;
  readonly auditRequirement: AuditRequirement;
  
  // Quantum security integration
  readonly quantumKeyRequired?: QuantumReferenceId;
  readonly quantumVerification: boolean;
  
  // Type-level contract validity (branded types)
  readonly __aiContractValid: unique symbol;
  readonly __aiHumanApproved: unique symbol;
}

/**
 * AI Contract Terms
 */
export interface AIContractTerms {
  readonly operation: AIOperation;
  readonly inputConstraints: InputConstraints;
  readonly outputRequirements: OutputRequirements;
  readonly performanceMetrics: PerformanceMetrics;
  readonly safetyLimits: SafetyLimits;
}

/**
 * AI Operation Definition
 */
export interface AIOperation {
  readonly type: 'decision' | 'negotiation' | 'optimization' | 'prediction' | 'generation';
  readonly description: string;
  readonly algorithm: string;
  readonly dataRequirements: DataRequirements;
  readonly computationalComplexity: ComputationalComplexity;
  readonly ethicalConstraints: EthicalConstraints;
}

/**
 * Input Constraints for AI Operations
 */
export interface InputConstraints {
  readonly dataTypes: ReadonlyArray<string>;
  readonly privacyLevel: 'public' | 'internal' | 'confidential' | 'secret';
  readonly sanitationRequired: boolean;
  readonly biasCheckRequired: boolean;
  readonly humanValidationRequired: boolean;
}

/**
 * Output Requirements for AI Operations
 */
export interface OutputRequirements {
  readonly format: string;
  readonly explainabilityLevel: ExplainabilityScore;
  readonly confidenceThreshold: number;
  readonly humanReadable: boolean;
  readonly auditableTrace: boolean;
}

/**
 * Performance Metrics
 */
export interface PerformanceMetrics {
  readonly accuracy: { min: number; target: number; };
  readonly latency: { max: number; target: number; };
  readonly throughput: { min: number; target: number; };
  readonly resourceUsage: { max: number; };
}

/**
 * Safety Limits for AI Operations
 */
export interface SafetyLimits {
  readonly maxIterations: number;
  readonly memoryLimit: number; // bytes
  readonly timeLimit: number; // milliseconds
  readonly errorThreshold: number; // error rate before termination
  readonly emergencyStop: EmergencyStopProcedure;
}

/**
 * Fallback Procedure
 */
export interface FallbackProcedure {
  readonly triggerConditions: ReadonlyArray<string>;
  readonly fallbackAction: 'human_intervention' | 'safe_default' | 'gradual_degradation' | 'emergency_stop';
  readonly notificationRequired: boolean;
  readonly rollbackCapability: boolean;
}

/**
 * Emergency Stop Procedure
 */
export interface EmergencyStopProcedure {
  readonly enabled: boolean;
  readonly triggers: ReadonlyArray<string>;
  readonly notificationList: ReadonlyArray<string>;
  readonly dataPreservation: boolean;
  readonly rollbackProcedure: string;
}

/**
 * Audit Requirement
 */
export interface AuditRequirement {
  readonly level: 'basic' | 'detailed' | 'comprehensive';
  readonly realTime: boolean;
  readonly logRetention: number; // days
  readonly complianceFramework: ReadonlyArray<string>;
  readonly humanReviewRequired: boolean;
}

/**
 * Data Requirements
 */
export interface DataRequirements {
  readonly types: ReadonlyArray<string>;
  readonly quality: 'low' | 'medium' | 'high' | 'critical';
  readonly volume: { min: number; max: number; };
  readonly freshness: number; // max age in hours
  readonly sourceVerification: boolean;
}

/**
 * Computational Complexity
 */
export interface ComputationalComplexity {
  readonly timeComplexity: string; // Big O notation
  readonly spaceComplexity: string; // Big O notation
  readonly parallelizable: boolean;
  readonly quantumAccelerated: boolean;
  readonly resourceIntensive: boolean;
}

/**
 * Ethical Constraints
 */
export interface EthicalConstraints {
  readonly fairnessRequired: boolean;
  readonly biasMonitoring: boolean;
  readonly transparencyLevel: 'none' | 'minimal' | 'standard' | 'full';
  readonly humanRightsCompliant: boolean;
  readonly environmentalImpact: 'low' | 'medium' | 'high';
}

/**
 * AI Negotiation Protocol
 */
export interface AINegotiationProtocol {
  readonly protocolId: string;
  readonly participants: ReadonlyArray<AIEntityId>;
  readonly mediator?: AIEntityId | 'human';
  readonly rounds: number;
  readonly timeLimit: number; // milliseconds per round
  readonly consensusRequirement: number; // percentage for agreement
  readonly explainabilityRequirement: ExplainabilityScore;
  readonly humanOversightRequired: boolean;
}

/**
 * Negotiation State
 */
export interface NegotiationState {
  readonly sessionId: string;
  readonly currentRound: number;
  readonly participants: ReadonlyArray<{
    readonly entityId: AIEntityId;
    readonly proposal: NegotiationProposal;
    readonly confidence: ConfidenceLevel;
  }>;
  readonly consensusReached: boolean;
  readonly explainabilityAchieved: boolean;
  readonly humanApprovalPending: boolean;
}

/**
 * Negotiation Proposal
 */
export interface NegotiationProposal {
  readonly proposalId: string;
  readonly terms: Record<string, any>;
  readonly reasoning: string; // Human-readable explanation
  readonly confidence: number;
  readonly alternatives: ReadonlyArray<any>;
  readonly riskAssessment: RiskAssessment;
}

/**
 * Risk Assessment
 */
export interface RiskAssessment {
  readonly overall: 'low' | 'medium' | 'high' | 'critical';
  readonly categories: {
    readonly technical: number;
    readonly ethical: number;
    readonly legal: number;
    readonly financial: number;
    readonly operational: number;
  };
  readonly mitigationStrategies: ReadonlyArray<string>;
}

/**
 * AI Verification Result
 */
export interface AIVerificationResult {
  readonly entityId: AIEntityId;
  readonly verificationId: string;
  readonly success: boolean;
  readonly score: number; // 0.0 - 1.0
  readonly method: 'formal_verification' | 'testing' | 'simulation' | 'human_review';
  readonly details: VerificationDetails;
  readonly timestamp: number;
  readonly validUntil: number;
}

/**
 * Verification Details
 */
export interface VerificationDetails {
  readonly categories: {
    readonly safety: number;
    readonly reliability: number;
    readonly explainability: number;
    readonly alignment: number;
    readonly robustness: number;
  };
  readonly testCases: ReadonlyArray<TestCase>;
  readonly knownLimitations: ReadonlyArray<string>;
  readonly recommendations: ReadonlyArray<string>;
}

/**
 * Test Case
 */
export interface TestCase {
  readonly id: string;
  readonly description: string;
  readonly input: any;
  readonly expectedOutput: any;
  readonly actualOutput: any;
  readonly passed: boolean;
  readonly explainabilityScore: ExplainabilityScore;
}

/**
 * AI Decision with Explainability
 */
export interface AIDecision<T = any> {
  readonly decisionId: string;
  readonly entityId: AIEntityId;
  readonly decision: T;
  readonly confidence: ConfidenceLevel;
  readonly reasoning: ExplainableReasoning;
  readonly alternatives: ReadonlyArray<Alternative<T>>;
  readonly riskAssessment: RiskAssessment;
  readonly timestamp: number;
  readonly humanReviewRequired: boolean;
}

/**
 * Explainable Reasoning
 */
export interface ExplainableReasoning {
  readonly method: 'rule_based' | 'statistical' | 'neural' | 'quantum' | 'hybrid';
  readonly factors: ReadonlyArray<ReasoningFactor>;
  readonly steps: ReadonlyArray<ReasoningStep>;
  readonly explainabilityScore: ExplainabilityScore;
  readonly humanReadableExplanation: string;
}

/**
 * Reasoning Factor
 */
export interface ReasoningFactor {
  readonly name: string;
  readonly importance: number; // 0.0 - 1.0
  readonly value: any;
  readonly interpretation: string;
  readonly sourceData: string;
}

/**
 * Reasoning Step
 */
export interface ReasoningStep {
  readonly step: number;
  readonly operation: string;
  readonly input: any;
  readonly output: any;
  readonly explanation: string;
  readonly confidence: number;
}

/**
 * Alternative Decision Option
 */
export interface Alternative<T> {
  readonly option: T;
  readonly probability: number;
  readonly reasoning: string;
  readonly tradeoffs: ReadonlyArray<string>;
}

/**
 * AI Governance Framework
 */
export interface AIGovernanceFramework {
  readonly frameworkId: string;
  readonly name: string;
  readonly version: string;
  readonly explainabilityThreshold: ExplainabilityScore;
  readonly oversightRequirements: ReadonlyArray<OversightRequirement>;
  readonly complianceRules: ReadonlyArray<ComplianceRule>;
  readonly auditFrequency: number; // days
  readonly enforcementMechanisms: ReadonlyArray<string>;
}

/**
 * Oversight Requirement
 */
export interface OversightRequirement {
  readonly operationType: string;
  readonly level: HumanOversightLevel;
  readonly qualifications: ReadonlyArray<string>;
  readonly responseTime: number; // max response time in minutes
  readonly escalationProcedure: string;
}

/**
 * Compliance Rule
 */
export interface ComplianceRule {
  readonly ruleId: string;
  readonly description: string;
  readonly mandatory: boolean;
  readonly applicableOperations: ReadonlyArray<string>;
  readonly violationPenalty: string;
  readonly monitoringMethod: string;
}

/**
 * Type Guards for AI Types
 */
export function isHighExplainability(score: ExplainabilityScore): boolean {
  return score >= 0.85;
}

export function requiresHumanOversight(criticality: OperationCriticality): boolean {
  return criticality === OperationCriticality.CRITICAL || 
         criticality === OperationCriticality.SAFETY;
}

export function isCompliant(status: ComplianceStatus): boolean {
  return status === ComplianceStatus.COMPLIANT || 
         status === ComplianceStatus.EXEMPTED;
}

export function isHighConfidence(level: ConfidenceLevel): boolean {
  return level === ConfidenceLevel.HIGH || level === ConfidenceLevel.VERY_HIGH;
}

/**
 * Utility Types for AI Type Constraints
 */

// Require high explainability
export type RequireHighExplainability<T extends { explainabilityScore: ExplainabilityScore }> = 
  T & { readonly explainabilityScore: ExplainabilityScore & { readonly _min: 0.85 } };

// Require human oversight
export type RequireHumanOversight<T extends { oversightLevel: HumanOversightLevel }> = 
  T & { readonly oversightLevel: HumanOversightLevel.APPROVAL | HumanOversightLevel.SUPERVISION | HumanOversightLevel.CONTROL };

// Require compliance
export type RequireCompliance<T extends { complianceStatus: ComplianceStatus }> = 
  T & { readonly complianceStatus: ComplianceStatus.COMPLIANT | ComplianceStatus.EXEMPTED };

// Critical operation constraint
export type CriticalOperation<T> = T & {
  readonly criticality: OperationCriticality.CRITICAL | OperationCriticality.SAFETY;
  readonly humanOversightRequired: true;
  readonly auditRequired: true;
};

/**
 * Type-Level Safety Validators
 */

// Validate explainability threshold
export type ValidateExplainability<
  T extends { explainabilityScore: ExplainabilityScore },
  MinScore extends number
> = T['explainabilityScore'] extends number 
  ? T['explainabilityScore'] extends infer Score
    ? Score extends number
      ? Score extends { readonly _min: infer Min }
        ? Min extends number
          ? Min extends MinScore
            ? T
            : never
          : never
        : never
      : never
    : never
  : never;

// Validate human oversight
export type ValidateOversight<
  T extends { oversightLevel: HumanOversightLevel },
  RequiredLevel extends HumanOversightLevel
> = T['oversightLevel'] extends RequiredLevel ? T : never;

// Export type utilities
export {
  type AIEntity as AI,
  type AIContract as Contract,
  type AINegotiationProtocol as Negotiation,
  type AIDecision as Decision,
  type ExplainableReasoning as Reasoning
};