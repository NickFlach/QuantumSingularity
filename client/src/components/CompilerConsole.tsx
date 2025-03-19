import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Code, FileCode, PlayCircle, Zap } from 'lucide-react';
import { executeCode, executeCodeDirect, compileCode, sampleQuantumCode, sampleAICode } from '@/lib/SingularisCompiler';
import { useToast } from '@/hooks/use-toast';

interface CompilerConsoleProps {
  code: string;
  onCodeChange: (code: string) => void;
}

export function CompilerConsole({ code, onCodeChange }: CompilerConsoleProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [bytecode, setBytecode] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("console");
  const { toast } = useToast();

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
    } catch (error) {
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "An error occurred during execution.",
        variant: "destructive"
      });
      setOutput(["Execution failed. See error details above."]);
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
    } catch (error) {
      toast({
        title: "Execution Error",
        description: error instanceof Error ? error.message : "An error occurred during direct execution.",
        variant: "destructive"
      });
      setOutput(["Direct execution failed. See error details above."]);
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
    } catch (error) {
      toast({
        title: "Compilation Error",
        description: error instanceof Error ? error.message : "An error occurred during compilation.",
        variant: "destructive"
      });
      setBytecode(["Compilation failed. See error details above."]);
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
      <CardHeader className="pb-3">
        <CardTitle>SINGULARIS PRIME Compiler Console</CardTitle>
        <CardDescription>
          Execute and compile SINGULARIS PRIME code for quantum and AI operations
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden pb-0">
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
              {output.length > 0 ? (
                output.map((line, index) => (
                  <div key={index} className="py-1">
                    {line.startsWith('>') ? (
                      <div className="text-blue-600 dark:text-blue-400">{line}</div>
                    ) : line.includes('ERROR') || line.includes('failed') ? (
                      <div className="text-red-600 dark:text-red-400">{line}</div>
                    ) : line.includes('SUCCESS') || line.includes('completed successfully') ? (
                      <div className="text-green-600 dark:text-green-400">{line}</div>
                    ) : (
                      <div>{line}</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 dark:text-slate-400 italic">
                  Execute SINGULARIS PRIME code to see output here
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="bytecode" className="flex-grow overflow-hidden mt-2">
            <ScrollArea className="h-[300px] rounded-md border p-4 bg-slate-50 dark:bg-slate-900 font-mono text-sm">
              {bytecode.length > 0 ? (
                bytecode.map((line, index) => (
                  <div key={index} className="py-1 flex items-start">
                    <span className="text-slate-500 dark:text-slate-400 mr-2">{String(index).padStart(3, '0')}</span>
                    <span>{line}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 dark:text-slate-400 italic">
                  Compile SINGULARIS PRIME code to see bytecode here
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