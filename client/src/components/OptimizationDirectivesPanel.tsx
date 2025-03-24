import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CirclePlus, 
  Sparkles, 
  Trash2, 
  ArrowRight, 
  Info,
  Settings, 
  Workflow,
  Target,
  ClipboardCheck
} from "lucide-react";

import { 
  OptimizationGoal, 
  OptimizationMethod, 
  CircuitPriority 
} from "@/lib/SingularisCompiler";
import { 
  parseOptimizationDirectives,
  generateOptimizationSuggestions
} from "@/lib/OptimizationDirectives";

interface OptimizationDirectivesProps {
  code: string;
  onApplyDirectives: (directives: string[]) => void;
}

interface DirectiveItem {
  type: 'goal' | 'method' | 'priority' | 'threshold' | 'parameter';
  value: string;
  parameter?: string;
}

export function OptimizationDirectivesPanel({ code, onApplyDirectives }: OptimizationDirectivesProps) {
  const [directives, setDirectives] = useState<DirectiveItem[]>([]);
  const [goalValue, setGoalValue] = useState<OptimizationGoal>("fidelity");
  const [methodValue, setMethodValue] = useState<OptimizationMethod>("gradient_descent");
  const [priorityValue, setPriorityValue] = useState<CircuitPriority>("critical");
  const [thresholdValue, setThresholdValue] = useState("0.9");
  const [paramName, setParamName] = useState("");
  const [paramValue, setParamValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [directiveSuggestions, setDirectiveSuggestions] = useState<string[]>([]);
  
  // Generate optimization suggestions based on the provided code
  const generateSuggestions = () => {
    const { suggestions, directives } = generateOptimizationSuggestions(code);
    setSuggestions(suggestions);
    setDirectiveSuggestions(directives);
  };
  
  // Add a directive to the list
  const addDirective = (type: DirectiveItem['type'], value: string, parameter?: string) => {
    setDirectives([...directives, { type, value, parameter }]);
  };
  
  // Remove a directive from the list
  const removeDirective = (index: number) => {
    const newDirectives = [...directives];
    newDirectives.splice(index, 1);
    setDirectives(newDirectives);
  };
  
  // Apply the directives to the code
  const applyDirectives = () => {
    const directiveStrings = directives.map(directive => {
      switch (directive.type) {
        case 'goal':
          return `// @optimize_for_${directive.value}`;
        case 'method':
          return `// @use_method(${directive.value})`;
        case 'priority':
          return `// @set_priority(${directive.value})`;
        case 'threshold':
          return `// @set_threshold(${directive.value})`;
        case 'parameter':
          return `// @set_parameter(${directive.parameter}=${directive.value})`;
        default:
          return '';
      }
    });
    
    onApplyDirectives(directiveStrings);
  };
  
  // Apply suggested directives
  const applySuggestions = () => {
    onApplyDirectives(directiveSuggestions);
  };
  
  return (
    <Card className="w-full bg-[#181825] border-[#313244] shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center text-[#CDD6F4]">
          <Sparkles className="h-4 w-4 mr-2 text-[#F5C2E7]" />
          AI Optimization Directives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Directives List */}
          <ScrollArea className="h-32 rounded-md border border-[#313244] bg-[#11111B] p-2">
            {directives.length === 0 ? (
              <div className="text-xs text-[#A6ADC8] italic flex items-center justify-center h-full">
                <Info className="h-3 w-3 mr-1 opacity-70" />
                No optimization directives added yet
              </div>
            ) : (
              <div className="space-y-1">
                {directives.map((directive, index) => (
                  <div key={index} className="flex justify-between items-center px-2 py-1 rounded-md bg-[#1E1E2E] text-xs">
                    <div className="flex items-center">
                      {directive.type === 'goal' && (
                        <Target className="h-3 w-3 mr-1 text-[#F5C2E7]" />
                      )}
                      {directive.type === 'method' && (
                        <Settings className="h-3 w-3 mr-1 text-[#89B4FA]" />
                      )}
                      {directive.type === 'priority' && (
                        <Workflow className="h-3 w-3 mr-1 text-[#F9E2AF]" />
                      )}
                      {directive.type === 'threshold' && (
                        <Target className="h-3 w-3 mr-1 text-[#ABE9B3]" />
                      )}
                      {directive.type === 'parameter' && (
                        <ClipboardCheck className="h-3 w-3 mr-1 text-[#FAB387]" />
                      )}
                      
                      <span>
                        {directive.type === 'goal' && `Optimize for ${directive.value}`}
                        {directive.type === 'method' && `Method: ${directive.value}`}
                        {directive.type === 'priority' && `Priority: ${directive.value}`}
                        {directive.type === 'threshold' && `Threshold: ${directive.value}`}
                        {directive.type === 'parameter' && `${directive.parameter} = ${directive.value}`}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 text-[#F38BA8] hover:text-[#F38BA8] hover:bg-[#313244]"
                      onClick={() => removeDirective(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Directive Controls */}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs font-medium mb-1 text-[#CDD6F4]">Optimization Goal</div>
                <Select 
                  value={goalValue} 
                  onValueChange={(value) => setGoalValue(value as OptimizationGoal)}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-[#1E1E2E]">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fidelity">Quantum Fidelity</SelectItem>
                    <SelectItem value="gate_count">Gate Count</SelectItem>
                    <SelectItem value="depth">Circuit Depth</SelectItem>
                    <SelectItem value="error_mitigation">Error Mitigation</SelectItem>
                    <SelectItem value="execution_time">Execution Time</SelectItem>
                    <SelectItem value="explainability">Explainability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="h-8 mt-auto bg-[#F5C2E7] text-[#1E1E2E] hover:bg-[#F5C2E7]/90"
                onClick={() => addDirective('goal', goalValue)}
              >
                <CirclePlus className="h-3 w-3 mr-1" />
                Add Goal
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs font-medium mb-1 text-[#CDD6F4]">Optimization Method</div>
                <Select 
                  value={methodValue} 
                  onValueChange={(value) => setMethodValue(value as OptimizationMethod)}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-[#1E1E2E]">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gradient_descent">Gradient Descent</SelectItem>
                    <SelectItem value="quantum_annealing">Quantum Annealing</SelectItem>
                    <SelectItem value="tensor_network">Tensor Network</SelectItem>
                    <SelectItem value="reinforcement_learning">Reinforcement Learning</SelectItem>
                    <SelectItem value="heuristic">Heuristic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="h-8 mt-auto bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90"
                onClick={() => addDirective('method', methodValue)}
              >
                <CirclePlus className="h-3 w-3 mr-1" />
                Add Method
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs font-medium mb-1 text-[#CDD6F4]">Priority Level</div>
                <Select 
                  value={priorityValue} 
                  onValueChange={(value) => setPriorityValue(value as CircuitPriority)}
                >
                  <SelectTrigger className="w-full h-8 text-xs bg-[#1E1E2E]">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="approximate_ok">Approximate OK</SelectItem>
                    <SelectItem value="error_tolerant">Error Tolerant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="h-8 mt-auto bg-[#F9E2AF] text-[#1E1E2E] hover:bg-[#F9E2AF]/90"
                onClick={() => addDirective('priority', priorityValue)}
              >
                <CirclePlus className="h-3 w-3 mr-1" />
                Add Priority
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs font-medium mb-1 text-[#CDD6F4]">Threshold</div>
                <Input 
                  type="text" 
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  className="h-8 text-xs bg-[#1E1E2E] border-[#313244]"
                  placeholder="0.0 - 1.0"
                />
              </div>
              <Button 
                className="h-8 mt-auto bg-[#ABE9B3] text-[#1E1E2E] hover:bg-[#ABE9B3]/90"
                onClick={() => addDirective('threshold', thresholdValue)}
              >
                <CirclePlus className="h-3 w-3 mr-1" />
                Add Threshold
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs font-medium mb-1 text-[#CDD6F4]">Parameter Name</div>
                <Input 
                  type="text" 
                  value={paramName}
                  onChange={(e) => setParamName(e.target.value)}
                  className="h-8 text-xs bg-[#1E1E2E] border-[#313244]"
                  placeholder="iterations"
                />
              </div>
              <div>
                <div className="text-xs font-medium mb-1 text-[#CDD6F4]">Value</div>
                <Input 
                  type="text" 
                  value={paramValue}
                  onChange={(e) => setParamValue(e.target.value)}
                  className="h-8 text-xs bg-[#1E1E2E] border-[#313244]"
                  placeholder="500"
                />
              </div>
              <Button 
                className="h-8 mt-auto bg-[#FAB387] text-[#1E1E2E] hover:bg-[#FAB387]/90"
                onClick={() => addDirective('parameter', paramValue, paramName)}
                disabled={!paramName || !paramValue}
              >
                <CirclePlus className="h-3 w-3 mr-1" />
                Add Parameter
              </Button>
            </div>
          </div>
          
          {/* Suggestion Section */}
          <div className="pt-2 border-t border-[#313244]">
            <div className="flex justify-between mb-2">
              <div className="text-xs font-medium text-[#CDD6F4]">
                AI Suggestions
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs border-[#313244] hover:bg-[#313244]"
                onClick={generateSuggestions}
              >
                <Sparkles className="h-3 w-3 mr-1 text-[#F5C2E7]" />
                Generate
              </Button>
            </div>
            
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                <ScrollArea className="h-20 rounded-md border border-[#313244] bg-[#11111B] p-2">
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="text-xs flex items-start">
                        <ArrowRight className="h-3 w-3 mr-1 mt-0.5 text-[#F5C2E7]" />
                        <span className="text-[#A6ADC8]">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    className="bg-[#F5C2E7] text-[#1E1E2E] hover:bg-[#F5C2E7]/90"
                    onClick={applySuggestions}
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Apply Suggestions
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#A6ADC8] italic flex items-center justify-center h-12 border border-dashed border-[#313244] rounded-md">
                <Info className="h-3 w-3 mr-1 opacity-70" />
                Generate suggestions to optimize your quantum circuit
              </div>
            )}
          </div>
          
          {/* Apply Button */}
          <Button 
            className="w-full bg-gradient-to-r from-[#89B4FA] to-[#F5C2E7] text-[#1E1E2E] hover:opacity-90"
            onClick={applyDirectives}
            disabled={directives.length === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Apply Optimization Directives
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}