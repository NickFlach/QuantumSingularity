import { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CircuitSimulationResult } from "@/pages/QuantumCircuitDesignerPage";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Info, 
  Save, 
  Trash2, 
  Plus, 
  Wand2, 
  Zap, 
  Download, 
  Upload,
  PlusCircle,
  Check
} from "lucide-react";

// Types
export type QuantumGate = {
  id: string;
  type: string;
  name: string;
  color: string;
  targets: number[];
  controls?: number[];
  rotation?: number;
  description: string;
};

export type QuantumWire = {
  id: string;
  qubitIndex: number;
  label: string;
  isClassical?: boolean;
};

export type QuantumCircuit = {
  id: string;
  name: string;
  wires: QuantumWire[];
  gates: QuantumGate[];
};

// Constants
const AVAILABLE_GATES: Record<string, {
  name: string;
  color: string;
  requiresControl: boolean;
  supportsRotation: boolean;
  description: string;
}> = {
  H: { 
    name: "Hadamard", 
    color: "bg-indigo-500", 
    requiresControl: false, 
    supportsRotation: false,
    description: "Creates superposition by placing qubits in equal probability of 0 and 1 states"
  },
  X: { 
    name: "Pauli-X (NOT)", 
    color: "bg-red-500", 
    requiresControl: false, 
    supportsRotation: false,
    description: "Flips the state of a qubit (equivalent to classical NOT gate)"
  },
  Y: { 
    name: "Pauli-Y", 
    color: "bg-green-500", 
    requiresControl: false, 
    supportsRotation: false,
    description: "Rotates qubit around Y-axis of Bloch sphere with phase shift"
  },
  Z: { 
    name: "Pauli-Z", 
    color: "bg-blue-500", 
    requiresControl: false, 
    supportsRotation: false,
    description: "Applies phase flip to qubit, leaving |0⟩ unchanged but mapping |1⟩ to -|1⟩"
  },
  RX: { 
    name: "Rotation-X", 
    color: "bg-rose-500", 
    requiresControl: false, 
    supportsRotation: true,
    description: "Rotates qubit around X-axis of Bloch sphere by specified angle"
  },
  RY: { 
    name: "Rotation-Y", 
    color: "bg-emerald-500", 
    requiresControl: false, 
    supportsRotation: true,
    description: "Rotates qubit around Y-axis of Bloch sphere by specified angle"
  },
  RZ: { 
    name: "Rotation-Z", 
    color: "bg-sky-500", 
    requiresControl: false, 
    supportsRotation: true,
    description: "Rotates qubit around Z-axis of Bloch sphere by specified angle"
  },
  CNOT: { 
    name: "Controlled-NOT", 
    color: "bg-amber-500", 
    requiresControl: true, 
    supportsRotation: false,
    description: "Flips target qubit if control qubit is in state |1⟩"
  },
  CZ: { 
    name: "Controlled-Z", 
    color: "bg-violet-500", 
    requiresControl: true, 
    supportsRotation: false,
    description: "Applies phase flip to target qubit if control qubit is in state |1⟩"
  },
  SWAP: { 
    name: "SWAP", 
    color: "bg-fuchsia-500", 
    requiresControl: false, 
    supportsRotation: false,
    description: "Exchanges the states of two qubits"
  },
  T: { 
    name: "T Gate", 
    color: "bg-cyan-500", 
    requiresControl: false, 
    supportsRotation: false,
    description: "π/4 phase rotation gate, important for universal quantum computation"
  },
  S: { 
    name: "S Gate", 
    color: "bg-teal-500", 
    requiresControl: false, 
    supportsRotation: false,
    description: "π/2 phase rotation gate (square root of Z gate)"
  }
};

interface MagicalQuantumCircuitDesignerProps {
  initialCircuit?: QuantumCircuit;
  onSave?: (circuit: QuantumCircuit) => void;
  onSimulate?: (result: CircuitSimulationResult) => void;
}

