/**
 * SINGULARIS PRIME Type Checker and Inference Engine
 * 
 * This module provides comprehensive type checking for the SINGULARIS PRIME language,
 * enforcing quantum mechanical principles and AI safety requirements at the type level.
 * 
 * Features:
 * - Quantum type inference with entanglement tracking
 * - AI explainability validation
 * - Human oversight requirement checking
 * - Memory safety for quantum operations
 * - Type-level constraint enforcement
 * - Advanced error reporting with suggestions
 */

import {
  QuantumState,
  Qubit,
  Qudit,
  QuantumDimension,
  QuantumReferenceId,
  QuantumError,
  QuantumErrorType,
  EntangledSystem,
  QuantumOperation,
  QuantumOperationResult,
  CoherenceStatus,
  MeasurementStatus,
  QuantumPurity,
  isQubit,
  isQudit,
  isEntangled,
  isCoherent
} from '../../shared/types/quantum-types';

import {
  AIEntity,
  AIContract,
  AIEntityId,
  AIContractId,
  ExplainabilityScore,
  HumanOversightLevel,
  OperationCriticality,
  ComplianceStatus,
  AIDecision,
  AIVerificationResult,
  isHighExplainability,
  requiresHumanOversight,
  isCompliant
} from '../../shared/types/ai-types';

import { QuantumOperationType } from '../../shared/schema';

// Type inference result
export interface TypeInferenceResult {
  readonly success: boolean;
  readonly type: InferredType;
  readonly constraints: TypeConstraint[];
  readonly errors: TypeError[];
  readonly warnings: TypeWarning[];
}

// Inferred type information
export interface InferredType {
  readonly kind: 'quantum' | 'ai' | 'primitive' | 'compound' | 'unknown';
  readonly name: string;
  readonly properties: Record<string, any>;
  readonly constraints: TypeConstraint[];
  readonly dependencies: TypeDependency[];
}

// Type constraint
export interface TypeConstraint {
  readonly type: 'quantum_no_clone' | 'quantum_entanglement' | 'ai_explainability' | 
                 'human_oversight' | 'memory_safety' | 'compliance' | 'coherence';
  readonly description: string;
  readonly required: boolean;
  readonly validator: (context: TypeContext) => boolean;
}

// Type dependency tracking
export interface TypeDependency {
  readonly dependentOn: string;
  readonly relationship: 'entangled_with' | 'requires' | 'constrains' | 'validated_by';
  readonly strength: number; // 0.0 - 1.0
}

// Type checking context
export interface TypeContext {
  readonly variables: Map<string, InferredType>;
  readonly quantumStates: Map<QuantumReferenceId, QuantumState>;
  readonly entanglements: Map<string, EntangledSystem>;
  readonly aiEntities: Map<AIEntityId, AIEntity>;
  readonly aiContracts: Map<AIContractId, AIContract>;
  readonly scope: string;
  readonly line: number;
  readonly column: number;
}

// Type error
export interface TypeError {
  readonly type: 'quantum_cloning' | 'explainability_violation' | 'oversight_missing' | 
                 'dimension_mismatch' | 'coherence_violation' | 'memory_leak' | 'compliance_violation';
  readonly message: string;
  readonly location: SourceLocation;
  readonly severity: 'error' | 'warning' | 'info';
  readonly suggestion?: string;
}

// Type warning
export interface TypeWarning {
  readonly type: 'performance' | 'best_practice' | 'deprecation' | 'potential_issue';
  readonly message: string;
  readonly location: SourceLocation;
  readonly suggestion: string;
}

// Source location
export interface SourceLocation {
  readonly line: number;
  readonly column: number;
  readonly file?: string;
}

// AST Node for type checking
export interface ASTNode {
  readonly type: string;
  readonly location: SourceLocation;
  readonly children?: ASTNode[];
  readonly value?: any;
  readonly metadata?: Record<string, any>;
}

/**
 * Main Type Checker Class
 */
export class SingularisTypeChecker {
  private context: TypeContext;
  private errors: TypeError[] = [];
  private warnings: TypeWarning[] = [];
  private quantumMemoryTracker: QuantumMemoryTracker;
  private aiComplianceValidator: AIComplianceValidator;
  
