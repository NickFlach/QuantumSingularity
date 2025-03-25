import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Atom, Code, Sparkles, Zap, FileCode, Copy } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface QuantumExperimentToCodeProps {
  experimentId?: string;
  onCodeGenerated: (code: string) => void;
}

export function QuantumExperimentToCode({ experimentId, onCodeGenerated }: QuantumExperimentToCodeProps) {
  const [generating, setGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [codeDescription, setCodeDescription] = useState<string>("");
  const [codeType, setCodeType] = useState<"quantum" | "ai" | "hybrid">("quantum");
  const { toast } = useToast();

  const codeTemplates = {
    quantum: `// SINGULARIS PRIME Quantum Template
QKD_INIT("${Date.now()}", "local", "remote");

// Define quantum space
QUANTUM_GEOMETRY {
  dimension: 3,
  metric: "minkowski",
  energyDensity: 0.85
}

// Main quantum operations
QUANTUM_OPERATION {
  type: "entanglement",
  target: "qubits[0:3]",
  fidelity: 0.99
}

// Execute with error correction
EXECUTE_WITH_CORRECTION();
`,
    ai: `// SINGULARIS PRIME AI Governance Template
AI_CONTRACT("negotiator_prime", 0.85, quantumKey1) {
  explainability: HIGH,
  auditTrail: ENABLED,
  humanFallback: TRUE
}

// Define key entities
DEFINE_AI_ENTITY("primary_agent", {
  expertise: ["negotiation", "transparency"],
  trustLevel: 0.95
});

DEFINE_AI_ENTITY("secondary_agent", {
  expertise: ["verification", "audit"],
  trustLevel: 0.92
});

// Negotiate terms
AI_NEGOTIATE(
  primary_agent, 
  secondary_agent, 
  {
    objectives: ["transparent_operation", "efficiency"],
    constraints: ["explainability > 0.85"]
  }
);

// Verify outcomes
AI_VERIFY(results);
`,
    hybrid: `// SINGULARIS PRIME Hybrid Quantum-AI Template
QKD_INIT("${Date.now()}", "processor_1", "processor_2");

// Initialize quantum geometry for computation
QUANTUM_GEOMETRY {
  dimension: 4,
  metric: "hyperbolic",
  energyDensity: 0.92,
  topologicalProperties: ["connected", "orientable"]
}

// Define AI contract with quantum key verification
AI_CONTRACT("quantum_enhanced", 0.90, currentQKD) {
  explainability: HIGH,
  quantumVerification: ENABLED
}

// Quantum-enhanced AI decision process
QUANTUM_DECISION("strategic_agent", "superposition", {
  contextData: "market_conditions",
  quantumAmplification: TRUE,
  uncertaintyThreshold: 0.15
});

// Resolve quantum paradoxes through AI
PARADOX_RESOLVE("uncertainty_relation", "neural_topology", 500);

// Deploy with quantum cryptographic verification
DEPLOY_WITH_VERIFICATION();
`
  };

  const generateCode = async () => {
    if (!codeDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide a description of the code you want to generate",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      // If we have an actual experimentId, we could fetch experiment details
      // and use them to generate more personalized code
      if (experimentId) {
        // This would be the actual API call in a production system
        // const response = await apiRequest<{code: string}>("POST", "/api/quantum/generate-code", {
        //   experimentId,
        //   description: codeDescription,
        //   type: codeType
        // });
        // setGeneratedCode(response.code);
      }

      // For now, we'll use the template as a starting point and customize it slightly
      let template = codeTemplates[codeType];
      
      // Add some custom comments based on the description
      const customizedCode = template.replace(
        "// Main quantum operations", 
        `// Main quantum operations\n// Purpose: ${codeDescription}`
      );
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGeneratedCode(customizedCode);

      toast({
        title: "Code Generated",
        description: "SINGULARIS PRIME code template has been generated based on your experiment"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: "Copied to Clipboard",
      description: "The code has been copied to your clipboard"
    });
  };

  const useGeneratedCode = () => {
    onCodeGenerated(generatedCode);
    toast({
      title: "Code Applied",
      description: "The generated code has been applied to the editor"
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600">
          <Atom className="h-4 w-4" />
          <span>Generate Singularis Code</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>Quantum Experiment to Singularis Prime Code</span>
          </DialogTitle>
          <DialogDescription>
            Transform your quantum experiments into executable SINGULARIS PRIME code
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Tabs defaultValue="quantum" onValueChange={(value) => setCodeType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quantum" className="flex items-center gap-2">
                <Atom className="h-4 w-4" />
                <span>Quantum</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>AI Governance</span>
              </TabsTrigger>
              <TabsTrigger value="hybrid" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Hybrid</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="quantum">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Quantum Operations</CardTitle>
                  <CardDescription>Generate quantum computing operations with built-in error correction</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This template includes quantum key distribution, geometric quantum space definition, and entanglement operations.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>AI Governance</CardTitle>
                  <CardDescription>Generate explainable AI contracts and negotiation protocols</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This template includes AI entity definitions, contract formation, negotiation protocols, and verification procedures.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hybrid">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Hybrid Quantum-AI</CardTitle>
                  <CardDescription>Combine quantum operations with AI governance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    This template integrates quantum key distribution with AI contracts, quantum-enhanced decision making, and paradox resolution.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Describe what you want the code to do:
            </label>
            <Textarea
              id="description"
              value={codeDescription}
              onChange={(e) => setCodeDescription(e.target.value)}
              placeholder="e.g., Create a quantum circuit that demonstrates superposition and entanglement, optimized for high fidelity..."
              className="min-h-[100px]"
            />
          </div>
          
          {generatedCode && (
            <Card className="mt-4 border border-purple-500/20">
              <CardHeader className="pb-2 bg-slate-900 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-purple-400" />
                    <span>SINGULARIS PRIME Code</span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={copyToClipboard}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <pre className="bg-slate-950 p-4 rounded-md overflow-x-auto text-xs font-mono text-green-400">
                  {generatedCode}
                </pre>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={useGeneratedCode}
                  className="text-xs"
                >
                  Use in IDE
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={generateCode} 
            disabled={generating || !codeDescription.trim()}
            className="gap-2"
          >
            {generating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Code className="h-4 w-4" />
                <span>Generate Code</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}