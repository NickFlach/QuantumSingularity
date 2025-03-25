import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Lightbulb, 
  Code, 
  Bot, 
  MessageSquare, 
  Loader2, 
  CornerDownRight,
  BrainCircuit,
  Sparkles,
  Send,
  ArrowRight,
  Puzzle,
  HelpCircle,
  Terminal,
  Search,
  GitMerge
} from "lucide-react";

export interface CodeAssistantProps {
  code: string;
  onCodeSuggestion: (suggestion: string) => void;
}

export function CodeAssistant({ code, onCodeSuggestion }: CodeAssistantProps) {
  const [selectedTab, setSelectedTab] = useState<string>("suggestions");
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m the SINGULARIS PRIME AI Assistant. I can help you with quantum programming, AI governance contracts, and paradox resolution. How can I assist you today?' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [explanations, setExplanations] = useState<{ section: string, explanation: string }[]>([]);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  
  const { toast } = useToast();

  // Preloaded suggestions based on common quantum operations
  const preloadedSuggestions = [
    {
      title: "Create Quantum Entanglement",
      code: `QKD_INIT("secure_key", "alice", "bob");

// Create Bell pair entanglement
QUANTUM_OPERATION {
  type: "entanglement",
  target: "qubits[0:1]",
  fidelity: 0.99
}`
    },
    {
      title: "Define AI Governance Contract",
      code: `AI_CONTRACT("governance_contract", 0.95, secureKey) {
  explainability: HIGH,
  auditTrail: ENABLED,
  humanFallback: TRUE,
  quantumVerification: ENABLED
}`
    },
    {
      title: "Create Quantum Geometric Space",
      code: `QUANTUM_GEOMETRY {
  dimension: 4,
  metric: "minkowski",
  energyDensity: 0.85,
  topologicalProperties: ["connected", "orientable"]
}`
    },
    {
      title: "Configure AI-to-AI Negotiation",
      code: `DEFINE_AI_ENTITY("agent_alpha", {
  trustLevel: 0.92,
  expertise: ["resource_optimization", "risk_assessment"]
});

DEFINE_AI_ENTITY("agent_beta", {
  trustLevel: 0.88,
  expertise: ["verification", "transparency"]
});

AI_NEGOTIATE(agent_alpha, agent_beta, {
  objectives: ["optimal_resource_allocation", "safety_compliance"],
  constraints: ["explainability > 0.85"]
});`
    }
  ];

  // Load suggestions when code changes
  useEffect(() => {
    if (code && code.trim() !== '') {
      analyzeCode();
    }
  }, [code]);

  const analyzeCode = async () => {
    if (!code || code.trim() === '') return;
    
    setAnalyzing(true);
    try {
      // Simulate API call to analyze code - in a real implementation, this would call the backend
      // const response = await apiRequest("POST", "/api/ai/assistant/analyze", { code });
      
      // Instead of an actual API call, we'll generate some fake suggestions based on the code content
      const generatedSuggestions = [];
      const generatedExplanations = [];
      
      if (code.includes('QKD_INIT')) {
        generatedSuggestions.push(
          `// Add quantum key verification\nVERIFY_QKD("${code.match(/QKD_INIT\("([^"]+)"/) ? code.match(/QKD_INIT\("([^"]+)"/)![1] : 'key_name'}");\n`
        );
        
        generatedExplanations.push({
          section: "Quantum Key Distribution",
          explanation: "Creates a secure quantum key between two parties using quantum entanglement. The key is resistant to eavesdropping due to the quantum no-cloning theorem."
        });
      }
      
      if (code.includes('AI_CONTRACT')) {
        generatedSuggestions.push(
          `// Add audit monitoring\nMONITOR_AUDIT_TRAIL(${code.match(/AI_CONTRACT\("([^"]+)"/) ? code.match(/AI_CONTRACT\("([^"]+)"/)![1] : 'contract_name'}, { frequency: "real-time" });\n`
        );
        
        generatedExplanations.push({
          section: "AI Governance Contract",
          explanation: "Defines formal governance parameters for AI operations, ensuring transparency, explainability, and human oversight throughout the AI execution lifecycle."
        });
      }
      
      if (code.includes('QUANTUM_GEOMETRY')) {
        generatedSuggestions.push(
          `// Compute topological invariants\nCOMPUTE_INVARIANTS({ spaceDimension: ${code.includes('dimension') ? code.match(/dimension:\s*(\d+)/)![1] : '3'} });\n`
        );
        
        generatedExplanations.push({
          section: "Quantum Geometric Space",
          explanation: "Defines a geometric framework for quantum computation based on topological properties, enabling more robust quantum operations through geometric phase manipulation."
        });
      }
      
      if (code.includes('AI_NEGOTIATE')) {
        generatedSuggestions.push(
          `// Verify negotiation outcomes\nVERIFY_NEGOTIATION_RESULT({ explainabilityThreshold: 0.9 });\n`
        );
        
        generatedExplanations.push({
          section: "AI-to-AI Negotiation",
          explanation: "Facilitates structured negotiation between AI agents with different expertise areas, ensuring they reach consensus while maintaining governance constraints."
        });
      }
      
      // If we have no specific suggestions, offer a general one
      if (generatedSuggestions.length === 0) {
        generatedSuggestions.push(
          `// Add error handling\nTRY_QUANTUM_OPERATION({\n  onError: (e) => REPORT_QUANTUM_ERROR(e)\n});\n`
        );
      }
      
      setSuggestions(generatedSuggestions);
      setExplanations(generatedExplanations);
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze code",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const sendChatMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = { role: 'user' as const, content: inputMessage };
    setChatHistory([...chatHistory, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call the backend
      // const response = await apiRequest("POST", "/api/ai/assistant/chat", { 
      //   message: userMessage.content,
      //   context: code
      // });
      
      // Simulated response - generate a response based on the query
      setTimeout(() => {
        let assistantResponse = '';
        
        if (userMessage.content.toLowerCase().includes('quantum')) {
          assistantResponse = "Quantum operations in SINGULARIS PRIME leverage geometric transformations to provide more stable qubit operations. You can use functions like QUANTUM_OPERATION and QUANTUM_GEOMETRY to define your quantum computation spaces.";
        } else if (userMessage.content.toLowerCase().includes('ai') || userMessage.content.toLowerCase().includes('governance')) {
          assistantResponse = "AI Governance in SINGULARIS PRIME is managed through formal contracts that specify explainability requirements, human oversight parameters, and audit mechanisms. The AI_CONTRACT directive is the primary way to implement these constraints.";
        } else if (userMessage.content.toLowerCase().includes('entangle')) {
          assistantResponse = "Entanglement is a core quantum phenomenon that SINGULARIS PRIME makes accessible through high-level abstractions. You can create entangled qubits using the QUANTUM_OPERATION directive with type: 'entanglement'.";
        } else if (userMessage.content.toLowerCase().includes('help') || userMessage.content.toLowerCase().includes('example')) {
          assistantResponse = "Here's a simple example of how to create a quantum circuit with error correction:\n\n```\nQUANTUM_OPERATION {\n  type: \"circuit\",\n  gates: [\"H\", \"CNOT\", \"T\"],\n  errorCorrection: true,\n  fidelity: 0.99\n}\n```";
        } else {
          assistantResponse = "I'm here to help with your SINGULARIS PRIME programming questions. I can explain quantum operations, AI governance contracts, or provide code examples. What specific aspect would you like to explore further?";
        }
        
        setChatHistory(current => [...current, { role: 'assistant', content: assistantResponse }]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Chat Failed",
        description: error instanceof Error ? error.message : "Failed to get assistant response",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };
  
  const handleSuggestionClick = (code: string) => {
    onCodeSuggestion(code);
    toast({
      title: "Code Suggestion Applied",
      description: "The suggestion has been added to your code"
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-11rem)]">
      <div className="p-4 space-y-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="suggestions" className="text-xs">
              <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-xs">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              AI Chat
            </TabsTrigger>
            <TabsTrigger value="explain" className="text-xs">
              <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
              Explain
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="mt-4 space-y-4">
            <div className="space-y-3">
              {/* Code-specific suggestions */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium flex items-center">
                    <BrainCircuit className="h-4 w-4 mr-1.5 text-indigo-400" />
                    Code Suggestions
                  </div>
                  {analyzing ? (
                    <Badge variant="outline" className="text-xs flex items-center">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Analyzing
                    </Badge>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={analyzeCode}
                    >
                      <Search className="h-3.5 w-3.5 mr-1" />
                      Analyze
                    </Button>
                  )}
                </div>
                
                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <Card key={index} className="overflow-hidden border-slate-800 bg-slate-900">
                        <CardContent className="p-3">
                          <div className="bg-slate-950 rounded p-2 font-mono text-xs overflow-x-auto mb-2">
                            <pre className="whitespace-pre-wrap">{suggestion}</pre>
                          </div>
                          <div className="flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <ArrowRight className="h-3 w-3 mr-1.5" />
                              Apply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : analyzing ? (
                  <div className="bg-slate-900 rounded-md p-4 text-center">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <p className="text-sm text-muted-foreground">Analyzing your code...</p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-md p-4 text-center">
                    <p className="text-sm text-muted-foreground">No specific suggestions for your current code.</p>
                  </div>
                )}
              </div>
              
              {/* Quantum templates */}
              <div className="space-y-1">
                <div className="text-sm font-medium flex items-center">
                  <Sparkles className="h-4 w-4 mr-1.5 text-purple-400" />
                  Template Snippets
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {preloadedSuggestions.map((suggestion, index) => (
                    <Card key={index} className="overflow-hidden border-slate-800 bg-slate-900">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs flex items-center">
                          <Puzzle className="h-3.5 w-3.5 mr-1.5 text-indigo-400" />
                          {suggestion.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="bg-slate-950 rounded p-2 font-mono text-xs overflow-x-auto max-h-24 scrollbar-thin">
                          <pre className="whitespace-pre-wrap">{suggestion.code}</pre>
                        </div>
                        <div className="flex justify-end mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleSuggestionClick(suggestion.code)}
                          >
                            <ArrowRight className="h-3 w-3 mr-1.5" />
                            Insert
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="mt-4">
            <Card className="border-slate-800 bg-slate-900">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm flex items-center">
                  <Bot className="h-4 w-4 mr-1.5 text-indigo-400" />
                  SINGULARIS PRIME Assistant
                </CardTitle>
                <CardDescription className="text-xs">
                  Ask questions about quantum programming and AI governance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3">
                <div className="bg-slate-950 rounded-md p-3 h-[calc(100vh-22rem)] flex flex-col">
                  <div className="flex-grow overflow-y-auto space-y-3 mb-3">
                    {chatHistory.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] rounded-lg px-3 py-2 ${
                            message.role === 'user' 
                              ? 'bg-indigo-700/70 text-white' 
                              : 'bg-slate-800 text-slate-100'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="flex items-center text-xs text-indigo-300 mb-1">
                              <Bot className="h-3 w-3 mr-1" />
                              SINGULARIS Assistant
                            </div>
                          )}
                          <div className="text-xs whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-lg px-3 py-2 text-slate-100 max-w-[85%]">
                          <div className="flex items-center text-xs text-indigo-300 mb-1">
                            <Bot className="h-3 w-3 mr-1" />
                            SINGULARIS Assistant
                          </div>
                          <div className="text-xs flex items-center">
                            <motion.div
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="flex items-center"
                            >
                              <span className="mr-2">Thinking</span>
                              <span className="flex space-x-1">
                                <span className="w-1 h-1 bg-indigo-400 rounded-full inline-block"></span>
                                <span className="w-1 h-1 bg-indigo-400 rounded-full inline-block"></span>
                                <span className="w-1 h-1 bg-indigo-400 rounded-full inline-block"></span>
                              </span>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask about quantum programming..."
                      className="flex-grow bg-slate-800 border-slate-700 rounded text-xs py-2 px-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Button 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={sendChatMessage}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="explain" className="mt-4">
            <Card className="border-slate-800 bg-slate-900">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Terminal className="h-4 w-4 mr-1.5 text-indigo-400" />
                  Code Explanation
                </CardTitle>
                <CardDescription className="text-xs">
                  Understand quantum operations and AI governance
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                {explanations.length > 0 ? (
                  <div className="space-y-3">
                    {explanations.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="text-xs font-medium text-indigo-400">{item.section}</div>
                        <div className="bg-slate-950 rounded p-3 text-xs">
                          {item.explanation}
                        </div>
                      </div>
                    ))}
                    
                    <Separator className="my-3" />
                    
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-indigo-400">Learning Resources</div>
                      <div className="space-y-2">
                        <div className="bg-slate-950 rounded p-2 text-xs flex items-center">
                          <div className="h-6 w-6 bg-blue-500/20 rounded-full flex items-center justify-center mr-2">
                            <Code className="h-3.5 w-3.5 text-blue-400" />
                          </div>
                          <div>
                            <div className="font-medium">Quantum Computing Fundamentals</div>
                            <div className="text-muted-foreground text-[10px]">Understanding quantum states, gates, and circuits</div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-950 rounded p-2 text-xs flex items-center">
                          <div className="h-6 w-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-2">
                            <BrainCircuit className="h-3.5 w-3.5 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-medium">AI Governance Protocols</div>
                            <div className="text-muted-foreground text-[10px]">Implementing transparent and explainable AI systems</div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-950 rounded p-2 text-xs flex items-center">
                          <div className="h-6 w-6 bg-teal-500/20 rounded-full flex items-center justify-center mr-2">
                            <GitMerge className="h-3.5 w-3.5 text-teal-400" />
                          </div>
                          <div>
                            <div className="font-medium">Quantum-AI Integration</div>
                            <div className="text-muted-foreground text-[10px]">Bridging quantum computing with artificial intelligence</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : analyzing ? (
                  <div className="bg-slate-950 rounded-md p-8 text-center">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <p className="text-sm text-muted-foreground">Analyzing your code...</p>
                    </motion.div>
                  </div>
                ) : (
                  <div className="bg-slate-950 rounded-md p-8 text-center">
                    <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No code detected to explain. Add some SINGULARIS PRIME code to receive explanations.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}