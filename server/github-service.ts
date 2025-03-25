/**
 * SINGULARIS PRIME GitHub Integration Service
 * 
 * This module provides GitHub integration for SINGULARIS PRIME, including
 * OAuth authentication, repository access, and CI/CD webhook handling.
 */

import { Request } from 'express';
import fetch from 'node-fetch';
import { User } from '../shared/schema';
import { log } from './vite';

// GitHub API URL bases
const GITHUB_API_URL = 'https://api.github.com';

/**
 * Repository information structure
 */
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
}

/**
 * Repository contents structure
 */
export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  encoding?: string;
}

/**
 * Initialize GitHub environment and check configuration
 */
export function initGitHubService(): boolean {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    log('GitHub OAuth credentials not found in environment variables.', 'github');
    return false;
  }
  
  log('GitHub integration service initialized', 'github');
  return true;
}

/**
 * Gets user's GitHub repositories
 */
export async function getUserRepositories(req: Request): Promise<GitHubRepository[]> {
  const user = req.user as User;
  
  if (!user?.githubAccessToken) {
    return [];
  }
  
  try {
    const response = await fetch(`${GITHUB_API_URL}/user/repos?sort=updated&per_page=100`, {
      headers: {
        'Authorization': `token ${user.githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const repos = await response.json() as GitHubRepository[];
    return repos;
  } catch (error) {
    log(`Error fetching user repositories: ${error}`, 'github');
    return [];
  }
}

/**
 * Gets the contents of a specific repository path
 */
export async function getRepositoryContents(
  req: Request,
  owner: string,
  repo: string,
  path: string = ''
): Promise<GitHubContent[]> {
  const user = req.user as User;
  
  if (!user?.githubAccessToken) {
    return [];
  }
  
  try {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${user.githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const contents = await response.json();
    return Array.isArray(contents) ? contents : [contents];
  } catch (error) {
    log(`Error fetching repository contents: ${error}`, 'github');
    return [];
  }
}

/**
 * Gets the content of a specific file in a repository
 */
export async function getFileContent(
  req: Request,
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const user = req.user as User;
  
  if (!user?.githubAccessToken) {
    return '';
  }
  
  try {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${user.githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as GitHubContent;
    
    if (data.content && data.encoding === 'base64') {
      // Decode base64 content
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    
    return '';
  } catch (error) {
    log(`Error fetching file content: ${error}`, 'github');
    return '';
  }
}

/**
 * Creates a GitHub webhook for CI/CD integration
 */
export async function setupRepositoryWebhook(
  req: Request,
  owner: string,
  repo: string,
  webhookUrl: string
): Promise<boolean> {
  const user = req.user as User;
  
  if (!user?.githubAccessToken) {
    return false;
  }
  
  try {
    const url = `${GITHUB_API_URL}/repos/${owner}/${repo}/hooks`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `token ${user.githubAccessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['push', 'pull_request'],
        config: {
          url: webhookUrl,
          content_type: 'json',
          insecure_ssl: '0'
        }
      })
    });
    
    return response.ok;
  } catch (error) {
    log(`Error setting up repository webhook: ${error}`, 'github');
    return false;
  }
}

/**
 * Finds SINGULARIS PRIME code files in a repository
 */
export async function findSingularisFiles(
  req: Request,
  owner: string,
  repo: string
): Promise<string[]> {
  // Start with the root directory
  const singularisFiles: string[] = [];
  
  const crawlDirectory = async (path: string = '') => {
    const contents = await getRepositoryContents(req, owner, repo, path);
    
    for (const item of contents) {
      if (item.type === 'file') {
        // Check if file has SINGULARIS PRIME code markers
        if (item.name.endsWith('.js') || item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
          const content = await getFileContent(req, owner, repo, item.path);
          if (
            content.includes('SINGULARIS PRIME') || 
            content.includes('quantumKey') || 
            content.includes('AIContract') ||
            content.includes('syncLedger') ||
            content.includes('resolveParadox')
          ) {
            singularisFiles.push(item.path);
          }
        }
      } else if (item.type === 'dir') {
        // Recursively crawl subdirectories
        await crawlDirectory(item.path);
      }
    }
  };
  
  try {
    await crawlDirectory();
    return singularisFiles;
  } catch (error) {
    log(`Error finding SINGULARIS PRIME files: ${error}`, 'github');
    return [];
  }
}

