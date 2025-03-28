import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Box, GitMerge, RotateCw, ArrowDownUp, Waves, Atom } from "lucide-react";

export interface QuantumVisualizerProps {
  spaces: any[];
  selectedSpace: string;
}

export function QuantumVisualizer({ 
  spaces = [], 
  selectedSpace = ""
}: QuantumVisualizerProps) {
  const [activeSpace, setActiveSpace] = useState<any>(null);
  const [visualizationMode, setVisualizationMode] = useState<string>("3d");

  // Set initial active space
  useEffect(() => {
    if (spaces.length > 0) {
      if (selectedSpace) {
        const space = spaces.find(s => s.id === selectedSpace);
        setActiveSpace(space || spaces[0]);
      } else {
        setActiveSpace(spaces[0]);
      }
    }
  }, [spaces, selectedSpace]);

  if (!activeSpace && spaces.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Box className="h-12 w-12 text-muted-foreground opacity-30" />
        <div>
          <h3 className="text-lg font-medium mb-1">No Quantum Spaces</h3>
          <p className="text-sm text-muted-foreground">
            Create a quantum geometric space to visualize it here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-11rem)]">
      <div className="p-4 space-y-4">
        {spaces.length > 0 && (
          <Card className="bg-slate-950 border-slate-800">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Quantum Space Visualization</CardTitle>
                <Select
                  value={visualizationMode}
                  onValueChange={setVisualizationMode}
                >
                  <SelectTrigger className="w-24 h-7 text-xs">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3d">3D View</SelectItem>
                    <SelectItem value="bloch">Bloch Sphere</SelectItem>
                    <SelectItem value="matrix">Matrix</SelectItem>
                    <SelectItem value="circuit">Circuit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription className="text-xs flex justify-between items-center">
                <span>
                  {activeSpace?.params?.metric || "minkowski"} space in {activeSpace?.params?.dimension || 3}D
                </span>
                {spaces.length > 1 && (
                  <Select
                    value={activeSpace?.id}
                    onValueChange={(value) => {
                      const space = spaces.find(s => s.id === value);
                      setActiveSpace(space);
                    }}
                  >
                    <SelectTrigger className="w-32 h-7 text-xs">
                      <SelectValue placeholder="Select space" />
                    </SelectTrigger>
                    <SelectContent>
                      {spaces.map((space) => (
                        <SelectItem key={space.id} value={space.id}>
                          {space.id.substring(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 w-full rounded-md border border-slate-800 bg-black overflow-hidden">
                {visualizationMode === "3d" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QuantumSpaceVisualization space={activeSpace} />
                  </div>
                )}
                
                {visualizationMode === "bloch" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BlochSphereVisualization space={activeSpace} />
                  </div>
                )}
                
                {visualizationMode === "matrix" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MatrixVisualization space={activeSpace} />
                  </div>
                )}
                
                {visualizationMode === "circuit" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CircuitVisualization space={activeSpace} />
                  </div>
                )}
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                  Rotate
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  <ArrowDownUp className="h-3.5 w-3.5 mr-1.5" />
                  Scale
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSpace && (
          <>
            <Card className="bg-slate-950 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quantum States</CardTitle>
                <CardDescription className="text-xs">
                  Quantum states embedded in this space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeSpace.states && activeSpace.states.length > 0 ? (
                    activeSpace.states.map((state: any, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md border border-slate-800 bg-slate-900"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center mr-2">
                            <Atom className="h-3.5 w-3.5 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-xs font-medium">{state.id || `State ${index + 1}`}</div>
                            <div className="text-[10px] text-muted-foreground">{state.coordinates?.join(', ')}</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          ψ
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No quantum states in this space
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-950 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Topological Invariants</CardTitle>
                <CardDescription className="text-xs">
                  Mathematical properties of the quantum space
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeSpace.invariants && activeSpace.invariants.length > 0 ? (
                    activeSpace.invariants.map((invariant: any, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md border border-slate-800 bg-slate-900"
                      >
                        <div className="text-xs">{invariant.name}</div>
                        <Badge className="text-[10px] bg-blue-600">{invariant.value.toFixed(3)}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No invariants calculated
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ScrollArea>
  );
}

// Visualization components

function QuantumSpaceVisualization({ space }: { space: any }) {
  // Get dimension directly or from params, if available
  const dimension = space?.dimension || space?.params?.dimension || 3;
  // Get metric from spaceProperties or use space id or fallback to minkowski
  const metric = space?.spaceProperties?.metric || (space?.id ? space.id.replace('space-', '') : 'minkowski');
  const energy = space?.params?.energy || 0.75;
  
  const getMetricColor = () => {
    switch(metric) {
      case "euclidean": return "#4f46e5";
      case "minkowski": return "#7c3aed";
      case "hyperbolic": return "#db2777";
      case "elliptic": return "#0891b2";
      default: return "#4f46e5";
    }
  };
  
  const gridSize = 10;
  const pointSize = 5;
  
  return (
    <div className="relative w-full h-full">
      {/* Background grid */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="grid"
          style={{
            width: `${gridSize * 20}px`,
            height: `${gridSize * 20}px`,
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), 
                               linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            transform: `perspective(800px) rotateX(60deg) rotateZ(0deg)`
          }}
        />
      </div>
      
      {/* Quantum space */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
          style={{
            width: dimension * 30,
            height: dimension * 30,
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${getMetricColor()}75 0%, transparent 70%)`,
              boxShadow: `0 0 40px ${getMetricColor()}50`,
            }}
          />
          
          {/* Entanglement lines */}
          {space.entanglements && space.entanglements.map((entanglement: any, index: number) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                width: "100%",
                height: "1px",
                background: `linear-gradient(90deg, transparent, ${getMetricColor()}, transparent)`,
                transform: `rotate(${index * 45}deg)`
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.5
              }}
            />
          ))}
          
          {/* Quantum states */}
          {space.states && space.states.map((state: any, index: number) => {
            // Calculate position based on coordinates
            const x = state.coordinates && state.coordinates[0] ? state.coordinates[0] * 10 : (Math.random() * 80 - 40);
            const y = state.coordinates && state.coordinates[1] ? state.coordinates[1] * 10 : (Math.random() * 80 - 40);
            
            return (
              <motion.div
                key={index}
                className="absolute rounded-full"
                style={{
                  width: pointSize * 2,
                  height: pointSize * 2,
                  backgroundColor: getMetricColor(),
                  boxShadow: `0 0 10px ${getMetricColor()}`,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  marginLeft: -pointSize,
                  marginTop: -pointSize
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2
                }}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

function BlochSphereVisualization({ space }: { space: any }) {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <motion.div
        className="w-40 h-40 border border-indigo-500/30 rounded-full relative"
        style={{
          background: "radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)",
          boxShadow: "0 0 20px rgba(79, 70, 229, 0.2)"
        }}
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Z-axis */}
        <motion.div className="absolute h-44 w-[1px] bg-blue-400/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        {/* X-axis */}
        <motion.div className="absolute h-[1px] w-44 bg-red-400/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        {/* Y-axis */}
        <motion.div 
          className="absolute h-44 w-[1px] bg-green-400/50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: "translate(-50%, -50%) rotateZ(90deg) rotateX(90deg)" }}
        />
        
        {/* Qubit state vector */}
        <motion.div
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-purple-300"
          style={{
            top: "50%",
            transformOrigin: "left center",
            transform: "rotate(45deg)"
          }}
          animate={{
            rotate: [45, 60, 30, 45]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <motion.div
            className="absolute w-2 h-2 bg-purple-400 rounded-full right-0 top-1/2 -translate-y-1/2"
            animate={{
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              boxShadow: "0 0 5px rgba(168, 85, 247, 0.8)"
            }}
          />
        </motion.div>
        
        {/* State labels */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 text-xs text-blue-400">|0⟩</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs text-blue-400">|1⟩</div>
      </motion.div>
    </div>
  );
}

function MatrixVisualization({ space }: { space: any }) {
  const matrixSize = 4; // 4x4 matrix
  const cellSize = 30;
  
  // Generate a sample matrix based on space properties
  const generateMatrix = () => {
    const matrix = [];
    for (let i = 0; i < matrixSize; i++) {
      const row = [];
      for (let j = 0; j < matrixSize; j++) {
        if (i === j) {
          // Diagonal elements
          row.push({
            real: Math.random().toFixed(2),
            imag: "0.00",
            magnitude: Math.random()
          });
        } else {
          // Off-diagonal elements
          const real = (Math.random() * 0.5 - 0.25).toFixed(2);
          const imag = (Math.random() * 0.5 - 0.25).toFixed(2);
          row.push({
            real,
            imag: `${imag.startsWith('-') ? '' : '+'}${imag}i`,
            magnitude: Math.sqrt(parseFloat(real) ** 2 + parseFloat(imag) ** 2)
          });
        }
      }
      matrix.push(row);
    }
    return matrix;
  };
  
  const matrix = generateMatrix();
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="border border-slate-700 bg-black/50 p-3 rounded-md">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrixSize}, ${cellSize}px)` }}>
          {matrix.map((row, i) => 
            row.map((cell, j) => (
              <motion.div
                key={`${i}-${j}`}
                className="flex items-center justify-center bg-slate-900 rounded-sm"
                style={{ 
                  width: cellSize, 
                  height: cellSize,
                  opacity: cell.magnitude,
                  background: `rgba(124, 58, 237, ${cell.magnitude})`
                }}
                animate={{
                  opacity: [cell.magnitude, cell.magnitude * 1.3, cell.magnitude]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: (i + j) * 0.1
                }}
              >
                <div className="text-[8px] text-white text-center leading-none">
                  {cell.real}
                  <br />
                  {cell.imag}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CircuitVisualization({ space }: { space: any }) {
  // Generate a sample circuit based on space properties
  const qubits = 3;
  const steps = 5;
  
  const generateCircuit = () => {
    const circuit = [];
    for (let i = 0; i < qubits; i++) {
      const row = [];
      for (let j = 0; j < steps; j++) {
        let gate = 'I'; // Identity by default
        let controlTarget = false;
        let controlSource = false;
        
        // Add some random gates
        if (i === 0 && j === 0) gate = 'H';
        else if (i === 1 && j === 1) gate = 'X';
        else if (i === 2 && j === 2) gate = 'Z';
        else if (i === 0 && j === 3) gate = 'H';
        else if (i === 0 && j === 4) gate = 'M';
        
        // Add CNOT
        if (i === 1 && j === 3) controlSource = true;
        if (i === 2 && j === 3) controlTarget = true;
        
        row.push({ gate, controlSource, controlTarget });
      }
      circuit.push(row);
    }
    return circuit;
  };
  
  const circuit = generateCircuit();
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="border border-slate-700 bg-black/50 p-3 rounded-md">
        {circuit.map((row, qubitIdx) => (
          <div key={qubitIdx} className="flex items-center mb-2">
            <div className="w-8 text-right mr-2 text-xs text-muted-foreground">q{qubitIdx}</div>
            <div className="flex-1 h-px bg-slate-700 flex items-center relative">
              {row.map((cell, stepIdx) => (
                <div key={stepIdx} className="relative" style={{ left: `${stepIdx * 30}px` }}>
                  {cell.gate !== 'I' && !cell.controlTarget && (
                    <motion.div
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center ${
                        cell.gate === 'M' ? 'border border-amber-500' : 'bg-indigo-700'
                      }`}
                      animate={{
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: qubitIdx * 0.2
                      }}
                    >
                      <span className="text-[9px] font-bold">{cell.gate}</span>
                    </motion.div>
                  )}
                  
                  {cell.controlSource && (
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
                  )}
                  
                  {cell.controlTarget && (
                    <div className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-2 border-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                  )}
                  
                  {cell.controlSource && (
                    <div className="absolute -translate-x-1/2 w-[1px] h-[31px] bg-purple-500"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}