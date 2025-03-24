import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface QuantumState {
  id: string;
  coordinates: number[];
}

interface QuantumSpace {
  id: string;
  dimension: number;
  metric: string;
  properties: string[];
  states: QuantumState[];
  entanglements?: { source: string; target: string; strength: number }[];
}

interface QuantumInvariant {
  name: string;
  value: number;
}

interface QuantumGeometryVisualizerProps {
  space: QuantumSpace;
  invariants?: QuantumInvariant[];
}

export function QuantumGeometryVisualizer({ space, invariants = [] }: QuantumGeometryVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeView, setActiveView] = React.useState("2d");
  
  // Colors for different metrics
  const metricColors = {
    euclidean: "#4a9fe3", // blue
    hyperbolic: "#9768d1", // purple
    elliptic: "#68b723", // green
    minkowski: "#de3b40", // red
  };
  
  // Get color for current metric
  const getMetricColor = () => {
    return metricColors[space.metric as keyof typeof metricColors] || "#888888";
  };
  
  // Function to draw 2D projection of the quantum space
  const draw2DProjection = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background grid
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    
    // Draw grid lines
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Draw axis
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // Draw metric-based space curvature representation
    ctx.fillStyle = getMetricColor();
    ctx.globalAlpha = 0.1;
    
    if (space.metric === "hyperbolic") {
      // Draw hyperbolic space representation (negative curvature)
      for (let i = 0; i < 5; i++) {
        const radius = 50 + i * 60;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else if (space.metric === "elliptic") {
      // Draw elliptic space representation (positive curvature)
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.4, 0, 2 * Math.PI);
      ctx.fill();
    } else if (space.metric === "minkowski") {
      // Draw Minkowski space representation (spacetime)
      const coneHeight = Math.min(width, height) * 0.7;
      ctx.beginPath();
      ctx.moveTo(width / 2, height / 2 - coneHeight / 2);
      ctx.lineTo(width / 2 - coneHeight / 2, height / 2 + coneHeight / 2);
      ctx.lineTo(width / 2 + coneHeight / 2, height / 2 + coneHeight / 2);
      ctx.closePath();
      ctx.fill();
      
      // Draw inverted cone for past light cone
      ctx.beginPath();
      ctx.moveTo(width / 2, height / 2 + coneHeight / 2);
      ctx.lineTo(width / 2 - coneHeight / 2, height / 2 - coneHeight / 2);
      ctx.lineTo(width / 2 + coneHeight / 2, height / 2 - coneHeight / 2);
      ctx.closePath();
      ctx.fill();
    } else {
      // Euclidean space (flat)
      ctx.fillRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    }
    
    ctx.globalAlpha = 1.0;
    
    // Draw quantum states
    if (space.states.length > 0) {
      space.states.forEach((state, index) => {
        // Use the first two coordinates for 2D projection
        // Scale to canvas size and center
        const x = (state.coordinates[0] + 1) * width / 2;
        const y = (state.coordinates[1] + 1) * height / 2;
        
        // Draw state
        ctx.fillStyle = getMetricColor();
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw state border
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw state label
        ctx.fillStyle = "#333333";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.id, x, y - 15);
      });
    }
    
    // Draw entanglements between states
    if (space.entanglements && space.entanglements.length > 0) {
      const stateMap = new Map<string, QuantumState>();
      space.states.forEach(state => stateMap.set(state.id, state));
      
      space.entanglements.forEach(entanglement => {
        const sourceState = stateMap.get(entanglement.source);
        const targetState = stateMap.get(entanglement.target);
        
        if (sourceState && targetState) {
          const x1 = (sourceState.coordinates[0] + 1) * width / 2;
          const y1 = (sourceState.coordinates[1] + 1) * height / 2;
          const x2 = (targetState.coordinates[0] + 1) * width / 2;
          const y2 = (targetState.coordinates[1] + 1) * height / 2;
          
          // Draw entanglement line with strength-based opacity
          ctx.strokeStyle = "#9768d1"; // Purple for entanglement
          ctx.globalAlpha = Math.min(1.0, Math.max(0.2, entanglement.strength));
          ctx.lineWidth = 2 * entanglement.strength;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          // Reset alpha
          ctx.globalAlpha = 1.0;
        }
      });
    }
  };
  
  // Function to draw 3D projection of the quantum space
  const draw3DProjection = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Simple 3D projection implementation
    // In a real implementation, use WebGL or Three.js for proper 3D
    
    // Draw 3D axes
    ctx.strokeStyle = "#cccccc";
    ctx.lineWidth = 2;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const axisLength = 100;
    
    // X-axis (red)
    ctx.strokeStyle = "#de3b40";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + axisLength, centerY);
    ctx.stroke();
    ctx.fillText("X", centerX + axisLength + 10, centerY);
    
    // Y-axis (green)
    ctx.strokeStyle = "#68b723";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX, centerY - axisLength);
    ctx.stroke();
    ctx.fillText("Y", centerX, centerY - axisLength - 10);
    
    // Z-axis (blue) - project into 2D
    ctx.strokeStyle = "#4a9fe3";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX - axisLength * 0.7, centerY + axisLength * 0.7);
    ctx.stroke();
    ctx.fillText("Z", centerX - axisLength * 0.7 - 10, centerY + axisLength * 0.7 + 10);
    
    // Draw 3D space representation based on metric
    ctx.fillStyle = getMetricColor();
    ctx.globalAlpha = 0.1;
    
    // Draw metric visualization
    if (space.metric === "hyperbolic") {
      // Hyperbolic space representation
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30 + i * 20, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else if (space.metric === "elliptic") {
      // Elliptic space representation
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, 2 * Math.PI);
      ctx.fill();
    } else if (space.metric === "minkowski") {
      // Minkowski space representation
      // Draw double cone for light cone
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 100);
      ctx.lineTo(centerX - 100, centerY + 100);
      ctx.lineTo(centerX + 100, centerY + 100);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY + 100);
      ctx.lineTo(centerX - 100, centerY - 100);
      ctx.lineTo(centerX + 100, centerY - 100);
      ctx.closePath();
      ctx.fill();
    } else {
      // Euclidean space
      // Draw cube
      const size = 100;
      // Front face
      ctx.beginPath();
      ctx.moveTo(centerX - size/2, centerY - size/2);
      ctx.lineTo(centerX + size/2, centerY - size/2);
      ctx.lineTo(centerX + size/2, centerY + size/2);
      ctx.lineTo(centerX - size/2, centerY + size/2);
      ctx.closePath();
      ctx.fill();
      
      // Back face (with perspective)
      ctx.beginPath();
      ctx.moveTo(centerX - size/3, centerY - size/3);
      ctx.lineTo(centerX + size/1.5, centerY - size/3);
      ctx.lineTo(centerX + size/1.5, centerY + size/1.5);
      ctx.lineTo(centerX - size/3, centerY + size/1.5);
      ctx.closePath();
      ctx.fill();
      
      // Connect front and back faces
      ctx.beginPath();
      ctx.moveTo(centerX - size/2, centerY - size/2);
      ctx.lineTo(centerX - size/3, centerY - size/3);
      ctx.moveTo(centerX + size/2, centerY - size/2);
      ctx.lineTo(centerX + size/1.5, centerY - size/3);
      ctx.moveTo(centerX + size/2, centerY + size/2);
      ctx.lineTo(centerX + size/1.5, centerY + size/1.5);
      ctx.moveTo(centerX - size/2, centerY + size/2);
      ctx.lineTo(centerX - size/3, centerY + size/1.5);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1.0;
    
    // Draw quantum states in 3D
    if (space.states.length > 0) {
      space.states.forEach((state, index) => {
        // Use three coordinates for 3D projection with simple perspective
        const x = centerX + state.coordinates[0] * 100;
        const y = centerY - state.coordinates[1] * 100;
        // Use Z for size (perspective)
        const z = state.coordinates[2] || 0;
        const size = Math.max(5, 8 + z * 3);
        
        // Draw state
        ctx.fillStyle = getMetricColor();
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw state border
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw state label
        ctx.fillStyle = "#333333";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(state.id, x, y - size - 10);
      });
    }
    
    // Draw entanglements in 3D
    if (space.entanglements && space.entanglements.length > 0) {
      const stateMap = new Map<string, QuantumState>();
      space.states.forEach(state => stateMap.set(state.id, state));
      
      space.entanglements.forEach(entanglement => {
        const sourceState = stateMap.get(entanglement.source);
        const targetState = stateMap.get(entanglement.target);
        
        if (sourceState && targetState) {
          const x1 = centerX + sourceState.coordinates[0] * 100;
          const y1 = centerY - sourceState.coordinates[1] * 100;
          const x2 = centerX + targetState.coordinates[0] * 100;
          const y2 = centerY - targetState.coordinates[1] * 100;
          
          // Draw entanglement line
          ctx.strokeStyle = "#9768d1"; // Purple for entanglement
          ctx.globalAlpha = Math.min(1.0, Math.max(0.2, entanglement.strength));
          ctx.lineWidth = 2 * entanglement.strength;
          
          // Draw wavy line for quantum entanglement visualization
          const segments = 20;
          const waveHeight = 5;
          const dx = (x2 - x1) / segments;
          const dy = (y2 - y1) / segments;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / distance; // normal vector x component
          const ny = dx / distance;  // normal vector y component
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          
          for (let i = 1; i < segments; i++) {
            const ratio = i / segments;
            const x = x1 + dx * i;
            const y = y1 + dy * i;
            const wave = Math.sin(ratio * Math.PI * 4) * waveHeight;
            
            ctx.lineTo(x + nx * wave, y + ny * wave);
          }
          
          ctx.lineTo(x2, y2);
          ctx.stroke();
          
          // Reset alpha
          ctx.globalAlpha = 1.0;
        }
      });
    }
  };
  
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      if (activeView === "2d") {
        draw2DProjection(ctx, width, height);
      } else {
        draw3DProjection(ctx, width, height);
      }
    }
  }, [space, activeView]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quantum Geometric Space: {space.metric.charAt(0).toUpperCase() + space.metric.slice(1)}</span>
          <Badge className="bg-indigo-100 text-indigo-800">{space.dimension}D</Badge>
        </CardTitle>
        <CardDescription>
          Visual representation of quantum states in {space.metric} space with{" "}
          {space.states.length} quantum state{space.states.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {space.properties.map((property, index) => (
              <Badge key={index} variant="outline">
                {property}
              </Badge>
            ))}
          </div>
          
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid grid-cols-2 w-40 mb-4">
              <TabsTrigger value="2d">2D View</TabsTrigger>
              <TabsTrigger value="3d">3D View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="border rounded w-full h-auto"
            />
          </div>
          
          <div className="lg:col-span-1">
            <h3 className="text-lg font-medium mb-2">Topological Invariants</h3>
            <div className="space-y-2">
              {invariants.map((invariant, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded flex justify-between items-center">
                  <span className="font-medium">{invariant.name}</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-800">
                    {invariant.value.toFixed(2)}
                  </Badge>
                </div>
              ))}
              
              {invariants.length === 0 && (
                <p className="text-muted-foreground text-sm italic">
                  No invariants computed for this space
                </p>
              )}
            </div>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Quantum States</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
              {space.states.map((state, index) => (
                <div key={index} className="bg-slate-50 p-2 rounded text-sm">
                  <div className="font-medium">{state.id}</div>
                  <div className="text-xs text-slate-500">
                    Coordinates: [{state.coordinates.map(c => c.toFixed(2)).join(", ")}]
                  </div>
                </div>
              ))}
              
              {space.states.length === 0 && (
                <p className="text-muted-foreground text-sm italic">
                  No quantum states in this space
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}