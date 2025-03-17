/**
 * SINGULARIS PRIME OpenAI Integration - Client
 * 
 * This module provides client-side functions for interacting with the OpenAI-powered
 * SINGULARIS PRIME language features.
 */

import { apiRequest } from "./queryClient";

/**
 * Analyzes SINGULARIS PRIME code with OpenAI
 */
export async function analyzeCode(
  code: string,
  detailLevel: 'basic' | 'moderate' | 'comprehensive' = 'moderate'
): Promise<string> {
  try {
    const response = await apiRequest<{ analysis: string }>("POST", "/api/analyze", {
      code,
      detailLevel
    });
    
    return response.analysis || "Analysis not available";
  } catch (error) {
    console.error("Failed to analyze code:", error);
    return "Error analyzing code. Please try again.";
  }
}

/**
 * Generates documentation for SINGULARIS PRIME code
 */
export async function generateDocumentation(
  code: string,
  detailLevel: 'basic' | 'moderate' | 'comprehensive' = 'moderate'
): Promise<string> {
  try {
    const response = await apiRequest<{ documentation: string }>("POST", "/api/documentation", {
      code,
      detailLevel
    });
    
    return response.documentation || "Documentation not available";
  } catch (error) {
    console.error("Failed to generate documentation:", error);
    return "Error generating documentation. Please try again.";
  }
}

/**
 * Gets AI-enhanced explanation of quantum operations
 */
export async function explainQuantumOperation(
  operationType: string,
  parameters: any,
  results: any
): Promise<string> {
  try {
    const response = await apiRequest<{ explanation: string }>("POST", "/api/quantum/explain", {
      operationType,
      parameters,
      results
    });
    
    return response.explanation || "Explanation not available";
  } catch (error) {
    console.error("Failed to explain quantum operation:", error);
    return "Error explaining quantum operation. Please try again.";
  }
}

/**
 * Gets AI suggestions for resolving quantum paradoxes
 */
export interface ParadoxResolution {
  recommendedApproach: string;
  justification: string;
  quantumPrinciples: string[];
  potentialRisks: string[];
}

export async function getParadoxResolution(
  paradoxDescription: string,
  currentApproach: string = ""
): Promise<ParadoxResolution> {
  try {
    const response = await apiRequest<ParadoxResolution>("POST", "/api/quantum/paradox", {
      paradoxDescription,
      currentApproach
    });
    
    return {
      recommendedApproach: response.recommendedApproach || "Approach not available",
      justification: response.justification || "Justification not available",
      quantumPrinciples: response.quantumPrinciples || [],
      potentialRisks: response.potentialRisks || ["Unknown risks"]
    };
  } catch (error) {
    console.error("Failed to get paradox resolution:", error);
    return {
      recommendedApproach: "Error getting resolution",
      justification: "An error occurred while processing your request",
      quantumPrinciples: [],
      potentialRisks: ["Unable to analyze risks due to processing error"]
    };
  }
}

/**
 * Evaluates code explainability with AI
 */
export interface ExplainabilityEvaluation {
  score: number;
  analysis: string;
  improvements: string[];
}

export async function evaluateExplainability(
  code: string,
  threshold: number = 0.8
): Promise<ExplainabilityEvaluation> {
  try {
    const response = await apiRequest<ExplainabilityEvaluation>("POST", "/api/evaluate/explainability", {
      code,
      threshold
    });
    
    return {
      score: response.score !== undefined ? response.score : 0,
      analysis: response.analysis || "Analysis not available",
      improvements: response.improvements || []
    };
  } catch (error) {
    console.error("Failed to evaluate explainability:", error);
    return {
      score: 0,
      analysis: "Error evaluating explainability",
      improvements: ["Please try again"]
    };
  }
}

/**
 * Gets AI-generated code suggestions based on description
 */
export async function getSuggestedCode(
  description: string,
  existingCode: string = ""
): Promise<string> {
  try {
    const response = await apiRequest<{ suggestion: string }>("POST", "/api/suggest", {
      description,
      existingCode
    });
    
    return response.suggestion || "// Code suggestion not available";
  } catch (error) {
    console.error("Failed to get code suggestion:", error);
    return "// Error generating code suggestion. Please try again.";
  }
}

/**
 * Performs enhanced AI-to-AI negotiation
 */
export async function performEnhancedNegotiation(
  initiator: string,
  responder: string,
  terms: any,
  explainabilityThreshold: number = 0.8
): Promise<any> {
  try {
    return await apiRequest("POST", "/api/ai/negotiate/enhanced", {
      initiator,
      responder,
      terms,
      explainabilityThreshold
    });
  } catch (error) {
    console.error("Failed to perform enhanced negotiation:", error);
    return {
      success: false,
      explanation: "Error performing enhanced negotiation",
      enhancedTerms: terms,
      additionalInsights: "Error occurred during AI processing",
      humanOversightRecommendations: ["Human review required due to processing error"]
    };
  }
}