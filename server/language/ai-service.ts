/**
 * SINGULARIS PRIME AI Service
 * 
 * This module provides AI-powered analysis, explanation, and documentation
 * generation for SINGULARIS PRIME code, leveraging advanced NLP models.
 */

import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Interface for explainability result
 */
export interface ExplainabilityResult {
  score: number; // 0-1 score
  factors: string[]; // Factors contributing to score
  recommendations: string[]; // Recommendations for improvement
}

/**
 * Interface for code analysis result
 */
export interface CodeAnalysisResult {
  complexity: number; // 0-1 score
  quantumFeatures: string[]; // Quantum features in code
  entanglementPattern: 'none' | 'low' | 'moderate' | 'high';
  dimensions: number; // Dimensionality of quantum system
  improvements: string[]; // Suggested improvements
}

/**
 * Evaluates the explainability of SINGULARIS PRIME code
 * 
 * @param code The code to evaluate
 * @returns Explainability result
 */
export async function evaluateExplainability(code: string): Promise<ExplainabilityResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, using local explainability evaluation');
      return evaluateExplainabilityLocally(code);
    }

    // Use OpenAI for advanced explainability evaluation
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: `You are an AI explainability assessment system for the SINGULARIS PRIME language, 
                    a quantum-secure, AI-native language designed for 37-dimensional quantum systems
                    and quantum magnetism simulations. Evaluate the explainability of the provided code.
                    Return a JSON object with the following properties:
                    - score: numeric value between 0-1 representing the explainability score
                    - factors: array of strings describing factors affecting the score (max 5)
                    - recommendations: array of specific recommendations to improve explainability (max 3)`
        },
        {
          role: 'user',
          content: code
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      score: result.score || 0.5,
      factors: result.factors || [],
      recommendations: result.recommendations || []
    };
  } catch (error) {
    console.error('Error evaluating explainability:', error);
    return evaluateExplainabilityLocally(code);
  }
}

/**
 * Local fallback for explainability evaluation
 */
function evaluateExplainabilityLocally(code: string): ExplainabilityResult {
  // Count comments and documentation
  const comments = (code.match(/\/\*\*[\s\S]*?\*\//g) || []).length + 
                  (code.match(/\/\/.*$/gm) || []).length;
  
  // Count descriptive variable names (longer than 3 characters)
  const descriptiveNames = (code.match(/\b[a-zA-Z][a-zA-Z0-9]{3,}\b/g) || []).length;
  
  // Count function parameters with explanatory names
  const functionParams = (code.match(/function\s+\w+\s*\(([^)]*)\)/g) || []).length;
  
  // Calculate score based on simple heuristics
  let score = 0.3; // Base score
  
  if (comments > 5) score += 0.2;
  if (descriptiveNames > 10) score += 0.2;
  if (functionParams > 3) score += 0.1;
  if (code.includes('@explain') || code.includes('@doc')) score += 0.2;
  
  // Clamp to 0-1 range
  score = Math.max(0, Math.min(1, score));
  
  return {
    score,
    factors: [
      'Comment density and quality',
      'Descriptive variable naming',
      'Function parameter documentation',
      'Use of explainability annotations'
    ],
    recommendations: [
      'Add more detailed function documentation',
      'Use more descriptive variable names',
      'Add @explain annotations to complex quantum operations'
    ]
  };
}

/**
 * Analyzes SINGULARIS PRIME code for features and patterns
 * 
 * @param code The code to analyze
 * @returns Code analysis result
 */
export async function analyzeCode(code: string): Promise<CodeAnalysisResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, using local code analysis');
      return analyzeCodeLocally(code);
    }

    // Use OpenAI for advanced code analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert in quantum computing and the SINGULARIS PRIME language.
                    Analyze the provided code for quantum features, complexity, dimensionality,
                    and entanglement patterns. Return a JSON object with the following properties:
                    - complexity: numeric value between 0-1 representing code complexity
                    - quantumFeatures: array of strings identifying quantum features used
                    - entanglementPattern: one of "none", "low", "moderate", or "high"
                    - dimensions: numeric value representing the quantum dimensionality
                    - improvements: array of suggested improvements (max 3)`
        },
        {
          role: 'user',
          content: code
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    return {
      complexity: result.complexity || 0.5,
      quantumFeatures: result.quantumFeatures || [],
      entanglementPattern: result.entanglementPattern || 'moderate',
      dimensions: result.dimensions || 2,
      improvements: result.improvements || []
    };
  } catch (error) {
    console.error('Error analyzing code:', error);
    return analyzeCodeLocally(code);
  }
}

/**
 * Local fallback for code analysis
 */
function analyzeCodeLocally(code: string): CodeAnalysisResult {
  // Extract dimensionality
  const dimensionsMatch = code.match(/dimension[s]?[:\s]+(\d+)/i) || 
                          code.match(/qudit<(\d+)>/i);
  const dimensions = dimensionsMatch ? parseInt(dimensionsMatch[1]) : 2;
  
  // Determine quantum features
  const quantumFeatures: string[] = [];
  if (code.includes('superposition')) quantumFeatures.push('Superposition');
  if (code.includes('entanglement')) quantumFeatures.push('Entanglement');
  if (code.includes('teleportation')) quantumFeatures.push('Quantum Teleportation');
  if (code.includes('Hamiltonian')) quantumFeatures.push('Hamiltonian Simulation');
  if (code.includes('37D') || code.includes('37-dimension')) quantumFeatures.push('37-Dimensional States');
  if (code.includes('magnetism')) quantumFeatures.push('Quantum Magnetism');
  
  // Determine entanglement pattern
  let entanglementPattern: 'none' | 'low' | 'moderate' | 'high' = 'none';
  if (code.includes('entangle')) {
    const entanglementCount = (code.match(/entangle/g) || []).length;
    if (entanglementCount > 10) entanglementPattern = 'high';
    else if (entanglementCount > 5) entanglementPattern = 'moderate';
    else entanglementPattern = 'low';
  }
  
  // Determine complexity
  const complexity = Math.min(1, 0.3 + 
    (code.split('\n').length / 200) + 
    (quantumFeatures.length / 10) + 
    (dimensions / 50));
  
  return {
    complexity,
    quantumFeatures,
    entanglementPattern,
    dimensions,
    improvements: [
      'Consider adding more detailed comments for complex quantum operations',
      'Add error handling for quantum state preparation',
      'Use parametric quantum types for better type safety'
    ]
  };
}

/**
 * Generates documentation for SINGULARIS PRIME code
 * 
 * @param code The code to document
 * @returns Generated documentation in markdown format
 */
export async function generateDocumentation(code: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, using local documentation generation');
      return generateDocumentationLocally(code);
    }

    // Use OpenAI for documentation generation
    const response = await openai.chat.completions.create({
      model: 'gpt-4-0125-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert in quantum computing and the SINGULARIS PRIME language.
                    Generate comprehensive documentation for the provided SINGULARIS PRIME code.
                    Include explanations of quantum concepts, data structures, algorithms, and
                    any special features. Format the documentation in markdown with sections for:
                    - Overview
                    - Quantum Features
                    - Code Structure
                    - Function Documentation
                    - Usage Examples`
        },
        {
          role: 'user',
          content: code
        }
      ],
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || 'Documentation generation failed.';
  } catch (error) {
    console.error('Error generating documentation:', error);
    return generateDocumentationLocally(code);
  }
}

