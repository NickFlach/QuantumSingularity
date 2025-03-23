/**
 * SINGULARIS PRIME Code Assistant
 * 
 * This module provides AI-powered assistance for writing, analyzing, and optimizing 
 * SINGULARIS PRIME code. It leverages OpenAI's GPT-4o to provide code suggestions,
 * debugging help, and general assistance with quantum computing and AI governance concepts.
 */

import { aiProviders } from './ai-providers';

// Sample explanation if AI services are unavailable
function getFallbackResponse(type: string): string {
  switch (type) {
    case 'chat':
      return "I'm the SINGULARIS PRIME assistant. I can help with quantum computing, AI governance, and language syntax questions.";
    case 'analyze':
      return "The code appears to implement a basic SINGULARIS PRIME program with quantum operations.";
    case 'generate':
      return "// Generated SINGULARIS PRIME code\nquantumKey secureKey = entangle(sender, receiver);\n\n@HumanAuditable(0.85)\ncontract AIContract {\n  enforce explainabilityThreshold(0.85);\n}";
    case 'explain':
      return "This code creates a quantum key for secure communication and establishes an AI contract with an explainability threshold of 85%.";
    case 'optimize':
      return "// Optimized version\nquantumKey secureKey = entangle(sender, receiver);\n\n@HumanAuditable(0.90) // Increased threshold\ncontract AIContract {\n  enforce explainabilityThreshold(0.90);\n  monitor auditTrail();\n}";
    default:
      return "Unable to process this request type.";
  }
}

/**
 * Processes a chat conversation with the SINGULARIS PRIME assistant
 */
export async function processAssistantChat(
  prompt: string,
  context: string,
  history: { role: 'user' | 'assistant', content: string }[]
): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const systemPrompt = `You are the SINGULARIS PRIME assistant, an expert in the SINGULARIS PRIME programming language,
      quantum computing concepts, and AI governance. The SINGULARIS PRIME language combines quantum operations,
      AI protocol execution, and distributed ledger technology. 
      
      Key features include:
      - Quantum key distribution (QKD) and entanglement
      - AI contract negotiation with explainability thresholds
      - Geometric quantum computing operations
      - Human-auditable AI governance protocols
      
      If the user provides code, it's written in SINGULARIS PRIME. Respond helpfully but concisely.`;
    
    const contextPrompt = context ? `\n\nUser's current code:\n\`\`\`\n${context}\n\`\`\`\n` : '';
    const chatHistoryText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    
    const fullPrompt = `${systemPrompt}${contextPrompt}\n\nChat history:\n${chatHistoryText}\n\nUser: ${prompt}\n\nAssistant:`;
    
    const response = await provider.generateText(fullPrompt);
    return response;
  } catch (error) {
    console.error('Assistant chat error:', error);
    return getFallbackResponse('chat');
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
    if (!code.trim()) {
      return {
        score: 0,
        issues: [{ type: 'error', message: 'No code provided for analysis.' }],
        suggestions: ['Write some SINGULARIS PRIME code to analyze.']
      };
    }
    
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `Analyze the following SINGULARIS PRIME code for quality, issues, and improvement opportunities:
    
    \`\`\`
    ${code}
    \`\`\`
    
    Consider:
    1. Quantum operation correctness
    2. AI governance compliance (explainability thresholds)
    3. Potential security or paradox risks
    4. Code structure and readability
    
    Return a JSON object with:
    - score: number from 0-100 rating code quality
    - issues: array of objects with {type: "error"|"warning"|"info", message: string, line?: number}
    - suggestions: array of strings with improvement ideas
    
    Be detailed but concise.`;
    
    const result = await provider.generateJson<{
      score: number;
      issues: { type: 'error' | 'warning' | 'info'; message: string; line?: number }[];
      suggestions: string[];
    }>(prompt);
    
    // Ensure the score is within bounds
    result.score = Math.max(0, Math.min(100, result.score));
    
    return result;
  } catch (error) {
    console.error('Code analysis error:', error);
    
    // Fallback response
    return {
      score: 50,
      issues: [
        { type: 'info', message: 'Analysis is running in fallback mode due to service limitations.' }
      ],
      suggestions: [
        'Consider adding more documentation to quantum operations.',
        'Ensure all AI contracts specify an explainability threshold.'
      ]
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
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `Based on the following SINGULARIS PRIME code context, generate 2-3 code suggestions that would be helpful additions or improvements:
    
    \`\`\`
    ${context || "// No context provided"}
    \`\`\`
    
    For each suggestion, provide:
    1. A code snippet that could be inserted
    2. A brief explanation of what the code does and why it's useful
    
    Return a JSON array where each object has:
    - code: string with the code snippet
    - explanation: string explaining the suggestion
    
    Focus on quantum operations, AI governance, or geometric quantum concepts depending on what seems most relevant to the context.`;
    
    const suggestions = await provider.generateJson<{ code: string; explanation: string }[]>(prompt);
    
    return suggestions.slice(0, 3); // Limit to max 3 suggestions
  } catch (error) {
    console.error('Code suggestions error:', error);
    
    // Fallback response
    return [
      {
        code: "@QuantumSecure\nquantumKey secureKey = entangle(sender, receiver);",
        explanation: "Creates a quantum-secure key using entanglement between sender and receiver nodes."
      },
      {
        code: "@HumanAuditable(0.85)\ncontract AIContract {\n  enforce explainabilityThreshold(0.85);\n}",
        explanation: "Establishes an AI contract with an explainability threshold of 85%, ensuring decisions are human-auditable."
      }
    ];
  }
}

