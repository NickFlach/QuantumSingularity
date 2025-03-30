import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cpu, 
  Code, 
  FileCode, 
  Atom, 
  Brain, 
  Github, 
  BarChart, 
  File, 
  FolderOpen, 
  RefreshCw,
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { queryClient } from '@/lib/queryClient';

// Types for code file and analysis
export interface CodeFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'quantum' | 'ai' | 'magnetism' | '37d' | 'unified' | 'kashiwara' | 'circuit' | 'geometry' | 'other';
  lastModified: Date;
}

export interface CodeAnalysisResult {
  file: CodeFile;
  complexity: number;
  explainability: number;
  entanglementLevel: number;
  dimensions: number;
  quantumFeatures: string[];
  aiIntegrationPoints: string[];
  improvements: string[];
  optimizedCode?: string;
  documentation?: string;
}

export function CodeAnalysisPanel() {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('code');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  // Fetch all code files
  const { 
    data: filesData, 
    isLoading: isLoadingFiles, 
    error: filesError,
    refetch: refetchFiles
  } = useQuery({
    queryKey: ['/api/code/analysis/files'],
    retry: 1
  });

  // Fetch file analysis when a file is selected
  const { 
    data: analysisData, 
    isLoading: isLoadingAnalysis,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['/api/code/analysis/analyze', selectedFileId],
    enabled: !!selectedFileId,
    retry: 1
  });

  // Generate code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async ({ operation, params }: { operation: string, params: any }) => {
      const response = await fetch('/api/code/analysis/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation, params }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate code');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      toast({
        title: 'Code Generated',
        description: 'SINGULARIS PRIME code has been successfully generated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error Generating Code',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // State for code generation form
  const [operation, setOperation] = useState('unified');
  const [dimensions, setDimensions] = useState(37);
  const [temperature, setTemperature] = useState(0.5);
  const [generatedCode, setGeneratedCode] = useState('');

  const handleFileSelect = (fileId: string) => {
    setSelectedFileId(fileId);
    setSelectedTab('code');
  };

  const handleGenerateCode = () => {
    generateCodeMutation.mutate({
      operation,
      params: {
        dimensions,
        temperature,
      },
    });
  };

  // Filter files by type
  const filteredFiles = filesData?.files.filter((file: CodeFile) => {
    if (filterType === 'all') return true;
    return file.type === filterType;
  }) || [];

  // Get the selected file
  const selectedFile = filesData?.files.find((file: CodeFile) => file.id === selectedFileId);
  const analysis = analysisData?.analysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Files panel */}
      <Card className="md:col-span-1 overflow-hidden">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Code Files
            </CardTitle>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => refetchFiles()}
              title="Refresh file list"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            SINGULARIS PRIME code files for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="unified">Unified Framework</SelectItem>
                <SelectItem value="37d">37D Quantum</SelectItem>
                <SelectItem value="magnetism">Quantum Magnetism</SelectItem>
                <SelectItem value="quantum">Quantum</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="circuit">Circuit</SelectItem>
                <SelectItem value="geometry">Geometry</SelectItem>
                <SelectItem value="kashiwara">Kashiwara</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoadingFiles ? (
            <div className="text-center py-4">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full" 
                   aria-label="loading"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading files...</p>
            </div>
          ) : filesError ? (
            <div className="text-center py-4 text-destructive">
              <AlertCircle className="mx-auto h-6 w-6 mb-2" />
              <p className="text-sm">Error loading files</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredFiles.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-6">No files found</p>
              ) : (
                filteredFiles.map((file: CodeFile) => (
                  <div 
                    key={file.id}
                    className={`p-3 rounded-md cursor-pointer border transition-colors hover:bg-accent hover:text-accent-foreground ${selectedFileId === file.id ? 'bg-accent text-accent-foreground' : ''}`}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        {file.type === 'unified' && <Atom className="h-4 w-4 text-blue-500" />}
                        {file.type === '37d' && <Atom className="h-4 w-4 text-purple-500" />}
                        {file.type === 'magnetism' && <Atom className="h-4 w-4 text-red-500" />}
                        {file.type === 'quantum' && <Atom className="h-4 w-4 text-green-500" />}
                        {file.type === 'ai' && <Brain className="h-4 w-4 text-amber-500" />}
                        {file.type === 'circuit' && <Cpu className="h-4 w-4 text-blue-500" />}
                        {file.type === 'geometry' && <Code className="h-4 w-4 text-pink-500" />}
                        {file.type === 'kashiwara' && <Github className="h-4 w-4 text-purple-500" />}
                        {file.type === 'other' && <File className="h-4 w-4 text-gray-500" />}
                        <span className="truncate font-medium">{file.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{file.type}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{file.path}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code and analysis panel */}
      <Card className="md:col-span-2">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {selectedFile ? (
                <span className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {selectedFile.name}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Analysis
                </span>
              )}
            </CardTitle>
            {selectedFileId && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refetchAnalysis()}
                title="Refresh analysis"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardDescription>
            {selectedFile ? `Analyze and examine ${selectedFile.name}` : 'Select a file to analyze'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No File Selected</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Select a file from the list to view its content and analysis
              </p>
            </div>
          ) : (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <div className="px-6 pt-2">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="code">
                    <Code className="h-4 w-4 mr-2" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="analysis">
                    <BarChart className="h-4 w-4 mr-2" />
                    Analysis
                  </TabsTrigger>
                  <TabsTrigger value="documentation">
                    <FileText className="h-4 w-4 mr-2" />
                    Docs
                  </TabsTrigger>
                  <TabsTrigger value="generate">
                    <Cpu className="h-4 w-4 mr-2" />
                    Generate
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="code" className="p-6 pt-4">
                <div className="h-[500px] border rounded-md overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    value={selectedFile.content}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      lineNumbers: 'on',
                      wordWrap: 'on'
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="p-6 pt-4">
                {isLoadingAnalysis ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full" 
                        aria-label="loading"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Analyzing code...</p>
                  </div>
                ) : analysisError ? (
                  <div className="text-center py-8 text-destructive">
                    <AlertCircle className="mx-auto h-6 w-6 mb-2" />
                    <p className="text-sm">Error analyzing code</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Complexity</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {analysis.complexity < 0.3 ? 'Low' : 
                               analysis.complexity < 0.7 ? 'Medium' : 'High'}
                            </span>
                            <span className="text-sm font-medium">
                              {Math.round(analysis.complexity * 100)}%
                            </span>
                          </div>
                          <Progress value={analysis.complexity * 100} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Explainability</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {analysis.explainability < 0.3 ? 'Low' : 
                               analysis.explainability < 0.7 ? 'Medium' : 'High'}
                            </span>
                            <span className="text-sm font-medium">
                              {Math.round(analysis.explainability * 100)}%
                            </span>
                          </div>
                          <Progress value={analysis.explainability * 100} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Entanglement Level</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {analysis.entanglementLevel < 0.3 ? 'Low' : 
                               analysis.entanglementLevel < 0.7 ? 'Medium' : 'High'}
                            </span>
                            <span className="text-sm font-medium">
                              {Math.round(analysis.entanglementLevel * 100)}%
                            </span>
                          </div>
                          <Progress value={analysis.entanglementLevel * 100} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Quantum Dimensions</Label>
                        <div className="p-2 border rounded-md text-center">
                          <span className="text-2xl font-bold">{analysis.dimensions}</span>
                          <span className="text-xs text-muted-foreground block">
                            {analysis.dimensions >= 37 ? 'High-Dimensional' : 
                             analysis.dimensions > 2 ? 'Multi-Level' : 'Standard Qubit'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Quantum Features</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysis.quantumFeatures.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No quantum features detected</p>
                          ) : (
                            analysis.quantumFeatures.map((feature, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50">
                                {feature}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">AI Integration Points</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysis.aiIntegrationPoints.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No AI integration points detected</p>
                          ) : (
                            analysis.aiIntegrationPoints.map((point, index) => (
                              <Badge key={index} variant="outline" className="bg-amber-50">
                                {point}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <Label className="text-sm font-medium">Suggested Improvements</Label>
                      <ul className="mt-2 space-y-2">
                        {analysis.improvements.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No improvements suggested</p>
                        ) : (
                          analysis.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5" />
                              <span>{improvement}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Select a file to view analysis</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="documentation" className="p-6 pt-4">
                {isLoadingAnalysis ? (
                  <div className="text-center py-8">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary rounded-full" 
                        aria-label="loading"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Generating documentation...</p>
                  </div>
                ) : analysisError ? (
                  <div className="text-center py-8 text-destructive">
                    <AlertCircle className="mx-auto h-6 w-6 mb-2" />
                    <p className="text-sm">Error generating documentation</p>
                  </div>
                ) : analysis?.documentation ? (
                  <div className="h-[500px] border rounded-md p-4 overflow-auto">
                    <div className="prose max-w-none dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ 
                        __html: analysis.documentation
                          .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                          .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                          .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                          .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                          .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
                          .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
                          .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
                          .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                          .replace(/\*(.*)\*/gim, '<em>$1</em>')
                          .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
                          .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
                          .replace(/^- (.*$)/gim, '<ul><li>$1</li></ul>')
                          .replace(/\n\n/gim, '<br />')
                          .replace(/`([^`]+)`/gim, '<code>$1</code>')
                          .replace(/```(.+?)```/gims, '<pre><code>$1</code></pre>')
                      }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Select a file to view documentation</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="generate" className="p-6 pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="operation">Operation</Label>
                    <Select value={operation} onValueChange={setOperation}>
                      <SelectTrigger id="operation">
                        <SelectValue placeholder="Select operation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unified">Unified Framework</SelectItem>
                        <SelectItem value="magnetism">Quantum Magnetism</SelectItem>
                        <SelectItem value="create_qudit">Create Qudit</SelectItem>
                        <SelectItem value="entangle">Entanglement</SelectItem>
                        <SelectItem value="measure">Measurement</SelectItem>
                        <SelectItem value="transform">Transform</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions</Label>
                      <Select 
                        value={dimensions.toString()} 
                        onValueChange={(value) => setDimensions(parseInt(value))}
                      >
                        <SelectTrigger id="dimensions">
                          <SelectValue placeholder="Select dimensions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 (standard qubit)</SelectItem>
                          <SelectItem value="3">3 (qutrit)</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="8">8</SelectItem>
                          <SelectItem value="16">16</SelectItem>
                          <SelectItem value="37">37 (optimal)</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Select 
                        value={temperature.toString()} 
                        onValueChange={(value) => setTemperature(parseFloat(value))}
                      >
                        <SelectTrigger id="temperature">
                          <SelectValue placeholder="Select temperature" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.1">0.1 (very low)</SelectItem>
                          <SelectItem value="0.25">0.25 (low)</SelectItem>
                          <SelectItem value="0.5">0.5 (medium)</SelectItem>
                          <SelectItem value="0.75">0.75 (high)</SelectItem>
                          <SelectItem value="1.0">1.0 (very high)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={handleGenerateCode}
                    disabled={generateCodeMutation.isPending}
                  >
                    {generateCodeMutation.isPending ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Generating...
                      </>
                    ) : (
                      <>Generate SINGULARIS PRIME Code</>
                    )}
                  </Button>
                  
                  <div className="mt-4 h-[400px] border rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage="typescript"
                      value={generatedCode}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        wordWrap: 'on'
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}