import { useState, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CircuitSimulationResult } from "@/pages/QuantumCircuitDesignerPage";
import { apiRequest } from "@/lib/queryClient";
import { 
  Atom, 
  RotateCw, 
  Trash2, 
  Zap, 
  Save, 
  Play,
  Plus,
  ChevronRight,
  ChevronDown,
  Eye
} from "lucide-react";
import { QuantumGate } from "@/lib/QuantumOperations";
import { useToast } from "@/hooks/use-toast";

// Circuit types
export interface QuantumGateInstance {
  id: string;
  type: QuantumGate;
  qubit: number;
  position: number;
  controlQubit?: number;
  color: string;
  angle?: number;
}

export interface QuantumCircuit {
  gates: QuantumGateInstance[];
  qubits: number;
  name: string;
}

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
    gates: [],
    qubits: 3,
    name: "New Quantum Circuit"
  });
  const [selectedGate, setSelectedGate] = useState<QuantumGate>("H");
  const [isSimulating, setIsSimulating] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [circuitName, setCircuitName] = useState(initialCircuit?.name || "New Quantum Circuit");
  const [simulationOptions, setSimulationOptions] = useState({
    shots: 1024,
    errorRate: 0,
    explainResults: true
  });
  
  // Gate palette
  const gateColors = {
    H: "#89B4FA", // Hadamard - Blue
    X: "#F38BA8", // Pauli X (NOT) - Red
    Y: "#A6E3A1", // Pauli Y - Green
    Z: "#94E2D5", // Pauli Z - Teal
    RX: "#FAB387", // Rotation X - Orange
    RY: "#F9E2AF", // Rotation Y - Yellow
    RZ: "#CBA6F7", // Rotation Z - Purple
    CNOT: "#F5C2E7", // CNOT - Pink
    CZ: "#89DCEB", // Controlled Z - Cyan
    SWAP: "#F2CDCD", // SWAP - Light Red
    T: "#B4BEFE", // T gate - Lavender
    S: "#DDB6F2"  // S gate - Light Purple
  };
  
  const basicGates: QuantumGate[] = ["H", "X", "Y", "Z"];
  const rotationalGates: QuantumGate[] = ["RX", "RY", "RZ"];
  const multiQubitGates: QuantumGate[] = ["CNOT", "CZ", "SWAP"];
  const phaseGates: QuantumGate[] = ["T", "S"];
  
  // Generate unique ID for gates
  const generateId = () => Math.random().toString(36).substring(2, 10);
  
  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    
    // If dragging from palette to circuit
    if (source.droppableId === "palette" && destination.droppableId.startsWith("qubit-")) {
      const qubitIndex = parseInt(destination.droppableId.split("-")[1]);
      const position = destination.index;
      
      // Add new gate to circuit
      const newGate: QuantumGateInstance = {
        id: generateId(),
        type: selectedGate,
        qubit: qubitIndex,
        position: position,
        color: gateColors[selectedGate],
        ...(["CNOT", "CZ"].includes(selectedGate) && { controlQubit: qubitIndex > 0 ? qubitIndex - 1 : qubitIndex + 1 }),
        ...(["RX", "RY", "RZ"].includes(selectedGate) && { angle: Math.PI / 4 }) // Default to π/4
      };
      
      setCircuit(prev => ({
        ...prev,
        gates: [...prev.gates, newGate]
      }));
    }
    // If reordering gates within a qubit wire
    else if (source.droppableId.startsWith("qubit-") && destination.droppableId === source.droppableId) {
      const qubitIndex = parseInt(source.droppableId.split("-")[1]);
      const qubitGates = circuit.gates.filter(gate => gate.qubit === qubitIndex);
      
      // Reordering logic
      const [movedGate] = qubitGates.splice(source.index, 1);
      qubitGates.splice(destination.index, 0, movedGate);
      
      // Update positions based on new order
      const updatedGates = qubitGates.map((gate, idx) => ({
        ...gate,
        position: idx
      }));
      
      // Merge with gates from other qubits
      const otherGates = circuit.gates.filter(gate => gate.qubit !== qubitIndex);
      
      setCircuit(prev => ({
        ...prev,
        gates: [...otherGates, ...updatedGates]
      }));
    }
    // Moving between different qubit wires
    else if (source.droppableId.startsWith("qubit-") && destination.droppableId.startsWith("qubit-") &&
             source.droppableId !== destination.droppableId) {
      const sourceQubitIndex = parseInt(source.droppableId.split("-")[1]);
      const destQubitIndex = parseInt(destination.droppableId.split("-")[1]);
      
      // Find the gate being moved
      const sourceGates = circuit.gates.filter(gate => gate.qubit === sourceQubitIndex);
      const gateToMove = sourceGates[source.index];
      
      // Remove gate from source
      const newGates = circuit.gates.filter(gate => gate.id !== gateToMove.id);
      
      // Add gate to destination
      const updatedGate = {
        ...gateToMove,
        qubit: destQubitIndex,
        position: destination.index
      };
      
      // If it's a controlled gate, adjust control qubit
      if (["CNOT", "CZ"].includes(updatedGate.type)) {
        updatedGate.controlQubit = destQubitIndex > 0 ? destQubitIndex - 1 : destQubitIndex + 1;
      }
      
      setCircuit(prev => ({
        ...prev,
        gates: [...newGates, updatedGate]
      }));
    }
  };
  
  // Remove a gate from the circuit
  const removeGate = (gateId: string) => {
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.filter(gate => gate.id !== gateId)
    }));
  };
  
  // Update control qubit for controlled gates
  const updateControlQubit = (gateId: string, controlQubit: number) => {
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.map(gate => 
        gate.id === gateId 
          ? { ...gate, controlQubit } 
          : gate
      )
    }));
  };
  
  // Update rotation angle for rotational gates
  const updateRotationAngle = (gateId: string, angle: number) => {
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.map(gate => 
        gate.id === gateId 
          ? { ...gate, angle } 
          : gate
      )
    }));
  };
  
  // Save the circuit
  const saveCircuit = () => {
    const circuitToSave = {
      ...circuit,
      name: circuitName
    };
    
    if (onSave) {
      onSave(circuitToSave);
    }
    
    toast({
      title: "Circuit Saved",
      description: `"${circuitName}" has been saved successfully.`,
    });
  };
  
  // Simulate the circuit
  const simulateCircuit = async () => {
    setIsSimulating(true);
    
    try {
      // Map our circuit gates to the format expected by the API
      const apiGates = circuit.gates.map(gate => ({
        gate: gate.type,
        targets: [gate.qubit],
        ...(gate.controlQubit !== undefined && { controls: [gate.controlQubit] }),
        ...(gate.angle !== undefined && { angle: gate.angle })
      }));
      
      // Call the quantum circuit simulation API
      const response = await apiRequest<{ result: CircuitSimulationResult }>(
        'POST', 
        '/api/quantum/circuit/simulate', 
        {
          gates: apiGates,
          options: {
            shots: simulationOptions.shots,
            errorRate: simulationOptions.errorRate,
            visualize: true,
            explain: simulationOptions.explainResults
          }
        }
      );
      
      if (onSimulate && response?.result) {
        onSimulate(response.result);
      }
      
      toast({
        title: "Simulation Complete",
        description: "Quantum circuit simulation has completed successfully.",
      });
    } catch (error) {
      console.error('Failed to simulate quantum circuit:', error);
      
      toast({
        title: "Simulation Failed",
        description: "There was an error simulating the quantum circuit.",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };
  
  // Add a qubit to the circuit
  const addQubit = () => {
    setCircuit(prev => ({
      ...prev,
      qubits: prev.qubits + 1
    }));
  };
  
  // Remove a qubit from the circuit
  const removeQubit = () => {
    if (circuit.qubits <= 1) return;
    
    // Remove gates that were on the removed qubit
    const highestQubit = circuit.qubits - 1;
    const updatedGates = circuit.gates.filter(gate => 
      gate.qubit !== highestQubit && 
      (gate.controlQubit === undefined || gate.controlQubit !== highestQubit)
    );
    
    setCircuit(prev => ({
      ...prev,
      qubits: prev.qubits - 1,
      gates: updatedGates
    }));
  };
  
  // Format angle display
  const formatAngle = (angle?: number) => {
    if (angle === undefined) return "";
    if (angle === 0) return "0";
    if (angle === Math.PI) return "π";
    if (angle === Math.PI/2) return "π/2";
    if (angle === Math.PI/4) return "π/4";
    return `${(angle / Math.PI).toFixed(2)}π`;
  };
  
  // Render gate UI
  const renderGate = (gate: QuantumGateInstance, index: number) => {
    return (
      <Draggable draggableId={gate.id} index={index} key={gate.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="gate-instance relative"
          >
            <div 
              className="gate-ui flex items-center justify-center w-12 h-12 rounded-md m-1 select-none cursor-grab"
              style={{ backgroundColor: gate.color }}
            >
              <div className="font-bold text-black text-opacity-80">
                {gate.type}
                {["RX", "RY", "RZ"].includes(gate.type) && (
                  <span className="text-[10px] ml-1">{formatAngle(gate.angle)}</span>
                )}
              </div>
              
              <button 
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 rounded-full p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  removeGate(gate.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-white" />
              </button>
              
              {["CNOT", "CZ"].includes(gate.type) && gate.controlQubit !== undefined && (
                <div className="absolute -bottom-7 left-0 right-0 flex justify-center">
                  <Select
                    value={gate.controlQubit.toString()}
                    onValueChange={(value) => updateControlQubit(gate.id, parseInt(value))}
                  >
                    <SelectTrigger className="w-16 h-6 text-xs">
                      <SelectValue placeholder="Control" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: circuit.qubits }).map((_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          q{i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {["RX", "RY", "RZ"].includes(gate.type) && (
                <div className="absolute -bottom-7 left-0 right-0 flex justify-center">
                  <Select
                    value={gate.angle?.toString() || (Math.PI/4).toString()}
                    onValueChange={(value) => updateRotationAngle(gate.id, parseFloat(value))}
                  >
                    <SelectTrigger className="w-16 h-6 text-xs">
                      <SelectValue placeholder="Angle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={(Math.PI/4).toString()}>π/4</SelectItem>
                      <SelectItem value={(Math.PI/2).toString()}>π/2</SelectItem>
                      <SelectItem value={Math.PI.toString()}>π</SelectItem>
                      <SelectItem value={(Math.PI*3/2).toString()}>3π/2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };
  
  return (
    <div className="quantum-circuit-designer">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="circuit-name">Circuit Name</Label>
          <Input
            id="circuit-name"
            value={circuitName}
            onChange={(e) => setCircuitName(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={saveCircuit}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={simulateCircuit}
            disabled={isSimulating || circuit.gates.length === 0}
          >
            {isSimulating ? (
              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Simulate
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* Gate Palette */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-4">
              <Label className="mb-2 block">Gate Palette</Label>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="palette" direction="vertical">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="gate-palette space-y-4"
                    >
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium flex items-center">
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Basic Gates
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {basicGates.map((gate, index) => (
                            <div
                              key={gate}
                              className={`gate cursor-pointer w-8 h-8 rounded-md flex items-center justify-center select-none ${selectedGate === gate ? 'ring-2 ring-white' : ''}`}
                              style={{ backgroundColor: gateColors[gate] }}
                              onClick={() => setSelectedGate(gate)}
                            >
                              <span className="font-bold text-black text-opacity-80">{gate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium flex items-center">
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Rotation Gates
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {rotationalGates.map((gate, index) => (
                            <div
                              key={gate}
                              className={`gate cursor-pointer w-8 h-8 rounded-md flex items-center justify-center select-none ${selectedGate === gate ? 'ring-2 ring-white' : ''}`}
                              style={{ backgroundColor: gateColors[gate] }}
                              onClick={() => setSelectedGate(gate)}
                            >
                              <span className="font-bold text-black text-opacity-80">{gate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium flex items-center">
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Multi-Qubit Gates
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {multiQubitGates.map((gate, index) => (
                            <div
                              key={gate}
                              className={`gate cursor-pointer w-8 h-8 rounded-md flex items-center justify-center select-none ${selectedGate === gate ? 'ring-2 ring-white' : ''}`}
                              style={{ backgroundColor: gateColors[gate] }}
                              onClick={() => setSelectedGate(gate)}
                            >
                              <span className="font-bold text-xs text-black text-opacity-80">{gate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium flex items-center">
                          <ChevronRight className="h-3 w-3 mr-1" />
                          Phase Gates
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {phaseGates.map((gate, index) => (
                            <div
                              key={gate}
                              className={`gate cursor-pointer w-8 h-8 rounded-md flex items-center justify-center select-none ${selectedGate === gate ? 'ring-2 ring-white' : ''}`}
                              style={{ backgroundColor: gateColors[gate] }}
                              onClick={() => setSelectedGate(gate)}
                            >
                              <span className="font-bold text-black text-opacity-80">{gate}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Qubits: {circuit.qubits}</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={addQubit}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={removeQubit}
                    disabled={circuit.qubits <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center mb-2">
                <Label>Options</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="h-7 px-2"
                >
                  {showAdvancedOptions ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {showAdvancedOptions && (
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Shot Count: {simulationOptions.shots}</Label>
                    <Slider
                      value={[simulationOptions.shots]}
                      min={1}
                      max={10000}
                      step={1}
                      onValueChange={(value) => setSimulationOptions(prev => ({ ...prev, shots: value[0] }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Error Rate: {simulationOptions.errorRate}%</Label>
                    <Slider
                      value={[simulationOptions.errorRate]}
                      min={0}
                      max={10}
                      step={0.1}
                      onValueChange={(value) => setSimulationOptions(prev => ({ ...prev, errorRate: value[0] }))}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="explain-results"
                      checked={simulationOptions.explainResults}
                      onChange={(e) => setSimulationOptions(prev => ({ ...prev, explainResults: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="explain-results" className="text-xs">AI Explanation</Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Circuit Canvas */}
        <div className="md:col-span-6">
          <Card className="relative overflow-x-auto">
            <CardContent className="py-6">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="circuit-canvas space-y-8">
                  {Array.from({ length: circuit.qubits }).map((_, qubitIndex) => {
                    const qubitGates = circuit.gates
                      .filter(gate => gate.qubit === qubitIndex)
                      .sort((a, b) => a.position - b.position);
                    
                    return (
                      <div key={qubitIndex} className="qubit-wire">
                        <div className="flex items-center mb-2">
                          <div className="qubit-label flex items-center justify-center bg-primary/20 text-primary w-10 h-10 rounded-full font-bold">
                            q{qubitIndex}
                          </div>
                          <div className="ml-4 h-px flex-grow bg-gray-500"></div>
                        </div>
                        
                        <Droppable droppableId={`qubit-${qubitIndex}`} direction="horizontal">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="gates-container flex items-center ml-14 min-h-[80px]"
                            >
                              {qubitGates.map((gate, index) => renderGate(gate, index))}
                              {provided.placeholder}
                              
                              {/* Drop hint */}
                              {qubitGates.length === 0 && (
                                <div className="text-sm text-gray-400 italic">
                                  Drag and drop gates here
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
              
              {/* Connection lines for controlled gates */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {circuit.gates
                  .filter(gate => ["CNOT", "CZ"].includes(gate.type) && gate.controlQubit !== undefined)
                  .map((gate) => {
                    // Find vertical positions of control and target qubits
                    const controlTop = gate.controlQubit! * 128 + 64; // Approximate
                    const targetTop = gate.qubit * 128 + 64; // Approximate
                    
                    // Find horizontal position based on gate position
                    const gatesBeforeControl = circuit.gates
                      .filter(g => g.qubit === gate.controlQubit && g.position < gate.position)
                      .length;
                    
                    const gatesBeforeTarget = circuit.gates
                      .filter(g => g.qubit === gate.qubit && g.position < gate.position)
                      .length;
                    
                    const controlLeft = 170 + gatesBeforeControl * 56; // Approximate
                    const targetLeft = 170 + gatesBeforeTarget * 56; // Approximate
                    
                    // Use the average for the connection line
                    const connectionLeft = (controlLeft + targetLeft) / 2;
                    
                    return (
                      <line
                        key={`connection-${gate.id}`}
                        x1={connectionLeft}
                        y1={controlTop}
                        x2={connectionLeft}
                        y2={targetTop}
                        stroke={gate.color}
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                    );
                  })}
              </svg>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}