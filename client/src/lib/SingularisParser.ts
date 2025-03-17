import * as monaco from 'monaco-editor';

// Define the Singularis Prime language
export function registerSingularisLanguage() {
  // Register a new language
  monaco.languages.register({ id: 'singularis' });

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider('singularis', {
    tokenizer: {
      root: [
        // Comments
        [/\/\/.*$/, 'comment'],
        
        // Strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        
        // Numbers
        [/\d*\.\d+([eE][-+]?\d+)?%?/, 'number.float'],
        [/\d+%?/, 'number'],
        
        // Keywords
        [/\b(quantumKey|contract|deployModel|syncLedger|resolveParadox|require|enforce|execute|to|if|using|fallbackToHuman|import)\b/, 'keyword'],
        
        // Functions
        [/\b(entangle|explainabilityThreshold|consensusProtocol|monitorAuditTrail|adaptiveLatency|validateZeroKnowledgeProofs|selfOptimizingLoop)\b/, 'function'],
        
        // Annotations
        [/@(QuantumSecure|HumanAuditable|AIModel)(\([\w\d\.]+\))?/, 'annotation'],
        
        // Operators
        [/>|<|=|>=|<=|==|!=|&&|\|\|/, 'operator'],
        
        // Identifiers
        [/[a-zA-Z_$][\w$]*/, 'variable'],
        
        // Delimiters and operators
        [/[{}()\[\]]/, '@brackets'],
        [/[;,.]/, 'delimiter'],
        
        // Whitespace
        [/\s+/, 'white'],
      ],
      
      string: [
        [/[^\\"]+/, 'string'],
        [/\\./, 'string.escape'],
        [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
      ],
    }
  });
  
  // Define a theme for Singularis Prime
  monaco.editor.defineTheme('singularis-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6272a4' },
      { token: 'string', foreground: 'f1fa8c' },
      { token: 'keyword', foreground: 'ff79c6' },
      { token: 'function', foreground: '8be9fd' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'number', foreground: 'bd93f9' },
      { token: 'operator', foreground: 'ff79c6' },
      { token: 'annotation', foreground: '50fa7b' },
    ],
    colors: {
      'editor.foreground': '#f8f8f2',
      'editor.background': '#1a1a2e',
      'editor.selectionBackground': '#44475a',
      'editor.lineHighlightBackground': '#6a0dad20',
      'editorCursor.foreground': '#f8f8f2',
      'editorWhitespace.foreground': '#3B3A32',
      'editorIndentGuide.activeBackground': '#9D550FB0',
      'editor.selectionHighlightBorder': '#222218',
    }
  });
  
  // Register completions provider for Singularis
  monaco.languages.registerCompletionItemProvider('singularis', {
    provideCompletionItems: (model, position) => {
      const suggestions = [
        {
          label: 'quantumKey',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'quantumKey ${1:keyName} = entangle(${2:nodeA}, ${3:nodeB});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates a quantum key using entangled particles'
        },
        {
          label: 'contract',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'contract ${1:contractName} {\n\tenforce explainabilityThreshold(${2:0.85});\n\t${3}\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates an AI-to-AI smart contract with human oversight'
        },
        {
          label: 'deployModel',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'deployModel ${1:modelName} to ${2:location} {\n\tmonitorAuditTrail();\n\tfallbackToHuman if ${3:condition} > ${4:threshold};\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Deploys an AI model with monitoring and human fallback'
        },
        {
          label: 'syncLedger',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'syncLedger ${1:ledgerName} {\n\tadaptiveLatency(max=${2:20} min);\n\tvalidateZeroKnowledgeProofs();\n}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Synchronizes distributed ledgers with latency compensation'
        },
        {
          label: 'resolveParadox',
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: 'resolveParadox ${1:dataName} using selfOptimizingLoop(max_iterations=${2:500});',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Resolves quantum information paradoxes through iterative optimization'
        },
        {
          label: 'entangle',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'entangle(${1:nodeA}, ${2:nodeB})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Creates quantum entanglement between two nodes'
        },
        {
          label: '@QuantumSecure',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '@QuantumSecure',
          documentation: 'Marks code as requiring quantum security'
        },
        {
          label: '@HumanAuditable',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: '@HumanAuditable(${1:0.85})',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Specifies human auditability threshold'
        }
      ];
      
      return { suggestions };
    }
  });
  
  // Set the default theme
  monaco.editor.setTheme('singularis-theme');
}
