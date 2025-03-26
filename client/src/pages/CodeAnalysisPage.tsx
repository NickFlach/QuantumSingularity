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
import { AlertTriangle, Brain, Code, FileText, Globe, Info, Lightbulb } from 'lucide-react';
import { 
  // Original examples (with limited documentation)
  exampleAIProtocolsCode, 
  exampleQuantumOpsCode, 
  exampleGeometryCode 
} from '@/data/exampleCode';
import {
  // Enhanced examples with improved documentation and explainability
  enhancedAIProtocolsCode,
  enhancedQuantumOpsCode,
  enhancedGeometryCode
} from '@/data/enhancedExampleCode';

export default function CodeAnalysisPage() {
  // Default to enhanced examples for better explainability
  const [code, setCode] = useState<string>(enhancedAIProtocolsCode);
  const [activeTab, setActiveTab] = useState<string>("ai-protocols-enhanced");
  const [useEnhanced, setUseEnhanced] = useState<boolean>(true);
  const { toast } = useToast();
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };
  
  const toggleExampleType = () => {
    const newState = !useEnhanced;
    setUseEnhanced(newState);
    
    // Reload the current example with the new version (enhanced or basic)
    const currentExample = activeTab.replace('-enhanced', '').replace('-basic', '');
    loadExample(currentExample + (newState ? '-enhanced' : '-basic'));
    
    toast({
      title: newState ? "Enhanced Examples Enabled" : "Basic Examples Enabled",
      description: newState 
        ? "Using examples with improved documentation and explainability" 
        : "Using original code examples with basic documentation",
    });
  };
  
  const loadExample = (example: string) => {
    const isEnhanced = example.includes('-enhanced');
    const baseExample = example.replace('-enhanced', '');
    
    if (baseExample === "ai-protocols") {
      setCode(isEnhanced ? enhancedAIProtocolsCode : exampleAIProtocolsCode);
    } else if (baseExample === "quantum-ops") {
      setCode(isEnhanced ? enhancedQuantumOpsCode : exampleQuantumOpsCode);
    } else if (baseExample === "quantum-geometry") {
      setCode(isEnhanced ? enhancedGeometryCode : exampleGeometryCode);
    }
    
    setActiveTab(example);
    setUseEnhanced(isEnhanced);
    
    let description = "AI Protocols";
    if (baseExample === "quantum-ops") description = "Quantum Operations";
    if (baseExample === "quantum-geometry") description = "Quantum Geometry";
    
    toast({
      title: "Example Loaded",
      description: `${description} ${isEnhanced ? "(Enhanced)" : ""} example loaded successfully.`,
    });
  };
  
  return (
    <div className="container mx-auto py-6">
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                variant={activeTab.includes("ai-protocols") ? "default" : "outline"}
                onClick={() => loadExample("ai-protocols" + (useEnhanced ? "-enhanced" : ""))}
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Protocols
              </Button>
              <Button 
                variant={activeTab.includes("quantum-ops") ? "default" : "outline"}
                onClick={() => loadExample("quantum-ops" + (useEnhanced ? "-enhanced" : ""))}
              >
                <Code className="h-4 w-4 mr-2" />
                Quantum Operations
              </Button>
              <Button 
                variant={activeTab.includes("quantum-geometry") ? "default" : "outline"}
                onClick={() => loadExample("quantum-geometry" + (useEnhanced ? "-enhanced" : ""))}
              >
                <Globe className="h-4 w-4 mr-2" />
                Quantum Geometry
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleExampleType} className="flex items-center gap-2">
                {useEnhanced ? (
                  <>
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs">Using Enhanced Examples</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                    <span className="text-xs">Using Basic Examples</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {useEnhanced && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md p-3 mb-4">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-sm text-green-800 dark:text-green-300">Enhanced Code Examples</h4>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    These examples include detailed documentation, descriptive comments, and comprehensive explanations of technical concepts to improve explainability.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ResizablePanelGroup 
        direction="horizontal" 
        className="min-h-[600px] h-[calc(100vh-18rem)] border rounded-lg"
      >
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
                  scrollBeyondLastLine: true,
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