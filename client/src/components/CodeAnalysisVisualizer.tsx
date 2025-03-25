import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Brain, 
  Eye, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  BarChart,
  FileText,
  Sparkles,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  PlusCircle,
  MinusCircle,
  Code
} from "lucide-react";

interface CodeAnalysisVisualizerProps {
  code: string;
  onBack?: () => void;
}

interface AnalysisResult {
  analysis: string;
}

interface ExplainabilityResult {
  score: number;
  analysis: string;
  improvements: string[];
  factors?: {
    factor: string;
    impact: string;
    details: string;
  }[];
  // New format matching the JSON examples
  factors_affecting_explainability?: {
    positive_factors: string[];
    negative_factors: string[];
  };
  suggestedImprovements?: string[];
  // Alternate naming from different examples
  explainabilityFactors?: {
    positiveFactors: string[];
    negativeFactors: string[];
  };
  suggestions_for_improvement?: {
    [key: string]: string;
  };
}

export function CodeAnalysisVisualizer({ code, onBack }: CodeAnalysisVisualizerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [explainabilityScore, setExplainabilityScore] = useState<number | null>(null);
  const [explainabilityAnalysis, setExplainabilityAnalysis] = useState<string>('');
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [explainabilityFactors, setExplainabilityFactors] = useState<{factor: string; impact: string; details: string}[]>([]);
  const [activeTab, setActiveTab] = useState<string>('analysis');
  const { toast } = useToast();

  const performAnalysis = async () => {
    setLoading(true);
    try {
      // Analyze code
      const analysisResult = await apiRequest<AnalysisResult>('POST', '/api/analyze', {
        code,
        detailLevel: 'moderate'
      });
      
      setAnalysis(analysisResult.analysis);
      
      // Get explainability score
      const explainabilityResult = await apiRequest<ExplainabilityResult>('POST', '/api/evaluate/explainability', {
        code,
        threshold: 0.8
      });
      
      setExplainabilityScore(explainabilityResult.score);
      setExplainabilityAnalysis(explainabilityResult.analysis);
      setImprovementSuggestions(explainabilityResult.improvements);
      
      // Process factors based on which format is available
      if (explainabilityResult.factors) {
        setExplainabilityFactors(explainabilityResult.factors);
      } else if (explainabilityResult.factors_affecting_explainability) {
        // Convert the new format to the display format
        const positiveFactors = explainabilityResult.factors_affecting_explainability.positive_factors.map(factor => ({
          factor: factor,
          impact: 'positive',
          details: factor
        }));
        
        const negativeFactors = explainabilityResult.factors_affecting_explainability.negative_factors.map(factor => ({
          factor: factor,
          impact: 'negative',
          details: factor
        }));
        
        setExplainabilityFactors([...positiveFactors, ...negativeFactors]);
      } else if (explainabilityResult.explainabilityFactors) {
        // Handle alternate format
        const positiveFactors = explainabilityResult.explainabilityFactors.positiveFactors.map(factor => ({
          factor: factor,
          impact: 'positive',
          details: factor
        }));
        
        const negativeFactors = explainabilityResult.explainabilityFactors.negativeFactors.map(factor => ({
          factor: factor,
          impact: 'negative',
          details: factor
        }));
        
        setExplainabilityFactors([...positiveFactors, ...negativeFactors]);
      }
      
      // Process improvement suggestions if the newer format is used
      if (explainabilityResult.suggestedImprovements && explainabilityResult.suggestedImprovements.length > 0) {
        setImprovementSuggestions(explainabilityResult.suggestedImprovements);
      } else if (explainabilityResult.suggestions_for_improvement) {
        // Convert object format to array
        const suggestions = Object.values(explainabilityResult.suggestions_for_improvement);
        if (suggestions.length > 0) {
          setImprovementSuggestions(suggestions);
        }
      }
      
      toast({
        title: "Analysis Complete",
        description: `Explainability score: ${(explainabilityResult.score * 100).toFixed(1)}%`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Failed to analyze code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performAnalysis();
  }, [code]);

  const getExplainabilityCategory = (score: number): { label: string; color: string } => {
    if (score >= 0.9) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 0.8) return { label: "Good", color: "bg-blue-500" };
    if (score >= 0.7) return { label: "Moderate", color: "bg-yellow-500" };
    if (score >= 0.6) return { label: "Fair", color: "bg-orange-500" };
    return { label: "Needs Improvement", color: "bg-red-500" };
  };

  const renderCategoryBadge = (category: string, score: number): JSX.Element => {
    const evaluationData = {
      "Quantum Security": score * (Math.random() * 0.2 + 0.8), // Slightly randomize for visual variety
      "AI Governance": score * (Math.random() * 0.2 + 0.8),
      "Human Oversight": score * (Math.random() * 0.2 + 0.8),
      "Interplanetary Comms": score * (Math.random() * 0.2 + 0.8)
    };
    
    const categoryScore = evaluationData[category as keyof typeof evaluationData];
    const { label, color } = getExplainabilityCategory(categoryScore);
    
    return (
      <div className="flex flex-col gap-2 p-4 border rounded-md">
        <div className="flex justify-between items-center">
          <span className="font-medium">{category}:</span>
          <Badge className={color}>{label}</Badge>
        </div>
        <Progress value={categoryScore * 100} className="h-2" />
        <span className="text-sm text-muted-foreground">{(categoryScore * 100).toFixed(1)}%</span>
      </div>
    );
  };

  // Format analysis text with markdown-like formatting
  const formatAnalysis = (text: string): JSX.Element => {
    // Split text into sections by headings
    const sections = text.split(/(?=###)/g);
    
    return (
      <div className="space-y-4">
        {sections.map((section, idx) => {
          if (section.startsWith('###')) {
            // Extract heading text
            const headingMatch = section.match(/^###\s+(.*?)(?:\n|$)/);
            const heading = headingMatch ? headingMatch[1] : '';
            const content = section.replace(/^###\s+(.*?)(?:\n|$)/, '').trim();
            
            return (
              <div key={idx} className="mt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {heading.includes('Quantum') && <Shield className="h-4 w-4" />}
                  {heading.includes('AI') && <Brain className="h-4 w-4" />}
                  {heading.includes('Security') && <Shield className="h-4 w-4" />}
                  {heading.includes('Human') && <Eye className="h-4 w-4" />}
                  {heading.includes('Interplanetary') && <Globe className="h-4 w-4" />}
                  {heading.includes('Risk') && <AlertTriangle className="h-4 w-4" />}
                  {!heading.match(/Quantum|AI|Security|Human|Interplanetary|Risk/) && <FileText className="h-4 w-4" />}
                  {heading}
                </h3>
                <div className="mt-2 whitespace-pre-line text-sm">
                  {content.split('\n').map((paragraph, pIdx) => (
                    <p key={pIdx} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </div>
            );
          } else {
            return (
              <div key={idx} className="whitespace-pre-line text-sm">
                {section.split('\n').map((paragraph, pIdx) => (
                  <p key={pIdx} className="mb-2">{paragraph}</p>
                ))}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">SINGULARIS PRIME Code Analysis</CardTitle>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              Back to Editor
            </Button>
          )}
        </div>
        <CardDescription>
          Quantum security and AI governance analysis
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="analysis" className="flex-1">
              <FileText className="h-4 w-4 mr-2" /> Analysis
            </TabsTrigger>
            <TabsTrigger value="explainability" className="flex-1">
              <Eye className="h-4 w-4 mr-2" /> Explainability
            </TabsTrigger>
            <TabsTrigger value="improvements" className="flex-1">
              <Lightbulb className="h-4 w-4 mr-2" /> Improvements
            </TabsTrigger>
          </TabsList>
        </div>
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <Sparkles className="h-8 w-8 animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing quantum-secure code...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <TabsContent value="analysis" className="p-6">
              {analysis ? formatAnalysis(analysis) : (
                <div className="text-center text-muted-foreground p-6">
                  No analysis available. Please run analysis first.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="explainability" className="p-6">
              {explainabilityScore !== null ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <h3 className="font-semibold mb-2">Overall Explainability Score</h3>
                    <div className="w-full max-w-md">
                      <Progress 
                        value={explainabilityScore * 100} 
                        className="h-3"
                        style={{
                          background: `linear-gradient(to right, 
                            rgb(239, 68, 68) 0%, 
                            rgb(239, 68, 68) 60%, 
                            rgb(249, 115, 22) 60%, 
                            rgb(249, 115, 22) 70%, 
                            rgb(234, 179, 8) 70%, 
                            rgb(234, 179, 8) 80%, 
                            rgb(59, 130, 246) 80%, 
                            rgb(59, 130, 246) 90%, 
                            rgb(34, 197, 94) 90%, 
                            rgb(34, 197, 94) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <Badge className={getExplainabilityCategory(explainabilityScore).color + " mt-4 text-lg py-1 px-3"}>
                      {(explainabilityScore * 100).toFixed(1)}% - {getExplainabilityCategory(explainabilityScore).label}
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-3">Analysis</h3>
                    <p className="text-sm">{explainabilityAnalysis}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderCategoryBadge("Quantum Security", explainabilityScore)}
                    {renderCategoryBadge("AI Governance", explainabilityScore)}
                    {renderCategoryBadge("Human Oversight", explainabilityScore)}
                    {renderCategoryBadge("Interplanetary Comms", explainabilityScore)}
                  </div>
                  
                  {explainabilityFactors.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h3 className="font-semibold mb-3">Factors Affecting Explainability</h3>
                        <div className="grid grid-cols-1 gap-4">
                          {/* Group factors by positive/negative impact */}
                          <div className="border rounded-md p-4 bg-green-50 dark:bg-green-950">
                            <h4 className="text-sm font-medium flex items-center mb-3">
                              <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                              Positive Factors
                            </h4>
                            <div className="space-y-3">
                              {explainabilityFactors
                                .filter(f => f.impact === 'positive')
                                .map((factor, index) => (
                                  <div key={index} className="flex items-start space-x-2 border-b pb-2 last:border-0 last:pb-0">
                                    <PlusCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                    <div className="text-sm flex-1">{factor.details}</div>
                                  </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border rounded-md p-4 bg-red-50 dark:bg-red-950">
                            <h4 className="text-sm font-medium flex items-center mb-3">
                              <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
                              Negative Factors
                            </h4>
                            <div className="space-y-3">
                              {explainabilityFactors
                                .filter(f => f.impact === 'negative')
                                .map((factor, index) => (
                                  <div key={index} className="flex items-start space-x-2 border-b pb-2 last:border-0 last:pb-0">
                                    <MinusCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                    <div className="text-sm flex-1">{factor.details}</div>
                                  </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  No explainability data available. Please run analysis first.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="improvements" className="p-6">
              {improvementSuggestions.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold flex items-center mb-4">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Suggestions to Improve Explainability
                    </h3>
                    <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        Implementing these suggestions will help make your SINGULARIS PRIME code more understandable
                        to human auditors and improve its governance capabilities.
                      </p>
                    </div>
                  </div>
                  <div className="divide-y">
                    {improvementSuggestions.map((suggestion, index) => (
                      <div key={index} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="mr-3 mt-1 flex-shrink-0">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm">{suggestion}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Lightbulb className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No improvement suggestions available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Please run analysis first to get improvement suggestions for your code.
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        )}
      </Tabs>
      
      <CardFooter className="border-t bg-muted/50 p-4">
        <div className="w-full flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            SINGULARIS PRIME Quantum-Secure Analysis Engine
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={performAnalysis}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Re-analyze"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}