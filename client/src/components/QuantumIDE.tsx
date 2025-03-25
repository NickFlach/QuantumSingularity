import { useState, useEffect, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Editor, { OnMount } from "@monaco-editor/react";
import { motion } from "framer-motion";
import { 
  FileCode, 
  Play, 
  Zap, 
  FileText,
  Activity, 
  BookOpen,
  PanelLeft,
  PanelRight, 
  Save, 
  LayoutGrid,
  ChevronsDown,
  ChevronsUp,
  Atom,
  Settings,
  Sparkles
} from "lucide-react";
import { QuantumOperationsPanel } from "@/components/QuantumOperationsPanel";
import { QuantumVisualizer } from "@/components/QuantumVisualizer";
import { CodeAssistant } from "@/components/CodeAssistant";
import { OptimizationDirectivesPanel } from "@/components/OptimizationDirectivesPanel";
import { apiRequest } from "@/lib/queryClient";
import { QuantumExperimentToCode } from "@/components/QuantumExperimentToCode";

interface FileData {
  name: string;
  content: string;
  language: string;
  isModified: boolean;
}

interface ExecutionHistoryItem {
  timestamp: Date;
  mode: 'ast' | 'direct' | 'compile' | 'quantum-geometry';
  code: string;
  output: string[];
  success: boolean;
  fileId: string;
}

export function QuantumIDE() {
  // Editor states
  const [files, setFiles] = useState<FileData[]>([
    {
      name: "quantum_operations.sp",
      content: `// SINGULARIS PRIME - Quantum Operations Example
QKD_INIT("saturn_key", "earth_station", "titan_station");

// Define quantum space for computation
QUANTUM_GEOMETRY {
  dimension: 3,
  metric: "minkowski",
  energyDensity: 0.75
}

// Perform entanglement operation
QUANTUM_OPERATION {
  type: "entanglement",
  target: "qubits[0:2]",
  fidelity: 0.99
}

// Execute with error mitigation
EXECUTE_WITH_CORRECTION();`,
      language: "javascript",
      isModified: false
    },
    {
      name: "ai_contract.sp",
      content: `// SINGULARIS PRIME - AI Governance Contract
AI_CONTRACT("interop_prime", 0.85, saturnKey) {
  explainability: HIGH,
  auditTrail: ENABLED, 
  humanFallback: TRUE
}

// Define key entities for negotiation
DEFINE_AI_ENTITY("primary_agent", {
  expertise: ["negotiation", "resource_allocation"],
  trustLevel: 0.92
});

DEFINE_AI_ENTITY("secondary_agent", {
  expertise: ["verification", "audit"],
  trustLevel: 0.89
});

// Negotiate contract terms with verification
AI_NEGOTIATE(
  primary_agent, 
  secondary_agent, 
  {
    objectives: ["resource_optimization", "transparency"],
    constraints: ["explainability > 0.85", "human_oversight = required"]
  }
);

// Verify outcomes against predefined metrics
AI_VERIFY(results);`,
      language: "javascript",
      isModified: false
    },
    {
      name: "hybrid_operations.sp",
      content: `// SINGULARIS PRIME - Hybrid Quantum-AI Operations
QKD_INIT("mission_key", "command_center", "deep_space_probe");

// Initialize quantum geometry for computation
QUANTUM_GEOMETRY {
  dimension: 4,
  metric: "hyperbolic",
  energyDensity: 0.92,
  topologicalProperties: ["connected", "orientable"]
}

// Define AI contract with quantum key verification
AI_CONTRACT("deep_space_mission", 0.90, mission_key) {
  explainability: HIGH,
  quantumVerification: ENABLED
}

// Quantum-enhanced AI decision process
QUANTUM_DECISION("mission_controller", "superposition", {
  contextData: "sensor_telemetry",
  quantumAmplification: TRUE,
  uncertaintyThreshold: 0.15
});

// Resolve quantum paradoxes through AI analysis
PARADOX_RESOLVE("sensor_uncertainty", "neural_topology", 300);

// Deploy with quantum cryptographic verification
DEPLOY_WITH_VERIFICATION();`,
      language: "javascript",
      isModified: false
    }
  ]);
  const [activeFile, setActiveFile] = useState<string>("quantum_operations.sp");
  const [showLeftPanel, setShowLeftPanel] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);
  const [leftPanelTab, setLeftPanelTab] = useState<string>("files");
  const [rightPanelTab, setRightPanelTab] = useState<string>("assistant");
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([]);
  const [executionLoading, setExecutionLoading] = useState<boolean>(false);
  const [compileLoading, setCompileLoading] = useState<boolean>(false);
  const [directExecutionLoading, setDirectExecutionLoading] = useState<boolean>(false);
  const [geometryLoading, setGeometryLoading] = useState<boolean>(false);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [editorHeight, setEditorHeight] = useState<string>("calc(100vh - 11rem)");
  const [editorTheme, setEditorTheme] = useState<string>("vs-dark");
  const [selectedOptimizationGoal, setSelectedOptimizationGoal] = useState<string>("fidelity");
  const [selectedOptimizationMethod, setSelectedOptimizationMethod] = useState<string>("gradient_descent");
  const [selectedPriority, setSelectedPriority] = useState<string>("critical");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [quantumSpaces, setQuantumSpaces] = useState<any[]>([]);

  const editorRef = useRef<any>(null);
  const monaco = useRef<any>(null);
  const { toast } = useToast();

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    monaco.current = monacoInstance;
    
    // Set up Singularis Prime language syntax highlighting
    monacoInstance.languages.register({ id: 'singularisPrime' });
    monacoInstance.languages.setMonarchTokensProvider('singularisPrime', {
      tokenizer: {
        root: [
          [/QKD_INIT|AI_CONTRACT|QUANTUM_GEOMETRY|QUANTUM_OPERATION|EXECUTE_WITH_CORRECTION|DEFINE_AI_ENTITY|AI_NEGOTIATE|AI_VERIFY|QUANTUM_DECISION|PARADOX_RESOLVE|DEPLOY_WITH_VERIFICATION/, 'keyword'],
          [/".*?"/, 'string'],
          [/\d+/, 'number'],
          [/\{|\}|\(|\)|\[|\]/, 'delimiter'],
          [/\btrue\b|\bfalse\b|\bnull\b/, 'keyword'],
          [/#.*$/, 'comment'],
          [/\/\/.*$/, 'comment'],
        ]
      }
    });
    
    // Set up completion provider
    monacoInstance.languages.registerCompletionItemProvider('singularisPrime', {
      provideCompletionItems: function (model: any, position: any): { suggestions: any[] } {
        const wordPosition = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordPosition.startColumn,
          endColumn: wordPosition.endColumn
        };
        
        const suggestions = [
          {
            label: 'QKD_INIT',
            kind: monacoInstance.languages.CompletionItemKind.Function,
            insertText: 'QKD_INIT("${1:key_id}", "${2:participant1}", "${3:participant2}");',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Initialize Quantum Key Distribution',
            range: range
          },
          {
            label: 'AI_CONTRACT',
            kind: monacoInstance.languages.CompletionItemKind.Function,
            insertText: 'AI_CONTRACT("${1:name}", ${2:explainability_threshold}, ${3:quantum_key}) {\n\texplainability: ${4:HIGH},\n\tauditTrail: ${5:ENABLED},\n\thumanFallback: ${6:TRUE}\n}',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define an AI Contract with governance parameters',
            range: range
          },
          {
            label: 'QUANTUM_GEOMETRY',
            kind: monacoInstance.languages.CompletionItemKind.Function,
            insertText: 'QUANTUM_GEOMETRY {\n\tdimension: ${1:3},\n\tmetric: "${2:minkowski}",\n\tenergyDensity: ${3:0.75}\n}',
            insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a quantum geometric space for computation',
            range: range
          }
        ];
        return { suggestions: suggestions };
      }
    });
  };

  // Get active file content
  const getActiveFileContent = (): string => {
    const file = files.find(f => f.name === activeFile);
    return file ? file.content : '';
  };

  // Update file content
  const updateFileContent = (content: string) => {
    setFiles(files.map(file => {
      if (file.name === activeFile) {
        return { ...file, content, isModified: true };
      }
      return file;
    }));
  };

  // Create a new file
  const createNewFile = () => {
    const fileName = `new_file_${files.length + 1}.sp`;
    const newFile: FileData = {
      name: fileName,
      content: `// SINGULARIS PRIME - New File\n`,
      language: "javascript",
      isModified: true
    };
    
    setFiles([...files, newFile]);
    setActiveFile(fileName);
  };

  // Save the current file
  const saveFile = async () => {
    try {
      // In a real app, we would save to backend here
      setFiles(files.map(file => {
        if (file.name === activeFile) {
          return { ...file, isModified: false };
        }
        return file;
      }));
      
      toast({
        title: "File Saved",
        description: `${activeFile} has been saved successfully.`
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save file",
        variant: "destructive"
      });
    }
  };

  // Execute the current code with AST interpreter
  const executeCurrentCode = async () => {
    const currentCode = getActiveFileContent();
    if (!currentCode.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code to execute",
        variant: "destructive"
      });
      return;
    }
    
    setExecutionLoading(true);
    try {
      const response = await apiRequest<{output: string[]}>("POST", "/api/execute", {
        code: currentCode
      });
      
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'ast',
        code: currentCode,
        output: response.output,
        success: true,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Execution Complete",
        description: "Code executed successfully with AST interpreter"
      });
    } catch (error) {
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'ast',
        code: currentCode,
        output: [error instanceof Error ? error.message : "Execution failed"],
        success: false,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Failed to execute code",
        variant: "destructive"
      });
    } finally {
      setExecutionLoading(false);
    }
  };

  // Execute code directly (bypass AST)
  const executeDirectCode = async () => {
    const currentCode = getActiveFileContent();
    if (!currentCode.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code to execute",
        variant: "destructive"
      });
      return;
    }
    
    setDirectExecutionLoading(true);
    try {
      const response = await apiRequest<{output: string[]}>("POST", "/api/execute/direct", {
        code: currentCode
      });
      
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'direct',
        code: currentCode,
        output: response.output,
        success: true,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Direct Execution Complete",
        description: "Code executed successfully with direct interpreter"
      });
    } catch (error) {
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'direct',
        code: currentCode,
        output: [error instanceof Error ? error.message : "Direct execution failed"],
        success: false,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Direct Execution Failed",
        description: error instanceof Error ? error.message : "Failed to execute code directly",
        variant: "destructive"
      });
    } finally {
      setDirectExecutionLoading(false);
    }
  };

  // Compile the current code
  const compileCurrentCode = async () => {
    const currentCode = getActiveFileContent();
    if (!currentCode.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code to compile",
        variant: "destructive"
      });
      return;
    }
    
    setCompileLoading(true);
    try {
      const response = await apiRequest<{bytecode: string[]}>("POST", "/api/compile", {
        code: currentCode
      });
      
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'compile',
        code: currentCode,
        output: response.bytecode,
        success: true,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Compilation Complete",
        description: "Code compiled successfully to bytecode"
      });
    } catch (error) {
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'compile',
        code: currentCode,
        output: [error instanceof Error ? error.message : "Compilation failed"],
        success: false,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Compilation Failed",
        description: error instanceof Error ? error.message : "Failed to compile code",
        variant: "destructive"
      });
    } finally {
      setCompileLoading(false);
    }
  };

  // Handle code analysis
  const analyzeCode = async () => {
    const currentCode = getActiveFileContent();
    if (!currentCode.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    try {
      const response = await apiRequest<{analysis: string; explainability: number}>("POST", "/api/analyze", {
        code: currentCode
      });
      
      setFeedbackData({
        type: 'analysis',
        content: response.analysis,
        explainability: response.explainability
      });
      
      setShowFeedback(true);
      
      toast({
        title: "Analysis Complete",
        description: `Code analyzed with explainability score: ${(response.explainability * 100).toFixed(1)}%`
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze code",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Create quantum geometric space
  const createGeometricSpace = async () => {
    const currentCode = getActiveFileContent();
    if (!currentCode.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some quantum geometry code",
        variant: "destructive"
      });
      return;
    }
    
    setGeometryLoading(true);
    try {
      const response = await apiRequest<{space: any}>("POST", "/api/quantum/geometry/create-space", {
        code: currentCode
      });
      
      // Add the new space to our list
      setQuantumSpaces([...quantumSpaces, response.space]);
      
      // Set the new space as selected
      setSelectedSpace(response.space.id);
      
      // Create history item
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'quantum-geometry',
        code: currentCode,
        output: [`Quantum geometric space created with ID: ${response.space.id}`],
        success: true,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Quantum Space Created",
        description: `New quantum geometric space created: ${response.space.id}`
      });
    } catch (error) {
      const historyItem: ExecutionHistoryItem = {
        timestamp: new Date(),
        mode: 'quantum-geometry',
        code: currentCode,
        output: [error instanceof Error ? error.message : "Quantum geometry creation failed"],
        success: false,
        fileId: activeFile
      };
      
      setExecutionHistory([historyItem, ...executionHistory]);
      
      toast({
        title: "Quantum Geometry Failed",
        description: error instanceof Error ? error.message : "Failed to create quantum space",
        variant: "destructive"
      });
    } finally {
      setGeometryLoading(false);
    }
  };

  // Apply code from QuantumExperimentToCode component
  const handleCodeFromExperiment = (code: string) => {
    // Create a new file with the generated code
    const fileName = `experiment_${new Date().getTime()}.sp`;
    const newFile: FileData = {
      name: fileName,
      content: code,
      language: "javascript",
      isModified: true
    };
    
    setFiles([...files, newFile]);
    setActiveFile(fileName);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowLeftPanel(!showLeftPanel)}>
            <PanelLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm" onClick={createNewFile}>
            <FileCode className="h-4 w-4 mr-2" />
            New File
          </Button>
          <Button variant="ghost" size="sm" onClick={saveFile} disabled={!files.find(f => f.name === activeFile)?.isModified}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <QuantumExperimentToCode onCodeGenerated={handleCodeFromExperiment} />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={executeCurrentCode}
            disabled={executionLoading}
            className="relative"
          >
            {executionLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Atom className="h-4 w-4" />
              </motion.div>
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Execute (AST)
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={executeDirectCode}
            disabled={directExecutionLoading}
          >
            {directExecutionLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Atom className="h-4 w-4" />
              </motion.div>
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Execute (Direct)
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={compileCurrentCode}
            disabled={compileLoading}
          >
            {compileLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Atom className="h-4 w-4" />
              </motion.div>
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Compile
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={analyzeCode}
            disabled={analyzing}
          >
            {analyzing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Atom className="h-4 w-4" />
              </motion.div>
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            Analyze
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={createGeometricSpace}
            disabled={geometryLoading}
          >
            {geometryLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Atom className="h-4 w-4" />
              </motion.div>
            ) : (
              <LayoutGrid className="h-4 w-4 mr-2" />
            )}
            Create Quantum Space
          </Button>
          
          <Button variant="ghost" size="icon" onClick={() => setShowRightPanel(!showRightPanel)}>
            <PanelRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        {/* Left Panel */}
        {showLeftPanel && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full flex flex-col bg-slate-900">
                <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="files">Files</TabsTrigger>
                    <TabsTrigger value="quantum">Quantum</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="files" className="flex-grow p-0">
                    <ScrollArea className="h-[calc(100vh-11rem)]">
                      <div className="p-4 space-y-2">
                        {files.map((file) => (
                          <div 
                            key={file.name}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${activeFile === file.name ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
                            onClick={() => setActiveFile(file.name)}
                          >
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-blue-400" />
                              <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                            </div>
                            {file.isModified && (
                              <div className="w-2 h-2 rounded-full bg-amber-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="quantum" className="flex-grow p-0">
                    <QuantumOperationsPanel 
                      onOperationComplete={(result) => {
                        toast({
                          title: "Operation Complete",
                          description: "Quantum operation executed successfully"
                        });
                      }}
                      onSpaceCreated={(space) => {
                        setQuantumSpaces([...quantumSpaces, space]);
                        setSelectedSpace(space.id);
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
          </>
        )}

        {/* Editor */}
        <ResizablePanel defaultSize={showLeftPanel && showRightPanel ? 60 : 80}>
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex-grow">
              <Editor
                height="calc(100vh - 9rem)"
                defaultLanguage="javascript"
                value={getActiveFileContent()}
                onChange={(value) => value !== undefined && updateFileContent(value)}
                theme={editorTheme}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            </div>
            
            {/* Execution history panel */}
            <div className="h-40 border-t border-slate-800 bg-slate-900 overflow-y-auto">
              <div className="p-2 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">Execution History</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setExecutionHistory([])}
                  disabled={executionHistory.length === 0}
                >
                  Clear
                </Button>
              </div>
              
              <ScrollArea className="h-32">
                <div className="divide-y divide-slate-800">
                  {executionHistory.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 text-sm">
                      No execution history yet. Run some code to see results here.
                    </div>
                  ) : (
                    executionHistory.map((item, index) => (
                      <div key={index} className="p-2 hover:bg-slate-800/50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <Badge variant={item.success ? "default" : "destructive"} className="text-xs">
                              {item.mode.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-slate-400">
                              {item.timestamp.toLocaleTimeString()}
                            </span>
                            <span className="text-xs text-slate-500">
                              {item.fileId}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 pl-2 border-l-2 border-slate-700">
                          {item.output.map((line, i) => (
                            <div key={i} className="text-xs font-mono text-slate-300 whitespace-pre-wrap">
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ResizablePanel>

        {/* Right Panel */}
        {showRightPanel && (
          <>
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <div className="h-full flex flex-col bg-slate-900">
                <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="w-full">
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="assistant">Assistant</TabsTrigger>
                    <TabsTrigger value="visualizer">Visualizer</TabsTrigger>
                    <TabsTrigger value="optimize">Optimize</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="assistant" className="flex-grow p-0">
                    <CodeAssistant 
                      code={getActiveFileContent()}
                      onCodeSuggestion={(suggestion) => {
                        if (editorRef.current) {
                          const position = editorRef.current.getPosition();
                          editorRef.current.executeEdits("suggestion", [{
                            range: {
                              startLineNumber: position.lineNumber,
                              startColumn: position.column,
                              endLineNumber: position.lineNumber,
                              endColumn: position.column
                            },
                            text: suggestion
                          }]);
                        }
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="visualizer" className="flex-grow p-0">
                    <QuantumVisualizer spaces={quantumSpaces} selectedSpace={selectedSpace} />
                  </TabsContent>
                  
                  <TabsContent value="optimize" className="flex-grow p-0">
                    <OptimizationDirectivesPanel 
                      code={getActiveFileContent()}
                      goal={selectedOptimizationGoal}
                      method={selectedOptimizationMethod}
                      priority={selectedPriority}
                      onGoalChange={setSelectedOptimizationGoal}
                      onMethodChange={setSelectedOptimizationMethod}
                      onPriorityChange={setSelectedPriority}
                      onOptimize={async (params) => {
                        try {
                          const response = await apiRequest("POST", "/api/quantum/circuit/optimize", {
                            code: getActiveFileContent(),
                            ...params
                          });
                          
                          // Update file content with optimized code
                          updateFileContent(response.optimizedCode);
                          
                          toast({
                            title: "Optimization Complete",
                            description: `Code optimized for ${params.goal}`
                          });
                        } catch (error) {
                          toast({
                            title: "Optimization Failed",
                            description: error instanceof Error ? error.message : "Failed to optimize code",
                            variant: "destructive"
                          });
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}