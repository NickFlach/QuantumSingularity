/**
 * SINGULARIS PRIME Quantum Security Verifier
 * 
 * This script verifies the quantum security features of SINGULARIS PRIME code
 * to ensure proper implementation of quantum-resistant algorithms, entanglement
 * protocols, and cryptographic methods.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_DIRS = ['client/src', 'server', 'shared'];
const SINGULARIS_EXTENSIONS = ['.js', '.ts', '.tsx'];
const REPORT_PATH = 'quantum-security-report.json';

// Quantum Security Patterns
const SECURITY_PATTERNS = {
  // QKD (Quantum Key Distribution) patterns
  qkd: /simulateQKD|quantumKey\s*\(/i,
  
  // Quantum-resistant encryption
  quantumResistant: /@QuantumResistant|postQuantumEncryption/i,
  
  // Entanglement verification
  entanglement: /simulateQuantumEntanglement|entangle\s*\(/i,
  
  // Zero-knowledge proofs
  zkProofs: /simulateZKProof|zeroKnowledgeValidation/i,
  
  // Surface code error correction
  errorCorrection: /applySurfaceCode|quantumErrorCorrection/i,
  
  // Quantum state verification
  stateVerification: /verifyQuantumState|measureState/i,
  
  // Decoherence resistance
  decoherenceResistance: /@DecoherenceResistant|resistDecoherence/i
};

// Security Vulnerabilities
const VULNERABILITY_PATTERNS = {
  // Unprotected quantum channels
  unprotectedChannels: /createQuantumChannel(?!\s*\([^)]*securityLevel)/i,
  
  // Missing validation
  missingValidation: /receiveQuantumData(?!\s*\([^)]*validate)/i,
  
  // Predictable quantum sources
  predictableSources: /quantumSource\s*=\s*("|')deterministic\1/i,
  
  // Fixed keys (insecure)
  fixedKeys: /const\s+QUANTUM_KEY\s*=|FIXED_ENTROPY/i,
  
  // Unaudited operations
  unauditedOperations: /bypassQuantumAudit|skipChecksum/i
};

/**
 * Analyze code for quantum security features and vulnerabilities
 */