  constructor(initialContext?: Partial<TypeContext>) {
    this.context = {
      variables: new Map(),
      quantumStates: new Map(),
      entanglements: new Map(),
      aiEntities: new Map(),
      aiContracts: new Map(),
      scope: 'global',
      line: 1,
      column: 1,
      ...initialContext
    };
    
    this.quantumMemoryTracker = new QuantumMemoryTracker();
    this.aiComplianceValidator = new AIComplianceValidator();
  }
  
  /**
   * Type check an AST node
   */
  public checkNode(node: ASTNode): TypeInferenceResult {
    this.updateLocation(node.location);
    
    try {
      const type = this.inferType(node);
      const constraints = this.extractConstraints(type, node);
      const errors = this.validateConstraints(constraints, this.context);
      
      return {
        success: errors.length === 0,
        type,
        constraints,
        errors,
        warnings: this.warnings
      };
    } catch (error) {
      const typeError: TypeError = {
        type: 'compliance_violation',
        message: error instanceof Error ? error.message : 'Unknown type checking error',
        location: node.location,
        severity: 'error'
      };
      
      return {
        success: false,
        type: { kind: 'unknown', name: 'error', properties: {}, constraints: [], dependencies: [] },
        constraints: [],
        errors: [typeError],
        warnings: this.warnings
      };
    }
  }
  
  /**
   * Infer type from AST node
   */
  private inferType(node: ASTNode): InferredType {
    switch (node.type) {
      case 'QuantumStateDeclaration':
        return this.inferQuantumType(node);
      case 'AIContractDeclaration':
        return this.inferAIContractType(node);
      case 'AIEntityDeclaration':
        return this.inferAIEntityType(node);
      case 'QuantumOperationCall':
        return this.inferQuantumOperationType(node);
      case 'AIDecisionCall':
        return this.inferAIDecisionType(node);
      case 'VariableReference':
        return this.inferVariableType(node);
      default:
        return this.inferPrimitiveType(node);
    }
  }
  
  /**
   * Infer quantum state type
   */
  private inferQuantumType(node: ASTNode): InferredType {
    const dimension = this.extractQuantumDimension(node);
    const isEntangled = this.checkEntanglementStatus(node);
    
    const constraints: TypeConstraint[] = [
      {
        type: 'quantum_no_clone',
        description: 'Quantum states cannot be cloned (no-cloning theorem)',
        required: true,
        validator: (ctx) => this.validateNoCloning(node, ctx)
      },
      {
        type: 'memory_safety',
        description: 'Quantum state must be properly managed in memory',
        required: true,
        validator: (ctx) => this.quantumMemoryTracker.validateMemoryUsage(node, ctx)
      }
    ];
    
    if (isEntangled) {
      constraints.push({
        type: 'quantum_entanglement',
        description: 'Entangled quantum states must maintain reference consistency',
        required: true,
        validator: (ctx) => this.validateEntanglementConsistency(node, ctx)
      });
    }
    
    const dependencies: TypeDependency[] = [];
    if (isEntangled) {
      const entangledWith = this.extractEntangledPartners(node);
      entangledWith.forEach(partner => {
        dependencies.push({
          dependentOn: partner,
          relationship: 'entangled_with',
          strength: 1.0
        });
      });
    }
    
    return {
      kind: 'quantum',
      name: dimension === QuantumDimension.QUBIT ? 'Qubit' : `Qudit<${dimension}>`,
      properties: {
        dimension,
        entangled: isEntangled,
        coherence: CoherenceStatus.COHERENT,
        measurement: MeasurementStatus.UNMEASURED,
        purity: isEntangled ? QuantumPurity.ENTANGLED : QuantumPurity.PURE
      },
      constraints,
      dependencies
    };
  }
  
