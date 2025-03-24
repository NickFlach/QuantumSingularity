import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { QuantumOperationsPanel } from "@/components/QuantumOperationsPanel";
import { QuantumVisualizer } from "@/components/QuantumVisualizer";
import { CodeAssistant } from "@/components/CodeAssistant";
import { OptimizationDirectivesPanel } from "@/components/OptimizationDirectivesPanel";
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
  Boxes,
  ChevronRight,
  Sparkles
} from "lucide-react";
import type { QuantumSpace, QuantumState, QuantumInvariant } from "../types/quantum";

import Editor, { OnMount } from "@monaco-editor/react";
import {
  sampleQuantumCode,
  sampleAICode,
  sampleQuantumGeometryCode,
  executeCode,
  executeCodeDirect,
  compileCode,
  optimizeCodeWithDirectives,
  AIOptimizedCircuitResponse,
  createQuantumGeometricSpace,
  embedQuantumStates,
  transformQuantumGeometry,
  entangleQuantumGeometricStates,
  computeQuantumTopologicalInvariants
} from "@/lib/SingularisCompiler";
import { evaluateExplainability } from "@/lib/openai";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Different code samples for new files
const SAMPLES: Record<string, string> = {
  "main.singularis": `// SINGULARIS PRIME - Main Program
import "quantum/entanglement";
import "ai/negotiation/v4.2";

@QuantumSecure
quantumKey secureKey = entangle(sender, receiver);

@HumanAuditable(0.85)
contract AIContract {
  enforce explainabilityThreshold(0.85);
  require secureKey;
  execute consensusProtocol(epoch=501292);
}`,
  "quantum.singularis": sampleQuantumCode,
  "ai-governance.singularis": sampleAICode,
  "quantum-geometry.singularis": sampleQuantumGeometryCode,
  "new-file.singularis": `// SINGULARIS PRIME - New File
// Start coding here...
`
};

// Type for file data
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

// Using types from the quantum.ts file

