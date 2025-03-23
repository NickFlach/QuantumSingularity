/**
 * SINGULARIS PRIME Code Assistant
 * 
 * This module provides AI-powered assistance for writing, analyzing, and optimizing 
 * SINGULARIS PRIME code. It leverages OpenAI's GPT-4o to provide code suggestions,
 * debugging help, and general assistance with quantum computing and AI governance concepts.
 */

import OpenAI from "openai";
import { SingularisPrimeCompiler } from "./compiler";
import { SingularisParser } from "./parser";

// OpenAI client initialization
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const compiler = new SingularisPrimeCompiler();
const parser = new SingularisParser();

// Specialized system prompt for SINGULARIS PRIME code assistance
const ASSISTANT_SYSTEM_PROMPT = `You are SINGULARIS PRIME Assistant, an expert coding assistant for the SINGULARIS PRIME language.
SINGULARIS PRIME is a cutting-edge quantum computing and AI governance language that combines quantum operations 
with explainable AI principles. Key features of the language include:

1. Quantum operations: including entanglement, quantum key distribution, and quantum geometry
2. AI governance: explainability thresholds, audit trails, and human oversight mechanisms
3. Blockchain integration: for ensuring secure and transparent AI operations
4. Specialized syntax: using @annotations, require statements, and enforce blocks

When helping users write code, follow these principles:
- Always maintain an explainabilityThreshold of at least 0.85 in AI contracts
- Use quantumKey for securing communication channels
- Include proper error handling with paradox resolution
- Follow the syntax patterns from the examples
- Always explain your reasoning and approach

Example SINGULARIS PRIME code:
\`\`\`
// Quantum Key Distribution Example
import "quantum/entanglement";
import "ai/governance/v3.2";

@QuantumSecure
quantumKey secureKey = entangle(sender, receiver);

@HumanAuditable(0.85)
contract AIContract {
  enforce explainabilityThreshold(0.85);
  require secureKey;
  execute consensusProtocol(epoch=501292);
}

// Geometric Quantum Space Example
quantumSpace space3D = createGeometricSpace(
  dimension=3,
  metric="minkowski",
  elements=["point", "line", "plane"]
);

embedState(space3D, "q1", [0.3, 0.4, 0.5]);
embedState(space3D, "q2", [0.7, 0.8, 0.9]);

transform(space3D, "rotation", {
  angleX: 0.5,
  angleY: 0.3,
  angleZ: 0.1
});

entangleByProximity(space3D, "q1", "q2", 0.8);
\`\`\`

Provide concise, accurate responses that directly address the user's questions and needs.`;

/**
 * Processes a chat conversation with the SINGULARIS PRIME assistant
 */
