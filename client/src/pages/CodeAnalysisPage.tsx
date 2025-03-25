import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Editor from "@monaco-editor/react";
import { CodeAnalysisVisualizer } from "@/components/CodeAnalysisVisualizer";
import { sampleQuantumCode, sampleAICode } from "@/lib/SingularisCompiler";
import { exampleMainCode, exampleQuantumOpsCode, exampleAIProtocolsCode } from "@/data/exampleCode";
import { ArrowLeft, FileCode, ChevronRight, Book, FlaskConical, Shield, Brain } from "lucide-react";

export default function CodeAnalysisPage() {
  const [, setLocation] = useLocation();
  const [activeExample, setActiveExample] = useState<string>("main");
  const [editorValue, setEditorValue] = useState<string>(exampleMainCode);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzedCode, setAnalyzedCode] = useState<string | null>(null);

  const examples = {
    main: {
      name: "Main Example",
      description: "Basic SINGULARIS PRIME program with quantum key and AI contract",
      code: exampleMainCode,
      icon: <FileCode className="h-4 w-4" />
    },
    quantum: {
      name: "Quantum Operations",
      description: "Advanced quantum entanglement and error correction",
      code: exampleQuantumOpsCode, 
      icon: <FlaskConical className="h-4 w-4" />
    },
    ai: {
      name: "AI Governance",
      description: "AI-to-AI protocols with human oversight",
      code: exampleAIProtocolsCode,
      icon: <Brain className="h-4 w-4" />
    },
    entanglement: {
      name: "Quantum Entanglement",
      description: "Secure quantum key distribution for interplanetary systems",
      code: `// SINGULARIS PRIME - Quantum Entanglement Protocol
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
      icon: <Shield className="h-4 w-4" />
    },
    custom: {
      name: "Custom Code",
      description: "Write your own SINGULARIS PRIME code for analysis",
      code: "// Write your SINGULARIS PRIME code here\n",
      icon: <Book className="h-4 w-4" />
    }
  };

  const handleExampleChange = (example: string) => {
    setActiveExample(example);
    setEditorValue(examples[example as keyof typeof examples].code);
    setAnalyzedCode(null);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Set the analyzed code to trigger the analyzer component
    setAnalyzedCode(editorValue);
    setIsAnalyzing(false);
  };

  return (
    <div className="container mx-auto py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">SINGULARIS PRIME Code Analysis</h1>
          <p className="text-muted-foreground">
            Analyze quantum operations, AI governance, and human oversight in SINGULARIS PRIME code
          </p>
        </div>
        <Button variant="outline" onClick={() => setLocation('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 border rounded-lg overflow-hidden">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold mb-2">Source Code</h2>
              <Tabs 
                value={activeExample} 
                onValueChange={handleExampleChange}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="main" className="flex-1 flex items-center gap-2">
                    {examples.main.icon} Main
                  </TabsTrigger>
                  <TabsTrigger value="quantum" className="flex-1 flex items-center gap-2">
                    {examples.quantum.icon} Quantum
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex-1 flex items-center gap-2">
                    {examples.ai.icon} AI
                  </TabsTrigger>
                  <TabsTrigger value="entanglement" className="flex-1 flex items-center gap-2">
                    {examples.entanglement.icon} QKD
                  </TabsTrigger>
                  <TabsTrigger value="custom" className="flex-1 flex items-center gap-2">
                    {examples.custom.icon} Custom
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language="javascript" // Using javascript for syntax highlighting as a fallback
                value={editorValue}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on'
                }}
              />
            </div>
            
            <div className="border-t p-4 bg-muted/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-sm">{examples[activeExample as keyof typeof examples].name}</h3>
                  <p className="text-xs text-muted-foreground">{examples[activeExample as keyof typeof examples].description}</p>
                </div>
                <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                  {isAnalyzing ? "Analyzing..." : "Analyze Code"}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          {analyzedCode ? (
            <CodeAnalysisVisualizer 
              code={analyzedCode} 
              onBack={() => setAnalyzedCode(null)} 
            />
          ) : (
            <div className="h-full flex items-center justify-center p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Ready to Analyze</CardTitle>
                  <CardDescription>Select or write SINGULARIS PRIME code and click "Analyze Code" to begin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Quantum Security Analysis</h3>
                        <p className="text-sm text-muted-foreground">Evaluate quantum operations and security features</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">AI Governance Assessment</h3>
                        <p className="text-sm text-muted-foreground">Review AI contracts and explainability compliance</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Book className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Improvement Recommendations</h3>
                        <p className="text-sm text-muted-foreground">Get suggestions to optimize and enhance your code</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}