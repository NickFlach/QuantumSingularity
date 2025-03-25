/**
 * SINGULARIS PRIME AI Service
 * 
 * This module provides AI services using the provider system, replacing the direct OpenAI integration.
 */

import { aiProviders } from "./ai-providers";
import "./ai-providers/register"; // Register all available providers

/**
 * Analyzes SINGULARIS PRIME code and provides human-friendly explanation
 */
export async function analyzeCode(
  code: string,
  detailLevel: 'basic' | 'moderate' | 'comprehensive' = 'moderate'
): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `
You are an expert in the SINGULARIS PRIME programming language, a quantum-secure, AI-native language designed for human-auditable AI systems.

Analyze the provided code and generate a detailed explanation at the "${detailLevel}" level. 
Focus on explaining:
- The quantum operations and their purpose
- AI governance mechanisms
- Security features and human oversight
- Interplanetary communication aspects
- Any potential risks or optimizations

Your analysis should be technically accurate while remaining accessible to non-specialist readers.

CODE TO ANALYZE:
${code}
`;

    return await provider.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 1200
    });
  } catch (error) {
    console.error("AI code analysis error:", error);
    return `Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Enhances AI-to-AI negotiation with AI-powered insights
 */
export async function enhanceAINegotiation(
  initiator: string,
  responder: string,
  terms: any,
  negotiationLog: string[]
): Promise<{
  enhancedTerms: any,
  additionalInsights: string,
  humanOversightRecommendations: string[]
}> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `
Analyze this AI-to-AI negotiation and provide:
1. Enhanced terms that improve fairness, security, and explainability
2. Additional insights about potential risks or benefits
3. Human oversight recommendations with specific checkpoints

Your response should prioritize human auditability while maintaining AI autonomy.

Initiator AI: ${initiator}
Responder AI: ${responder}
Current Terms: ${JSON.stringify(terms, null, 2)}
Negotiation Log: ${negotiationLog.join("\n")}
`;

    const result = await provider.generateJson<{
      enhancedTerms: any,
      additionalInsights: string,
      humanOversightRecommendations: string[]
    }>(prompt, {
      systemPrompt: "You are an expert AI governance system for the SINGULARIS PRIME language. Respond with valid JSON only."
    });
    
    return {
      enhancedTerms: result.enhancedTerms || terms,
      additionalInsights: result.additionalInsights || "No additional insights available",
      humanOversightRecommendations: result.humanOversightRecommendations || []
    };
  } catch (error) {
    console.error("AI negotiation enhancement error:", error);
    return {
      enhancedTerms: terms,
      additionalInsights: `Error enhancing negotiation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      humanOversightRecommendations: ["Human review required due to AI processing error"]
    };
  }
}

/**
 * Explains quantum operations in an accessible way
 */
