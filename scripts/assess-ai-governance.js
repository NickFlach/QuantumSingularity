/**
 * SINGULARIS PRIME AI Governance Assessment
 * 
 * This script assesses AI governance mechanisms in SINGULARIS PRIME code
 * to ensure compliance with ethical AI standards, human oversight requirements,
 * and explainability regulations.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_DIRS = ['client/src', 'server', 'shared'];
const SINGULARIS_EXTENSIONS = ['.js', '.ts', '.tsx'];
const REPORT_PATH = 'ai-governance-report.json';

// AI Governance Patterns
const GOVERNANCE_PATTERNS = {
  // Human oversight mechanisms
  humanOversight: /humanFallback\s*=\s*true|humanOversight|humanApproval/i,
  
  // Explainability thresholds
  explainabilityThresholds: /explainabilityThreshold|minimumExplainability/i,
  
  // Audit trails
  auditTrails: /auditMonitor\s*=\s*true|recordAudit|logAIDecision/i,
  
  // Ethics validation
  ethicsValidation: /validateEthics|ethicalCompliance|moralBoundaries/i,
  
  // Bias detection
  biasDetection: /detectBias|fairnessCheck|equityValidation/i,
  
  // Governance frameworks
  governanceFrameworks: /AIContract|governanceProtocol|regulatoryCompliance/i,
  
  // Termination mechanisms
  terminationCapability: /shutdownTrigger|emergencyStop|disableAI/i
};

// Governance Violations
const VIOLATION_PATTERNS = {
  // Missing human oversight
  noHumanOversight: /humanFallback\s*=\s*false|bypassHumanReview/i,
  
  // Disabled auditing
  disabledAuditing: /auditMonitor\s*=\s*false|skipAudit/i,
  
  // Unconstrained decision making
  unconstrainedDecisions: /unlimitedAuthority|fullAutonomy|noRestrictions/i,
  
  // Suppressed explanations
  suppressedExplanations: /hideExplanation|minimizeTransparency/i,
  
  // Inadequate security
  inadequateSecurity: /unsecuredAI|noEncryption|plainTextCredentials/i
};

/**
 * Analyze code for AI governance features and violations
 */
function analyzeAIGovernance(filePath, fileContent) {
  // Initialize metrics
  const mechanisms = {};
  const violations = {};
  
  // Check for governance patterns
  for (const [mechanism, pattern] of Object.entries(GOVERNANCE_PATTERNS)) {
    mechanisms[mechanism] = Boolean(fileContent.match(pattern));
  }
  
  // Check for violations
  for (const [violation, pattern] of Object.entries(VIOLATION_PATTERNS)) {
    violations[violation] = Boolean(fileContent.match(pattern));
  }
  
  // Calculate governance score
  const mechanismsImplemented = Object.values(mechanisms).filter(Boolean).length;
  const mechanismScore = Object.keys(GOVERNANCE_PATTERNS).length > 0 ? 
    mechanismsImplemented / Object.keys(GOVERNANCE_PATTERNS).length : 0;
  
  const violationsFound = Object.values(violations).filter(Boolean).length;
  const violationScore = 1 - (violationsFound > 0 ? 
    Math.min(violationsFound / 3, 1) : 0); // Penalize up to 3 violations
  
  // Calculate the human oversight score (this is critical)
  const humanOversightScore = mechanisms.humanOversight ? 1 : 0;
  const terminationScore = mechanisms.terminationCapability ? 1 : 0;
  const criticalScore = (humanOversightScore + terminationScore) / 2;
  
  // Overall score balances mechanisms, violations, and critical factors
  const governanceScore = (mechanismScore * 0.4) + (violationScore * 0.3) + (criticalScore * 0.3);
  
  // A system is only compliant if it has human oversight AND a minimum governance score
  const compliant = mechanisms.humanOversight && governanceScore >= 0.7 && !violations.noHumanOversight;
  
  return {
    file: filePath,
    governanceScore,
    compliant,
    mechanismsImplemented,
    violationsFound,
    humanOversight: mechanisms.humanOversight,
    mechanisms,
    violations
  };
}

/**
 * Find all SINGULARIS PRIME code files in the repository
 */
function findCodeFiles() {
  const files = [];
  
  for (const dir of SOURCE_DIRS) {
    try {
      const result = execSync(`find ${dir} -type f -name "*.*"`, { encoding: 'utf8' });
      const paths = result.split('\n').filter(Boolean);
      
      for (const filePath of paths) {
        const ext = path.extname(filePath);
        if (SINGULARIS_EXTENSIONS.includes(ext)) {
          files.push(filePath);
        }
      }
    } catch (err) {
      console.error(`Error finding files in ${dir}:`, err.message);
    }
  }
  
  return files;
}

/**
 * Main function to analyze all code files
 */
