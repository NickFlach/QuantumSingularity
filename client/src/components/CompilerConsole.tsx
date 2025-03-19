import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Code, FileCode, PlayCircle, Zap, History, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { executeCode, executeCodeDirect, compileCode, sampleQuantumCode, sampleAICode } from '@/lib/SingularisCompiler';
import { useToast } from '@/hooks/use-toast';

interface CompilerConsoleProps {
  code: string;
  onCodeChange: (code: string) => void;
}

interface ExecutionHistoryItem {
  timestamp: Date;
  mode: 'ast' | 'direct' | 'compile';
  code: string;
  output: string[];
  success: boolean;
}

export function CompilerConsole({ code, onCodeChange }: CompilerConsoleProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [bytecode, setBytecode] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("console");
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const { toast } = useToast();

  // Add history entry function
  const addToHistory = (mode: 'ast' | 'direct' | 'compile', output: string[], success: boolean) => {
    const historyItem: ExecutionHistoryItem = {
      timestamp: new Date(),
      mode,
      code,
      output,
      success
    };
    
    setExecutionHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep only last 10 entries
  };

  // Load code from history
  const loadFromHistory = (historyItem: ExecutionHistoryItem) => {
    onCodeChange(historyItem.code);
    
    if (historyItem.mode === 'compile') {
      setBytecode(historyItem.output);
      setActiveTab('bytecode');
    } else {
      setOutput(historyItem.output);
      setActiveTab('console');
    }
    
    toast({
      title: "Loaded from History",
      description: `Loaded ${historyItem.mode === 'ast' ? 'AST execution' : 
        historyItem.mode === 'direct' ? 'direct execution' : 'compilation'} from ${historyItem.timestamp.toLocaleTimeString()}`,
    });
  };

  const handleExecution = async () => {
    if (!code) {
      toast({
        title: "Empty Code",
        description: "Please enter some SINGULARIS PRIME code to execute.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await executeCode(code);
      setOutput(result);
      setActiveTab("console");
      addToHistory('ast', result, true);
      
      toast({
        title: "Execution Complete",
        description: "AST-based execution completed successfully.",
      });
    } catch (error) {
      const errorOutput = ["Execution failed. See error details above."];
      setOutput(errorOutput);
      addToHistory('ast', errorOutput, false);
      
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "An error occurred during execution.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectExecution = async () => {
    if (!code) {
      toast({
        title: "Empty Code",
        description: "Please enter some SINGULARIS PRIME code to execute.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await executeCodeDirect(code);
      setOutput(result);
      setActiveTab("console");
      addToHistory('direct', result, true);
      
      toast({
        title: "Execution Complete",
        description: "Direct execution completed successfully.",
      });
    } catch (error) {
      const errorOutput = ["Direct execution failed. See error details above."];
      setOutput(errorOutput);
      addToHistory('direct', errorOutput, false);
      
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "An error occurred during direct execution.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompilation = async () => {
    if (!code) {
      toast({
        title: "Empty Code",
        description: "Please enter some SINGULARIS PRIME code to compile.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await compileCode(code);
      setBytecode(result);
      setActiveTab("bytecode");
      addToHistory('compile', result, true);
      
      toast({
        title: "Compilation Complete",
        description: `Generated ${result.length} bytecode instructions.`,
      });
    } catch (error) {
      const errorOutput = ["Compilation failed. See error details above."];
      setBytecode(errorOutput);
      addToHistory('compile', errorOutput, false);
      
      toast({
        title: "Compilation Error",
        description: error instanceof Error ? error.message : "An error occurred during compilation.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuantumSample = () => {
    onCodeChange(sampleQuantumCode);
    toast({
      title: "Sample Loaded",
      description: "Quantum operations sample code has been loaded.",
    });
  };

  const loadAISample = () => {
    onCodeChange(sampleAICode);
    toast({
      title: "Sample Loaded",
      description: "AI governance sample code has been loaded.",
    });
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle>SINGULARIS PRIME Compiler Console</CardTitle>
          <CardDescription>
            Execute and compile SINGULARIS PRIME code for quantum and AI operations
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowHistory(!showHistory)}
          className="flex gap-1"
        >
          <History className="h-4 w-4" />
          {showHistory ? "Hide History" : "Show History"}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden pb-0">
        {showHistory && executionHistory.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Execution History</h3>
            <ScrollArea className="h-[100px] rounded-md border">
              <div className="p-2">
                {executionHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    {item.mode === 'ast' ? (
                      <PlayCircle className="h-4 w-4 text-blue-500" />
                    ) : item.mode === 'direct' ? (
                      <Zap className="h-4 w-4 text-purple-500" />
                    ) : (
                      <FileCode className="h-4 w-4 text-amber-500" />
                    )}
                    
                    <span className="text-xs">
                      {item.timestamp.toLocaleTimeString()} - 
                      {item.mode === 'ast' ? 'AST Execution' : 
                       item.mode === 'direct' ? 'Direct Execution' : 
                       'Compilation'}
                    </span>
                    
                    {item.success ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="console">
              <Code className="mr-2 h-4 w-4" />
              Console Output
            </TabsTrigger>
            <TabsTrigger value="bytecode">
              <FileCode className="mr-2 h-4 w-4" />
              Bytecode
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="console" className="flex-grow overflow-hidden mt-2">
            <ScrollArea className="h-[300px] rounded-md border p-4 bg-slate-50 dark:bg-slate-900 font-mono text-sm">
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg">
                    <span className="animate-pulse">⦿</span>
                    <span>Executing...</span>
                  </div>
                </div>
              )}
              
              {output.length > 0 ? (
                output.map((line, index) => (
                  <div key={index} className="py-1">
                    {line.startsWith('>') ? (
                      <div className="text-blue-600 dark:text-blue-400 flex items-start">
                        <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">CODE</Badge>
                        {line}
                      </div>
                    ) : line.includes('ERROR') || line.includes('failed') || line.includes('Failed') ? (
                      <div className="text-red-600 dark:text-red-400 flex items-start">
                        <Badge variant="outline" className="mr-2 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300">ERROR</Badge>
                        {line}
                      </div>
                    ) : line.includes('SUCCESS') || line.includes('completed successfully') ? (
                      <div className="text-green-600 dark:text-green-400 flex items-start">
                        <Badge variant="outline" className="mr-2 bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">SUCCESS</Badge>
                        {line}
                      </div>
                    ) : line.includes('WARNING') || line.includes('Potential') ? (
                      <div className="text-yellow-600 dark:text-yellow-400 flex items-start">
                        <Badge variant="outline" className="mr-2 bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">WARN</Badge>
                        {line}
                      </div>
                    ) : line.includes('INFO') ? (
                      <div className="text-slate-600 dark:text-slate-300 flex items-start">
                        <Badge variant="outline" className="mr-2 bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300">INFO</Badge>
                        {line}
                      </div>
                    ) : (
                      <div>{line}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 dark:text-slate-400 italic flex flex-col items-center justify-center h-full gap-2">
                  <Info className="h-10 w-10 opacity-20" />
                  <p>Execute SINGULARIS PRIME code to see output here</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="bytecode" className="flex-grow overflow-hidden mt-2">
            <ScrollArea className="h-[300px] rounded-md border p-4 bg-slate-50 dark:bg-slate-900 font-mono text-sm">
              {isLoading && (
                <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center z-10">
                  <div className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg">
                    <span className="animate-pulse">⦿</span>
                    <span>Compiling...</span>
                  </div>
                </div>
              )}
              
              {bytecode.length > 0 ? (
                bytecode.map((line, index) => (
                  <div key={index} className="py-1 flex items-start">
                    <span className="text-slate-500 dark:text-slate-400 mr-2 font-bold">{String(index).padStart(3, '0')}</span>
                    <span className="font-medium">{line}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 dark:text-slate-400 italic flex flex-col items-center justify-center h-full gap-2">
                  <FileCode className="h-10 w-10 opacity-20" />
                  <p>Compile SINGULARIS PRIME code to see bytecode here</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <Separator className="my-4" />
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadQuantumSample}
            className="text-xs"
          >
            <Zap className="mr-1 h-3 w-3" />
            Quantum Sample
          </Button>
          <Button 
            variant="outline" 
            onClick={loadAISample}
            className="text-xs"
          >
            <ChevronRight className="mr-1 h-3 w-3" />
            AI Sample
          </Button>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleCompilation} 
            disabled={isLoading}
            variant="secondary"
          >
            <FileCode className="mr-2 h-4 w-4" />
            Compile
          </Button>
          <Button 
            onClick={handleExecution} 
            disabled={isLoading}
            variant="secondary"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Execute (AST)
          </Button>
          <Button 
            onClick={handleDirectExecution} 
            disabled={isLoading}
            variant="default"
          >
            <Zap className="mr-2 h-4 w-4" />
            Execute (Direct)
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}