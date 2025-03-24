import { useState, useRef, useEffect } from 'react';
import { QuantumGate } from '@/lib/QuantumOperations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Atom, Box, Code, Maximize, Download, Play, Plus, Trash2, Wand, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CircuitGate {
  id: string;
  type: QuantumGate;
  qubit: number;
  controlQubit?: number;
  position: number;
  color: string;
}

interface QuantumCircuitDesignerProps {
  onCircuitChange?: (gates: CircuitGate[]) => void;
  onExecute?: (gates: CircuitGate[]) => void;
  initialCircuit?: CircuitGate[];
  maxQubits?: number;
}

const gateColors = {
  'H': '#89B4FA', // Hadamard - blue
  'X': '#F38BA8', // Pauli X - red
  'Y': '#A6E3A1', // Pauli Y - green
  'Z': '#94E2D5', // Pauli Z - teal
  'CNOT': '#FAB387', // CNOT - orange
  'CZ': '#CBA6F7', // CZ - purple
  'SWAP': '#F9E2AF', // SWAP - yellow
  'RX': '#EBA0AC', // RX - pink
  'RY': '#ABE9B3', // RY - lighter green
  'RZ': '#B4BEFE', // RZ - light blue
};

const gateIcons: Record<QuantumGate, React.ReactNode> = {
  'H': <div className="text-xs font-bold">H</div>,
  'X': <div className="text-xs font-bold">X</div>,
  'Y': <div className="text-xs font-bold">Y</div>,
  'Z': <div className="text-xs font-bold">Z</div>,
  'CNOT': <div className="text-[9px] font-bold">CNOT</div>,
  'CZ': <div className="text-xs font-bold">CZ</div>,
  'SWAP': <div className="text-[9px] font-bold">SWAP</div>,
  'RX': <div className="text-xs font-bold">RX</div>,
  'RY': <div className="text-xs font-bold">RY</div>,
  'RZ': <div className="text-xs font-bold">RZ</div>,
};

