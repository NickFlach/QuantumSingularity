import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Atom, Wand2, RotateCw, ScanFace, Network, Cpu, Sparkles } from "lucide-react";
import { 
  createQuantumGeometricSpace,
  embedQuantumStates,
  transformQuantumGeometry,
  entangleQuantumGeometricStates,
  computeQuantumTopologicalInvariants,
  simulateAIOptimizedCircuit,
  type OptimizationGoal
} from "@/lib/SingularisCompiler";

import { QuantumGate } from "@/lib/QuantumOperations";

interface QuantumOperationsPanelProps {
  onOperationComplete: (output: string[], success: boolean) => void;
  onSpaceCreated: (spaceData: any) => void;
}

export function QuantumOperationsPanel({ 
  onOperationComplete, 
  onSpaceCreated 
}: QuantumOperationsPanelProps) {
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("create-space");
  const [optimizationGoal, setOptimizationGoal] = useState<OptimizationGoal>("fidelity");
  
  // Run quantum space creation
  const handleCreateSpace = async () => {
    setIsExecuting(true);
    
    try {
      // Create test space
      const spaceId = `space-${Date.now().toString(36)}`;
      const dimension = 3;
      
      const spaceResponse = await createQuantumGeometricSpace(
        spaceId,
        dimension,
        ['point', 'line', 'plane'],
        'minkowski',
        ['connected', 'compact'],
        1.0
      );
      
      const output = [
        "$ singularis quantum-geometry create-space",
        "Initializing Quantum Geometry Processor...",
        "────────────────────────────────────────────",
        `✓ Created quantum geometric space: ${spaceId}`,
        `  Dimension: ${dimension}`,
        `  Metric: minkowski`,
        `  Result: ${spaceResponse.creationResult}`,
        "────────────────────────────────────────────",
        "Space creation completed successfully."
      ];
      
      onOperationComplete(output, true);
      onSpaceCreated({
        id: spaceId,
        dimension,
        elements: ['point', 'line', 'plane'],
        states: [],
        transformations: [],
        entanglements: [],
        invariants: []
      });
      
      // Switch to embed states tab
      setActiveTab("embed-states");
      
    } catch (error) {
      console.error("Space creation error:", error);
      
      const errorOutput = [
        "$ singularis quantum-geometry create-space",
        "Initializing Quantum Geometry Processor...",
        "ERROR: Quantum space creation failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Operation terminated with errors."
      ];
      
      onOperationComplete(errorOutput, false);
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Run quantum state embedding
  const handleEmbedStates = async () => {
    setIsExecuting(true);
    
    try {
      // Get the most recently created space
      const spaceId = `space-${Date.now().toString(36)}`; // This would come from state in a real implementation
      const dimension = 3;
      
      // Embed quantum states
      const stateIds = ['q1', 'q2'];
      const coordinates = [[0.1, 0.2, 0.3], [0.7, 0.8, 0.9]];
      
      const embedResponse = await embedQuantumStates(
        spaceId,
        dimension,
        ['point', 'line'],
        stateIds,
        coordinates
      );
      
      const output = [
        "$ singularis quantum-geometry embed-states",
        "Initializing Quantum Geometry Processor...",
        "────────────────────────────────────────────",
        "✓ Embedded quantum states:",
        ...embedResponse.embeddings.map(e => `  State '${e.stateId}' at [${e.coordinates.join(', ')}]`),
        "────────────────────────────────────────────",
        "State embedding completed successfully."
      ];
      
      onOperationComplete(output, true);
      
      // Switch to transform tab
      setActiveTab("transform");
      
    } catch (error) {
      console.error("State embedding error:", error);
      
      const errorOutput = [
        "$ singularis quantum-geometry embed-states",
        "Initializing Quantum Geometry Processor...",
        "ERROR: Quantum state embedding failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Operation terminated with errors."
      ];
      
      onOperationComplete(errorOutput, false);
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Run quantum geometry transformation
  const handleTransform = async () => {
    setIsExecuting(true);
    
    try {
      // Get the most recently created space
      const spaceId = `space-${Date.now().toString(36)}`; // This would come from state in a real implementation
      const dimension = 3;
      
      // Apply transformation
      const transformResponse = await transformQuantumGeometry(
        spaceId,
        dimension,
        ['point', 'line'],
        'rotation',
        { angleX: 0.5, angleY: 0.3, angleZ: 0.1 }
      );
      
      const output = [
        "$ singularis quantum-geometry transform",
        "Initializing Quantum Geometry Processor...",
        "────────────────────────────────────────────",
        "✓ Applied transformation:",
        `  Type: ${transformResponse.transformationType}`,
        `  Parameters: ${Object.entries(transformResponse.parameters).map(([k, v]) => `${k}=${v}`).join(', ')}`,
        `  Energy delta: ${transformResponse.energyDelta}`,
        "────────────────────────────────────────────",
        "Transformation completed successfully."
      ];
      
      onOperationComplete(output, true);
      
      // Switch to entangle tab
      setActiveTab("entangle");
      
    } catch (error) {
      console.error("Transformation error:", error);
      
      const errorOutput = [
        "$ singularis quantum-geometry transform",
        "Initializing Quantum Geometry Processor...",
        "ERROR: Quantum transformation failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Operation terminated with errors."
      ];
      
      onOperationComplete(errorOutput, false);
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Run quantum entanglement
  const handleEntangle = async () => {
    setIsExecuting(true);
    
    try {
      // Get the most recently created space
      const spaceId = `space-${Date.now().toString(36)}`; // This would come from state in a real implementation
      const dimension = 3;
      
      // Entangle states
      const entangleResponse = await entangleQuantumGeometricStates(
        spaceId,
        dimension,
        ['point', 'line'],
        'q1',
        'q2',
        0.8
      );
      
      const output = [
        "$ singularis quantum-geometry entangle",
        "Initializing Quantum Geometry Processor...",
        "────────────────────────────────────────────",
        "✓ Entanglement result:",
        `  Success: ${entangleResponse.entanglementResult.success}`,
        `  Strength: ${entangleResponse.entanglementResult.entanglementStrength}`,
        `  Description: ${entangleResponse.entanglementResult.description}`,
        "────────────────────────────────────────────",
        "✓ Quantum Effects:",
        `  Information Preservation: ${entangleResponse.quantumEffects.informationPreservation}`,
        `  Decoherence Resistance: ${entangleResponse.quantumEffects.decoherenceResistance}`,
        `  Non-Locality Measure: ${entangleResponse.quantumEffects.nonLocalityMeasure}`,
        "────────────────────────────────────────────",
        "Entanglement operation completed successfully."
      ];
      
      onOperationComplete(output, true);
      
      // Switch to invariants tab
      setActiveTab("invariants");
      
    } catch (error) {
      console.error("Entanglement error:", error);
      
      const errorOutput = [
        "$ singularis quantum-geometry entangle",
        "Initializing Quantum Geometry Processor...",
        "ERROR: Quantum entanglement failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Operation terminated with errors."
      ];
      
      onOperationComplete(errorOutput, false);
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Compute topological invariants
  const handleComputeInvariants = async () => {
    setIsExecuting(true);
    
    try {
      // Get the most recently created space
      const spaceId = `space-${Date.now().toString(36)}`; // This would come from state in a real implementation
      const dimension = 3;
      
      // Compute invariants
      const invariantsResponse = await computeQuantumTopologicalInvariants(
        spaceId,
        dimension,
        ['point', 'line', 'plane']
      );
      
      const output = [
        "$ singularis quantum-geometry invariants",
        "Initializing Quantum Geometry Processor...",
        "────────────────────────────────────────────",
        "✓ Computed invariants:",
        ...invariantsResponse.invariants.map(inv => `  ${inv.name}: ${inv.value}`),
        "────────────────────────────────────────────",
        "✓ Interpretation:",
        ...invariantsResponse.interpretation.map(int => `  ${int.property}: ${int.implication}`),
        "────────────────────────────────────────────",
        "Invariants computation completed successfully."
      ];
      
      onOperationComplete(output, true);
      
    } catch (error) {
      console.error("Invariants error:", error);
      
      const errorOutput = [
        "$ singularis quantum-geometry invariants",
        "Initializing Quantum Geometry Processor...",
        "ERROR: Quantum invariants computation failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Operation terminated with errors."
      ];
      
      onOperationComplete(errorOutput, false);
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Run AI-optimized quantum circuit simulation
  const handleOptimizeCircuit = async () => {
    setIsExecuting(true);
    
    try {
      // Define a sample quantum circuit with some gates
      const gates = [
        { gate: 'H' as QuantumGate, targets: [0] },
        { gate: 'X' as QuantumGate, targets: [1] },
        { gate: 'CNOT' as QuantumGate, targets: [1], controls: [0] },
        { gate: 'H' as QuantumGate, targets: [0] },
        { gate: 'Z' as QuantumGate, targets: [1] },
        { gate: 'H' as QuantumGate, targets: [1] }
      ];
      
      // Number of qubits
      const numQubits = 2;
      
      // Run AI-optimized circuit simulation
      const optimizationResponse = await simulateAIOptimizedCircuit(
        gates,
        numQubits,
        {
          goal: optimizationGoal,
          method: 'gradient_descent',
          priority: 'critical',
          threshold: 0.9
        }
      );
      
      const output = [
        "$ singularis quantum-circuit optimize",
        "Initializing AI-Optimized Quantum Circuit Processor...",
        "────────────────────────────────────────────",
        "✓ Original circuit:",
        `  Gates: ${optimizationResponse.original.gates}`,
        `  Depth: ${optimizationResponse.original.depth}`,
        "────────────────────────────────────────────",
        "✓ Optimized circuit:",
        `  Gates: ${optimizationResponse.optimized.gates}`,
        `  Depth: ${optimizationResponse.optimized.depth}`,
        `  Explanation: ${optimizationResponse.optimized.explanation}`,
        "────────────────────────────────────────────",
        "✓ Improvement metrics:",
        `  Gate count change: ${optimizationResponse.improvement.gateCount > 0 ? '+' : ''}${optimizationResponse.improvement.gateCount}`,
        `  Depth change: ${(optimizationResponse.improvement.depthChange * 100).toFixed(1)}%`,
        `  Explainability score: ${(optimizationResponse.explainability * 100).toFixed(1)}%`,
        "────────────────────────────────────────────",
        "✓ Resource estimates:",
        `  Computational complexity: ${optimizationResponse.resourceEstimates.computationalComplexity}`,
        `  Estimated runtime: ${optimizationResponse.resourceEstimates.estimatedRuntime.toFixed(2)} ms`,
        "────────────────────────────────────────────",
        "AI-Optimized circuit simulation completed successfully."
      ];
      
      onOperationComplete(output, true);
      
    } catch (error) {
      console.error("AI-Optimized circuit error:", error);
      
      const errorOutput = [
        "$ singularis quantum-circuit optimize",
        "Initializing AI-Optimized Quantum Circuit Processor...",
        "ERROR: AI-Optimized quantum circuit simulation failed.",
        error instanceof Error ? `${error.message}` : "An unknown error occurred.",
        "Operation terminated with errors."
      ];
      
      onOperationComplete(errorOutput, false);
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <Card className="w-full bg-[#181825] border-[#313244] shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center text-[#CDD6F4]">
          <Atom className="h-4 w-4 mr-2 text-[#89B4FA]" />
          Quantum Operations
          <Sparkles className="h-3 w-3 mx-2 text-[#F5C2E7]" />
          <span className="text-[#F5C2E7]">AI Optimization</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-2 bg-[#11111B]">
            <TabsTrigger value="create-space" className="text-xs">
              <Atom className="h-3 w-3 mr-1" />
              Space
            </TabsTrigger>
            <TabsTrigger value="embed-states" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              States
            </TabsTrigger>
            <TabsTrigger value="transform" className="text-xs">
              <RotateCw className="h-3 w-3 mr-1" />
              Transform
            </TabsTrigger>
            <TabsTrigger value="entangle" className="text-xs">
              <Network className="h-3 w-3 mr-1" />
              Entangle
            </TabsTrigger>
            <TabsTrigger value="invariants" className="text-xs">
              <ScanFace className="h-3 w-3 mr-1" />
              Invariants
            </TabsTrigger>
            <TabsTrigger value="optimize" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Optimize
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-64 rounded-md border border-[#313244] bg-[#11111B] p-4">
            <TabsContent value="create-space" className="mt-0">
              <h3 className="text-sm font-medium mb-2">Create Quantum Geometric Space</h3>
              <p className="text-xs text-[#A6ADC8] mb-3">
                Initialize a new quantum geometric space with specified dimension, 
                elements, and metric.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Dimension:</span>
                  <span>3</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Metric:</span>
                  <span>Minkowski</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Elements:</span>
                  <span>Point, Line, Plane</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Properties:</span>
                  <span>Connected, Compact</span>
                </div>
              </div>
              <Button 
                onClick={handleCreateSpace} 
                disabled={isExecuting}
                className="w-full bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90"
              >
                <Atom className="h-3 w-3 mr-1" />
                Create Space
              </Button>
            </TabsContent>
            
            <TabsContent value="embed-states" className="mt-0">
              <h3 className="text-sm font-medium mb-2">Embed Quantum States</h3>
              <p className="text-xs text-[#A6ADC8] mb-3">
                Embed quantum states into the geometric space with specified coordinates.
              </p>
              <div className="mb-4 space-y-2">
                <div className="text-xs bg-[#1E1E2E] p-2 rounded-md">
                  <div className="font-mono mb-1">State: q1</div>
                  <div className="flex space-x-2">
                    <div className="bg-[#313244] rounded-md px-2 py-1 w-12 text-center">0.1</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 w-12 text-center">0.2</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 w-12 text-center">0.3</div>
                  </div>
                </div>
                
                <div className="text-xs bg-[#1E1E2E] p-2 rounded-md">
                  <div className="font-mono mb-1">State: q2</div>
                  <div className="flex space-x-2">
                    <div className="bg-[#313244] rounded-md px-2 py-1 w-12 text-center">0.7</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 w-12 text-center">0.8</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 w-12 text-center">0.9</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleEmbedStates} 
                disabled={isExecuting}
                className="w-full bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                Embed States
              </Button>
            </TabsContent>
            
            <TabsContent value="transform" className="mt-0">
              <h3 className="text-sm font-medium mb-2">Transform Quantum States</h3>
              <p className="text-xs text-[#A6ADC8] mb-3">
                Apply geometric transformations to quantum states within the space.
              </p>
              <div className="bg-[#1E1E2E] p-3 rounded-md mb-4">
                <h4 className="text-xs font-medium mb-2">Rotation Parameters</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="mb-1">X-Angle:</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 text-center">0.5</div>
                  </div>
                  <div>
                    <div className="mb-1">Y-Angle:</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 text-center">0.3</div>
                  </div>
                  <div>
                    <div className="mb-1">Z-Angle:</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 text-center">0.1</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleTransform} 
                disabled={isExecuting}
                className="w-full bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90"
              >
                <RotateCw className="h-3 w-3 mr-1" />
                Apply Transformation
              </Button>
            </TabsContent>
            
            <TabsContent value="entangle" className="mt-0">
              <h3 className="text-sm font-medium mb-2">Entangle Quantum States</h3>
              <p className="text-xs text-[#A6ADC8] mb-3">
                Create quantum entanglement between states based on geometric proximity.
              </p>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="mb-1">State 1:</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 text-center font-mono">q1</div>
                  </div>
                  <div>
                    <div className="mb-1">State 2:</div>
                    <div className="bg-[#313244] rounded-md px-2 py-1 text-center font-mono">q2</div>
                  </div>
                </div>
                
                <div className="text-xs">
                  <div className="mb-1">Entanglement Strength:</div>
                  <div className="bg-[#313244] rounded-md px-2 py-1 text-center">0.8</div>
                </div>
                
                <div className="bg-[#1E1E2E] p-2 rounded-md text-xs">
                  <div className="text-[#F5C2E7]">Expected Effects:</div>
                  <div className="flex justify-between mt-1">
                    <span>Information Preservation:</span>
                    <span>~0.75</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Decoherence Resistance:</span>
                    <span>~0.65</span>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleEntangle} 
                disabled={isExecuting}
                className="w-full bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90"
              >
                <Network className="h-3 w-3 mr-1" />
                Entangle States
              </Button>
            </TabsContent>
            
            <TabsContent value="invariants" className="mt-0">
              <h3 className="text-sm font-medium mb-2">Compute Topological Invariants</h3>
              <p className="text-xs text-[#A6ADC8] mb-3">
                Calculate topological invariants of the quantum space to extract meaningful properties.
              </p>
              <div className="bg-[#1E1E2E] p-3 rounded-md mb-4 text-xs">
                <h4 className="font-medium mb-2">Invariants to Calculate</h4>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#89B4FA] mr-2"></div>
                    <div>Betti Numbers</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#89B4FA] mr-2"></div>
                    <div>Euler Characteristic</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#89B4FA] mr-2"></div>
                    <div>Curvature</div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-[#89B4FA] mr-2"></div>
                    <div>Quantum Complexity</div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleComputeInvariants} 
                disabled={isExecuting}
                className="w-full bg-[#89B4FA] text-[#1E1E2E] hover:bg-[#89B4FA]/90"
              >
                <ScanFace className="h-3 w-3 mr-1" />
                Compute Invariants
              </Button>
            </TabsContent>
            
            <TabsContent value="optimize" className="mt-0">
              <h3 className="text-sm font-medium mb-2">AI-Optimized Quantum Circuit</h3>
              <p className="text-xs text-[#A6ADC8] mb-3">
                Apply AI optimization techniques to quantum circuits for improved efficiency and performance.
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="text-xs">
                  <div className="mb-1 font-medium">Optimization Goal:</div>
                  <Select
                    value={optimizationGoal}
                    onValueChange={(value) => setOptimizationGoal(value as OptimizationGoal)}
                  >
                    <SelectTrigger className="w-full bg-[#313244]">
                      <SelectValue placeholder="Select optimization goal" />
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
                
                <div className="bg-[#1E1E2E] p-3 rounded-md text-xs">
                  <h4 className="font-medium mb-2">Circuit Gates</h4>
                  <div className="font-mono bg-[#313244] p-2 rounded-md mb-2 text-[#CDD6F4]">
                    H(q[0]) → X(q[1]) → CNOT(q[0],q[1]) → H(q[0]) → Z(q[1]) → H(q[1])
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="mb-1">Gate Count:</div>
                      <div className="bg-[#313244] rounded-md px-2 py-1 text-center">6</div>
                    </div>
                    <div>
                      <div className="mb-1">Circuit Depth:</div>
                      <div className="bg-[#313244] rounded-md px-2 py-1 text-center">5</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#1E1E2E] p-3 rounded-md text-xs">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-3 w-3 mr-1 text-[#F5C2E7]" />
                    <h4 className="font-medium text-[#F5C2E7]">AI Optimization Preview</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Expected Gate Reduction:</span>
                      <span>~30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Depth Reduction:</span>
                      <span>~25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Explainability Score:</span>
                      <span>~90%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleOptimizeCircuit} 
                disabled={isExecuting}
                className="w-full bg-[#F5C2E7] text-[#1E1E2E] hover:bg-[#F5C2E7]/90"
              >
                <Cpu className="h-3 w-3 mr-1" />
                Run AI Optimization
              </Button>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}