/**
 * Runs CI/CD pipeline analysis on repository files
 */
export async function analyzeRepository(
  req: Request,
  owner: string,
  repo: string
): Promise<{
  explainability: { score: number, factors: string[] },
  security: { score: number, vulnerabilities: number },
  governance: { score: number, compliant: boolean }
}> {
  // Find SINGULARIS PRIME files
  const files = await findSingularisFiles(req, owner, repo);
  
  if (files.length === 0) {
    return {
      explainability: { score: 0, factors: ['No SINGULARIS PRIME files found'] },
      security: { score: 0, vulnerabilities: 0 },
      governance: { score: 0, compliant: false }
    };
  }
  
  // Fetch content of each file for analysis
  const fileContents: Record<string, string> = {};
  for (const file of files) {
    fileContents[file] = await getFileContent(req, owner, repo, file);
  }
  
  // Analyze files for explainability
  const explainability = analyzeExplainability(fileContents);
  
  // Analyze files for quantum security
  const security = analyzeQuantumSecurity(fileContents);
  
  // Analyze files for AI governance
  const governance = analyzeAIGovernance(fileContents);
  
  return {
    explainability,
    security,
    governance
  };
}

/**
 * Analyzes code for explainability
 */
function analyzeExplainability(fileContents: Record<string, string>): { score: number, factors: string[] } {
  // Simple implementation for explainability analysis
  // In a production environment, this would call the actual script
  
  let totalScore = 0;
  let totalFiles = 0;
  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];
  
  for (const [file, content] of Object.entries(fileContents)) {
    const lines = content.split('\n');
    const totalLines = lines.length;
    
    // Comment analysis 
    const commentLines = lines.filter(line => line.trim().startsWith('//') || 
                                           line.trim().startsWith('/*') || 
                                           line.trim().startsWith('*')).length;
    const commentRatio = commentLines / totalLines;
    
    // Function documentation 
    const functionCount = (content.match(/function\s+\w+\s*\(/g) || []).length;
    const documentedFunctions = (content.match(/\/\*\*[\s\S]*?\*\/\s*function\s+\w+\s*\(/g) || []).length;
    const functionDocRatio = functionCount > 0 ? documentedFunctions / functionCount : 1;
    
    // Human oversight indicators
    const humanOversightFactor = content.includes('humanFallback') || 
                                 content.includes('humanApproval') ||
                                 content.includes('explainabilityThreshold') ? 1 : 0.6;
    
    // Calculate overall explainability score
    const fileScore = (commentRatio * 0.3 + functionDocRatio * 0.4 + humanOversightFactor * 0.3);
    totalScore += fileScore;
    totalFiles++;
    
    // Add to factors
    if (commentRatio > 0.15) {
      if (!positiveFactors.includes("Good comment-to-code ratio"))
        positiveFactors.push("Good comment-to-code ratio");
    } else {
      if (!negativeFactors.includes("Insufficient comments"))
        negativeFactors.push("Insufficient comments");
    }
    
    if (functionDocRatio > 0.7) {
      if (!positiveFactors.includes("Well-documented functions"))
        positiveFactors.push("Well-documented functions");
    } else {
      if (!negativeFactors.includes("Undocumented functions"))
        negativeFactors.push("Undocumented functions");
    }
    
    if (humanOversightFactor > 0.8) {
      if (!positiveFactors.includes("Human oversight mechanisms present"))
        positiveFactors.push("Human oversight mechanisms present");
    } else {
      if (!negativeFactors.includes("Missing human oversight"))
        negativeFactors.push("Missing human oversight");
    }
  }
  
  const averageScore = totalFiles > 0 ? Math.min(totalScore / totalFiles, 1) : 0;
  const factors = [...positiveFactors, ...negativeFactors.map(f => `Issue: ${f}`)];
  
  return {
    score: parseFloat(averageScore.toFixed(2)),
    factors: factors.slice(0, 5) // Top 5 factors
  };
}

/**
 * Analyzes code for quantum security
 */
function analyzeQuantumSecurity(fileContents: Record<string, string>): { score: number, vulnerabilities: number } {
  // Simple implementation for quantum security analysis
  let totalScore = 0;
  let totalFiles = 0;
  let vulnerabilityCount = 0;
  
  // Security patterns to check
  const securityPatterns = [
    /simulateQKD|quantumKey\s*\(/i,
    /@QuantumResistant|postQuantumEncryption/i,
    /simulateQuantumEntanglement|entangle\s*\(/i,
    /simulateZKProof|zeroKnowledgeValidation/i,
  ];
  
  // Vulnerability patterns to check
  const vulnerabilityPatterns = [
    /createQuantumChannel(?!\s*\([^)]*securityLevel)/i,
    /receiveQuantumData(?!\s*\([^)]*validate)/i,
    /const\s+QUANTUM_KEY\s*=|FIXED_ENTROPY/i,
  ];
  
  for (const [file, content] of Object.entries(fileContents)) {
    let fileSecurityScore = 0;
    let fileVulnerabilities = 0;
    
    // Check for security patterns
    for (const pattern of securityPatterns) {
      if (pattern.test(content)) {
        fileSecurityScore += 0.25; // Each pattern contributes 25% to the score
      }
    }
    
    // Check for vulnerabilities
    for (const pattern of vulnerabilityPatterns) {
      if (pattern.test(content)) {
        fileVulnerabilities++;
      }
    }
    
    // Penalize for vulnerabilities
    fileSecurityScore = Math.max(0, fileSecurityScore - (fileVulnerabilities * 0.2));
    
    totalScore += fileSecurityScore;
    totalFiles++;
    vulnerabilityCount += fileVulnerabilities;
  }
  
  const averageScore = totalFiles > 0 ? Math.min(totalScore / totalFiles, 1) : 0;
  
  return {
    score: parseFloat(averageScore.toFixed(2)),
    vulnerabilities: vulnerabilityCount
  };
}

/**
 * Analyzes code for AI governance
 */
function analyzeAIGovernance(fileContents: Record<string, string>): { score: number, compliant: boolean } {
  // Simple implementation for AI governance analysis
  let totalScore = 0;
  let totalFiles = 0;
  let hasHumanOversight = false;
  
  // Governance patterns to check
  const governancePatterns = [
    { pattern: /humanFallback\s*=\s*true|humanOversight|humanApproval/i, weight: 0.3 },
    { pattern: /explainabilityThreshold|minimumExplainability/i, weight: 0.2 },
    { pattern: /auditMonitor\s*=\s*true|recordAudit|logAIDecision/i, weight: 0.2 },
    { pattern: /validateEthics|ethicalCompliance|moralBoundaries/i, weight: 0.1 },
    { pattern: /AIContract|governanceProtocol|regulatoryCompliance/i, weight: 0.2 }
  ];
  
  for (const [file, content] of Object.entries(fileContents)) {
    let fileScore = 0;
    
    // Check for governance patterns
    for (const { pattern, weight } of governancePatterns) {
      if (pattern.test(content)) {
        fileScore += weight;
        
        // Check specifically for human oversight
        if (pattern.toString().includes('humanFallback') && pattern.test(content)) {
          hasHumanOversight = true;
        }
      }
    }
    
    totalScore += fileScore;
    totalFiles++;
  }
  
  const averageScore = totalFiles > 0 ? Math.min(totalScore / totalFiles, 1) : 0;
  const compliant = averageScore >= 0.7 && hasHumanOversight;
  
  return {
    score: parseFloat(averageScore.toFixed(2)),
    compliant
  };
}