export function QuantumCircuitDesigner({
  onCircuitChange,
  onExecute,
  initialCircuit = [],
  maxQubits = 8
}: QuantumCircuitDesignerProps) {
  const [numQubits, setNumQubits] = useState<number>(3);
  const [gates, setGates] = useState<CircuitGate[]>(initialCircuit);
  const [selectedGate, setSelectedGate] = useState<QuantumGate>('H');
  const [draggingGate, setDraggingGate] = useState<string | null>(null);
  const [circuitWidth, setCircuitWidth] = useState<number>(10);
  const designerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [showControlSelect, setShowControlSelect] = useState(false);
  const [controlQubit, setControlQubit] = useState<number | undefined>(undefined);
  const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);
  
  // Generate unique ID for gates
  const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  // Handle gate selection
  const handleGateSelect = (gate: QuantumGate) => {
    setSelectedGate(gate);
    setShowControlSelect(gate === 'CNOT' || gate === 'CZ');
    if (gate !== 'CNOT' && gate !== 'CZ') {
      setControlQubit(undefined);
    }
  };

  // Handle control qubit selection
  const handleControlSelect = (value: string) => {
    setControlQubit(parseInt(value));
  };
  
  // Add gate to circuit
  const addGate = (qubit: number, position: number) => {
    if (position < 0 || position >= circuitWidth) return;
    
    // Check if there's already a gate at this position
    const existingGate = gates.find(g => g.qubit === qubit && g.position === position);
    if (existingGate) return;
    
    // Check if this would create an invalid control gate (self-controlled)
    if ((selectedGate === 'CNOT' || selectedGate === 'CZ') && 
        controlQubit !== undefined && 
        controlQubit === qubit) return;
    
    const newGate: CircuitGate = {
      id: generateId(),
      type: selectedGate,
      qubit,
      position,
      color: gateColors[selectedGate] || '#89B4FA',
      ...(controlQubit !== undefined && { controlQubit }),
    };
    
    const updatedGates = [...gates, newGate];
    setGates(updatedGates);
    onCircuitChange?.(updatedGates);
  };
  
  // Remove gate from circuit
  const removeGate = (id: string) => {
    const updatedGates = gates.filter(gate => gate.id !== id);
    setGates(updatedGates);
    onCircuitChange?.(updatedGates);
  };
  
  // Handle circuit execution
  const executeCircuit = () => {
    onExecute?.(gates);
  };
  
  // Handle drag start for gates in palette
  const handleDragStart = (e: React.DragEvent, gateType: QuantumGate) => {
    e.dataTransfer.setData('gateType', gateType);
    setDraggingGate(gateType);
  };
  
  // Handle drag over for circuit grid
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!designerRef.current) return;
    
    const rect = designerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cellWidth = rect.width / circuitWidth;
    const cellHeight = 50; // Height of each qubit row
    
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    
    if (row >= 0 && row < numQubits && col >= 0 && col < circuitWidth) {
      setHoveredCell({ row, col });
    } else {
      setHoveredCell(null);
    }
  };
  
  // Handle drop for circuit grid
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('gateType') as QuantumGate;
    
    if (!hoveredCell || !designerRef.current) return;
    
    const isControlGate = gateType === 'CNOT' || gateType === 'CZ';
    
    if (isControlGate && controlQubit === undefined) {
      // For control gates, we need a control qubit
      setSelectedGate(gateType);
      setShowControlSelect(true);
      return;
    }
    
    const { row, col } = hoveredCell;
    
    // Check if this would create an invalid control gate (self-controlled)
    if (isControlGate && controlQubit === row) return;
    
    addGate(row, col);
    setHoveredCell(null);
    setDraggingGate(null);
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setDraggingGate(null);
    setHoveredCell(null);
  };
  
  // Handle adding qubit
  const addQubit = () => {
    if (numQubits < maxQubits) {
      setNumQubits(numQubits + 1);
    }
  };
  
  // Handle removing qubit
  const removeQubit = () => {
    if (numQubits > 1) {
      // Remove gates on the last qubit
      const updatedGates = gates.filter(
        gate => gate.qubit !== numQubits - 1 && gate.controlQubit !== numQubits - 1
      );
      setGates(updatedGates);
      onCircuitChange?.(updatedGates);
      setNumQubits(numQubits - 1);
      
      // Update control qubit selection if needed
      if (controlQubit === numQubits - 1) {
        setControlQubit(undefined);
      }
    }
  };
  
  // Handle clearing circuit
  const clearCircuit = () => {
    setGates([]);
    onCircuitChange?.([]);
  };
  
  // Update circuit width
  const handleCircuitWidthChange = (value: number[]) => {
    const newWidth = value[0];
    
    // Remove gates that would be outside the new circuit width
    const updatedGates = gates.filter(gate => gate.position < newWidth);
    
    setCircuitWidth(newWidth);
    setGates(updatedGates);
    onCircuitChange?.(updatedGates);
  };
  
  // Download circuit as JSON
  const downloadCircuit = () => {
    const circuitData = {
      qubits: numQubits,
      width: circuitWidth,
      gates: gates
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(circuitData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "quantum_circuit.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };
  
  // Optimize circuit (stub for now)
  const optimizeCircuit = () => {
    // This would be connected to the AI optimization API
    alert("Circuit optimization with AI will be implemented in the next phase");
  };
  
  useEffect(() => {
    // Initialize with existing circuit if provided
    if (initialCircuit.length > 0) {
      setGates(initialCircuit);
      
      // Find the maximum qubit index and position to set initial dimensions
      const maxQubit = Math.max(...initialCircuit.map(g => g.qubit)) + 1;
      const maxPosition = Math.max(...initialCircuit.map(g => g.position)) + 1;
      
      setNumQubits(Math.max(numQubits, maxQubit));
      setCircuitWidth(Math.max(circuitWidth, maxPosition));
    }
  }, [initialCircuit]);
  
  return (
    <Card className="w-full bg-[#181825] border-[#313244]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Code className="h-4 w-4 mr-2 text-[#89B4FA]" />
            <span className="text-[#CDD6F4]">Quantum Circuit Designer</span>
          </div>
          <div className="flex space-x-1">
            <Badge variant="outline" className="text-xs bg-[#313244]">
              {numQubits} qubits
            </Badge>
            <Badge variant="outline" className="text-xs bg-[#313244]">
              {gates.length} gates
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="mb-4 bg-[#313244]">
            <TabsTrigger value="design" className="data-[state=active]:bg-[#45475A]">Design</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-[#45475A]">Preview</TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-[#45475A]">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="design">
            <div className="space-y-4">
              {/* Gate Palette */}
              <div className="flex flex-wrap gap-2 mb-4 p-2 bg-[#1E1E2E] rounded-md">
                {Object.entries(gateIcons).map(([gate, icon]) => (
                  <div
                    key={gate}
                    className={cn(
                      "w-10 h-10 rounded-md flex items-center justify-center cursor-grab transition-all",
                      gate === selectedGate ? "ring-2 ring-[#CBA6F7]" : "",
                      "hover:ring-1 hover:ring-[#CBA6F7]"
                    )}
                    style={{ backgroundColor: gateColors[gate as QuantumGate] }}
                    onClick={() => handleGateSelect(gate as QuantumGate)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, gate as QuantumGate)}
                    onDragEnd={handleDragEnd}
                  >
                    {icon}
                  </div>
                ))}
              </div>
              
              {/* Control Qubit Selector (for CNOT and CZ gates) */}
              {showControlSelect && (
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xs">Control Qubit:</span>
                  <Select value={controlQubit?.toString()} onValueChange={handleControlSelect}>
                    <SelectTrigger className="w-24 h-8 text-xs bg-[#1E1E2E]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E1E2E]">
                      {Array.from({ length: numQubits }).map((_, i) => (
                        <SelectItem key={i} value={i.toString()} className="text-xs">
                          Qubit {i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {/* Circuit Designer */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs">Circuit Width: {circuitWidth}</span>
                  <div className="flex space-x-1">
                    <Button 
                      onClick={addQubit} 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6 bg-[#1E1E2E]"
                      disabled={numQubits >= maxQubits}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button 
                      onClick={removeQubit} 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6 bg-[#1E1E2E]"
                      disabled={numQubits <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="w-full flex mb-2">
                  <Slider
                    value={[circuitWidth]}
                    min={5}
                    max={20}
                    step={1}
                    onValueChange={handleCircuitWidthChange}
                    className="w-full"
                  />
                </div>
                <div 
                  ref={designerRef}
                  className="w-full bg-[#1E1E2E] rounded-md p-2 overflow-x-auto relative"
                  style={{ minHeight: `${numQubits * 50 + 10}px` }}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* Circuit Grid */}
                  {Array.from({ length: numQubits }).map((_, qubit) => (
                    <div key={qubit} className="relative h-[50px] flex items-center">
                      {/* Qubit Label */}
                      <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center bg-[#313244] rounded-md mr-2 z-10">
                        <span className="text-xs">q{qubit}</span>
                      </div>
                      
                      {/* Qubit Wire */}
                      <div className="ml-12 h-[2px] bg-[#6C7086] w-full" />
                      
                      {/* Grid Positions */}
                      {Array.from({ length: circuitWidth }).map((_, pos) => (
                        <div 
                          key={pos}
                          className={cn(
                            "absolute h-[40px] w-[40px] rounded-md",
                            hoveredCell?.row === qubit && hoveredCell?.col === pos ? "bg-[#45475A33]" : ""
                          )}
                          style={{ 
                            left: `${pos * 40 + 50}px`, 
                            top: '5px',
                          }}
                          onClick={() => addGate(qubit, pos)}
                        />
                      ))}
                    </div>
                  ))}
                  
                  {/* Render Gates */}
                  {gates.map(gate => (
                    <div key={gate.id}>
                      {/* Gate */}
                      <div
                        className="absolute flex items-center justify-center rounded-md cursor-pointer"
                        style={{
                          backgroundColor: gate.color,
                          width: '36px',
                          height: '36px',
                          left: `${gate.position * 40 + 52}px`,
                          top: `${gate.qubit * 50 + 7}px`,
                          zIndex: 20,
                        }}
                        onClick={() => removeGate(gate.id)}
                      >
                        {gateIcons[gate.type]}
                      </div>
                      
                      {/* Control Line (for CNOT and CZ gates) */}
                      {gate.controlQubit !== undefined && (
                        <div
                          className="absolute bg-[#CBA6F7] w-[2px]"
                          style={{
                            left: `${gate.position * 40 + 70}px`,
                            top: `${Math.min(gate.qubit, gate.controlQubit) * 50 + 25}px`,
                            height: `${Math.abs(gate.qubit - gate.controlQubit) * 50}px`,
                            zIndex: 15,
                          }}
                        />
                      )}
                      
                      {/* Control Point (for CNOT and CZ gates) */}
                      {gate.controlQubit !== undefined && (
                        <div
                          className="absolute bg-[#CBA6F7] rounded-full"
                          style={{
                            width: '10px',
                            height: '10px',
                            left: `${gate.position * 40 + 65}px`,
                            top: `${gate.controlQubit * 50 + 20}px`,
                            zIndex: 25,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={executeCircuit}
                  className="bg-[#CBA6F7] hover:bg-[#DDB6FF] text-[#1E1E2E]"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run Circuit
                </Button>
                <Button 
                  onClick={clearCircuit}
                  variant="outline" 
                  size="sm"
                  className="bg-[#1E1E2E]"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
                <Button 
                  onClick={optimizeCircuit}
                  variant="outline" 
                  size="sm"
                  className="bg-[#1E1E2E]"
                >
                  <Wand className="h-4 w-4 mr-1" />
                  Optimize
                </Button>
                <Button 
                  onClick={downloadCircuit}
                  variant="outline" 
                  size="sm"
                  className="bg-[#1E1E2E]"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="bg-[#1E1E2E] rounded-md p-4 min-h-[300px] flex items-center justify-center">
              <div className="text-center">
                <Atom className="h-10 w-10 text-[#CBA6F7] opacity-70 mx-auto mb-2" />
                <p className="text-sm text-[#A6ADC8]">Circuit visualization will appear here</p>
                <p className="text-xs text-[#A6ADC8] mt-1 opacity-70">Coming in the next update</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="code">
            <div className="bg-[#1E1E2E] rounded-md p-4 min-h-[300px] overflow-auto">
              <pre className="text-xs text-[#CDD6F4] font-mono">
                <code>
{`// SINGULARIS PRIME Quantum Circuit
// Generated by Quantum Circuit Designer

// Circuit with ${numQubits} qubits and ${gates.length} gates
quantum_circuit {
${gates.map(gate => {
  if (gate.controlQubit !== undefined) {
    return `  ${gate.type.toLowerCase()}(q${gate.qubit}, control=q${gate.controlQubit});  // position: ${gate.position}`;
  } else {
    return `  ${gate.type.toLowerCase()}(q${gate.qubit});  // position: ${gate.position}`;
  }
}).join('\n')}
}`}
                </code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}