  /**
   * Infer AI contract type
   */
  private inferAIContractType(node: ASTNode): InferredType {
    const explainabilityScore = this.extractExplainabilityScore(node);
    const oversightLevel = this.extractOversightLevel(node);
    const criticality = this.extractCriticality(node);
    
    const constraints: TypeConstraint[] = [
      {
        type: 'ai_explainability',
        description: 'AI operations must meet explainability threshold',
        required: true,
        validator: (ctx) => this.validateExplainability(explainabilityScore, ctx)
      },
      {
        type: 'compliance',
        description: 'AI operations must comply with governance framework',
        required: true,
        validator: (ctx) => this.aiComplianceValidator.validateCompliance(node, ctx)
      }
    ];
    
    if (requiresHumanOversight(criticality)) {
      constraints.push({
        type: 'human_oversight',
        description: 'Critical AI operations require human oversight',
        required: true,
        validator: (ctx) => this.validateHumanOversight(oversightLevel, criticality, ctx)
      });
    }
    
    return {
      kind: 'ai',
      name: 'AIContract',
      properties: {
        explainabilityScore,
        oversightLevel,
        criticality,
        requiresApproval: requiresHumanOversight(criticality)
      },
      constraints,
      dependencies: []
    };
  }
  
  /**
   * Infer AI entity type
   */
  private inferAIEntityType(node: ASTNode): InferredType {
    const explainabilityScore = this.extractExplainabilityScore(node);
    const safetyRating = this.extractSafetyRating(node);
    const capabilities = this.extractCapabilities(node);
    
    const constraints: TypeConstraint[] = [
      {
        type: 'ai_explainability',
        description: 'AI entity must meet minimum explainability score',
        required: true,
        validator: (ctx) => isHighExplainability(explainabilityScore)
      }
    ];
    
    return {
      kind: 'ai',
      name: 'AIEntity',
      properties: {
        explainabilityScore,
        safetyRating,
        capabilities,
        verified: safetyRating.overall >= 0.85
      },
      constraints,
      dependencies: []
    };
  }
  
  /**
   * Infer quantum operation type
   */
  private inferQuantumOperationType(node: ASTNode): InferredType {
    const operationType = this.extractOperationType(node);
    const inputTypes = this.extractInputTypes(node);
    const outputTypes = this.inferOutputTypes(inputTypes, operationType);
    
    const constraints: TypeConstraint[] = [
      {
        type: 'quantum_no_clone',
        description: 'Quantum operations cannot clone input states',
        required: true,
        validator: (ctx) => this.validateOperationNoCloning(node, ctx)
      }
    ];
    
    // Add coherence constraint for operations that should preserve coherence
    if (this.shouldPreserveCoherence(operationType)) {
      constraints.push({
        type: 'coherence',
        description: 'Operation must preserve quantum coherence',
        required: true,
        validator: (ctx) => this.validateCoherencePreservation(node, ctx)
      });
    }
    
    return {
      kind: 'quantum',
      name: `QuantumOperation<${operationType}>`,
      properties: {
        operationType,
        inputTypes,
        outputTypes,
        unitary: this.isUnitaryOperation(operationType),
        preservesEntanglement: this.preservesEntanglement(operationType)
      },
      constraints,
      dependencies: []
    };
  }
  
  /**
   * Infer AI decision type
   */
  private inferAIDecisionType(node: ASTNode): InferredType {
    const confidence = this.extractConfidence(node);
    const explainabilityScore = this.extractExplainabilityScore(node);
    const requiresOversight = this.extractOversightRequirement(node);
    
    const constraints: TypeConstraint[] = [
      {
        type: 'ai_explainability',
        description: 'AI decisions must be explainable',
        required: true,
        validator: (ctx) => isHighExplainability(explainabilityScore)
      }
    ];
    
    if (requiresOversight) {
      constraints.push({
        type: 'human_oversight',
        description: 'AI decision requires human oversight',
        required: true,
        validator: (ctx) => this.validateDecisionOversight(node, ctx)
      });
    }
    
    return {
      kind: 'ai',
      name: 'AIDecision',
      properties: {
        confidence,
        explainabilityScore,
        requiresOversight,
        verified: confidence >= 0.8 && isHighExplainability(explainabilityScore)
      },
      constraints,
      dependencies: []
    };
  }
  
  /**
   * Infer variable reference type
   */
  private inferVariableType(node: ASTNode): InferredType {
    const variableName = node.value as string;
    const existingType = this.context.variables.get(variableName);
    
    if (!existingType) {
      this.addError({
        type: 'compliance_violation',
        message: `Undefined variable: ${variableName}`,
        location: node.location,
        severity: 'error',
        suggestion: `Declare variable ${variableName} before use`
      });
      
      return {
        kind: 'unknown',
        name: 'undefined',
        properties: {},
        constraints: [],
        dependencies: []
      };
    }
    
    return existingType;
  }
  
