import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Code, Wand2, Bug, Zap, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your SINGULARIS PRIME coding assistant. I can help you write, debug, and optimize code for quantum computing and AI governance. What would you like to work on today?' 
    }
  ]);
  const [suggestions, setSuggestions] = useState<SuggestionResponse[]>([]);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysisResponse | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    // Add user message to chat
    setChatHistory([...chatHistory, { role: 'user', content: prompt }]);
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          context: currentCode, 
          history: chatHistory.slice(-6) // Last 6 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      setPrompt("");
    } catch (error) {
      console.error('Error with code assistant:', error);
      toast({
        title: "Assistant Error",
        description: error instanceof Error ? error.message : "Something went wrong with the code assistant",
        variant: "destructive"
      });
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: "I'm sorry, I encountered an error processing your request. Please try again." 
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCodeSuggestions = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/assistant/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: currentCode })
      });

      if (!response.ok) {
        throw new Error('Failed to generate code suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate code suggestions",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeCode = async () => {
    if (isGenerating || !currentCode.trim()) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/assistant/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentCode })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const data = await response.json();
      setCodeAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing code:', error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-[#181825] border-[#313244]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-[#CBA6F7]" />
            <span className="text-[#CDD6F4]">SINGULARIS PRIME Assistant</span>
          </div>
          <Badge variant="outline" className="text-xs bg-[#313244]">
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-3 mb-2 mx-2">
          <TabsTrigger value="chat" className="text-xs">
            <Code className="h-3.5 w-3.5 mr-1.5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="suggest" className="text-xs">
            <Wand2 className="h-3.5 w-3.5 mr-1.5" />
            Suggest
          </TabsTrigger>
          <TabsTrigger value="analyze" className="text-xs">
            <Bug className="h-3.5 w-3.5 mr-1.5" />
            Analyze
          </TabsTrigger>
        </TabsList>
        
        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="flex flex-col gap-3 pb-3">
              {chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "px-3 py-2 rounded-lg max-w-[85%]",
                    msg.role === 'user' 
                      ? "bg-[#313244] ml-auto" 
                      : "bg-[#45475A] mr-auto"
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </ScrollArea>
          
          <Separator className="my-2" />
          
          <form onSubmit={handlePromptSubmit} className="flex items-center gap-2 px-2 pb-2">
            <Input
              placeholder="Ask about SINGULARIS PRIME code..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-[#11111B] border-[#313244]"
              disabled={isGenerating}
            />
            <Button 
              type="submit" 
              size="sm"
              disabled={isGenerating || !prompt.trim()}
              className="bg-[#CBA6F7] text-[#11111B] hover:bg-[#CBA6F7]/90"
            >
              {isGenerating ? (
                <div className="h-4 w-4 border-2 border-[#11111B] border-t-transparent rounded-full animate-spin" />
              ) : (
                <CornerDownLeft className="h-4 w-4" />
              )}
            </Button>
          </form>
        </TabsContent>
        
        {/* Suggest Tab */}
        <TabsContent value="suggest" className="flex-1 flex flex-col space-y-3 mt-0">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-[#A6ADC8]">AI-generated code suggestions</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={generateCodeSuggestions}
              disabled={isGenerating}
              className="text-xs h-7"
            >
              {isGenerating ? (
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Wand2 className="h-3 w-3 mr-1" />
              )}
              Generate
            </Button>
          </div>
          
          <ScrollArea className="flex-1 pr-4">
            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Lightbulb className="h-8 w-8 text-[#A6ADC8] opacity-20 mb-2" />
                <p className="text-sm text-[#A6ADC8]">
                  Click "Generate" to get AI suggestions for your code.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-3">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="bg-[#11111B] border-[#313244]">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs font-medium flex justify-between items-center">
                        <span>Suggestion {index + 1}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 text-xs"
                          onClick={() => onInsertCode(suggestion.code)}
                        >
                          Insert <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 py-2 text-xs">
                      <pre className="bg-[#181825] p-2 rounded-md overflow-x-auto mb-2">
                        <code>{suggestion.code}</code>
                      </pre>
                      <Separator className="my-2" />
                      <div className="text-[#A6ADC8]">{suggestion.explanation}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        {/* Analyze Tab */}
        <TabsContent value="analyze" className="flex-1 flex flex-col space-y-3 mt-0">
          <div className="flex justify-between items-center px-2">
            <span className="text-xs text-[#A6ADC8]">Code quality analysis</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={analyzeCode}
              disabled={isGenerating || !currentCode.trim()}
              className="text-xs h-7"
            >
              {isGenerating ? (
                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Zap className="h-3 w-3 mr-1" />
              )}
              Analyze
            </Button>
          </div>
          
          <ScrollArea className="flex-1 pr-4">
            {!codeAnalysis ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <Bug className="h-8 w-8 text-[#A6ADC8] opacity-20 mb-2" />
                <p className="text-sm text-[#A6ADC8]">
                  Click "Analyze" to check your code for issues and get improvement suggestions.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pb-3">
                <div className="px-2">
                  <div className="flex items-center mb-3">
                    <span className="font-medium mr-2 text-sm">Quality Score:</span>
                    <div className="w-full bg-[#313244] rounded-full h-2.5 mr-2">
                      <div 
                        className={cn(
                          "h-2.5 rounded-full",
                          codeAnalysis.score > 0.7 
                            ? "bg-[#A6E3A1]" 
                            : codeAnalysis.score > 0.4 
                              ? "bg-[#F9E2AF]" 
                              : "bg-[#F38BA8]"
                        )}
                        style={{ width: `${codeAnalysis.score * 100}%` }}
                      />
                    </div>
                    <span className="text-sm">{Math.round(codeAnalysis.score * 100)}%</span>
                  </div>
                  
                  {codeAnalysis.issues.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium mb-2">Issues</h4>
                      <div className="space-y-2">
                        {codeAnalysis.issues.map((issue, i) => (
                          <div key={i} className="flex p-2 rounded-md bg-[#11111B]">
                            <div 
                              className={cn(
                                "w-1 rounded-full mr-2",
                                issue.type === 'error' 
                                  ? "bg-[#F38BA8]" 
                                  : issue.type === 'warning' 
                                    ? "bg-[#F9E2AF]" 
                                    : "bg-[#89B4FA]"
                              )}
                            />
                            <div className="flex-1 text-xs">
                              <div className="flex justify-between">
                                <span className="font-medium">{issue.type.toUpperCase()}</span>
                                {issue.line && <span className="text-[#A6ADC8]">Line {issue.line}</span>}
                              </div>
                              <p className="mt-1">{issue.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {codeAnalysis.suggestions.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium mt-4 mb-2">Suggestions</h4>
                      <div className="space-y-2">
                        {codeAnalysis.suggestions.map((suggestion, i) => (
                          <div key={i} className="p-2 rounded-md bg-[#11111B] text-xs">
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}