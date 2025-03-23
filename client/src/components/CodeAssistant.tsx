import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles, Code, MessageSquare, Send, Wand, Zap, Lightbulb, Eye, Scissors } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CodeAssistantProps {
  currentCode: string;
  onInsertCode: (code: string) => void;
}

interface SuggestionResponse {
  code: string;
  explanation: string;
}

interface CodeAnalysisResponse {
  score: number;
  issues: {
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
  }[];
  suggestions: string[];
}

export function CodeAssistant({ currentCode, onInsertCode }: CodeAssistantProps) {
  const [activeTab, setActiveTab] = useState("chat");
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeDescription, setCodeDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [optimization, setOptimization] = useState<'performance' | 'security' | 'explainability'>('performance');
  const [explanation, setExplanation] = useState("");
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysisResponse | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionResponse[]>([]);
  
  const { toast } = useToast();

  // Chat with the assistant
  const handleChat = async () => {
    if (!prompt.trim()) return;
    
    try {
      setIsLoading(true);
      const newHistory = [...chatHistory, { role: 'user' as const, content: prompt }];
      setChatHistory(newHistory);
      
      const response = await apiRequest<{ response: string }>(
        'POST',
        '/api/ai/assistant/chat',
        {
          prompt,
          context: currentCode,
          history: chatHistory
        }
      );
      
      setChatHistory([...newHistory, { role: 'assistant' as const, content: response.response }]);
      setPrompt("");
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get a response from the assistant.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate code from description
  const handleGenerateCode = async () => {
    if (!codeDescription.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await apiRequest<{ code: string }>(
        'POST',
        '/api/ai/assistant/generate',
        {
          description: codeDescription
        }
      );
      
      setGeneratedCode(response.code);
    } catch (error) {
      console.error('Code generation error:', error);
      toast({
        title: "Generation Error",
        description: "Failed to generate code from description.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Explain code
  const handleExplainCode = async () => {
    if (!currentCode.trim()) {
      toast({
        title: "No Code",
        description: "There is no code to explain.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiRequest<{ explanation: string }>(
        'POST',
        '/api/ai/assistant/explain',
        {
          code: currentCode
        }
      );
      
      setExplanation(response.explanation);
    } catch (error) {
      console.error('Explain error:', error);
      toast({
        title: "Explanation Error",
        description: "Failed to explain the code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Analyze code
  const handleAnalyzeCode = async () => {
    if (!currentCode.trim()) {
      toast({
        title: "No Code",
        description: "There is no code to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiRequest<{ analysis: CodeAnalysisResponse }>(
        'POST',
        '/api/ai/assistant/analyze',
        {
          code: currentCode
        }
      );
      
      setCodeAnalysis(response.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get code suggestions
  const handleGetSuggestions = async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest<{ suggestions: SuggestionResponse[] }>(
        'POST',
        '/api/ai/assistant/suggest',
        {
          context: currentCode
        }
      );
      
      setSuggestions(response.suggestions);
    } catch (error) {
      console.error('Suggestions error:', error);
      toast({
        title: "Suggestions Error",
        description: "Failed to get code suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Optimize code
  const handleOptimizeCode = async () => {
    if (!currentCode.trim()) {
      toast({
        title: "No Code",
        description: "There is no code to optimize.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await apiRequest<{ optimizedCode: string }>(
        'POST',
        '/api/ai/assistant/optimize',
        {
          code: currentCode,
          focus: optimization
        }
      );
      
      setGeneratedCode(response.optimizedCode);
      setActiveTab("generate"); // Switch to generate tab to show the optimized code
    } catch (error) {
      console.error('Optimization error:', error);
      toast({
        title: "Optimization Error",
        description: "Failed to optimize the code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span>SINGULARIS PRIME Code Assistant</span>
        </CardTitle>
        <CardDescription>
          AI-powered assistance for writing and understanding SINGULARIS PRIME code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="generate">
              <Wand className="h-4 w-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="analyze">
              <Eye className="h-4 w-4 mr-2" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="explain">
              <Lightbulb className="h-4 w-4 mr-2" />
              Explain
            </TabsTrigger>
            <TabsTrigger value="optimize">
              <Scissors className="h-4 w-4 mr-2" />
              Optimize
            </TabsTrigger>
          </TabsList>
          
          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-4 mb-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Chat with the SINGULARIS PRIME assistant about quantum computing, AI governance, or code help.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        msg.role === 'assistant' 
                          ? 'bg-secondary text-secondary-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Ask about quantum concepts, AI governance, or code help..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleChat()}
              />
              <Button onClick={handleChat} disabled={isLoading || !prompt.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </TabsContent>
          
          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="Describe the code you want to generate in natural language..."
                  value={codeDescription}
                  onChange={(e) => setCodeDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>
              <Button 
                onClick={handleGenerateCode} 
                disabled={isLoading || !codeDescription.trim()}
                className="w-full"
              >
                <Wand className="h-4 w-4 mr-2" />
                Generate Code
              </Button>
              {generatedCode && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Generated Code:</h4>
                  <pre className="bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap">
                    <code>{generatedCode}</code>
                  </pre>
                  <Button 
                    variant="outline" 
                    onClick={() => onInsertCode(generatedCode)}
                    className="w-full mt-2"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Insert Into Editor
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Analyze Tab */}
          <TabsContent value="analyze" className="space-y-4">
            <Button 
              onClick={handleAnalyzeCode} 
              disabled={isLoading || !currentCode.trim()}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Analyze Current Code
            </Button>
            
            {codeAnalysis && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Code Quality Score:</h4>
                  <Badge variant={
                    codeAnalysis.score >= 80 ? "default" : 
                    codeAnalysis.score >= 60 ? "outline" : "destructive"
                  }>
                    {codeAnalysis.score}/100
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Issues:</h4>
                  {codeAnalysis.issues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No issues found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {codeAnalysis.issues.map((issue, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <Badge variant={
                            issue.type === 'error' ? "destructive" : 
                            issue.type === 'warning' ? "outline" : "secondary"
                          } className="mt-0.5">
                            {issue.type}
                          </Badge>
                          <span className="text-sm">
                            {issue.message}
                            {issue.line !== undefined && ` (Line ${issue.line})`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Suggestions:</h4>
                  {codeAnalysis.suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No suggestions available.</p>
                  ) : (
                    <ul className="space-y-1">
                      {codeAnalysis.suggestions.map((suggestion, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <span className="mr-2">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
            
            <div className="border-t pt-4 mt-4">
              <Button 
                onClick={handleGetSuggestions} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Get Code Suggestions
              </Button>
              
              {suggestions.length > 0 && (
                <div className="space-y-4 mt-4">
                  <h4 className="text-sm font-medium">Suggested Code Snippets:</h4>
                  {suggestions.map((suggestion, i) => (
                    <div key={i} className="border rounded-md p-3 space-y-2">
                      <pre className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                        <code>{suggestion.code}</code>
                      </pre>
                      <p className="text-sm text-muted-foreground">{suggestion.explanation}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onInsertCode(suggestion.code)}
                        className="w-full mt-1"
                      >
                        <Code className="h-3 w-3 mr-2" />
                        Insert Snippet
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Explain Tab */}
          <TabsContent value="explain" className="space-y-4">
            <Button 
              onClick={handleExplainCode} 
              disabled={isLoading || !currentCode.trim()}
              className="w-full"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Explain Current Code
            </Button>
            
            {explanation && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Explanation:</h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">{explanation}</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Optimize Tab */}
          <TabsContent value="optimize" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Optimization Focus:</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={optimization === 'performance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOptimization('performance')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Performance
                </Button>
                <Button 
                  variant={optimization === 'security' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOptimization('security')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Security
                </Button>
                <Button 
                  variant={optimization === 'explainability' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setOptimization('explainability')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Explainability
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleOptimizeCode} 
              disabled={isLoading || !currentCode.trim()}
              className="w-full mt-2"
            >
              <Scissors className="h-4 w-4 mr-2" />
              Optimize for {optimization}
            </Button>
            
            <p className="text-xs text-muted-foreground mt-2">
              Optimized code will appear in the Generate tab where you can review and insert it.
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>Powered by AI</div>
        <div>SINGULARIS PRIME v1.0</div>
      </CardFooter>
    </Card>
  );
}