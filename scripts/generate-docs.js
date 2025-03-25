/**
 * SINGULARIS PRIME Documentation Generator
 * 
 * This script automatically generates comprehensive documentation for the
 * SINGULARIS PRIME language, including its core concepts, quantum operations,
 * and AI governance mechanisms.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_DIRS = ['client/src', 'server', 'shared'];
const DOCS_DIR = 'docs';
const SINGULARIS_EXTENSIONS = ['.js', '.ts', '.tsx'];

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Documentation sections
const SECTIONS = {
  OVERVIEW: 'overview',
  LANGUAGE: 'language',
  QUANTUM: 'quantum',
  AI: 'ai',
  EXPLAINABILITY: 'explainability',
  API: 'api',
  SECURITY: 'security'
};

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
 * Extract JSDoc style comments from code
 */
function extractDocComments(fileContent) {
  const commentRegex = /\/\*\*\s*([\s\S]*?)\s*\*\//g;
  const comments = [];
  let match;
  
  while ((match = commentRegex.exec(fileContent)) !== null) {
    // Clean up the comment by removing asterisks at the beginning of lines
    const cleanComment = match[1]
      .split('\n')
      .map(line => line.replace(/^\s*\*\s?/, ''))
      .join('\n')
      .trim();
    
    comments.push(cleanComment);
  }
  
  return comments;
}

/**
 * Extract function and class definitions
 */
