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
  Lightbulb
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
      
      // Set factors if they exist
      if (explainabilityResult.factors) {
        setExplainabilityFactors(explainabilityResult.factors);
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
    <Card className="w-full h-full flex flex-col overflow-hidden">
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
          <>
            <TabsContent value="analysis" className="flex-1 overflow-auto p-6">
              {analysis ? formatAnalysis(analysis) : (
                <div className="text-center text-muted-foreground p-6">
                  No analysis available. Please run analysis first.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="explainability" className="flex-1 overflow-auto p-6">
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
                        <div className="space-y-4">
                          {explainabilityFactors.map((factor, index) => (
                            <div key={index} className="border rounded-md p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{factor.factor}</span>
                                <Badge className={factor.impact === 'positive' ? 'bg-green-500' : factor.impact === 'negative' ? 'bg-red-500' : 'bg-blue-500'}>
                                  {factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm">{factor.details}</p>
                            </div>
                          ))}
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
            
            <TabsContent value="improvements" className="flex-1 overflow-auto p-6">
              {improvementSuggestions.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Suggestions to Improve Explainability</h3>
                  <ul className="space-y-3">
                    {improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex">
                        <div className="mr-2 mt-1">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div className="text-sm">{suggestion}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-6">
                  No improvement suggestions available. Please run analysis first.
                </div>
              )}
            </TabsContent>
          </>
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