// Main component for SINGULARIS PRIME IDE
const Home = () => {
  // State for files and tabs
  const [files, setFiles] = useState<FileData[]>([
    { name: "main.singularis", content: SAMPLES["main.singularis"], language: "javascript", isModified: false }
  ]);
  const [activeFileId, setActiveFileId] = useState<string>("main.singularis");
  const [activeTab, setActiveTab] = useState<string>("editor");
  const [sidePanelTab, setSidePanelTab] = useState<string>("documentation");
  
  // Editor state
  const monacoRef = useRef<any>(null);
  const editorRef = useRef<any>(null);
  
  // Output and execution state
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [bytecodeOutput, setBytecodeOutput] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([]);
  
  // Quantum geometry visualization state
  const [quantumSpaces, setQuantumSpaces] = useState<QuantumSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string | null>(null);
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [outputPanelExpanded, setOutputPanelExpanded] = useState<boolean>(false);
  const [showOptimizationPanel, setShowOptimizationPanel] = useState<boolean>(false);
  const { toast } = useToast();

  // Add a new file tab
  const addNewFile = (templateName: string = "new-file.singularis") => {
    // Generate a unique name
    let baseName = templateName.split('.')[0];
    let extension = templateName.split('.')[1];
    let counter = 1;
    let newName = `${baseName}.${extension}`;
    
    while (files.some(file => file.name === newName)) {
      newName = `${baseName}-${counter}.${extension}`;
      counter++;
    }
    
    const newFile: FileData = {
      name: newName,
      content: SAMPLES[templateName] || SAMPLES["new-file.singularis"],
      language: "javascript",
      isModified: false
    };
    
    setFiles([...files, newFile]);
    setActiveFileId(newName);
    setActiveTab("editor");
  };
  
  // Save the current file
  const saveCurrentFile = () => {
    const updatedFiles = files.map(file => 
      file.name === activeFileId ? { ...file, isModified: false } : file
    );
    setFiles(updatedFiles);
    
    toast({
      title: "File Saved",
      description: `${activeFileId} has been saved successfully.`,
    });
  };
  
  // Close a file tab
  const closeFile = (fileName: string) => {
    // If it's the current active file, switch to another file
    if (activeFileId === fileName && files.length > 1) {
      const index = files.findIndex(file => file.name === fileName);
      const newActiveIndex = index === 0 ? 1 : index - 1;
      setActiveFileId(files[newActiveIndex].name);
    }
    
    // Remove the file
    setFiles(files.filter(file => file.name !== fileName));
    
    // If no files left, add a new one
    if (files.length === 1) {
      addNewFile();
    }
  };
  
  // Handle code changes in the editor
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    const updatedFiles = files.map(file => 
      file.name === activeFileId ? { ...file, content: value, isModified: true } : file
    );
    setFiles(updatedFiles);
  };
  
  // Setup editor on mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Setup custom language (would be expanded in a real implementation)
    monaco.languages.register({ id: 'singularis' });
    
    // Basic syntax highlighting for our language
    monaco.languages.setMonarchTokensProvider('singularis', {
      tokenizer: {
        root: [
          [/@\w+/, 'annotation'],
          [/import\s+"[^"]+"/, 'keyword'],
          [/\b(function|if|else|return|while|for|enforce|require|execute|quantumKey|qubit|contract|deployModel|syncLedger|resolveParadox)\b/, 'keyword'],
          [/\b(entangle|quantumSpace|embedState|transform|createGeometricSpace)\b/, 'keyword.quantum'],
          [/\b(true|false|null)\b/, 'keyword.constant'],
          [/[{}()\[\]]/, 'delimiter.bracket'],
          [/"[^"]*"/, 'string'],
          [/\d+/, 'number'],
          [/\/\/.*$/, 'comment'],
        ]
      }
    });
    
    // Set editor theme
    monaco.editor.defineTheme('singularisDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'annotation', foreground: '#FF79C6', fontStyle: 'italic' },
        { token: 'keyword', foreground: '#BD93F9' },
        { token: 'keyword.quantum', foreground: '#8BE9FD' },
        { token: 'keyword.constant', foreground: '#BD93F9' },
        { token: 'string', foreground: '#F1FA8C' },
        { token: 'number', foreground: '#FF79C6' },
        { token: 'comment', foreground: '#6272A4', fontStyle: 'italic' }
      ],
      colors: {
        'editor.background': '#282A36',
        'editor.foreground': '#F8F8F2',
        'editorLineNumber.foreground': '#6272A4',
        'editor.selectionBackground': '#44475A',
        'editor.lineHighlightBackground': '#44475A40'
      }
    });
    
    monaco.editor.setTheme('singularisDark');
  };
  
  // Add to execution history
  const addToHistory = (mode: 'ast' | 'direct' | 'compile' | 'quantum-geometry', output: string[], success: boolean) => {
    const currentFile = files.find(file => file.name === activeFileId);
    if (!currentFile) return;
    
    const historyItem: ExecutionHistoryItem = {
      timestamp: new Date(),
      mode,
      code: currentFile.content,
      output,
      success,
      fileId: activeFileId
    };
    
    setExecutionHistory(prev => [historyItem, ...prev.slice(0, 19)]); // Keep last 20 items
  };
  
  // Execute code (AST-based)
  const handleExecuteAST = async () => {
    const currentFile = files.find(file => file.name === activeFileId);
    if (!currentFile) return;
    
    setIsExecuting(true);
    setConsoleOutput(["$ singularis run " + activeFileId, "Initializing Quantum Runtime v2.4.0...", "Executing..."]);
    
    try {
      const result = await executeCode(currentFile.content);
      setConsoleOutput([
        "$ singularis run " + activeFileId, 
        "Initializing Quantum Runtime v2.4.0...",
        ...result
      ]);
      setActiveTab("output");
      addToHistory('ast', result, true);
      
      // Get explainability score
      try {
        const explainResult = await evaluateExplainability(currentFile.content);
        if (explainResult && explainResult.score) {
          setConsoleOutput(prev => [
            ...prev,
            "────────────────────────────────────────────",
            `Explainability Score: ${(explainResult.score * 100).toFixed(1)}%`,
            `Analysis: ${explainResult.analysis}`,
            "────────────────────────────────────────────",
            "Program completed successfully."
          ]);
        }
      } catch (explainError) {
        console.error("Failed to evaluate explainability:", explainError);
      }
      
    } catch (error) {
      console.error("Execution error:", error);
      
      const errorOutput = [
        "$ singularis run " + activeFileId, 
        "Initializing Quantum Runtime v2.4.0...",
        "ERROR: Execution failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Program terminated with errors."
      ];
      
      setConsoleOutput(errorOutput);
      addToHistory('ast', errorOutput, false);
      
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute the code",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Execute code (Direct)
  const handleExecuteDirect = async () => {
    const currentFile = files.find(file => file.name === activeFileId);
    if (!currentFile) return;
    
    setIsExecuting(true);
    setConsoleOutput(["$ singularis run-direct " + activeFileId, "Initializing Quantum Runtime v2.4.0...", "Direct execution..."]);
    
    try {
      const result = await executeCodeDirect(currentFile.content);
      setConsoleOutput([
        "$ singularis run-direct " + activeFileId, 
        "Initializing Quantum Runtime v2.4.0...",
        ...result
      ]);
      setActiveTab("output");
      addToHistory('direct', result, true);
      
    } catch (error) {
      console.error("Direct execution error:", error);
      
      const errorOutput = [
        "$ singularis run-direct " + activeFileId, 
        "Initializing Quantum Runtime v2.4.0...",
        "ERROR: Direct execution failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Program terminated with errors."
      ];
      
      setConsoleOutput(errorOutput);
      addToHistory('direct', errorOutput, false);
      
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "Failed to execute the code directly",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Compile code
  const handleCompile = async () => {
    const currentFile = files.find(file => file.name === activeFileId);
    if (!currentFile) return;
    
    setIsExecuting(true);
    setBytecodeOutput(["Compiling..."]);
    
    try {
      const result = await compileCode(currentFile.content);
      setBytecodeOutput(result);
      setActiveTab("bytecode");
      addToHistory('compile', result, true);
      
      toast({
        title: "Compilation Successful",
        description: `Generated ${result.length} bytecode instructions.`
      });
      
    } catch (error) {
      console.error("Compilation error:", error);
      
      const errorOutput = [
        "ERROR: Compilation failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred."
      ];
      
      setBytecodeOutput(errorOutput);
      addToHistory('compile', errorOutput, false);
      
      toast({
        title: "Compilation Error",
        description: error instanceof Error ? error.message : "Failed to compile the code",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Handle AI optimization of code
  const handleAIOptimize = () => {
    setSidePanelTab("optimization");
    setShowOptimizationPanel(true);
  };
  
  // Handle applying optimization directives to code
  const handleApplyOptimizationDirectives = async (directives: string[]) => {
    const currentFile = files.find(file => file.name === activeFileId);
    if (!currentFile) return;
    
    setIsExecuting(true);
    setConsoleOutput([
      "$ singularis optimize " + activeFileId, 
      "Initializing AI Optimization Engine...", 
      "Applying directives:", 
      ...directives.map(d => `  ${d}`),
      "Optimizing quantum circuit..."
    ]);
    
    try {
      // Apply the directives as comments to the code for processing
      const codeWithDirectives = directives.map(d => `// ${d}`).join('\n') + '\n\n' + currentFile.content;
      
      // Optimize code using the directives
      const result = await optimizeCodeWithDirectives(codeWithDirectives);
      
      // Update the console output with optimization results
      setConsoleOutput([
        "$ singularis optimize " + activeFileId, 
        "Initializing AI Optimization Engine...", 
        "Applying directives:", 
        ...directives.map(d => `  ${d}`),
        "────────────────────────────────────────────",
        "✓ Original circuit:",
        `  Gates: ${result.original.gates}`,
        `  Depth: ${result.original.depth}`,
        "────────────────────────────────────────────",
        "✓ Optimized circuit:",
        `  Gates: ${result.optimized.gates}`,
        `  Depth: ${result.optimized.depth}`,
        "────────────────────────────────────────────",
        "✓ Improvements:",
        `  Gate count reduction: ${result.improvement.gateCount}%`,
        `  Circuit depth change: ${result.improvement.depthChange}%`,
        "────────────────────────────────────────────",
        "✓ Explanation:",
        result.optimized.explanation,
        "────────────────────────────────────────────",
        "✓ Explainability score: " + (result.explainability * 100).toFixed(1) + "%",
        "────────────────────────────────────────────",
        "✓ Resource estimates:",
        `  Computational complexity: ${result.resourceEstimates.computationalComplexity}`,
        `  Estimated runtime: ${result.resourceEstimates.estimatedRuntime.toFixed(2)}ms`,
        `  Memory requirements: ${result.resourceEstimates.memoryRequirements}MB`,
        "────────────────────────────────────────────",
        "Optimization completed successfully at " + new Date(result.timestamp).toLocaleTimeString()
      ]);
      
      setActiveTab("output");
      
      // Ask user if they want to apply the optimized code
      toast({
        title: "Optimization Complete",
        description: `Reduced gate count by ${result.improvement.gateCount}%. Apply optimized code?`,
        action: (
          <Button 
            onClick={() => applyOptimizedCode(result.optimized.circuit)} 
            className="bg-primary text-white"
          >
            Apply
          </Button>
        ),
      });
      
    } catch (error) {
      console.error("Optimization error:", error);
      
      const errorOutput = [
        "$ singularis optimize " + activeFileId, 
        "Initializing AI Optimization Engine...",
        "ERROR: Optimization failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Process terminated with errors."
      ];
      
      setConsoleOutput(errorOutput);
      
      toast({
        title: "Optimization Error",
        description: error instanceof Error ? error.message : "Failed to optimize the code",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Apply optimized code to the editor
  const applyOptimizedCode = (optimizedCode: string) => {
    const updatedFiles = files.map(file => 
      file.name === activeFileId ? { ...file, content: optimizedCode, isModified: true } : file
    );
    setFiles(updatedFiles);
    
    toast({
      title: "Optimized Code Applied",
      description: "The AI-optimized code has been applied to the editor."
    });
  };
  
  // Simulate quantum geometry operations
  const handleRunQuantumGeometry = async () => {
    const currentFile = files.find(file => file.name === activeFileId);
    if (!currentFile) return;
    
    setIsExecuting(true);
    setConsoleOutput(["$ singularis quantum-geometry " + activeFileId, "Initializing Quantum Geometry Processor...", "Running simulation..."]);
    
    try {
      // Create test space
      const spaceId = `space-${Date.now().toString(36)}`;
      const dimension = 3;
      
      const spaceResponse = await createQuantumGeometricSpace(
        spaceId,
        dimension,
        ['point', 'line', 'plane'],
        'minkowski',
        ['connected', 'compact'],
        1.0
      );
      
      // Embed quantum states
      const stateIds = ['q1', 'q2'];
      const coordinates = [[0.1, 0.2, 0.3], [0.7, 0.8, 0.9]];
      
      const embedResponse = await embedQuantumStates(
        spaceId,
        dimension,
        ['point', 'line'],
        stateIds,
        coordinates
      );
      
      // Apply transformation
      const transformResponse = await transformQuantumGeometry(
        spaceId,
        dimension,
        ['point', 'line'],
        'rotation',
        { angleX: 0.5, angleY: 0.3, angleZ: 0.1 }
      );
      
      // Entangle states
      const entangleResponse = await entangleQuantumGeometricStates(
        spaceId,
        dimension,
        ['point', 'line'],
        'q1',
        'q2',
        0.8
      );
      
      // Compute invariants
      const invariantsResponse = await computeQuantumTopologicalInvariants(
        spaceId,
        dimension,
        ['point', 'line', 'plane']
      );
      
      // Update quantum spaces list
      setQuantumSpaces(prev => [
        ...prev,
        { 
          id: spaceId, 
          dimension, 
          elements: ['point', 'line', 'plane'],
          states: stateIds.map((id, index) => ({ id, coordinates: coordinates[index] })),
          transformations: [transformResponse],
          entanglements: [entangleResponse],
          invariants: invariantsResponse.invariants
        }
      ]);
      
      // Show results in console
      const output = [
        "$ singularis quantum-geometry " + activeFileId,
        "Initializing Quantum Geometry Processor...",
        "────────────────────────────────────────────",
        `✓ Created quantum geometric space: ${spaceId}`,
        `  Dimension: ${dimension}`,
        `  Metric: minkowski`,
        "────────────────────────────────────────────",
        "✓ Embedded quantum states:",
        ...embedResponse.embeddings.map(e => `  State '${e.stateId}' at [${e.coordinates.join(', ')}]`),
        "────────────────────────────────────────────",
        "✓ Applied transformation:",
        `  Type: ${transformResponse.transformationType}`,
        `  Parameters: ${Object.entries(transformResponse.parameters).map(([k, v]) => `${k}=${v}`).join(', ')}`,
        `  Energy delta: ${transformResponse.energyDelta}`,
        "────────────────────────────────────────────",
        "✓ Entanglement result:",
        `  Success: ${entangleResponse.entanglementResult.success}`,
        `  Strength: ${entangleResponse.entanglementResult.entanglementStrength}`,
        `  Description: ${entangleResponse.entanglementResult.description}`,
        "────────────────────────────────────────────",
        "✓ Computed invariants:",
        ...invariantsResponse.invariants.map(inv => `  ${inv.name}: ${inv.value}`),
        "────────────────────────────────────────────",
        "✓ Interpretation:",
        ...invariantsResponse.interpretation.map(int => `  ${int.property}: ${int.implication}`),
        "────────────────────────────────────────────",
        "Quantum geometry simulation completed successfully."
      ];
      
      setConsoleOutput(output);
      setActiveTab("output");
      setSidePanelTab("visualization");
      setSelectedSpace(spaceId);
      addToHistory('quantum-geometry', output, true);
      
    } catch (error) {
      console.error("Quantum geometry error:", error);
      
      const errorOutput = [
        "$ singularis quantum-geometry " + activeFileId,
        "Initializing Quantum Geometry Processor...",
        "ERROR: Quantum geometry simulation failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Simulation terminated with errors."
      ];
      
      setConsoleOutput(errorOutput);
      addToHistory('quantum-geometry', errorOutput, false);
      
      toast({
        title: "Simulation Error",
        description: error instanceof Error ? error.message : "Failed to run quantum geometry simulation",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-[#1E1E2E] text-[#CDD6F4]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244]">
        <div className="flex items-center">
          <Atom className="h-6 w-6 text-[#CBA6F7] mr-2" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#CBA6F7] to-[#89B4FA] bg-clip-text text-transparent">
            SINGULARIS PRIME IDE
          </h1>
          <Badge className="ml-2 bg-[#313244] text-[#CDD6F4]">v2.4.0</Badge>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => saveCurrentFile()}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        {!sidebarCollapsed && (
          <div className="w-48 bg-[#181825] border-r border-[#313244] flex flex-col">
            <div className="p-2">
              <h2 className="px-2 py-1 text-xs font-bold text-[#A6ADC8]">WORKSPACE</h2>
              
              <div className="mt-2 space-y-1">
                {/* File tree */}
                <div className="px-2 py-1 hover:bg-[#313244] rounded-md cursor-pointer">
                  <span className="flex items-center text-[#CDD6F4]">
                    <ChevronRight className="h-3 w-3 mr-1" />
                    <span className="text-xs">singularis_project</span>
                  </span>
                </div>
                
                {files.map(file => (
                  <div 
                    key={file.name}
                    onClick={() => {
                      setActiveFileId(file.name);
                      setActiveTab("editor");
                    }}
                    className={`px-2 py-1 pl-4 hover:bg-[#313244] rounded-md cursor-pointer ${
                      activeFileId === file.name ? "bg-[#313244]" : ""
                    }`}
                  >
                    <span className="flex items-center text-[#CDD6F4] text-xs">
                      <FileCode className="h-3 w-3 mr-1 text-[#89B4FA]" />
                      {file.name} {file.isModified && <span className="ml-1 text-[#F38BA8]">•</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 p-2">
              <h2 className="px-2 py-1 text-xs font-bold text-[#A6ADC8]">TEMPLATES</h2>
              
              <div className="mt-2 space-y-1">
                <div 
                  onClick={() => addNewFile("main.singularis")}
                  className="px-2 py-1 hover:bg-[#313244] rounded-md cursor-pointer"
                >
                  <span className="flex items-center text-[#CDD6F4] text-xs">
                    <FileText className="h-3 w-3 mr-1 text-[#FAB387]" />
                    Main Program
                  </span>
                </div>
                <div 
                  onClick={() => addNewFile("quantum.singularis")}
                  className="px-2 py-1 hover:bg-[#313244] rounded-md cursor-pointer"
                >
                  <span className="flex items-center text-[#CDD6F4] text-xs">
                    <Atom className="h-3 w-3 mr-1 text-[#89DCEB]" />
                    Quantum Operations
                  </span>
                </div>
                <div 
                  onClick={() => addNewFile("ai-governance.singularis")}
                  className="px-2 py-1 hover:bg-[#313244] rounded-md cursor-pointer"
                >
                  <span className="flex items-center text-[#CDD6F4] text-xs">
                    <Activity className="h-3 w-3 mr-1 text-[#ABE9B3]" />
                    AI Governance
                  </span>
                </div>
                <div 
                  onClick={() => addNewFile("quantum-geometry.singularis")}
                  className="px-2 py-1 hover:bg-[#313244] rounded-md cursor-pointer"
                >
                  <span className="flex items-center text-[#CDD6F4] text-xs">
                    <Boxes className="h-3 w-3 mr-1 text-[#F5C2E7]" />
                    Quantum Geometry
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-2">
              <h2 className="px-2 py-1 text-xs font-bold text-[#A6ADC8]">QUANTUM SPACES</h2>
              
              <div className="mt-2 space-y-1 max-h-48 overflow-auto">
                {quantumSpaces.length > 0 ? (
                  quantumSpaces.map(space => (
                    <div 
                      key={space.id}
                      onClick={() => {
                        setSelectedSpace(space.id);
                        setSidePanelTab("visualization");
                      }}
                      className={`px-2 py-1 hover:bg-[#313244] rounded-md cursor-pointer ${
                        selectedSpace === space.id ? "bg-[#313244]" : ""
                      }`}
                    >
                      <span className="flex items-center text-[#CDD6F4] text-xs">
                        <Boxes className="h-3 w-3 mr-1 text-[#F5C2E7]" />
                        {space.id.substring(0, 14)}...
                      </span>
                      <span className="ml-4 text-[#A6ADC8] text-xs">
                        {space.dimension}D • {space.states.length} states
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-2 py-1 text-[#A6ADC8] text-xs italic">
                    No spaces yet. Run a quantum geometry program to create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Main Editor and Output Area */}
        <ResizablePanelGroup direction="vertical" className="flex-grow">
          {/* Editor Area */}
          <ResizablePanel defaultSize={70} minSize={30}>
            <div className="flex flex-col h-full">
              {/* Tabs bar */}
              <div className="flex border-b border-[#313244] bg-[#1E1E2E]">
                {files.map(file => (
                  <div 
                    key={file.name}
                    onClick={() => {
                      setActiveFileId(file.name);
                      setActiveTab("editor");
                    }}
                    className={`flex items-center border-r border-[#313244] px-3 py-1.5 ${
                      activeFileId === file.name ? "bg-[#181825] text-[#CBA6F7]" : "text-[#A6ADC8] hover:text-[#CDD6F4]"
                    }`}
                  >
                    <span className="text-xs">
                      {file.name} {file.isModified && <span className="ml-1 text-[#F38BA8]">•</span>}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-1 p-0 h-4 w-4 hover:bg-[#313244] rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeFile(file.name);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="px-2 text-[#A6ADC8]"
                  onClick={() => addNewFile()}
                >
                  +
                </Button>
              </div>
              
              {/* Editor */}
              <div className="flex-grow overflow-hidden">
                <Editor
                  height="100%"
                  language="javascript" // Monaco doesn't directly support our custom language
                  theme="singularisDark"
                  value={files.find(f => f.name === activeFileId)?.content || ""}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    scrollbar: {
                      verticalScrollbarSize: 8,
                      horizontalScrollbarSize: 8
                    }
                  }}
                />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Output Area */}
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="flex h-full">
              <div className="flex-grow flex flex-col h-full">
                {/* Output tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                  <div className="flex justify-between items-center border-b border-[#313244] bg-[#1E1E2E]">
                    <TabsList className="bg-transparent border-none h-8">
                      <TabsTrigger value="editor" className="text-xs h-8 data-[state=active]:bg-[#181825]">
                        <FileCode className="h-3 w-3 mr-1" />
                        Editor
                      </TabsTrigger>
                      <TabsTrigger value="output" className="text-xs h-8 data-[state=active]:bg-[#181825]">
                        <Play className="h-3 w-3 mr-1" />
                        Output
                      </TabsTrigger>
                      <TabsTrigger value="bytecode" className="text-xs h-8 data-[state=active]:bg-[#181825]">
                        <Zap className="h-3 w-3 mr-1" />
                        Bytecode
                      </TabsTrigger>
                      <TabsTrigger value="history" className="text-xs h-8 data-[state=active]:bg-[#181825]">
                        <Activity className="h-3 w-3 mr-1" />
                        History
                      </TabsTrigger>
                    </TabsList>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mr-2"
                      onClick={() => setOutputPanelExpanded(!outputPanelExpanded)}
                    >
                      {outputPanelExpanded ? <ChevronsDown className="h-4 w-4" /> : <ChevronsUp className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <TabsContent value="editor" className="flex-grow mt-0 p-0">
                    <div className="p-4 h-full flex items-center justify-center text-center">
                      <div className="max-w-md">
                        <FileCode className="h-12 w-12 mx-auto text-[#A6ADC8] opacity-20" />
                        <h3 className="mt-4 text-lg font-semibold text-[#CDD6F4]">SINGULARIS PRIME Editor</h3>
                        <p className="mt-2 text-sm text-[#A6ADC8]">
                          Edit your code in the editor above, then use the buttons below to execute or compile your code.
                        </p>
                        <div className="mt-4 flex justify-center space-x-2">
                          <Button onClick={handleExecuteAST} disabled={isExecuting}>
                            <Play className="h-4 w-4 mr-1" />
                            Run
                          </Button>
                          <Button onClick={handleCompile} variant="outline" disabled={isExecuting}>
                            <FileCode className="h-4 w-4 mr-1" />
                            Compile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="output" className="flex-grow mt-0 p-0">
                    <ScrollArea className="h-full border-t border-[#313244]">
                      <div className="p-4 font-mono text-sm">
                        {isExecuting && (
                          <div className="absolute inset-0 bg-[#11111B]/30 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="flex items-center gap-2 bg-[#1E1E2E] text-[#CDD6F4] px-4 py-2 rounded-lg border border-[#313244]">
                              <div className="h-3 w-3 rounded-full bg-[#CBA6F7] animate-pulse"></div>
                              <span>Executing...</span>
                            </div>
                          </div>
                        )}
                        
                        {consoleOutput.length > 0 ? (
                          consoleOutput.map((line, index) => (
                            <div key={index} className="py-1">
                              {line.startsWith('$') ? (
                                <div className="text-[#CBA6F7] font-bold">{line}</div>
                              ) : line.startsWith('ERROR') || line.includes('failed') || line.includes('Failed') ? (
                                <div className="text-[#F38BA8]">{line}</div>
                              ) : line.startsWith('✓') ? (
                                <div className="text-[#A6E3A1]">{line}</div>
                              ) : line.includes('WARNING') || line.startsWith('⚠') ? (
                                <div className="text-[#F9E2AF]">{line}</div>
                              ) : line.startsWith('─') ? (
                                <div className="text-[#6C7086]">{line}</div>
                              ) : (
                                <div>{line}</div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-[#A6ADC8] italic flex flex-col items-center justify-center h-full gap-2">
                            <Play className="h-10 w-10 opacity-20" />
                            <p>Execute a SINGULARIS PRIME program to see output here</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="bytecode" className="flex-grow mt-0 p-0">
                    <ScrollArea className="h-full border-t border-[#313244]">
                      <div className="p-4 font-mono text-sm">
                        {isExecuting && (
                          <div className="absolute inset-0 bg-[#11111B]/30 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="flex items-center gap-2 bg-[#1E1E2E] text-[#CDD6F4] px-4 py-2 rounded-lg border border-[#313244]">
                              <div className="h-3 w-3 rounded-full bg-[#CBA6F7] animate-pulse"></div>
                              <span>Compiling...</span>
                            </div>
                          </div>
                        )}
                        
                        {bytecodeOutput.length > 0 ? (
                          bytecodeOutput.map((line, index) => (
                            <div key={index} className="py-1 flex">
                              <span className="text-[#A6ADC8] w-8 text-right mr-4">{String(index).padStart(3, '0')}</span>
                              <span className={line.startsWith('ERROR') ? "text-[#F38BA8]" : ""}>{line}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-[#A6ADC8] italic flex flex-col items-center justify-center h-full gap-2">
                            <FileCode className="h-10 w-10 opacity-20" />
                            <p>Compile a SINGULARIS PRIME program to see bytecode here</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="history" className="flex-grow mt-0 p-0">
                    <ScrollArea className="h-full border-t border-[#313244]">
                      <div className="p-4">
                        {executionHistory.length > 0 ? (
                          <div className="space-y-2">
                            {executionHistory.map((item, idx) => (
                              <Card key={idx} className="bg-[#181825] border-[#313244]">
                                <CardHeader className="py-2 px-4">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      {item.mode === 'ast' ? (
                                        <Play className="h-4 w-4 text-[#89B4FA] mr-2" />
                                      ) : item.mode === 'direct' ? (
                                        <Zap className="h-4 w-4 text-[#CBA6F7] mr-2" />
                                      ) : item.mode === 'compile' ? (
                                        <FileCode className="h-4 w-4 text-[#F9E2AF] mr-2" />
                                      ) : (
                                        <Boxes className="h-4 w-4 text-[#F5C2E7] mr-2" />
                                      )}
                                      <CardTitle className="text-sm font-medium">
                                        {item.mode === 'ast' ? 'AST Execution' : 
                                         item.mode === 'direct' ? 'Direct Execution' : 
                                         item.mode === 'compile' ? 'Compilation' :
                                         'Quantum Geometry'}
                                      </CardTitle>
                                    </div>
                                    <Badge 
                                      className={
                                        item.success 
                                          ? "bg-[#A6E3A1]/20 text-[#A6E3A1] hover:bg-[#A6E3A1]/20" 
                                          : "bg-[#F38BA8]/20 text-[#F38BA8] hover:bg-[#F38BA8]/20"
                                      }
                                    >
                                      {item.success ? 'Success' : 'Failed'}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="py-2 px-4">
                                  <div className="text-xs text-[#A6ADC8]">
                                    <span className="font-medium">File:</span> {item.fileId}
                                  </div>
                                  <div className="text-xs text-[#A6ADC8]">
                                    <span className="font-medium">Time:</span> {item.timestamp.toLocaleTimeString()}
                                  </div>
                                </CardContent>
                                <CardFooter className="py-2 px-4">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full text-xs"
                                    onClick={() => {
                                      // Find the file
                                      const fileExists = files.some(f => f.name === item.fileId);
                                      
                                      // If file doesn't exist, recreate it
                                      if (!fileExists) {
                                        setFiles([...files, {
                                          name: item.fileId,
                                          content: item.code,
                                          language: "javascript",
                                          isModified: false
                                        }]);
                                      } else {
                                        // Update existing file
                                        const updatedFiles = files.map(f => 
                                          f.name === item.fileId ? { ...f, content: item.code } : f
                                        );
                                        setFiles(updatedFiles);
                                      }
                                      
                                      // Set active file
                                      setActiveFileId(item.fileId);
                                      
                                      // Show output if available
                                      if (item.mode === 'compile') {
                                        setBytecodeOutput(item.output);
                                        setActiveTab("bytecode");
                                      } else {
                                        setConsoleOutput(item.output);
                                        setActiveTab("output");
                                      }
                                      
                                      toast({
                                        title: "History Loaded",
                                        description: `Loaded ${item.fileId} from history`
                                      });
                                    }}
                                  >
                                    Restore This Version
                                  </Button>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[#A6ADC8] italic flex flex-col items-center justify-center h-full gap-2">
                            <Activity className="h-10 w-10 opacity-20" />
                            <p>No execution history yet</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
                
                {/* Action buttons */}
                <div className={`flex justify-between items-center p-2 border-t border-[#313244] bg-[#181825] ${
                  activeTab !== "history" ? "" : "hidden"
                }`}>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRunQuantumGeometry}
                      disabled={isExecuting}
                      className="text-xs"
                    >
                      <Boxes className="h-3 w-3 mr-1" />
                      Quantum Geometry
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAIOptimize}
                      className="text-xs"
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      AI Optimize
                    </Button>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCompile}
                      disabled={isExecuting}
                      className="text-xs"
                    >
                      <FileCode className="h-3 w-3 mr-1" />
                      Compile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExecuteAST}
                      disabled={isExecuting}
                      className="text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Execute (AST)
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleExecuteDirect}
                      disabled={isExecuting}
                      className="text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Execute (Direct)
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Side panel (documentation & visualization) */}
              <div className="w-72 border-l border-[#313244] bg-[#181825] flex flex-col">
                <Tabs value={sidePanelTab} onValueChange={setSidePanelTab} className="h-full flex flex-col">
                  <TabsList className="bg-transparent border-b border-[#313244] w-full h-9 rounded-none">
                    <TabsTrigger value="documentation" className="flex-1 text-xs h-9 data-[state=active]:bg-[#181825]">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Docs
                    </TabsTrigger>
                    <TabsTrigger value="visualization" className="flex-1 text-xs h-9 data-[state=active]:bg-[#181825]">
                      <LayoutGrid className="h-3 w-3 mr-1" />
                      Visualization
                    </TabsTrigger>
                    <TabsTrigger value="assistant" className="flex-1 text-xs h-9 data-[state=active]:bg-[#181825]">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Assistant
                    </TabsTrigger>
                    <TabsTrigger value="optimization" className="flex-1 text-xs h-9 data-[state=active]:bg-[#181825]">
                      <Activity className="h-3 w-3 mr-1" />
                      Optimize
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="documentation" className="flex-grow mt-0 p-4">
                    <ScrollArea className="h-full">
                      <h3 className="text-lg font-semibold mb-3 text-[#CDD6F4]">SINGULARIS PRIME</h3>
                      <p className="text-sm text-[#A6ADC8] mb-4">
                        A programming language designed for quantum computing simulation with integrated AI governance features.
                      </p>
                      
                      <Separator className="my-4" />
                      
                      <h4 className="text-md font-semibold mb-2 text-[#CDD6F4]">Key Features</h4>
                      <ul className="text-sm text-[#A6ADC8] space-y-2 mb-4">
                        <li className="flex items-start">
                          <Badge className="mt-0.5 mr-2 bg-[#89B4FA]/20 text-[#89B4FA] hover:bg-[#89B4FA]/20">Quantum</Badge>
                          <span>Quantum key distribution, entanglement operations</span>
                        </li>
                        <li className="flex items-start">
                          <Badge className="mt-0.5 mr-2 bg-[#A6E3A1]/20 text-[#A6E3A1] hover:bg-[#A6E3A1]/20">AI</Badge>
                          <span>AI contract negotiation, governance protocols</span>
                        </li>
                        <li className="flex items-start">
                          <Badge className="mt-0.5 mr-2 bg-[#F5C2E7]/20 text-[#F5C2E7] hover:bg-[#F5C2E7]/20">Geometry</Badge>
                          <span>Quantum geometric space operations & topological analysis</span>
                        </li>
                      </ul>
                      
                      <h4 className="text-md font-semibold mb-2 text-[#CDD6F4]">Language Syntax</h4>
                      <div className="text-sm text-[#A6ADC8] space-y-2 mb-4">
                        <div>
                          <p className="font-medium text-[#CDD6F4]">@Annotations</p>
                          <p>Define properties and constraints for objects.</p>
                          <p><code>@QuantumSecure, @HumanAuditable(0.85)</code></p>
                        </div>
                        <div>
                          <p className="font-medium text-[#CDD6F4]">Quantum Keys</p>
                          <p>Create secure quantum entanglement between parties.</p>
                          <p><code>quantumKey qkdHandshake = entangle(alice, bob);</code></p>
                        </div>
                        <div>
                          <p className="font-medium text-[#CDD6F4]">AI Contracts</p>
                          <p>Define AI governance constraints and execution parameters.</p>
                          <p><code>{"contract AIContract { enforce explainabilityThreshold(0.9); }"}</code></p>
                        </div>
                        <div>
                          <p className="font-medium text-[#CDD6F4]">Quantum Geometry</p>
                          <p>Create geometric spaces for quantum operations.</p>
                          <p><code>quantumSpace space = createGeometricSpace(dimension=3);</code></p>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="visualization" className="flex-grow mt-0 p-0">
                    {selectedSpace && quantumSpaces.length > 0 ? (
                      <div className="p-4">
                        <h3 className="text-sm font-semibold mb-2">
                          Quantum Space: {selectedSpace.substring(0, 10)}...
                        </h3>
                        
                        <div className="h-48 w-full bg-[#11111B] rounded-md mb-3 relative overflow-hidden flex items-center justify-center">
                          {/* This would be replaced with a real visualization component */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#89B4FA]/20 to-[#F5C2E7]/20"></div>
                          
                          {quantumSpaces.find(s => s.id === selectedSpace)?.states.map((state: QuantumState, i: number) => (
                            <div 
                              key={i}
                              className="absolute w-3 h-3 rounded-full bg-[#F5C2E7]"
                              style={{
                                left: `${30 + state.coordinates[0] * 180}px`,
                                top: `${30 + state.coordinates[1] * 100}px`,
                                boxShadow: '0 0 8px #F5C2E7'
                              }}
                            />
                          ))}
                          
                          {/* Connection line for entanglement */}
                          {(quantumSpaces.find(s => s.id === selectedSpace)?.states?.length || 0) >= 2 && (
                            <div 
                              className="absolute bg-gradient-to-r from-[#89B4FA] to-[#F5C2E7] h-0.5" 
                              style={{
                                width: '70px',
                                left: '80px',
                                top: '75px',
                                transform: 'rotate(20deg)',
                                transformOrigin: '0 0'
                              }}
                            />
                          )}
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="text-xs">
                          <h4 className="font-medium mb-1">Space Properties</h4>
                          <div className="grid grid-cols-2 gap-1 mb-3">
                            <div>Dimension:</div>
                            <div>{quantumSpaces.find(s => s.id === selectedSpace)?.dimension}</div>
                            <div>States:</div>
                            <div>{quantumSpaces.find(s => s.id === selectedSpace)?.states.length}</div>
                            <div>Elements:</div>
                            <div>{quantumSpaces.find(s => s.id === selectedSpace)?.elements.join(', ')}</div>
                          </div>
                          
                          <h4 className="font-medium mb-1">Invariants</h4>
                          <div className="space-y-1">
                            {quantumSpaces.find(s => s.id === selectedSpace)?.invariants.map((inv: QuantumInvariant, i: number) => (
                              <div key={i} className="flex justify-between">
                                <span>{inv.name}:</span>
                                <span>{inv.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Boxes className="h-10 w-10 text-[#A6ADC8] opacity-20 mb-2" />
                        <p className="text-sm text-[#A6ADC8]">
                          No quantum space selected.
                        </p>
                        <p className="text-xs text-[#A6ADC8] mt-1">
                          Run a quantum geometry program to create visualization data.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            // Add quantum geometry file if not exists
                            if (!files.some(f => f.name === "quantum-geometry.singularis")) {
                              addNewFile("quantum-geometry.singularis");
                            } else {
                              // Set existing file as active
                              setActiveFileId("quantum-geometry.singularis");
                              setActiveTab("editor");
                            }
                          }}
                        >
                          <Boxes className="h-3 w-3 mr-1" />
                          Create New Space
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="assistant" className="flex-grow mt-0 p-3">
                    <CodeAssistant 
                      currentCode={files.find(file => file.name === activeFileId)?.content || ""}
                      onInsertCode={(code) => {
                        if (activeFileId) {
                          const currentFile = files.find(file => file.name === activeFileId);
                          if (currentFile) {
                            // Replace the current file content with the generated code
                            const updatedFiles = files.map(file => 
                              file.name === activeFileId 
                                ? { ...file, content: code, isModified: true } 
                                : file
                            );
                            setFiles(updatedFiles);
                            
                            // Switch to editor tab to show the inserted code
                            setActiveTab("editor");
                            
                            toast({
                              title: "Code Inserted",
                              description: "The generated code has been inserted into the editor.",
                            });
                          }
                        }
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="optimization" className="flex-grow mt-0 p-3">
                    <OptimizationDirectivesPanel 
                      code={files.find(file => file.name === activeFileId)?.content || ""}
                      onApplyDirectives={handleApplyOptimizationDirectives}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs bg-[#181825] border-t border-[#313244] text-[#A6ADC8]">
        <div className="flex items-center space-x-4">
          <div>SINGULARIS PRIME v2.4.0</div>
          <div>Quantum Runtime: Active</div>
        </div>
        <div className="flex items-center space-x-4">
          <div>Human-Auditable: 95%</div>
          <div>Explainability Threshold: 0.85</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
