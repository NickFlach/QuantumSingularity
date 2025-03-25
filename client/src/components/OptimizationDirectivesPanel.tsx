import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Gauge, 
  BarChart2, 
  ClipboardList, 
  BarChart, 
  Zap, 
  Clock, 
  Shield, 
  Layers, 
  Lightbulb,
  LayoutGrid,
  CpuIcon,
  ActivityIcon
} from "lucide-react";

export interface OptimizationDirectivesPanelProps {
  code: string;
  goal: string;
  method: string;
  priority: string;
  onGoalChange: (goal: string) => void;
  onMethodChange: (method: string) => void;
  onPriorityChange: (priority: string) => void;
  onOptimize: (params: {
    goal: string;
    method: string;
    priority: string;
    parameters: Record<string, number>;
  }) => Promise<void>;
}

export function OptimizationDirectivesPanel({
  code,
  goal = "fidelity",
  method = "gradient_descent",
  priority = "critical",
  onGoalChange,
  onMethodChange,
  onPriorityChange,
  onOptimize
}: OptimizationDirectivesPanelProps) {
  const [selectedTab, setSelectedTab] = useState<string>("goals");
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [parameters, setParameters] = useState<Record<string, number>>({
    learningRate: 0.01,
    iterations: 100,
    threshold: 0.95,
    regularization: 0.5,
    parallelism: 4
  });
  const [advancedOptions, setAdvancedOptions] = useState<Record<string, boolean>>({
    useQuantumBackend: true,
    enableValidation: true,
    cacheResults: true
  });
  
  const { toast } = useToast();

  const handleOptimize = async () => {
    setOptimizing(true);
    try {
      await onOptimize({
        goal,
        method,
        priority,
        parameters
      });
      
      toast({
        title: "Optimization Complete",
        description: `Successfully optimized code for ${goal}`
      });
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "Failed to optimize quantum circuits",
        variant: "destructive"
      });
    } finally {
      setOptimizing(false);
    }
  };

  const getGoalIcon = () => {
    switch (goal) {
      case "fidelity": return <Gauge className="h-4 w-4 text-blue-400" />;
      case "gate_count": return <LayoutGrid className="h-4 w-4 text-purple-400" />;
      case "depth": return <Layers className="h-4 w-4 text-indigo-400" />;
      case "error_mitigation": return <Shield className="h-4 w-4 text-teal-400" />;
      case "execution_time": return <Clock className="h-4 w-4 text-amber-400" />;
      case "explainability": return <Lightbulb className="h-4 w-4 text-rose-400" />;
      default: return <Gauge className="h-4 w-4 text-blue-400" />;
    }
  };
  
  const getMethodIcon = () => {
    switch (method) {
      case "gradient_descent": return <BarChart2 className="h-4 w-4 text-blue-400" />;
      case "quantum_annealing": return <CpuIcon className="h-4 w-4 text-purple-400" />;
      case "tensor_network": return <LayoutGrid className="h-4 w-4 text-indigo-400" />;
      case "reinforcement_learning": return <ActivityIcon className="h-4 w-4 text-teal-400" />;
      case "heuristic": return <ClipboardList className="h-4 w-4 text-amber-400" />;
      default: return <BarChart2 className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-11rem)]">
      <div className="p-4 space-y-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="goals" className="text-xs">
              <BarChart className="h-3.5 w-3.5 mr-1.5" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="methods" className="text-xs">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Methods
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="goals" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                <Gauge className="h-4 w-4 mr-2 text-blue-400" />
                Optimization Targets
              </h3>
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                {getGoalIcon()}
                <span className="ml-1 capitalize">{goal.replace('_', ' ')}</span>
              </Badge>
            </div>
            
            <div className="space-y-2">
              {/* Fidelity */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${goal === "fidelity" ? "bg-blue-950/20 border-blue-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onGoalChange("fidelity")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <Gauge className="h-4 w-4 mr-2 text-blue-400" />
                    Quantum Fidelity
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Optimize for accuracy of quantum operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Improves the accuracy of quantum operations by reducing noise and decoherence effects
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                    <Badge variant="secondary" className="justify-center">High Accuracy</Badge>
                    <Badge variant="secondary" className="justify-center">Error Resistant</Badge>
                    <Badge variant="secondary" className="justify-center">Stability</Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Gate Count */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${goal === "gate_count" ? "bg-purple-950/20 border-purple-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onGoalChange("gate_count")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <LayoutGrid className="h-4 w-4 mr-2 text-purple-400" />
                    Gate Count Reduction
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Minimize the number of quantum gates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Reduces circuit complexity by finding equivalent representations with fewer gates
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                    <Badge variant="secondary" className="justify-center">Simplicity</Badge>
                    <Badge variant="secondary" className="justify-center">Efficiency</Badge>
                    <Badge variant="secondary" className="justify-center">Less Error</Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Depth */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${goal === "depth" ? "bg-indigo-950/20 border-indigo-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onGoalChange("depth")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <Layers className="h-4 w-4 mr-2 text-indigo-400" />
                    Circuit Depth
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Reduce the critical path length of the circuit
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Optimizes parallel execution of quantum gates to reduce overall execution time
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                    <Badge variant="secondary" className="justify-center">Speed</Badge>
                    <Badge variant="secondary" className="justify-center">Parallel Ops</Badge>
                    <Badge variant="secondary" className="justify-center">Coherence</Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Error Mitigation */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${goal === "error_mitigation" ? "bg-teal-950/20 border-teal-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onGoalChange("error_mitigation")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-teal-400" />
                    Error Mitigation
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Reduce sensitivity to quantum noise
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Applies error-correction codes and noise-resistant gate sequences
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                    <Badge variant="secondary" className="justify-center">Resilient</Badge>
                    <Badge variant="secondary" className="justify-center">Robust</Badge>
                    <Badge variant="secondary" className="justify-center">Fault-Tolerant</Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Execution Time */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${goal === "execution_time" ? "bg-amber-950/20 border-amber-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onGoalChange("execution_time")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-400" />
                    Execution Time
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Minimize total execution time
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Optimizes for fastest possible execution on quantum hardware
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                    <Badge variant="secondary" className="justify-center">Performance</Badge>
                    <Badge variant="secondary" className="justify-center">Throughput</Badge>
                    <Badge variant="secondary" className="justify-center">Efficiency</Badge>
                  </div>
                </CardContent>
              </Card>
              
              {/* Explainability */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${goal === "explainability" ? "bg-rose-950/20 border-rose-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onGoalChange("explainability")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-rose-400" />
                    Explainability
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Improve clarity and understandability of operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Restructures quantum circuits to align with explainable patterns and formal verification
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-[10px]">
                    <Badge variant="secondary" className="justify-center">Transparency</Badge>
                    <Badge variant="secondary" className="justify-center">Governance</Badge>
                    <Badge variant="secondary" className="justify-center">Auditable</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="methods" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-400" />
                Optimization Methods
              </h3>
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                {getMethodIcon()}
                <span className="ml-1 capitalize">{method.replace('_', ' ')}</span>
              </Badge>
            </div>
            
            <div className="space-y-2">
              {/* Gradient Descent */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${method === "gradient_descent" ? "bg-blue-950/20 border-blue-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onMethodChange("gradient_descent")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-blue-400" />
                    Gradient Descent
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Classical optimization technique that iteratively adjusts parameters to minimize a cost function
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Best for: Continuous parameter optimization
                  </div>
                </CardContent>
              </Card>
              
              {/* Quantum Annealing */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${method === "quantum_annealing" ? "bg-purple-950/20 border-purple-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onMethodChange("quantum_annealing")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <CpuIcon className="h-4 w-4 mr-2 text-purple-400" />
                    Quantum Annealing
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Leverages quantum tunneling to find global minima in complex energy landscapes
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Best for: Combinatorial optimization problems
                  </div>
                </CardContent>
              </Card>
              
              {/* Tensor Network */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${method === "tensor_network" ? "bg-indigo-950/20 border-indigo-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onMethodChange("tensor_network")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <LayoutGrid className="h-4 w-4 mr-2 text-indigo-400" />
                    Tensor Network
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Represents quantum circuits as tensor networks to identify optimization opportunities
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Best for: Complex entanglement patterns
                  </div>
                </CardContent>
              </Card>
              
              {/* Reinforcement Learning */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${method === "reinforcement_learning" ? "bg-teal-950/20 border-teal-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onMethodChange("reinforcement_learning")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <ActivityIcon className="h-4 w-4 mr-2 text-teal-400" />
                    Reinforcement Learning
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    AI-driven approach that learns optimization strategies through exploration
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Best for: Adaptive optimization with feedback
                  </div>
                </CardContent>
              </Card>
              
              {/* Heuristic */}
              <Card 
                className={`border overflow-hidden cursor-pointer hover:bg-slate-900/50 ${method === "heuristic" ? "bg-amber-950/20 border-amber-800/30" : "border-slate-800 bg-slate-900"}`}
                onClick={() => onMethodChange("heuristic")}
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm flex items-center">
                    <ClipboardList className="h-4 w-4 mr-2 text-amber-400" />
                    Heuristic Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="text-xs text-slate-400">
                    Rule-based approach applying established quantum circuit equivalence rules
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    Best for: Fast optimization with proven techniques
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="border-t border-slate-800 pt-4">
              <h3 className="text-sm font-medium mb-2">Priority Level</h3>
              
              <div className="space-y-2">
                <div 
                  className={`rounded-md p-2 border ${priority === "critical" ? "bg-red-950/20 border-red-800/30" : "bg-slate-900 border-slate-800"} cursor-pointer flex items-center justify-between`}
                  onClick={() => onPriorityChange("critical")}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-xs">Critical</span>
                  </div>
                  <span className="text-xs text-slate-400">No approximations</span>
                </div>
                
                <div 
                  className={`rounded-md p-2 border ${priority === "approximate_ok" ? "bg-amber-950/20 border-amber-800/30" : "bg-slate-900 border-slate-800"} cursor-pointer flex items-center justify-between`}
                  onClick={() => onPriorityChange("approximate_ok")}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-xs">Balanced</span>
                  </div>
                  <span className="text-xs text-slate-400">Some approximations</span>
                </div>
                
                <div 
                  className={`rounded-md p-2 border ${priority === "error_tolerant" ? "bg-green-950/20 border-green-800/30" : "bg-slate-900 border-slate-800"} cursor-pointer flex items-center justify-between`}
                  onClick={() => onPriorityChange("error_tolerant")}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-xs">Tolerant</span>
                  </div>
                  <span className="text-xs text-slate-400">Aggressive optimizations</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4 space-y-4">
            <Card className="border-slate-800 bg-slate-900">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm">Optimization Parameters</CardTitle>
                <CardDescription className="text-xs">
                  Fine-tune the optimization process
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-2 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="learningRate" className="text-xs">Learning Rate</Label>
                    <Badge variant="outline" className="text-xs">{parameters.learningRate}</Badge>
                  </div>
                  <Slider 
                    id="learningRate"
                    min={0.001} 
                    max={0.1} 
                    step={0.001}
                    value={[parameters.learningRate]} 
                    onValueChange={(value) => setParameters({...parameters, learningRate: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="iterations" className="text-xs">Max Iterations</Label>
                    <Badge variant="outline" className="text-xs">{parameters.iterations}</Badge>
                  </div>
                  <Slider 
                    id="iterations"
                    min={10} 
                    max={500} 
                    step={10}
                    value={[parameters.iterations]} 
                    onValueChange={(value) => setParameters({...parameters, iterations: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="threshold" className="text-xs">Convergence Threshold</Label>
                    <Badge variant="outline" className="text-xs">{parameters.threshold}</Badge>
                  </div>
                  <Slider 
                    id="threshold"
                    min={0.8} 
                    max={0.999} 
                    step={0.001}
                    value={[parameters.threshold]} 
                    onValueChange={(value) => setParameters({...parameters, threshold: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="regularization" className="text-xs">Regularization</Label>
                    <Badge variant="outline" className="text-xs">{parameters.regularization}</Badge>
                  </div>
                  <Slider 
                    id="regularization"
                    min={0} 
                    max={1} 
                    step={0.01}
                    value={[parameters.regularization]} 
                    onValueChange={(value) => setParameters({...parameters, regularization: value[0]})}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="parallelism" className="text-xs">Parallelism</Label>
                    <Badge variant="outline" className="text-xs">{parameters.parallelism}</Badge>
                  </div>
                  <Slider 
                    id="parallelism"
                    min={1} 
                    max={16} 
                    step={1}
                    value={[parameters.parallelism]} 
                    onValueChange={(value) => setParameters({...parameters, parallelism: value[0]})}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-slate-800 bg-slate-900">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm">Advanced Options</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="useQuantumBackend" className="text-xs">Use Quantum Backend</Label>
                      <p className="text-[10px] text-muted-foreground">Run optimization on quantum hardware</p>
                    </div>
                    <Switch
                      id="useQuantumBackend"
                      checked={advancedOptions.useQuantumBackend}
                      onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, useQuantumBackend: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableValidation" className="text-xs">Enable Validation</Label>
                      <p className="text-[10px] text-muted-foreground">Validate optimized circuits against original</p>
                    </div>
                    <Switch
                      id="enableValidation"
                      checked={advancedOptions.enableValidation}
                      onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, enableValidation: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="cacheResults" className="text-xs">Cache Results</Label>
                      <p className="text-[10px] text-muted-foreground">Store optimization results for future use</p>
                    </div>
                    <Switch
                      id="cacheResults"
                      checked={advancedOptions.cacheResults}
                      onCheckedChange={(checked) => setAdvancedOptions({...advancedOptions, cacheResults: checked})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
          onClick={handleOptimize}
          disabled={optimizing || !code || code.trim() === ''}
        >
          {optimizing ? (
            <>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-2 h-4 w-4"
              >
                <Zap className="h-4 w-4" />
              </motion.div>
              Optimizing Quantum Circuits...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Apply {goal.replace('_', ' ')} Optimization
            </>
          )}
        </Button>
      </div>
    </ScrollArea>
  );
}