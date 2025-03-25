/**
 * SINGULARIS PRIME Explainability Analyzer
 * 
 * This script analyzes the explainability of SINGULARIS PRIME code files
 * in the repository and produces a report used during CI/CD to ensure
 * human-auditable, transparent code.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const EXPLAINABILITY_THRESHOLD = 0.8; // 80% minimum explainability
const SOURCE_DIRS = ['client/src', 'server', 'shared'];
const SINGULARIS_EXTENSIONS = ['.js', '.ts', '.tsx'];
const REPORT_PATH = 'explainability-report.json';

/**
 * Simple scoring algorithm that examines key factors in code explainability
 * In a real implementation, this would integrate with the AI service.
 */
function analyzeCodeExplainability(filePath, fileContent) {
  // Basic metrics
  const lines = fileContent.split('\n');
  const totalLines = lines.length;
  
  // Comment analysis 
  const commentLines = lines.filter(line => line.trim().startsWith('//') || 
                                           line.trim().startsWith('/*') || 
                                           line.trim().startsWith('*')).length;
  const commentRatio = commentLines / totalLines;
  
  // Function documentation 
  const functionCount = (fileContent.match(/function\s+\w+\s*\(/g) || []).length;
  const documentedFunctions = (fileContent.match(/\/\*\*[\s\S]*?\*\/\s*function\s+\w+\s*\(/g) || []).length;
  const functionDocRatio = functionCount > 0 ? documentedFunctions / functionCount : 1;
  
  // Complexity factors
  const complexConstructsCount = (fileContent.match(/quantumKey|contract|deployModel|syncLedger|resolveParadox|enforce/g) || []).length;
  const explainedConstructsCount = (fileContent.match(/\/\/.*(?:quantumKey|contract|deployModel|syncLedger|resolveParadox|enforce)/g) || []).length +
                                   (fileContent.match(/\/\*[\s\S]*?(?:quantumKey|contract|deployModel|syncLedger|resolveParadox|enforce)[\s\S]*?\*\//g) || []).length;
  const complexityExplanationFactor = complexConstructsCount > 0 ? Math.min(explainedConstructsCount / complexConstructsCount, 1) : 1;
  
  // Human oversight indicators
  const humanOversightFactor = fileContent.includes('humanFallback') || 
                              fileContent.includes('humanApproval') ||
                              fileContent.includes('explainabilityThreshold') ? 1 : 0.6;
  
  // Variable names quality (basic heuristic)
  const singleLetterVars = (fileContent.match(/\b[a-z]\s*=/gi) || []).length;
  const totalVarDeclarations = (fileContent.match(/\b(?:const|let|var)\s+\w+\s*=/g) || []).length;
  const descriptiveNamesFactor = totalVarDeclarations > 0 ? 
    Math.max(0, Math.min(1, 1 - (singleLetterVars / totalVarDeclarations))) : 1;
  
  // Calculate overall explainability score (weighted factors)
  const score = (
    commentRatio * 0.2 + 
    functionDocRatio * 0.25 + 
    complexityExplanationFactor * 0.3 +
    humanOversightFactor * 0.15 +
    descriptiveNamesFactor * 0.1
  );
  
  // Calculate positive and negative factors
  const positiveFactors = [];
  const negativeFactors = [];
  
  if (commentRatio > 0.15) {
    positiveFactors.push("Good comment-to-code ratio");
  } else {
    negativeFactors.push("Insufficient comments explaining code purpose and functionality");
  }
  
  if (functionDocRatio > 0.7) {
    positiveFactors.push("Most functions are documented");
  } else {
    negativeFactors.push("Many functions lack proper documentation");
  }
  
  if (complexityExplanationFactor > 0.8) {
    positiveFactors.push("Complex quantum and AI constructs are well-explained");
  } else {
    negativeFactors.push("Complex quantum and AI operations lack sufficient explanations");
  }
  
  if (humanOversightFactor > 0.8) {
    positiveFactors.push("Good human oversight mechanisms");
  } else {
    negativeFactors.push("Insufficient human oversight for AI operations");
  }
  
  if (descriptiveNamesFactor > 0.9) {
    positiveFactors.push("Descriptive variable and function names");
  } else {
    negativeFactors.push("Some variable names are not descriptive enough");
  }
  
  return {
    file: filePath,
    score: Math.min(Math.max(score, 0), 1), // Ensure between 0-1
    passed: score >= EXPLAINABILITY_THRESHOLD,
    positiveFactors,
    negativeFactors,
    metrics: {
      commentRatio,
      functionDocRatio,
      complexityExplanationFactor,
      humanOversightFactor,
      descriptiveNamesFactor
    }
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
  let belowThresholdCount = 0;
  
  console.log(`Analyzing ${files.length} code files for explainability...`);
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = analyzeCodeExplainability(filePath, content);
      results.push(result);
      
      totalScore += result.score;
      if (!result.passed) {
        belowThresholdCount++;
      }
    } catch (err) {
      console.error(`Error analyzing ${filePath}:`, err.message);
    }
  }
  
  // Calculate overall stats
  const averageScore = files.length > 0 ? totalScore / files.length : 0;
  const passed = averageScore >= EXPLAINABILITY_THRESHOLD && belowThresholdCount === 0;
  
  // Generate suggestions based on common negative factors
  const factorCounts = {};
  results.forEach(result => {
    result.negativeFactors.forEach(factor => {
      factorCounts[factor] = (factorCounts[factor] || 0) + 1;
    });
  });
  
  // Sort factors by frequency
  const sortedFactors = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([factor, count]) => `${factor} (found in ${count} files)`);
  
  // Create final report
  const report = {
    timestamp: new Date().toISOString(),
    overallScore: averageScore,
    passed,
    threshold: EXPLAINABILITY_THRESHOLD,
    filesAnalyzed: files.length,
    filesBelowThreshold: belowThresholdCount,
    improvementPriorities: sortedFactors.slice(0, 5), // Top 5 issues to fix
    fileResults: results
  };
  
  // Write report to file
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  
  // Output summary to console (for CI/CD)
  console.log(`
Explainability Analysis Complete:
--------------------------------
Overall Score: ${(averageScore * 100).toFixed(1)}%
Threshold: ${(EXPLAINABILITY_THRESHOLD * 100).toFixed(1)}%
Files Analyzed: ${files.length}
Files Below Threshold: ${belowThresholdCount}
Status: ${passed ? 'PASSED ✅' : 'FAILED ❌'}

Top improvement priorities:
${sortedFactors.slice(0, 3).map(f => `- ${f}`).join('\n')}

Full report written to: ${REPORT_PATH}
  `);
  
  // Return JSON object for CI/CD pipeline
  return {
    score: averageScore,
    passed,
    factors: sortedFactors.slice(0, 3)
  };
}

// Run the analysis and print the result as JSON for the CI/CD pipeline
const result = analyzeRepository();
console.log(JSON.stringify(result));

// Exit with appropriate code for CI/CD
process.exit(result.passed ? 0 : 1);