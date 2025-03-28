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
import { AlertTriangle, Brain, Code, FileText, Globe, Info, Lightbulb, Package, Zap, Box, Activity, Layers, GitMerge } from 'lucide-react';
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
import {
  // Kashiwara Genesis examples
  sheafModuleExample,
  dModuleExample,
  functorialTransformExample,
  crystalStateExample,
  singularityAnalysisExample,
  integratedQuantumExample
} from '@/data/kashiwaraExamples';

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
    const baseExample = example.replace('-enhanced', '').replace('-kashiwara', '');
    
    // Standard examples
    if (baseExample === "ai-protocols") {
      setCode(isEnhanced ? enhancedAIProtocolsCode : exampleAIProtocolsCode);
    } else if (baseExample === "quantum-ops") {
      setCode(isEnhanced ? enhancedQuantumOpsCode : exampleQuantumOpsCode);
    } else if (baseExample === "quantum-geometry") {
      setCode(isEnhanced ? enhancedGeometryCode : exampleGeometryCode);
    } 
    // Kashiwara Genesis examples
    else if (baseExample === "sheaf-module") {
      setCode(sheafModuleExample);
    } else if (baseExample === "d-module") {
      setCode(dModuleExample);
    } else if (baseExample === "functorial-transform") {
      setCode(functorialTransformExample);
    } else if (baseExample === "crystal-state") {
      setCode(crystalStateExample);
    } else if (baseExample === "singularity-analysis") {
      setCode(singularityAnalysisExample);
    } else if (baseExample === "integrated-quantum") {
      setCode(integratedQuantumExample);
    }
    
    setActiveTab(example);
    
    // Only standard examples can toggle between enhanced and basic
    if (!example.includes('kashiwara')) {
      setUseEnhanced(isEnhanced);
    }
    
    let description = "AI Protocols";
    if (baseExample === "quantum-ops") description = "Quantum Operations";
    if (baseExample === "quantum-geometry") description = "Quantum Geometry";
    if (baseExample === "sheaf-module") description = "Kashiwara Sheaf Module";
    if (baseExample === "d-module") description = "Kashiwara D-Module";
    if (baseExample === "functorial-transform") description = "Kashiwara Functorial Transform";
    if (baseExample === "crystal-state") description = "Kashiwara Crystal State";
    if (baseExample === "singularity-analysis") description = "Quantum Singularity Analysis";
    if (baseExample === "integrated-quantum") description = "Integrated Kashiwara Quantum";
    
    toast({
      title: "Example Loaded",
      description: `${description} ${isEnhanced && !example.includes('kashiwara') ? "(Enhanced)" : ""} example loaded successfully.`,
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
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2 flex items-center">
              <Box className="h-4 w-4 mr-2 text-purple-500" />
              Standard Examples
            </h4>
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={activeTab.includes("ai-protocols") ? "default" : "outline"}
                  onClick={() => loadExample("ai-protocols" + (useEnhanced ? "-enhanced" : ""))}
                  size="sm"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Protocols
                </Button>
                <Button 
                  variant={activeTab.includes("quantum-ops") ? "default" : "outline"}
                  onClick={() => loadExample("quantum-ops" + (useEnhanced ? "-enhanced" : ""))}
                  size="sm"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Quantum Operations
                </Button>
                <Button 
                  variant={activeTab.includes("quantum-geometry") ? "default" : "outline"}
                  onClick={() => loadExample("quantum-geometry" + (useEnhanced ? "-enhanced" : ""))}
                  size="sm"
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
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2 flex items-center">
              <Package className="h-4 w-4 mr-2 text-rose-500" />
              Kashiwara Genesis Examples
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
              <Button 
                variant={activeTab.includes("sheaf-module") ? "default" : "outline"}
                onClick={() => loadExample("sheaf-module-kashiwara")}
                size="sm"
                className="justify-start"
              >
                <Layers className="h-4 w-4 mr-2 text-green-500" />
                Sheaf Module
              </Button>
              <Button 
                variant={activeTab.includes("d-module") ? "default" : "outline"}
                onClick={() => loadExample("d-module-kashiwara")}
                size="sm"
                className="justify-start"
              >
                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                D-Module
              </Button>
              <Button 
                variant={activeTab.includes("functorial-transform") ? "default" : "outline"}
                onClick={() => loadExample("functorial-transform-kashiwara")}
                size="sm"
                className="justify-start"
              >
                <GitMerge className="h-4 w-4 mr-2 text-purple-500" />
                Functorial Transform
              </Button>
              <Button 
                variant={activeTab.includes("crystal-state") ? "default" : "outline"}
                onClick={() => loadExample("crystal-state-kashiwara")}
                size="sm"
                className="justify-start"
              >
                <Box className="h-4 w-4 mr-2 text-cyan-500" />
                Crystal State
              </Button>
              <Button 
                variant={activeTab.includes("singularity-analysis") ? "default" : "outline"}
                onClick={() => loadExample("singularity-analysis-kashiwara")}
                size="sm"
                className="justify-start"
              >
                <Zap className="h-4 w-4 mr-2 text-amber-500" />
                Singularity Analysis
              </Button>
              <Button 
                variant={activeTab.includes("integrated-quantum") ? "default" : "outline"}
                onClick={() => loadExample("integrated-quantum-kashiwara")}
                size="sm"
                className="justify-start"
              >
                <Zap className="h-4 w-4 mr-2 text-rose-500" />
                Integrated Quantum
              </Button>
            </div>
            
            <div className="bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-900 rounded-md p-3 mt-2">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-rose-600 dark:text-rose-400 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-sm text-rose-800 dark:text-rose-300">Kashiwara Genesis Examples</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
                    These examples showcase the Kashiwara Genesis framework that integrates sheaf theory, D-modules, functorial transforms, and crystal bases to create a unified mathematical foundation for quantum computing.
                  </p>
                </div>
              </div>
            </div>
          </div>
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