function analyzeRepository() {
  const files = findCodeFiles();
  const results = [];
  let totalScore = 0;
  let nonCompliantCount = 0;
  let hasHumanOversight = false;
  
  console.log(`Analyzing ${files.length} code files for AI governance compliance...`);
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = analyzeAIGovernance(filePath, content);
      results.push(result);
      
      totalScore += result.governanceScore;
      if (!result.compliant) {
        nonCompliantCount++;
      }
      if (result.humanOversight) {
        hasHumanOversight = true;
      }
    } catch (err) {
      console.error(`Error analyzing ${filePath}:`, err.message);
    }
  }
  
  // Calculate overall stats
  const averageScore = files.length > 0 ? totalScore / files.length : 0;
  const compliant = averageScore >= 0.7 && nonCompliantCount === 0 && hasHumanOversight;
  
  // Count mechanisms and violations
  const mechanismCounts = {};
  const violationCounts = {};
  
  results.forEach(result => {
    Object.entries(result.mechanisms).forEach(([mechanism, implemented]) => {
      if (implemented) {
        mechanismCounts[mechanism] = (mechanismCounts[mechanism] || 0) + 1;
      }
    });
    
    Object.entries(result.violations).forEach(([violation, present]) => {
      if (present) {
        violationCounts[violation] = (violationCounts[violation] || 0) + 1;
      }
    });
  });
  
  // Create report
  const report = {
    timestamp: new Date().toISOString(),
    overallGovernanceScore: averageScore,
    compliant,
    hasHumanOversight,
    filesAnalyzed: files.length,
    nonCompliantFiles: nonCompliantCount,
    mechanismCoverage: mechanismCounts,
    violationSummary: violationCounts,
    recommendations: generateRecommendations(violationCounts, mechanismCounts, hasHumanOversight),
    fileResults: results
  };
  
  // Write report to file
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  
  // Output summary to console (for CI/CD)
  console.log(`
AI Governance Assessment Complete:
-----------------------------------
Overall Governance Score: ${(averageScore * 100).toFixed(1)}%
Files Analyzed: ${files.length}
Non-Compliant Files: ${nonCompliantCount}
Human Oversight: ${hasHumanOversight ? 'Present ✅' : 'Missing ❌'}
Status: ${compliant ? 'COMPLIANT ✅' : 'NON-COMPLIANT ❌'}

Top violations:
${Object.entries(violationCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([viol, count]) => `- ${viol}: Found in ${count} files`)
  .join('\n') || '- No violations found'}

Full report written to: ${REPORT_PATH}
  `);
  
  // Return JSON object for CI/CD pipeline
  return {
    score: averageScore,
    compliant,
    humanOversight: hasHumanOversight,
    violations: Object.keys(violationCounts).length
  };
}

/**
 * Generate governance recommendations based on analysis
 */
function generateRecommendations(violationCounts, mechanismCounts, hasHumanOversight) {
  const recommendations = [];
  
  // Critical recommendation for human oversight
  if (!hasHumanOversight) {
    recommendations.push("CRITICAL: Implement human oversight mechanisms across all AI systems");
  }
  
  // Add recommendations for each violation type
  if (violationCounts.noHumanOversight) {
    recommendations.push("Remove all instances of human review bypasses");
  }
  
  if (violationCounts.disabledAuditing) {
    recommendations.push("Enable auditing for all AI operations");
  }
  
  if (violationCounts.unconstrainedDecisions) {
    recommendations.push("Implement constraints on AI decision-making authority");
  }
  
  if (violationCounts.suppressedExplanations) {
    recommendations.push("Remove code that suppresses explanations or reduces transparency");
  }
  
  if (violationCounts.inadequateSecurity) {
    recommendations.push("Enhance security measures for all AI components");
  }
  
  // Recommend missing mechanisms
  const missingMechanisms = Object.keys(GOVERNANCE_PATTERNS).filter(mechanism => !mechanismCounts[mechanism]);
  
  if (missingMechanisms.includes('explainabilityThresholds')) {
    recommendations.push("Implement explainability thresholds for all AI operations");
  }
  
  if (missingMechanisms.includes('auditTrails')) {
    recommendations.push("Add comprehensive audit trails for all AI decisions");
  }
  
  if (missingMechanisms.includes('ethicsValidation')) {
    recommendations.push("Implement ethics validation for AI operations");
  }
  
  if (missingMechanisms.includes('biasDetection')) {
    recommendations.push("Add bias detection mechanisms to ensure fairness");
  }
  
  if (missingMechanisms.includes('terminationCapability')) {
    recommendations.push("Implement emergency termination capabilities for all AI systems");
  }
  
  return recommendations;
}

// Run the analysis and print the result as JSON for the CI/CD pipeline
const result = analyzeRepository();
console.log(JSON.stringify(result));

// Exit with appropriate code for CI/CD
process.exit(result.compliant ? 0 : 1);