export default function MagicalQuantumCircuitDesigner({
  initialCircuit,
  onSave,
  onSimulate
}: MagicalQuantumCircuitDesignerProps) {
  const { toast } = useToast();
  const [circuit, setCircuit] = useState<QuantumCircuit>(initialCircuit || {
    id: `circuit-${Date.now()}`,
    name: "My Magical Quantum Circuit",
    wires: [
      { id: "wire-0", qubitIndex: 0, label: "q0" },
      { id: "wire-1", qubitIndex: 1, label: "q1" }
    ],
    gates: []
  });
  
  const [showGateInfo, setShowGateInfo] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<CircuitSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    shots: 1024,
    errorRate: 0,
    useQuantumOptimization: true,
    visualizeBlochSphere: true,
    includeStatistics: true,
    generateExplanation: true,
    optimizationGoal: "fidelity" as "fidelity" | "gate_count" | "depth" | "explainability",
    optimizationMethod: "gradient_descent" as "gradient_descent" | "quantum_annealing" | "reinforcement_learning"
  });
  
  // Generate a unique ID for new elements
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Add a new qubit wire
  const addWire = () => {
    const newWireIndex = circuit.wires.length;
    setCircuit({
      ...circuit,
      wires: [
        ...circuit.wires,
        { 
          id: generateId("wire"), 
          qubitIndex: newWireIndex, 
          label: `q${newWireIndex}` 
        }
      ]
    });
    
    toast({
      title: "Qubit Added",
      description: `Added new qubit q${newWireIndex} to your quantum circuit.`,
      duration: 2000,
    });
  };
  
  // Remove a qubit wire and any gates targeting it
  const removeWire = (wireIndex: number) => {
    if (circuit.wires.length <= 1) {
      toast({
        title: "Cannot Remove Wire",
        description: "A quantum circuit must have at least one qubit.",
        variant: "destructive"
      });
      return;
    }
    
    // Remove the wire
    const newWires = circuit.wires.filter((_, idx) => idx !== wireIndex);
    
    // Re-index the remaining wires
    const reindexedWires = newWires.map((wire, idx) => ({
      ...wire,
      qubitIndex: idx,
      label: `q${idx}`
    }));
    
    // Remove gates targeting the removed wire and adjust target indices for remaining gates
    const newGates = circuit.gates.filter(gate => {
      // Remove if this gate targets the wire we're removing
      if (gate.targets.includes(wireIndex)) {
        return false;
      }
      
      // Remove if this gate controls using the wire we're removing
      if (gate.controls?.includes(wireIndex)) {
        return false;
      }
      
      return true;
    }).map(gate => {
      // Update target and control indices for gates targeting wires after the removed one
      const newTargets = gate.targets.map(target => 
        target > wireIndex ? target - 1 : target
      );
      
      const newControls = gate.controls?.map(control => 
        control > wireIndex ? control - 1 : control
      );
      
      return {
        ...gate,
        targets: newTargets,
        controls: newControls
      };
    });
    
    setCircuit({
      ...circuit,
      wires: reindexedWires,
      gates: newGates
    });
    
    toast({
      title: "Qubit Removed",
      description: `Removed qubit q${wireIndex} and associated gates.`,
      duration: 2000,
    });
  };
  
  // Add a new gate to the circuit
  const addGate = (gateType: string) => {
    const gateInfo = AVAILABLE_GATES[gateType];
    if (!gateInfo) return;
    
    const newGate: QuantumGate = {
      id: generateId("gate"),
      type: gateType,
      name: gateInfo.name,
      color: gateInfo.color,
      targets: [0], // Default to the first qubit
      description: gateInfo.description
    };
    
    if (gateInfo.requiresControl) {
      // If there's only one wire, we can't add a controlled gate
      if (circuit.wires.length < 2) {
        toast({
          title: "Cannot Add Controlled Gate",
          description: "Controlled gates require at least two qubits.",
          variant: "destructive"
        });
        return;
      }
      newGate.controls = [1]; // Default to the second qubit as control
      newGate.targets = [0]; // Default to the first qubit as target
    }
    
    if (gateInfo.supportsRotation) {
      newGate.rotation = Math.PI / 4; // Default rotation of π/4
    }
    
    setCircuit({
      ...circuit,
      gates: [...circuit.gates, newGate]
    });
    
    toast({
      title: "Gate Added",
      description: `Added ${gateInfo.name} gate to your circuit.`,
      variant: "default",
      duration: 1500,
    });
  };
  
  // Remove a gate from the circuit
  const removeGate = (gateId: string) => {
    setCircuit({
      ...circuit,
      gates: circuit.gates.filter(gate => gate.id !== gateId)
    });
  };
  
  // Update gate properties
  const updateGate = (gateId: string, updates: Partial<QuantumGate>) => {
    setCircuit({
      ...circuit,
      gates: circuit.gates.map(gate => 
        gate.id === gateId ? { ...gate, ...updates } : gate
      )
    });
  };
  
  // Handle drag and drop for gates
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    // If dragging from gate palette to circuit
    if (result.source.droppableId === "gate-palette") {
      const gateType = result.draggableId.replace("palette-", "");
      addGate(gateType);
      return;
    }
    
    // If reordering gates
    const gateId = result.draggableId;
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    const gate = circuit.gates.find(g => g.id === gateId);
    if (!gate) return;
    
    // Create a new gates array with the item reordered
    const newGates = [...circuit.gates];
    newGates.splice(sourceIndex, 1);
    newGates.splice(destinationIndex, 0, gate);
    
    setCircuit({
      ...circuit,
      gates: newGates
    });
  };
  
  // Simulate the quantum circuit
  const simulateCircuit = async () => {
    if (circuit.gates.length === 0) {
      toast({
        title: "Cannot Simulate",
        description: "Please add at least one gate to your circuit.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSimulating(true);
      
      // Format the circuit for the API
      const formattedGates = circuit.gates.map(gate => {
        const formatted: any = {
          gate: gate.type,
          targets: gate.targets,
        };
        
        if (gate.controls && gate.controls.length > 0) {
          formatted.controls = gate.controls;
        }
        
        if (gate.rotation !== undefined) {
          formatted.rotation = gate.rotation;
        }
        
        return formatted;
      });
      
      const response = await apiRequest<{ result: CircuitSimulationResult }>(
        "POST",
        "/api/quantum/circuit/simulate",
        {
          circuit: {
            numQubits: circuit.wires.length,
            gates: formattedGates
          },
          options: {
            shots: advancedOptions.shots,
            noiseLevel: advancedOptions.errorRate,
            includeVisualization: true,
            includeBinary: true,
            includeBlochSphere: advancedOptions.visualizeBlochSphere,
            includeStatistics: advancedOptions.includeStatistics,
            generateExplanation: advancedOptions.generateExplanation,
            optimizationGoal: advancedOptions.optimizationGoal,
            optimizationMethod: advancedOptions.optimizationMethod,
            useQuantumOptimization: advancedOptions.useQuantumOptimization
          }
        }
      );
      
      setSimulationResult(response.result);
      
      // Call the onSimulate prop if provided
      if (onSimulate) {
        onSimulate(response.result);
      }
      
      toast({
        title: "Simulation Complete",
        description: "Your quantum circuit has been successfully simulated.",
        variant: "default",
      });
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };
  
  // Save the current circuit
  const saveCircuit = () => {
    if (onSave) {
      onSave(circuit);
      toast({
        title: "Circuit Saved",
        description: "Your quantum circuit has been saved successfully.",
      });
    }
  };
  
  // Clear the circuit
  const clearCircuit = () => {
    setCircuit({
      ...circuit,
      gates: []
    });
    setSimulationResult(null);
    toast({
      title: "Circuit Cleared",
      description: "All gates have been removed from your circuit.",
    });
  };
  
  // Export circuit as JSON
  const exportCircuit = () => {
    const circuitJson = JSON.stringify(circuit, null, 2);
    const blob = new Blob([circuitJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `${circuit.name.replace(/\s+/g, "_").toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Circuit Exported",
      description: "Your quantum circuit has been exported as JSON.",
    });
  };
  
  // Import circuit from JSON file
  const importCircuitRef = useRef<HTMLInputElement>(null);
  
  const importCircuit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCircuit = JSON.parse(e.target?.result as string) as QuantumCircuit;
        
        // Validate the imported circuit
        if (!importedCircuit.wires || !importedCircuit.gates) {
          throw new Error("Invalid circuit format");
        }
        
        // Generate new IDs to avoid conflicts
        const newCircuit: QuantumCircuit = {
          id: generateId("circuit"),
          name: importedCircuit.name || "Imported Circuit",
          wires: importedCircuit.wires.map((wire, idx) => ({
            id: generateId("wire"),
            qubitIndex: idx,
            label: wire.label || `q${idx}`,
            isClassical: wire.isClassical
          })),
          gates: importedCircuit.gates.map(gate => ({
            id: generateId("gate"),
            type: gate.type,
            name: gate.name || AVAILABLE_GATES[gate.type]?.name || gate.type,
            color: gate.color || AVAILABLE_GATES[gate.type]?.color || "bg-gray-500",
            targets: gate.targets,
            controls: gate.controls,
            rotation: gate.rotation,
            description: gate.description || AVAILABLE_GATES[gate.type]?.description || ""
          }))
        };
        
        setCircuit(newCircuit);
        setSimulationResult(null);
        
        toast({
          title: "Circuit Imported",
          description: "Your quantum circuit has been imported successfully.",
        });
      } catch (error) {
        console.error("Import error:", error);
        toast({
          title: "Import Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
    
    // Reset the input so the same file can be imported again
    if (importCircuitRef.current) {
      importCircuitRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl">Magical Quantum Circuit Designer</CardTitle>
          <CardDescription>
            Design quantum circuits with enchanted drag-and-drop capabilities
          </CardDescription>
        </div>
        <Input
          className="max-w-xs"
          value={circuit.name}
          onChange={(e) => setCircuit({ ...circuit, name: e.target.value })}
          placeholder="Circuit Name"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {/* Circuit Design Area - 5 columns on large screens */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>Circuit Design</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addWire}
                    className="text-xs"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Qubit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearCircuit}
                    className="text-xs"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="p-4 min-h-[300px] bg-slate-50 dark:bg-slate-900 rounded-md">
                  {/* Quantum circuit wires */}
                  <div className="space-y-8">
                    {circuit.wires.map((wire, wireIndex) => (
                      <div key={wire.id} className="relative flex items-center">
                        <div className="w-16 pr-2 text-right font-mono">
                          {wire.label}
                        </div>
                        <div className="flex-1 border-b-2 border-primary/30 relative py-2">
                          {/* Gate drop area */}
                          <Droppable droppableId={`wire-${wireIndex}`} direction="horizontal">
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex items-center gap-2 min-h-[40px]"
                              >
                                {circuit.gates
                                  .filter(gate => 
                                    gate.targets.includes(wireIndex) || 
                                    gate.controls?.includes(wireIndex)
                                  )
                                  .map((gate, gateIndex) => (
                                    <Draggable
                                      key={gate.id}
                                      draggableId={gate.id}
                                      index={gateIndex}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`
                                            flex items-center justify-center
                                            w-12 h-12 rounded-md ${gate.color}
                                            text-white font-bold shadow-md
                                            cursor-move relative
                                            transition-transform
                                          `}
                                          onMouseEnter={() => setShowGateInfo(gate.id)}
                                          onMouseLeave={() => setShowGateInfo(null)}
                                        >
                                          <span>{gate.type}</span>
                                          
                                          {/* Gate info tooltip */}
                                          {showGateInfo === gate.id && (
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black/80 text-white text-xs rounded shadow-lg w-48 z-10">
                                              <div className="font-bold mb-1">{gate.name}</div>
                                              <p className="text-xs">{gate.description}</p>
                                              <div className="mt-1">
                                                <span className="opacity-70">
                                                  Target: q{gate.targets.join(', q')}
                                                </span>
                                                {gate.controls && (
                                                  <div className="opacity-70">
                                                    Control: q{gate.controls.join(', q')}
                                                  </div>
                                                )}
                                                {gate.rotation !== undefined && (
                                                  <div className="opacity-70">
                                                    Angle: {(gate.rotation / Math.PI).toFixed(2)}π
                                                  </div>
                                                )}
                                              </div>
                                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                                                <div className="border-8 border-transparent border-t-black/80"></div>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Gate controls */}
                                          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                                            <button
                                              className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeGate(gate.id);
                                              }}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                          
                                          {/* Show control lines if it's a controlled gate */}
                                          {gate.controls?.includes(wireIndex) && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                              <div className="w-3 h-3 rounded-full bg-black dark:bg-white"></div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                        
                        {/* Wire controls */}
                        <div className="ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeWire(wireIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </DragDropContext>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={simulateCircuit}
                  disabled={isSimulating || circuit.gates.length === 0}
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Simulate
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={saveCircuit}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => importCircuitRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <input
                  ref={importCircuitRef}
                  type="file"
                  accept=".json"
                  onChange={importCircuit}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={exportCircuit}
                  disabled={circuit.gates.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Simulation Results */}
          {simulationResult && (
            <Card>
              <CardHeader>
                <CardTitle>Simulation Results</CardTitle>
                <CardDescription>
                  Results from quantum circuit simulation with {advancedOptions.shots} shots
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="probabilities">
                  <TabsList className="mb-4">
                    <TabsTrigger value="probabilities">Probabilities</TabsTrigger>
                    <TabsTrigger value="visualization">Visualization</TabsTrigger>
                    {simulationResult.blochSphere && (
                      <TabsTrigger value="bloch">Bloch Sphere</TabsTrigger>
                    )}
                    {simulationResult.statistics && (
                      <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    )}
                    {simulationResult.explanation && (
                      <TabsTrigger value="explanation">Explanation</TabsTrigger>
                    )}
                  </TabsList>
                  
                  <TabsContent value="probabilities" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(simulationResult.probabilities).map(([state, prob]) => (
                        <div key={state} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                          <div className="font-mono">{state}</div>
                          <div className="flex items-center">
                            <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-primary h-2.5 rounded-full" 
                                style={{ width: `${prob * 100}%` }}
                              ></div>
                            </div>
                            <div className="w-16 text-right">{(prob * 100).toFixed(2)}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="visualization">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                      <pre className="font-mono text-xs sm:text-sm overflow-x-auto">
                        {simulationResult.visualization}
                      </pre>
                    </div>
                  </TabsContent>
                  
                  {simulationResult.blochSphere && (
                    <TabsContent value="bloch">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {simulationResult.blochSphere.map((coords, i) => (
                          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                            <div className="text-center mb-2 font-semibold">Qubit {i}</div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col items-center">
                                <div className="font-mono text-lg">{coords.x.toFixed(3)}</div>
                                <div className="text-xs text-muted-foreground">X</div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="font-mono text-lg">{coords.y.toFixed(3)}</div>
                                <div className="text-xs text-muted-foreground">Y</div>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="font-mono text-lg">{coords.z.toFixed(3)}</div>
                                <div className="text-xs text-muted-foreground">Z</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                  
                  {simulationResult.statistics && (
                    <TabsContent value="statistics">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                          <div className="text-center mb-2 font-semibold">Entanglement</div>
                          <div className="flex justify-center">
                            <div className="font-mono text-2xl">
                              {(simulationResult.statistics.entanglement * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                          <div className="text-center mb-2 font-semibold">Circuit Depth</div>
                          <div className="flex justify-center">
                            <div className="font-mono text-2xl">
                              {simulationResult.statistics.depth}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
                          <div className="text-center mb-2 font-semibold">Complexity</div>
                          <div className="flex justify-center">
                            <div className="font-mono text-2xl">
                              {(simulationResult.statistics.complexity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  )}
                  
                  {simulationResult.explanation && (
                    <TabsContent value="explanation">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md prose dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap">
                          {simulationResult.explanation}
                        </div>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Gate Palette and Advanced Options - 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-4">
          {/* Gate Palette */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quantum Gates</CardTitle>
              <CardDescription>Drag gates to your circuit</CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="gate-palette" direction="horizontal">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="grid grid-cols-3 gap-2"
                    >
                      {Object.entries(AVAILABLE_GATES).map(([gateType, gateInfo], index) => (
                        <Draggable
                          key={`palette-${gateType}`}
                          draggableId={`palette-${gateType}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`
                                flex flex-col items-center justify-center
                                rounded-md ${gateInfo.color} text-white
                                p-2 cursor-move h-16 shadow-sm
                                hover:shadow-md transition-shadow
                              `}
                              title={gateInfo.description}
                              onClick={() => addGate(gateType)}
                            >
                              <div className="font-bold">{gateType}</div>
                              <div className="text-xs mt-1 opacity-80">{gateInfo.name}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
          
          {/* Advanced Options */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Wand2 className="h-4 w-4 mr-2" />
                Advanced Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shots">Simulation Shots</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="shots"
                    min={1}
                    max={8192}
                    step={1}
                    value={[advancedOptions.shots]}
                    onValueChange={(value) => setAdvancedOptions({
                      ...advancedOptions,
                      shots: value[0]
                    })}
                  />
                  <span className="w-16 text-right font-mono">{advancedOptions.shots}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="error-rate">Error Rate</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="error-rate"
                    min={0}
                    max={0.1}
                    step={0.001}
                    value={[advancedOptions.errorRate]}
                    onValueChange={(value) => setAdvancedOptions({
                      ...advancedOptions,
                      errorRate: value[0]
                    })}
                  />
                  <span className="w-16 text-right font-mono">{(advancedOptions.errorRate * 100).toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="opt-goal">Optimization Goal</Label>
                  <Select
                    value={advancedOptions.optimizationGoal}
                    onValueChange={(value: any) => setAdvancedOptions({
                      ...advancedOptions,
                      optimizationGoal: value
                    })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fidelity">Fidelity</SelectItem>
                      <SelectItem value="gate_count">Gate Count</SelectItem>
                      <SelectItem value="depth">Depth</SelectItem>
                      <SelectItem value="explainability">Explainability</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="opt-method">Optimization Method</Label>
                  <Select
                    value={advancedOptions.optimizationMethod}
                    onValueChange={(value: any) => setAdvancedOptions({
                      ...advancedOptions,
                      optimizationMethod: value
                    })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient_descent">Gradient Descent</SelectItem>
                      <SelectItem value="quantum_annealing">Quantum Annealing</SelectItem>
                      <SelectItem value="reinforcement_learning">Reinforcement Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quantum-opt"
                      checked={advancedOptions.useQuantumOptimization}
                      onCheckedChange={(checked) => setAdvancedOptions({
                        ...advancedOptions,
                        useQuantumOptimization: checked
                      })}
                    />
                    <Label htmlFor="quantum-opt">Use Quantum Optimization</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bloch-viz"
                      checked={advancedOptions.visualizeBlochSphere}
                      onCheckedChange={(checked) => setAdvancedOptions({
                        ...advancedOptions,
                        visualizeBlochSphere: checked
                      })}
                    />
                    <Label htmlFor="bloch-viz">Visualize Bloch Sphere</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-stats"
                      checked={advancedOptions.includeStatistics}
                      onCheckedChange={(checked) => setAdvancedOptions({
                        ...advancedOptions,
                        includeStatistics: checked
                      })}
                    />
                    <Label htmlFor="include-stats">Include Statistics</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="gen-explanation"
                      checked={advancedOptions.generateExplanation}
                      onCheckedChange={(checked) => setAdvancedOptions({
                        ...advancedOptions,
                        generateExplanation: checked
                      })}
                    />
                    <Label htmlFor="gen-explanation">Generate Explanation</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}