function extractDefinitions(fileContent) {
  const definitions = [];
  
  // Match classes
  const classRegex = /class\s+(\w+)\s*(?:extends\s+(\w+))?\s*{/g;
  let classMatch;
  
  while ((classMatch = classRegex.exec(fileContent)) !== null) {
    definitions.push({
      type: 'class',
      name: classMatch[1],
      extends: classMatch[2] || null,
      line: fileContent.substring(0, classMatch.index).split('\n').length
    });
  }
  
  // Match functions
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/g;
  let functionMatch;
  
  while ((functionMatch = functionRegex.exec(fileContent)) !== null) {
    definitions.push({
      type: 'function',
      name: functionMatch[1],
      parameters: functionMatch[2].split(',').map(p => p.trim()).filter(Boolean),
      line: fileContent.substring(0, functionMatch.index).split('\n').length
    });
  }
  
  // Match interfaces and types
  const interfaceRegex = /(interface|type)\s+(\w+)(?:\s*<[^>]*>)?\s*(?:=|\{)/g;
  let interfaceMatch;
  
  while ((interfaceMatch = interfaceRegex.exec(fileContent)) !== null) {
    definitions.push({
      type: interfaceMatch[1],
      name: interfaceMatch[2],
      line: fileContent.substring(0, interfaceMatch.index).split('\n').length
    });
  }
  
  return definitions;
}

/**
 * Generate documentation for a specific category
 */
function generateCategoryDocs(section, files) {
  console.log(`Generating ${section} documentation...`);
  let content = '';
  
  // Generate appropriate title
  let title = section.charAt(0).toUpperCase() + section.slice(1);
  content += `# SINGULARIS PRIME ${title}\n\n`;
  
  // Add appropriate intro based on section
  switch (section) {
    case SECTIONS.OVERVIEW:
      content += `
SINGULARIS PRIME is a cutting-edge quantum computing development platform that combines quantum operations with artificial intelligence governance. This document provides an overview of the platform's architecture and design principles.

## Core Components

- **Quantum Runtime**: A sophisticated environment for quantum simulation and computation
- **AI Governance**: Built-in mechanisms for explainable AI and human oversight
- **Security Framework**: Quantum-resistant cryptography and secure communication protocols
- **Development Tools**: React-based UI with real-time code analysis and visualization

## Key Features

- Quantum circuit design and simulation
- AI-enhanced code analysis and optimization
- Explainability metrics and visualization
- Quantum geometry and topological operations
`;
      break;
      
    case SECTIONS.LANGUAGE:
      content += `
SINGULARIS PRIME is a specialized programming language designed for quantum computing and AI governance. This documentation covers its syntax, structures, and core concepts.

## Language Components

- **Syntax**: Modern, JavaScript-influenced syntax with quantum and AI extensions
- **Type System**: Strong typing with quantum-specific types
- **Quantum Operations**: First-class support for quantum computations
- **AI Contracts**: Formalized structures for AI governance and oversight
`;
      break;
      
    case SECTIONS.QUANTUM:
      content += `
The quantum computing features of SINGULARIS PRIME enable developers to design, simulate, and optimize quantum circuits. This section documents the quantum operations, simulation capabilities, and geometric extensions.

## Quantum Features

- Quantum circuit design with gate-level operations
- Quantum key distribution (QKD) for secure communication
- Quantum geometry for topological quantum computing
- Decoherence simulation and error correction
`;
      break;
      
    case SECTIONS.AI:
      content += `
SINGULARIS PRIME includes comprehensive AI governance mechanisms to ensure responsible and explainable AI operations. This section documents the AI contracts, negotiation protocols, and oversight systems.

## AI Governance Features

- AI contracts with explainability thresholds
- Multi-agent AI negotiation protocols
- Human oversight and fallback mechanisms
- Comprehensive audit trails and monitoring
`;
      break;
      
    case SECTIONS.EXPLAINABILITY:
      content += `
Explainability is a cornerstone of SINGULARIS PRIME's design philosophy. This section documents the explainability metrics, assessment methods, and visualization tools.

## Explainability Features

- Quantitative explainability scoring (0.0-1.0)
- Factor analysis for positive and negative contributors
- Improvement recommendations based on code analysis
- Visual representations through charts and diagrams
`;
      break;
      
    case SECTIONS.API:
      content += `
The SINGULARIS PRIME API provides programmatic access to quantum operations, AI governance mechanisms, and code analysis tools. This section documents the available endpoints and their usage.

## API Overview

- RESTful architecture with JSON responses
- Authentication and authorization mechanisms
- Quantum operation endpoints
- AI governance and analysis endpoints
`;
      break;
      
    case SECTIONS.SECURITY:
      content += `
Security is fundamental to SINGULARIS PRIME, with quantum-resistant cryptography and comprehensive verification mechanisms. This section documents the security features and best practices.

## Security Features

- Post-quantum cryptography
- Quantum key distribution
- Zero-knowledge proofs
- Audit trails and verification
`;
      break;
  }
  
  content += '\n## Reference\n\n';
  
  // Filter files relevant to this section
  const sectionFiles = files.filter(file => {
    const lowerPath = file.file.toLowerCase();
    
    switch (section) {
      case SECTIONS.QUANTUM:
        return lowerPath.includes('quantum');
      case SECTIONS.AI:
        return lowerPath.includes('ai') || lowerPath.includes('assistant');
      case SECTIONS.EXPLAINABILITY:
        return lowerPath.includes('explain') || lowerPath.includes('analysis');
      case SECTIONS.API:
        return lowerPath.includes('routes') || lowerPath.includes('api');
      case SECTIONS.SECURITY:
        return lowerPath.includes('security') || lowerPath.includes('crypto') || lowerPath.includes('auth');
      case SECTIONS.LANGUAGE:
        return lowerPath.includes('parser') || lowerPath.includes('compiler') || lowerPath.includes('interpreter');
      default:
        return false;
    }
  });
  
  // Add definitions from files
  sectionFiles.forEach(file => {
    content += `### ${path.basename(file.file)}\n\n`;
    
    if (file.comments.length > 0) {
      // Add file-level documentation if available (first comment)
      content += `${file.comments[0]}\n\n`;
    }
    
    file.definitions.forEach(def => {
      if (def.type === 'class') {
        content += `#### \`class ${def.name}${def.extends ? ` extends ${def.extends}` : ''}\`\n\n`;
      } else if (def.type === 'function') {
        content += `#### \`function ${def.name}(${def.parameters.join(', ')})\`\n\n`;
      } else {
        content += `#### \`${def.type} ${def.name}\`\n\n`;
      }
      
      // Find the nearest comment before this definition
      const defComments = file.comments.filter(c => {
        const commentLineCount = c.split('\n').length;
        const commentIndex = file.fileContent.indexOf(`/**\n * ${c.split('\n')[0]}`);
        if (commentIndex === -1) return false;
        
        const commentLine = file.fileContent.substring(0, commentIndex).split('\n').length;
        return commentLine < def.line && commentLine + commentLineCount + 1 >= def.line - 2;
      });
      
      if (defComments.length > 0) {
        content += `${defComments[0]}\n\n`;
      }
    });
  });
  
  // Write content to file
  const filePath = path.join(DOCS_DIR, `${section}.md`);
  fs.writeFileSync(filePath, content);
  console.log(`Generated ${filePath}`);
  
  return filePath;
}

/**
 * Generate index page with links to all sections
 */
function generateIndex(sectionFiles) {
  console.log('Generating index page...');
  
  let content = `# SINGULARIS PRIME Documentation

Welcome to the SINGULARIS PRIME documentation. This documentation covers the quantum-secure, AI-native programming language and its development platform.

## Documentation Sections

`;

  // Add links to all sections
  Object.values(SECTIONS).forEach(section => {
    const title = section.charAt(0).toUpperCase() + section.slice(1);
    content += `- [${title}](${section}.md)\n`;
  });
  
  // Add additional information
  content += `
## About SINGULARIS PRIME

SINGULARIS PRIME is a cutting-edge quantum computing development platform that empowers developers with AI-enhanced tools and interactive learning experiences. It combines quantum operations with robust AI governance to ensure secure, explainable, and ethical quantum computing applications.

The platform features:

- Advanced quantum runtime environment (v2.4.0)
- TypeScript and React-based frontend with dynamic UI components
- AI-powered code analysis and visualization system
- Intuitive quantum circuit design and simulation tools
- Cloud-native architecture supporting collaborative development

## Getting Started

To get started with SINGULARIS PRIME, visit the [Overview](overview.md) section for an introduction to the platform's concepts and architecture.

---

**Documentation generated on: ${new Date().toISOString()}**
`;

  // Write index file
  const indexPath = path.join(DOCS_DIR, 'index.md');
  fs.writeFileSync(indexPath, content);
  console.log(`Generated ${indexPath}`);
  
  return indexPath;
}

/**
 * Main function to generate documentation
 */
function generateDocs() {
  console.log('Starting SINGULARIS PRIME documentation generation...');
  
  // Find all code files
  const filePaths = findCodeFiles();
  console.log(`Found ${filePaths.length} code files to document.`);
  
  // Process each file
  const files = filePaths.map(filePath => {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return {
        file: filePath,
        fileContent,
        comments: extractDocComments(fileContent),
        definitions: extractDefinitions(fileContent)
      };
    } catch (err) {
      console.error(`Error processing ${filePath}:`, err.message);
      return null;
    }
  }).filter(Boolean);
  
  // Generate documentation for each section
  const sectionFiles = {};
  
  Object.values(SECTIONS).forEach(section => {
    sectionFiles[section] = generateCategoryDocs(section, files);
  });
  
  // Generate index page
  const indexPath = generateIndex(sectionFiles);
  
  // Create CSS file for styling
  const cssContent = `
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1, h2, h3, h4 {
  color: #1a202c;
}

h1 {
  border-bottom: 2px solid #4299e1;
  padding-bottom: 10px;
}

h2 {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 5px;
}

code {
  background-color: #f1f5f9;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.9em;
}

pre {
  background-color: #f1f5f9;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

a {
  color: #3182ce;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

ul, ol {
  padding-left: 24px;
}

blockquote {
  border-left: 4px solid #cbd5e0;
  padding-left: 16px;
  margin-left: 0;
  color: #4a5568;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  text-align: left;
}

th {
  background-color: #f7fafc;
}
`;
  
  fs.writeFileSync(path.join(DOCS_DIR, 'style.css'), cssContent);
  
  // Create HTML versions of the Markdown files
  try {
    console.log('Creating HTML versions of documentation...');
    execSync(`npx marked -o ${DOCS_DIR}/index.html ${indexPath}`, { stdio: 'inherit' });
    
    Object.values(SECTIONS).forEach(section => {
      const sectionPath = path.join(DOCS_DIR, `${section}.md`);
      const htmlPath = path.join(DOCS_DIR, `${section}.html`);
      execSync(`npx marked -o ${htmlPath} ${sectionPath}`, { stdio: 'inherit' });
      
      // Add CSS link to HTML files
      let htmlContent = fs.readFileSync(htmlPath, 'utf8');
      htmlContent = htmlContent.replace('<head>', '<head>\n  <link rel="stylesheet" href="style.css">');
      htmlContent = htmlContent.replace('<body>', '<body>\n  <div class="container">');
      htmlContent = htmlContent.replace('</body>', '  </div>\n</body>');
      fs.writeFileSync(htmlPath, htmlContent);
    });
  } catch (err) {
    console.warn('Could not generate HTML versions - marked package not installed:', err.message);
    console.warn('Only Markdown documentation has been generated.');
  }
  
  console.log('Documentation generation complete!');
  return {
    filesProcessed: files.length,
    sectionsGenerated: Object.keys(SECTIONS).length,
    outputDir: DOCS_DIR
  };
}

// Run the documentation generator
const result = generateDocs();
console.log(JSON.stringify(result));