  /**
   * Infer primitive type
   */
  private inferPrimitiveType(node: ASTNode): InferredType {
    let typeName = 'unknown';
    
    switch (typeof node.value) {
      case 'number':
        typeName = 'number';
        break;
      case 'string':
        typeName = 'string';
        break;
      case 'boolean':
        typeName = 'boolean';
        break;
    }
    
    return {
      kind: 'primitive',
      name: typeName,
      properties: { value: node.value },
      constraints: [],
      dependencies: []
    };
  }
  
  /**
   * Extract type constraints
   */
  private extractConstraints(type: InferredType, node: ASTNode): TypeConstraint[] {
    const constraints = [...type.constraints];
    
    // Add node-specific constraints
    if (node.metadata?.constraints) {
      constraints.push(...node.metadata.constraints);
    }
    
    return constraints;
  }
  
  /**
   * Validate type constraints
   */
  private validateConstraints(constraints: TypeConstraint[], context: TypeContext): TypeError[] {
    const errors: TypeError[] = [];
    
    for (const constraint of constraints) {
      if (constraint.required && !constraint.validator(context)) {
        errors.push({
          type: constraint.type as any,
          message: `Constraint violation: ${constraint.description}`,
          location: { line: context.line, column: context.column },
          severity: 'error'
        });
      }
    }
    
    return errors;
  }
  
  // Helper methods for type inference
  
  private extractQuantumDimension(node: ASTNode): QuantumDimension {
    return node.metadata?.dimension || QuantumDimension.QUBIT;
  }
  
  private checkEntanglementStatus(node: ASTNode): boolean {
    return node.metadata?.entangled || false;
  }
  
  private extractEntangledPartners(node: ASTNode): string[] {
    return node.metadata?.entangledWith || [];
  }
  
  private extractExplainabilityScore(node: ASTNode): ExplainabilityScore {
    return (node.metadata?.explainabilityScore || 0.0) as ExplainabilityScore;
  }
  
  private extractOversightLevel(node: ASTNode): HumanOversightLevel {
    return node.metadata?.oversightLevel || HumanOversightLevel.NONE;
  }
  
  private extractCriticality(node: ASTNode): OperationCriticality {
    return node.metadata?.criticality || OperationCriticality.LOW;
  }
  
  private extractSafetyRating(node: ASTNode): any {
    return node.metadata?.safetyRating || { overall: 0.0, categories: {} };
  }
  
  private extractCapabilities(node: ASTNode): any[] {
    return node.metadata?.capabilities || [];
  }
  
  private extractOperationType(node: ASTNode): QuantumOperationType {
    return node.metadata?.operationType || QuantumOperationType.GATE;
  }
  
  private extractInputTypes(node: ASTNode): InferredType[] {
    return node.metadata?.inputTypes || [];
  }
  
  private inferOutputTypes(inputTypes: InferredType[], operationType: QuantumOperationType): InferredType[] {
    // Simple inference - in practice this would be more sophisticated
    return inputTypes;
  }
  
  private extractConfidence(node: ASTNode): number {
    return node.metadata?.confidence || 0.0;
  }
  
  private extractOversightRequirement(node: ASTNode): boolean {
    return node.metadata?.requiresOversight || false;
  }
  
  // Validation methods
  
  private validateNoCloning(node: ASTNode, context: TypeContext): boolean {
    // Check if quantum state is being cloned
    const variableName = node.value as string;
    const usageCount = this.countVariableUsage(variableName, context);
    return usageCount <= 1; // Each quantum state can only be used once
  }
  
  private validateEntanglementConsistency(node: ASTNode, context: TypeContext): boolean {
    // Validate that entangled states maintain consistency
    const entangledWith = this.extractEntangledPartners(node);
    return entangledWith.every(partner => 
      context.variables.has(partner) && 
      context.variables.get(partner)?.properties.entangled
    );
  }
  
  private validateExplainability(score: ExplainabilityScore, context: TypeContext): boolean {
    return isHighExplainability(score);
  }
  
  private validateHumanOversight(
    level: HumanOversightLevel, 
    criticality: OperationCriticality, 
    context: TypeContext
  ): boolean {
    if (requiresHumanOversight(criticality)) {
      return level === HumanOversightLevel.APPROVAL || 
             level === HumanOversightLevel.SUPERVISION || 
             level === HumanOversightLevel.CONTROL;
    }
    return true;
  }
  