/**
 * Converts natural language to SINGULARIS PRIME code
 */
export async function naturalLanguageToCode(description: string): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `Convert the following natural language description into SINGULARIS PRIME code:
    
    "${description}"
    
    The SINGULARIS PRIME language has these key components:
    - Quantum operations: quantumKey, entangle(), quantum states
    - AI governance: contract, explainabilityThreshold(), @HumanAuditable annotation
    - Quantum geometry: quantumSpace, createGeometricSpace(), embedState()
    - Syntax similar to JavaScript/TypeScript with specialized operations
    
    Return only the code without explanations.`;
    
    const code = await provider.generateText(prompt);
    return code;
  } catch (error) {
    console.error('Natural language to code error:', error);
    
    // Create a fallback response based on common patterns
    const keywords = ['quantum', 'AI', 'entangle', 'contract', 'governance', 'secure'];
    const hasQuantum = description.toLowerCase().includes('quantum');
    const hasAI = description.toLowerCase().includes('ai') || description.toLowerCase().includes('artificial');
    
    let fallbackCode = "// Generated from description: " + description + "\n\n";
    
    if (hasQuantum) {
      fallbackCode += "@QuantumSecure\nquantumKey secureKey = entangle(sender, receiver);\n\n";
    }
    
    if (hasAI) {
      fallbackCode += "@HumanAuditable(0.85)\ncontract AIContract {\n  enforce explainabilityThreshold(0.85);\n  execute consensusProtocol();\n}\n\n";
    }
    
    return fallbackCode;
  }
}

/**
 * Explains a section of SINGULARIS PRIME code
 */
export async function explainCode(code: string): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const prompt = `Explain the following SINGULARIS PRIME code in clear, concise terms:
    
    \`\`\`
    ${code}
    \`\`\`
    
    Focus on:
    1. What the code does functionally
    2. Any quantum operations and their effects
    3. AI governance aspects and explainability measures
    4. Security and integrity mechanisms
    
    Keep the explanation straightforward and accessible for someone familiar with programming but new to quantum computing concepts.`;
    
    const explanation = await provider.generateText(prompt);
    return explanation;
  } catch (error) {
    console.error('Code explanation error:', error);
    return getFallbackResponse('explain');
  }
}

/**
 * Optimizes SINGULARIS PRIME code for better performance or security
 */
export async function optimizeCode(code: string, focus: 'performance' | 'security' | 'explainability' = 'performance'): Promise<string> {
  try {
    const provider = await aiProviders.getActiveProvider();
    
    const focusDescriptions = {
      performance: "optimizing quantum operations for efficiency and reduced decoherence",
      security: "enhancing cryptographic protection and quantum key security",
      explainability: "improving AI governance transparency and human-auditability"
    };
    
    const prompt = `Optimize the following SINGULARIS PRIME code focusing specifically on ${focusDescriptions[focus]}:
    
    \`\`\`
    ${code}
    \`\`\`
    
    Maintain the same functionality but improve the code's ${focus} characteristics.
    Only return the optimized code without additional explanations.`;
    
    const optimizedCode = await provider.generateText(prompt);
    return optimizedCode;
  } catch (error) {
    console.error('Code optimization error:', error);
    return getFallbackResponse('optimize');
  }
}