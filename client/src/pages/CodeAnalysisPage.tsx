import React, { useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { Button } from "@/components/ui/button";
import { 
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { CodeAnalysisVisualizer } from '@/components/CodeAnalysisVisualizer';
import { Brain, Code, FileText } from 'lucide-react';
import { exampleAIProtocolsCode, exampleQuantumOpsCode } from '@/data/exampleCode';

export default function CodeAnalysisPage() {
  const [code, setCode] = useState<string>(exampleAIProtocolsCode);
  const [activeTab, setActiveTab] = useState<string>("ai-protocols");
  const { toast } = useToast();
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };
  
  const loadExample = (example: string) => {
    if (example === "ai-protocols") {
      setCode(exampleAIProtocolsCode);
      setActiveTab("ai-protocols");
    } else if (example === "quantum-ops") {
      setCode(exampleQuantumOpsCode);
      setActiveTab("quantum-ops");
    }
    
    toast({
      title: "Example Loaded",
      description: `${example === "ai-protocols" ? "AI Protocols" : "Quantum Operations"} example loaded successfully.`,
    });
  };
  
  return (
    <div className="container mx-auto py-6 h-[calc(100vh-7rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-7 w-7 text-purple-500" />
          SINGULARIS PRIME Code Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          Analyze quantum-secure AI-native code for explainability, governance, and security
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-500" />
            Example Code Snippets
          </CardTitle>
          <CardDescription>
            Load example SINGULARIS PRIME code to see analysis in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button 
              variant={activeTab === "ai-protocols" ? "default" : "outline"}
              onClick={() => loadExample("ai-protocols")}
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Protocols Example
            </Button>
            <Button 
              variant={activeTab === "quantum-ops" ? "default" : "outline"}
              onClick={() => loadExample("quantum-ops")}
            >
              <Code className="h-4 w-4 mr-2" />
              Quantum Operations Example
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-18rem)] border rounded-lg overflow-hidden">
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="border-b p-4 bg-muted/30">
              <h3 className="font-medium flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Code Editor
              </h3>
            </div>
            <div className="flex-1 overflow-auto">
              <MonacoEditor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  glyphMargin: true,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50} minSize={30}>
          <CodeAnalysisVisualizer code={code} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}