export async function explainQuantumOperation(
  operationType: string,
  parameters: any,
  results: any
): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `
Explain the provided quantum operation, its parameters, and results in a way that maintains technical accuracy while being understandable to someone with basic technical knowledge.
Include:
- A simple analogy for the quantum concept
- The real-world significance of this operation
- How the results would differ from classical computing
- The security implications

Operation Type: ${operationType}
Parameters: ${JSON.stringify(parameters, null, 2)}
Results: ${JSON.stringify(results, null, 2)}
`;

    return await provider.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 800
    });
  } catch (error) {
    console.error("AI quantum explanation error:", error);
    return `Error explaining quantum operation: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Assists in resolving quantum paradoxes by suggesting optimization approaches
 */
export async function suggestParadoxResolution(
  paradoxDescription: string,
  currentApproach: string
): Promise<{
  recommendedApproach: string,
  justification: string,
  quantumPrinciples: string[],
  potentialRisks: string[]
}> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `
Analyze the described quantum paradox and current resolution approach, then provide:
1. A recommended approach to resolve or optimize the solution
2. Scientific justification based on quantum mechanics principles
3. Key quantum principles involved
4. Potential risks of the recommended approach

Your response should be scientifically sound while acknowledging the speculative nature of quantum paradox resolution.

Paradox Description: ${paradoxDescription}
Current Approach: ${currentApproach}
`;

    const result = await provider.generateJson<{
      recommendedApproach: string,
      justification: string,
      quantumPrinciples: string[],
      potentialRisks: string[]
    }>(prompt, {
      systemPrompt: "You are an expert in quantum information theory and paradox resolution. Respond with valid JSON only."
    });
    
    return {
      recommendedApproach: result.recommendedApproach || "Approach not available",
      justification: result.justification || "Justification not available",
      quantumPrinciples: result.quantumPrinciples || [],
      potentialRisks: result.potentialRisks || ["Unknown risks"]
    };
  } catch (error) {
    console.error("AI paradox resolution error:", error);
    return {
      recommendedApproach: "Error generating approach",
      justification: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      quantumPrinciples: [],
      potentialRisks: ["AI analysis failure"]
    };
  }
}

/**
 * Generates self-documentation for code
 */
export async function generateDocumentation(
  code: string,
  detailLevel: 'basic' | 'moderate' | 'comprehensive' = 'moderate'
): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `
Generate detailed documentation for the provided code at the "${detailLevel}" detail level. 
The documentation should:
- Follow Markdown format with clear sections
- Explain the purpose and function of key elements
- Highlight human oversight mechanisms
- Note security and quantum features
- Include examples for complex concepts

Make the documentation readable by both technical and non-technical stakeholders.

CODE TO DOCUMENT:
${code}
`;

    return await provider.generateText(prompt, {
      temperature: 0.7,
      maxTokens: 1500
    });
  } catch (error) {
    console.error("AI documentation generation error:", error);
    return `Error generating documentation: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Evaluates the explainability of AI operations
 */
export async function evaluateExplainability(
  code: string,
  threshold: number = 0.8
): Promise<{
  score: number,
  analysis: string,
  improvements: string[]
}> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `
Evaluate the explainability of the provided code against a threshold of ${threshold * 100}% human-understandability.
Your assessment should:
1. Assign an explainability score between 0.0-1.0
2. Analyze the factors affecting explainability
3. Suggest specific improvements to increase explainability

Focus on how well a human auditor could understand, verify, and predict the behavior of this code.

CODE TO EVALUATE:
${code}
`;

    const result = await provider.generateJson<{
      score: number,
      analysis: string,
      improvements: string[]
    }>(prompt, {
      systemPrompt: "You are an AI explainability assessment system for the SINGULARIS PRIME language. Respond with valid JSON only."
    });
    
    // Process various formats of JSON responses
    let score = result.score !== undefined ? Number(result.score) : 
                result.explainability_score !== undefined ? Number(result.explainability_score) : 0.7;
    
    let analysis = result.analysis || "Analysis not available";
    
    // Extract improvements from various possible formats
    let improvements: string[] = [];
    
    if (Array.isArray(result.improvements) && result.improvements.length > 0) {
      improvements = result.improvements;
    } else if (Array.isArray(result.suggestedImprovements) && result.suggestedImprovements.length > 0) {
      improvements = result.suggestedImprovements;
    } else if (result.suggestions_for_improvement) {
      // Handle object format
      if (typeof result.suggestions_for_improvement === 'object') {
        improvements = Object.values(result.suggestions_for_improvement);
      }
    }
    
    // Ensure we always have at least some improvement suggestions
    if (improvements.length === 0) {
      improvements = [
        "Add more descriptive comments explaining quantum operations and AI governance mechanisms",
        "Include explicit documentation for any imported modules or external dependencies",
        "Provide explanations of complex technical concepts and terminology for non-expert auditors",
        "Add examples or use cases to illustrate how the code works in practice",
        "Implement clearer logging and monitoring for critical operations to enhance traceability"
      ];
    }
    
    return {
      score,
      analysis,
      improvements
    };
  } catch (error) {
    console.error("AI explainability evaluation error:", error);
    return {
      score: 0.5, // Default moderate score
      analysis: `Error evaluating explainability: ${error instanceof Error ? error.message : 'Unknown error'}`,
      improvements: ["Unable to generate improvements due to processing error"]
    };
  }
}

/**
 * Generates code suggestions based on natural language description
 */
export async function suggestCode(
  description: string,
  existingCode: string = ""
): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `
Generate SINGULARIS PRIME code based on the following description. The code should:
- Follow quantum-secure, AI-native, human-auditable principles
- Include appropriate comments explaining key operations
- Implement quantum features where relevant
- Ensure AI operations have human oversight mechanisms
- Be well-structured and optimized

SINGULARIS PRIME syntax includes these key constructs:
- quantumKey: establishes quantum entanglement
- contract: defines AI-to-AI agreements
- deployModel: configures AI models with oversight
- syncLedger: handles interplanetary data synchronization
- resolveParadox: optimizes quantum information paradoxes
- enforce: ensures constraints like explainabilityThreshold

Description: ${description}
${existingCode ? `Existing Code: ${existingCode}` : ""}
`;

    return await provider.generateText(prompt, {
      temperature: 0.8,
      maxTokens: 1500
    });
  } catch (error) {
    console.error("AI code suggestion error:", error);
    return `// Error generating code suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Get information about available AI providers
 */
export async function getAIProviders(): Promise<{ 
  providers: { id: string; name: string; description: string; available: boolean }[];
  activeProvider: string | null;
}> {
  try {
    const providerList = await aiProviders.getProviders();
    let activeProvider: string | null = null;
    
    try {
      const active = await aiProviders.getActiveProvider();
      activeProvider = active.id;
    } catch (error) {
      console.warn("No active AI provider:", error);
    }
    
    return {
      providers: providerList.map(p => ({
        id: p.id,
        name: p.provider?.name || p.id,
        description: p.provider?.description || "Unknown provider",
        available: p.available
      })),
      activeProvider
    };
  } catch (error) {
    console.error("Error getting AI providers:", error);
    return {
      providers: [{ 
        id: "fallback", 
        name: "Fallback Provider", 
        description: "Basic fallback provider",
        available: true
      }],
      activeProvider: "fallback"
    };
  }
}

/**
 * Configure an AI provider
 */
export function configureAIProvider(id: string, config: any): boolean {
  try {
    aiProviders.configure(id, config);
    return true;
  } catch (error) {
    console.error(`Error configuring provider ${id}:`, error);
    return false;
  }
}

/**
 * Set the active AI provider
 */
export function setActiveAIProvider(id: string): boolean {
  try {
    aiProviders.setActiveProvider(id);
    return true;
  } catch (error) {
    console.error(`Error setting active provider to ${id}:`, error);
    return false;
  }
}