function analyzeQuantumSecurity(filePath, fileContent) {
  // Initialize metrics
  const features = {};
  const vulnerabilities = {};
  
  // Check for security patterns
  for (const [feature, pattern] of Object.entries(SECURITY_PATTERNS)) {
    features[feature] = Boolean(fileContent.match(pattern));
  }
  
  // Check for vulnerabilities
  for (const [vulnerability, pattern] of Object.entries(VULNERABILITY_PATTERNS)) {
    vulnerabilities[vulnerability] = Boolean(fileContent.match(pattern));
  }
  
  // Calculate security score
  const featuresImplemented = Object.values(features).filter(Boolean).length;
  const featureScore = Object.keys(SECURITY_PATTERNS).length > 0 ? 
    featuresImplemented / Object.keys(SECURITY_PATTERNS).length : 0;
  
  const vulnerabilitiesFound = Object.values(vulnerabilities).filter(Boolean).length;
  const vulnerabilityScore = 1 - (vulnerabilitiesFound > 0 ? 
    Math.min(vulnerabilitiesFound / 3, 1) : 0); // Penalize up to 3 vulnerabilities
  
  // Overall score balances features and vulnerability absence
  const securityScore = (featureScore * 0.6) + (vulnerabilityScore * 0.4);
  
  return {
    file: filePath,
    securityScore,
    secure: securityScore >= 0.7 && vulnerabilitiesFound === 0,
    featuresImplemented,
    vulnerabilitiesFound,
    features,
    vulnerabilities
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
  let insecureCount = 0;
  
  console.log(`Analyzing ${files.length} code files for quantum security...`);
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = analyzeQuantumSecurity(filePath, content);
      results.push(result);
      
      totalScore += result.securityScore;
      if (!result.secure) {
        insecureCount++;
      }
    } catch (err) {
      console.error(`Error analyzing ${filePath}:`, err.message);
    }
  }
  
  // Calculate overall stats
  const averageScore = files.length > 0 ? totalScore / files.length : 0;
  const secure = averageScore >= 0.7 && insecureCount === 0;
  
  // Count features and vulnerabilities
  const featureCounts = {};
  const vulnerabilityCounts = {};
  
  results.forEach(result => {
    Object.entries(result.features).forEach(([feature, implemented]) => {
      if (implemented) {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      }
    });
    
    Object.entries(result.vulnerabilities).forEach(([vulnerability, present]) => {
      if (present) {
        vulnerabilityCounts[vulnerability] = (vulnerabilityCounts[vulnerability] || 0) + 1;
      }
    });
  });
  
  // Create report
  const report = {
    timestamp: new Date().toISOString(),
    overallSecurityScore: averageScore,
    secure,
    filesAnalyzed: files.length,
    filesWithVulnerabilities: insecureCount,
    featureCoverage: featureCounts,
    vulnerabilitySummary: vulnerabilityCounts,
    recommendations: generateRecommendations(vulnerabilityCounts, featureCounts),
    fileResults: results
  };
  
  // Write report to file
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  
  // Output summary to console (for CI/CD)
  console.log(`
Quantum Security Verification Complete:
----------------------------------------
Overall Security Score: ${(averageScore * 100).toFixed(1)}%
Files Analyzed: ${files.length}
Files With Vulnerabilities: ${insecureCount}
Status: ${secure ? 'SECURE ✅' : 'VULNERABLE ❌'}

Top vulnerabilities:
${Object.entries(vulnerabilityCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([vuln, count]) => `- ${vuln}: Found in ${count} files`)
  .join('\n') || '- No vulnerabilities found'}

Full report written to: ${REPORT_PATH}
  `);
  
  // Return JSON object for CI/CD pipeline
  return {
    score: averageScore,
    secure,
    vulnerabilities: Object.keys(vulnerabilityCounts).length
  };
}

/**
 * Generate security recommendations based on analysis
 */
function generateRecommendations(vulnerabilityCounts, featureCounts) {
  const recommendations = [];
  
  // Add recommendations for each vulnerability type
  if (vulnerabilityCounts.unprotectedChannels) {
    recommendations.push("Implement security parameters for all quantum channels");
  }
  
  if (vulnerabilityCounts.missingValidation) {
    recommendations.push("Add validation to all quantum data reception points");
  }
  
  if (vulnerabilityCounts.predictableSources) {
    recommendations.push("Replace deterministic quantum sources with true random sources");
  }
  
  if (vulnerabilityCounts.fixedKeys) {
    recommendations.push("Remove hardcoded quantum keys and use dynamic key generation");
  }
  
  if (vulnerabilityCounts.unauditedOperations) {
    recommendations.push("Remove audit bypasses and ensure all operations are logged");
  }
  
  // Recommend missing features
  const missingFeatures = Object.keys(SECURITY_PATTERNS).filter(feature => !featureCounts[feature]);
  if (missingFeatures.includes('qkd')) {
    recommendations.push("Implement Quantum Key Distribution for secure communication");
  }
  
  if (missingFeatures.includes('quantumResistant')) {
    recommendations.push("Add quantum-resistant encryption algorithms");
  }
  
  if (missingFeatures.includes('zkProofs')) {
    recommendations.push("Implement zero-knowledge proofs for secure verification");
  }
  
  if (missingFeatures.includes('errorCorrection')) {
    recommendations.push("Add quantum error correction using surface codes");
  }
  
  return recommendations;
}

// Run the analysis and print the result as JSON for the CI/CD pipeline
const result = analyzeRepository();
console.log(JSON.stringify(result));

// Exit with appropriate code for CI/CD
process.exit(result.secure ? 0 : 1);