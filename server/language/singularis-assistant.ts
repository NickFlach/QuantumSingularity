/**
 * SINGULARIS PRIME Code Assistant
 * 
 * This module provides AI-powered assistance for writing, analyzing, and optimizing 
 * SINGULARIS PRIME code. It leverages OpenAI's GPT-4o to provide code suggestions,
 * debugging help, and general assistance with quantum computing and AI governance concepts.
 */

import { aiProviders } from "./ai-providers";
import { OpenAI } from "openai";

/**
 * Processes a chat conversation with the SINGULARIS PRIME assistant
 */
export async function processAssistantChat(
  prompt: string, 
  context: string = "", 
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  try {
    const activeProvider = await aiProviders.getActiveProvider();
    
    const fullContext = `
CONTEXT:
${context || "No additional context provided"}

USER QUERY:
${prompt}
    `;
    
    const systemMessage = `
You are SINGULARIS PRIME assistant, an expert in quantum computing, AI governance, 
and the SINGULARIS PRIME programming language. Your goal is to help users understand
and write better SINGULARIS PRIME code.

Key features of SINGULARIS PRIME:
1. Quantum operations (entanglement, QKD, circuit simulations)
2. AI governance protocols (contracts, verification, explainability)
3. Quantum geometry operations (spatial embeddings, transformations)
4. Blockchain integration for record-keeping

When answering questions:
- Provide example code when relevant
- Explain complex quantum and AI concepts in an accessible way
- Suggest best practices for explainable AI and quantum safety
- Focus on practical applications of quantum computing concepts
`;

    const messagesPayload = [
      { role: "system", content: systemMessage },
      ...history,
      { role: "user", content: fullContext }
    ];
    
    const response = await activeProvider.generateText(
      JSON.stringify(messagesPayload),
      { responseFormat: "text" }
    );
    
    return response;
  } catch (error) {
    console.error("Error in assistant chat:", error);
    return `I encountered an error while processing your request. ${error instanceof Error ? error.message : "Please try again later."}`;
  }
}

/**
 * Analyzes SINGULARIS PRIME code for issues and improvement suggestions
 */
export async function analyzeCode(code: string): Promise<{
  score: number;
  issues: {
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }[];
  suggestions: string[];
}> {
  try {
    const activeProvider = await aiProviders.getActiveProvider();
    
    const prompt = `
Analyze this SINGULARIS PRIME code for issues and provide improvement suggestions:

\`\`\`
${code}
\`\`\`

Return a JSON object with the following structure:
{
  "score": number between 0-100 representing code quality,
  "issues": [
    {
      "type": "error" | "warning" | "info",
      "message": "description of the issue",
      "line": line number (if applicable)
    },
    ...
  ],
  "suggestions": [
    "Specific actionable suggestion to improve the code",
    ...
  ]
}
`;

    const result = await activeProvider.generateJson<{
      score: number;
      issues: {
        type: 'error' | 'warning' | 'info';
        message: string;
        line?: number;
      }[];
      suggestions: string[];
    }>(prompt);
    
    return {
      score: Math.min(100, Math.max(0, result.score)),
      issues: result.issues || [],
      suggestions: result.suggestions || []
    };
  } catch (error) {
    console.error("Error analyzing code:", error);
    return {
      score: 50,
      issues: [{ type: 'error', message: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}` }],
      suggestions: ["Try simplifying your code and check for syntax errors."]
    };
  }
}

/**
 * Generates code suggestions based on current context
 */
export async function generateCodeSuggestions(
  context: string
): Promise<{ code: string; explanation: string }[]> {
  try {
    const activeProvider = await aiProviders.getActiveProvider();
    
    const prompt = `
Based on the following context, generate 3 SINGULARIS PRIME code suggestions that would be helpful:

CONTEXT:
${context || "General SINGULARIS PRIME coding assistance"}

Return a JSON array with objects having this structure:
[
  {
    "code": "code snippet",
    "explanation": "explanation of what the code does and why it's useful"
  },
  ...
]
`;

    const result = await activeProvider.generateJson<{ code: string; explanation: string }[]>(prompt);
    
    return result || [];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [{
      code: "// Error generating suggestions",
      explanation: `Failed to generate suggestions: ${error instanceof Error ? error.message : "Unknown error"}`
    }];
  }
}

/**
 * Converts natural language to SINGULARIS PRIME code
 */
export async function naturalLanguageToCode(description: string): Promise<string> {
  try {
    const activeProvider = await aiProviders.getActiveProvider();
    
    const prompt = `
Convert this natural language description into SINGULARIS PRIME code:

${description}

Provide only the code output without additional explanation.
`;

    const result = await activeProvider.generateText(prompt);
    
    return result;
  } catch (error) {
    console.error("Error converting to code:", error);
    return `// Error generating code: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * Explains a section of SINGULARIS PRIME code
 */
export async function explainCode(code: string): Promise<string> {
  try {
    const activeProvider = await aiProviders.getActiveProvider();
    
    const prompt = `
Explain this SINGULARIS PRIME code in a clear, concise way:

\`\`\`
${code}
\`\`\`

Focus on the purpose of the code, what each section does, and any quantum or AI concepts being used.
`;

    const result = await activeProvider.generateText(prompt);
    
    return result;
  } catch (error) {
    console.error("Error explaining code:", error);
    return `Error explaining code: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * Optimizes SINGULARIS PRIME code for better performance or security
 */
export async function optimizeCode(code: string, focus: 'performance' | 'security' | 'explainability' = 'performance'): Promise<string> {
  try {
    const activeProvider = await aiProviders.getActiveProvider();
    
    const prompt = `
Optimize this SINGULARIS PRIME code for ${focus}:

\`\`\`
${code}
\`\`\`

Return only the optimized code without explanation.
`;

    const result = await activeProvider.generateText(prompt);
    
    return result;
  } catch (error) {
    console.error("Error optimizing code:", error);
    return `// Error optimizing code: ${error instanceof Error ? error.message : "Unknown error"}\n${code}`;
  }
}