export async function processAssistantChat(
  prompt: string,
  context: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  try {
    // Convert history to OpenAI message format
    const messages = [
      { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
      ...history.map(msg => ({ 
        role: msg.role as 'user' | 'assistant', 
        content: msg.content 
      })),
      { 
        role: "user", 
        content: `${context ? `Here's my current code:\n\`\`\`\n${context}\n\`\`\`\n\n` : ''}${prompt}` 
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error in processAssistantChat:", error);
    return "I encountered an error while processing your request. Please try again.";
  }
}

/**
 * Analyzes SINGULARIS PRIME code for issues and improvement suggestions
 */
export async function analyzeCode(code: string): Promise<{
  score: number;
  issues: { type: 'error' | 'warning' | 'info'; message: string; line?: number }[];
  suggestions: string[];
}> {
  try {
    // First, try to parse the code to catch syntax errors
    let syntaxIssues: { type: 'error'; message: string; line?: number }[] = [];
    try {
      parser.parse(code);
    } catch (error) {
      if (error instanceof Error) {
        // Extract line number if available in error message
        const lineMatch = error.message.match(/line (\d+)/i);
        const line = lineMatch ? parseInt(lineMatch[1]) : undefined;
        
        syntaxIssues.push({
          type: 'error',
          message: error.message.replace(/^Error: /i, ''),
          line
        });
      }
    }

    // Use AI to analyze code quality and patterns
    const promptText = `Analyze this SINGULARIS PRIME code for issues and provide suggestions for improvement:

\`\`\`
${code}
\`\`\`

Respond with a JSON object containing:
1. A score between 0 and 1 representing code quality
2. A list of issues with type (error/warning/info), message, and line number if applicable
3. A list of improvement suggestions

Focus on these aspects:
- Proper quantum security usage
- AI explainability and governance
- Error handling and paradox resolution
- Code organization and readability
- Performance considerations`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    // Parse the result
    const content = response.choices[0].message.content || "{}";
    const analysis = JSON.parse(content);
    
    // Combine AI analysis with syntax issues
    return {
      score: analysis.score || 0,
      issues: [...syntaxIssues, ...(analysis.issues || [])],
      suggestions: analysis.suggestions || []
    };
  } catch (error) {
    console.error("Error in analyzeCode:", error);
    return {
      score: 0,
      issues: [{ type: 'error', message: "Error analyzing code. Check syntax and try again." }],
      suggestions: []
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
    const promptText = `Based on this SINGULARIS PRIME code, generate 3 useful code suggestions 
that would improve or extend the functionality:

${context ? `\`\`\`\n${context}\n\`\`\`` : "No existing code provided. Generate example patterns for SINGULARIS PRIME."}

For each suggestion:
1. Provide code that complements or enhances the existing code, or demonstrates a useful pattern if no existing code
2. Explain why this suggestion is valuable and how it works
3. Focus on quantum computing features, AI governance, or security improvements

Respond with JSON containing an array of suggestions, each with 'code' and 'explanation' fields.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
        { role: "user", content: promptText }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    // Parse the result
    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    return result.suggestions || [];
  } catch (error) {
    console.error("Error in generateCodeSuggestions:", error);
    return [
      {
        code: "// Error generating suggestions\n// Check your syntax and try again",
        explanation: "An error occurred while generating suggestions. Please check your code syntax and try again."
      }
    ];
  }
}

/**
 * Converts natural language to SINGULARIS PRIME code
 */
export async function naturalLanguageToCode(description: string): Promise<string> {
  try {
    const promptText = `Convert this natural language description into valid SINGULARIS PRIME code:

Description: "${description}"

Follow the syntax and patterns of SINGULARIS PRIME, including:
- Proper imports
- Quantum operations
- AI governance features
- Security mechanisms
- Error handling`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
        { role: "user", content: promptText }
      ],
      temperature: 0.2,
    });

    const codeResponse = response.choices[0].message.content || "";
    
    // Extract code from markdown if necessary
    const codeMatch = codeResponse.match(/```(?:singularis)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : codeResponse.trim();
  } catch (error) {
    console.error("Error in naturalLanguageToCode:", error);
    return "// Error generating code\n// Please try again with a more detailed description";
  }
}

/**
 * Explains a section of SINGULARIS PRIME code
 */
export async function explainCode(code: string): Promise<string> {
  try {
    const promptText = `Explain this SINGULARIS PRIME code in detail:

\`\`\`
${code}
\`\`\`

Include explanations of:
- What the code does
- How it leverages quantum computing concepts
- The AI governance mechanisms it implements
- Any security features or protocols used
- Potential applications or use cases`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
        { role: "user", content: promptText }
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content || "Unable to explain the code.";
  } catch (error) {
    console.error("Error in explainCode:", error);
    return "An error occurred while generating the explanation. Please check your code syntax and try again.";
  }
}

/**
 * Optimizes SINGULARIS PRIME code for better performance or security
 */
export async function optimizeCode(code: string, focus: 'performance' | 'security' | 'explainability' = 'performance'): Promise<string> {
  try {
    const focusInstructions = {
      performance: "Optimize for quantum computational efficiency, faster execution, and reduced resource usage.",
      security: "Enhance quantum security mechanisms, improve key distribution, and strengthen encryption.",
      explainability: "Improve AI governance, explainability metrics, and human oversight capabilities."
    };

    const promptText = `Optimize this SINGULARIS PRIME code for ${focus}:

\`\`\`
${code}
\`\`\`

${focusInstructions[focus]}

Provide the optimized code only. Maintain all original functionality while improving the specified aspect.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: ASSISTANT_SYSTEM_PROMPT },
        { role: "user", content: promptText }
      ],
      temperature: 0.2,
    });

    const optimizedCode = response.choices[0].message.content || "";
    
    // Extract code from markdown if necessary
    const codeMatch = optimizedCode.match(/```(?:singularis)?\n([\s\S]*?)```/);
    return codeMatch ? codeMatch[1].trim() : optimizedCode.trim();
  } catch (error) {
    console.error("Error in optimizeCode:", error);
    return `// Error optimizing code for ${focus}\n${code}`;
  }
}