/**
 * Local fallback for documentation generation
 */
function generateDocumentationLocally(code: string): string {
  // Extract function names
  const functionMatches = code.match(/function\s+(\w+)/g) || [];
  const functions = functionMatches.map(f => f.replace('function ', ''));
  
  // Extract class names
  const classMatches = code.match(/class\s+(\w+)/g) || [];
  const classes = classMatches.map(c => c.replace('class ', ''));
  
  // Determine quantum features
  const features: string[] = [];
  if (code.includes('superposition')) features.push('Superposition');
  if (code.includes('entanglement')) features.push('Entanglement');
  if (code.includes('teleportation')) features.push('Quantum Teleportation');
  if (code.includes('Hamiltonian')) features.push('Hamiltonian Simulation');
  if (code.includes('37D') || code.includes('37-dimension')) features.push('37-Dimensional States');
  if (code.includes('magnetism')) features.push('Quantum Magnetism');
  
  // Generate simple documentation
  let documentation = '# SINGULARIS PRIME Code Documentation\n\n';
  
  documentation += '## Overview\n\n';
  documentation += 'This code implements SINGULARIS PRIME quantum operations ';
  documentation += features.length > 0 ? 
    `with a focus on ${features.join(', ')}.\n\n` : 
    'for quantum computation.\n\n';
  
  if (classes.length > 0) {
    documentation += '## Classes\n\n';
    classes.forEach(c => {
      documentation += `### ${c}\n\n`;
      documentation += `The \`${c}\` class implements quantum functionality for SINGULARIS PRIME.\n\n`;
    });
  }
  
  if (functions.length > 0) {
    documentation += '## Functions\n\n';
    functions.forEach(f => {
      documentation += `### ${f}\n\n`;
      documentation += `The \`${f}\` function provides quantum operations in the SINGULARIS PRIME framework.\n\n`;
    });
  }
  
  if (features.length > 0) {
    documentation += '## Quantum Features\n\n';
    features.forEach(f => {
      documentation += `### ${f}\n\n`;
      documentation += `This code implements ${f} capabilities through SINGULARIS PRIME.\n\n`;
    });
  }
  
  documentation += '## Usage\n\n';
  documentation += 'This code can be integrated into quantum computation workflows using the SINGULARIS PRIME framework.\n';
  
  return documentation;
}