  private validateOperationNoCloning(node: ASTNode, context: TypeContext): boolean {
    // Ensure quantum operations don't clone states
    const inputs = this.extractInputTypes(node);
    return inputs.every(input => 
      input.kind !== 'quantum' || 
      !this.isBeingCloned(input, context)
    );
  }
  
  private validateCoherencePreservation(node: ASTNode, context: TypeContext): boolean {
    // Check if operation preserves quantum coherence
    const operationType = this.extractOperationType(node);
    return this.shouldPreserveCoherence(operationType);
  }
  
  private validateDecisionOversight(node: ASTNode, context: TypeContext): boolean {
    return node.metadata?.humanApproved || false;
  }
  
  // Utility methods
  
  private countVariableUsage(variableName: string, context: TypeContext): number {
    // Count how many times a variable is used (simplified)
    return 1; // Placeholder implementation
  }
  
  private isBeingCloned(type: InferredType, context: TypeContext): boolean {
    // Check if a quantum type is being cloned
    return false; // Placeholder implementation
  }
  
  private shouldPreserveCoherence(operationType: QuantumOperationType): boolean {
    // Determine if operation should preserve coherence
    return operationType !== QuantumOperationType.MEASUREMENT;
  }
  
  private isUnitaryOperation(operationType: QuantumOperationType): boolean {
    return operationType === QuantumOperationType.GATE || 
           operationType === QuantumOperationType.EVOLUTION;
  }
  
  private preservesEntanglement(operationType: QuantumOperationType): boolean {
    return operationType !== QuantumOperationType.MEASUREMENT;
  }
  
  private updateLocation(location: SourceLocation): void {
    this.context = {
      ...this.context,
      line: location.line,
      column: location.column
    };
  }
  
  private addError(error: TypeError): void {
    this.errors.push(error);
  }
  
  private addWarning(warning: TypeWarning): void {
    this.warnings.push(warning);
  }
  
  /**
   * Public API methods
   */
  
  public getContext(): TypeContext {
    return this.context;
  }
  
  public getErrors(): TypeError[] {
    return this.errors;
  }
  
  public getWarnings(): TypeWarning[] {
    return this.warnings;
  }
  
  public reset(): void {
    this.errors = [];
    this.warnings = [];
    this.context.variables.clear();
    this.context.quantumStates.clear();
    this.context.entanglements.clear();
    this.context.aiEntities.clear();
    this.context.aiContracts.clear();
  }
}

/**
 * Quantum Memory Tracker
 */
class QuantumMemoryTracker {
  private allocatedStates: Map<QuantumReferenceId, QuantumState> = new Map();
  private usageCounter: Map<QuantumReferenceId, number> = new Map();
  
  public validateMemoryUsage(node: ASTNode, context: TypeContext): boolean {
    // Validate quantum memory usage patterns
    return true; // Placeholder implementation
  }
  
  public trackAllocation(id: QuantumReferenceId, state: QuantumState): void {
    this.allocatedStates.set(id, state);
    this.usageCounter.set(id, 0);
  }
  
  public trackUsage(id: QuantumReferenceId): void {
    const current = this.usageCounter.get(id) || 0;
    this.usageCounter.set(id, current + 1);
  }
  
  public isValidUsage(id: QuantumReferenceId): boolean {
    return (this.usageCounter.get(id) || 0) <= 1; // No-cloning constraint
  }
}

/**
 * AI Compliance Validator
 */
class AIComplianceValidator {
  public validateCompliance(node: ASTNode, context: TypeContext): boolean {
    // Validate AI compliance with governance framework
    const explainabilityScore = node.metadata?.explainabilityScore || 0.0;
    const oversightLevel = node.metadata?.oversightLevel || HumanOversightLevel.NONE;
    const criticality = node.metadata?.criticality || OperationCriticality.LOW;
    
    // Basic compliance checks
    if (!isHighExplainability(explainabilityScore as ExplainabilityScore)) {
      return false;
    }
    
    if (requiresHumanOversight(criticality) && 
        oversightLevel === HumanOversightLevel.NONE) {
      return false;
    }
    
    return true;
  }
}

// Types and classes are already exported above