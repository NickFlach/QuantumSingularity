import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Check, GanttChart, SparkleIcon, Zap, Layers, BarChart } from "lucide-react";

interface OptimizationDirectivesPanelProps {
  code: string;
  onApplyDirectives: (directives: string[]) => void;
}

type OptimizationGoal = 'fidelity' | 'gate_count' | 'depth' | 'error_mitigation' | 'execution_time' | 'explainability';
type OptimizationMethod = 'gradient_descent' | 'quantum_annealing' | 'tensor_network' | 'reinforcement_learning' | 'heuristic';
type CircuitPriority = 'critical' | 'approximate_ok' | 'error_tolerant';

export function OptimizationDirectivesPanel({ code, onApplyDirectives }: OptimizationDirectivesPanelProps) {
  const [selectedGoal, setSelectedGoal] = useState<OptimizationGoal>('fidelity');
  const [selectedMethod, setSelectedMethod] = useState<OptimizationMethod>('gradient_descent');
  const [selectedPriority, setSelectedPriority] = useState<CircuitPriority>('critical');
  const [threshold, setThreshold] = useState<number>(0.85);
  const [parameters, setParameters] = useState({
    iterations: 500,
    learningRate: 0.01,
    errorThreshold: 0.001
  });

  // Generate directives from current settings
  const generateDirectives = (): string[] => {
    const directives = [`@optimize_for_${selectedGoal}`];
    
    directives.push(`@use_method(${selectedMethod})`);
    directives.push(`@set_priority(${selectedPriority})`);
    directives.push(`@set_threshold(${threshold})`);
    
    Object.entries(parameters).forEach(([key, value]) => {
      directives.push(`@set_parameter(${key}=${value})`);
    });
    
    return directives;
  };

  const handleApply = () => {
    const directives = generateDirectives();
    onApplyDirectives(directives);
  };

  const goalIcons = {
    fidelity: <SparkleIcon className="h-4 w-4 text-[#CBA6F7]" />,
    gate_count: <Layers className="h-4 w-4 text-[#89B4FA]" />,
    depth: <GanttChart className="h-4 w-4 text-[#94E2D5]" />,
    error_mitigation: <Check className="h-4 w-4 text-[#A6E3A1]" />,
    execution_time: <Zap className="h-4 w-4 text-[#F9E2AF]" />,
    explainability: <Activity className="h-4 w-4 text-[#FAB387]" />
  };

  const goalDescriptions = {
    fidelity: "Optimize for highest quantum state fidelity",
    gate_count: "Minimize the number of quantum gates",
    depth: "Minimize circuit depth for parallel execution",
    error_mitigation: "Maximize error correction and resilience",
    execution_time: "Optimize for fastest runtime performance",
    explainability: "Maximize human-understandability of operations"
  };

  const methodDescriptions = {
    gradient_descent: "Mathematical optimization using gradients",
    quantum_annealing: "Quantum-based optimization technique",
    tensor_network: "Advanced tensor contraction optimization",
    reinforcement_learning: "AI learning through environmental feedback",
    heuristic: "Rule-based optimization with domain knowledge"
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-medium mb-2">AI Optimization Directives</h3>
      <p className="text-xs text-[#A6ADC8] mb-4">
        Add AI-powered optimization directives to your quantum circuits and operations.
      </p>

      <ScrollArea className="flex-grow">
        <div className="space-y-4">
          <Card className="bg-[#11111B] border-[#313244]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <BarChart className="h-4 w-4 mr-2 text-[#CBA6F7]" />
                Optimization Goal
              </CardTitle>
              <CardDescription className="text-xs">
                Select the primary objective for optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(goalIcons) as OptimizationGoal[]).map(goal => (
                  <div
                    key={goal}
                    className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer border ${
                      selectedGoal === goal 
                        ? 'border-[#CBA6F7] bg-[#CBA6F7]/10' 
                        : 'border-[#313244] hover:border-[#45475A]'
                    }`}
                    onClick={() => setSelectedGoal(goal)}
                  >
                    <div>{goalIcons[goal]}</div>
                    <div>
                      <p className="text-xs font-medium">{goal.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-[#A6ADC8]">
                {goalDescriptions[selectedGoal]}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#11111B] border-[#313244]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Optimization Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Method</Label>
                <Select 
                  value={selectedMethod} 
                  onValueChange={(value) => setSelectedMethod(value as OptimizationMethod)}
                >
                  <SelectTrigger className="bg-[#1E1E2E] border-[#313244] text-xs h-8">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E2E] border-[#313244]">
                    {(Object.keys(methodDescriptions) as OptimizationMethod[]).map(method => (
                      <SelectItem key={method} value={method} className="text-xs">
                        {method.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#A6ADC8]">
                  {methodDescriptions[selectedMethod]}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Circuit Priority</Label>
                <Select 
                  value={selectedPriority} 
                  onValueChange={(value) => setSelectedPriority(value as CircuitPriority)}
                >
                  <SelectTrigger className="bg-[#1E1E2E] border-[#313244] text-xs h-8">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1E1E2E] border-[#313244]">
                    <SelectItem value="critical" className="text-xs">Critical</SelectItem>
                    <SelectItem value="approximate_ok" className="text-xs">Approximate OK</SelectItem>
                    <SelectItem value="error_tolerant" className="text-xs">Error Tolerant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-xs">Threshold</Label>
                  <span className="text-xs">{threshold.toFixed(2)}</span>
                </div>
                <Slider 
                  value={[threshold]} 
                  min={0} 
                  max={1} 
                  step={0.01} 
                  onValueChange={(values) => setThreshold(values[0])}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#11111B] border-[#313244]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Advanced Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-xs">Iterations</Label>
                  <input
                    type="number"
                    min={10}
                    max={10000}
                    value={parameters.iterations}
                    onChange={(e) => setParameters({...parameters, iterations: parseInt(e.target.value)})}
                    className="col-span-2 h-8 rounded-md border border-[#313244] bg-[#1E1E2E] px-3 py-1 text-xs"
                  />
                </div>
                
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-xs">Learning Rate</Label>
                  <input
                    type="number"
                    min={0.0001}
                    max={1}
                    step={0.001}
                    value={parameters.learningRate}
                    onChange={(e) => setParameters({...parameters, learningRate: parseFloat(e.target.value)})}
                    className="col-span-2 h-8 rounded-md border border-[#313244] bg-[#1E1E2E] px-3 py-1 text-xs"
                  />
                </div>
                
                <div className="grid grid-cols-3 items-center gap-2">
                  <Label className="text-xs">Error Threshold</Label>
                  <input
                    type="number"
                    min={0.0001}
                    max={0.1}
                    step={0.0001}
                    value={parameters.errorThreshold}
                    onChange={(e) => setParameters({...parameters, errorThreshold: parseFloat(e.target.value)})}
                    className="col-span-2 h-8 rounded-md border border-[#313244] bg-[#1E1E2E] px-3 py-1 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[#11111B] border-[#313244]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Generated Directives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#1E1E2E] p-3 rounded-md font-mono text-xs">
                {generateDirectives().map((directive, index) => (
                  <div key={index} className="text-[#CBA6F7]">{directive}</div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-[#CBA6F7] text-[#1E1E2E] hover:bg-[#CBA6F7]/90"
                onClick={handleApply}
              >
                Apply Optimization Directives
              </Button>
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}