import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Atom, Box, Network, Orbit } from "lucide-react";
import type { QuantumSpace, QuantumState, QuantumInvariant } from "../types/quantum";

interface QuantumVisualizerProps {
  space: QuantumSpace | null;
}

export function QuantumVisualizer({ space }: QuantumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  
  // Basic animation effect for rotation
  useEffect(() => {
    if (!space) return;
    
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, [space]);
  
  // Draw visualization on canvas
  useEffect(() => {
    if (!space || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Center point
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw background grid
    ctx.strokeStyle = '#313244';
    ctx.lineWidth = 0.5;
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw states
    if (space.states.length > 0) {
      for (const state of space.states) {
        // Calculate position with rotation effect
        const rad = (rotation * Math.PI) / 180;
        const x = centerX + Math.cos(rad) * state.coordinates[0] * 100 - Math.sin(rad) * state.coordinates[1] * 100;
        const y = centerY + Math.sin(rad) * state.coordinates[0] * 100 + Math.cos(rad) * state.coordinates[1] * 100;
        
        // State glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
        gradient.addColorStop(0, 'rgba(245, 194, 231, 0.8)');
        gradient.addColorStop(1, 'rgba(245, 194, 231, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // State core
        ctx.beginPath();
        ctx.fillStyle = '#F5C2E7';
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // State label
        ctx.fillStyle = '#CDD6F4';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.id, x, y - 15);
      }
      
      // Draw connections/entanglements if we have multiple states
      if (space.states.length >= 2 && space.entanglements.length > 0) {
        // Get first two states for simplicity
        const state1 = space.states[0];
        const state2 = space.states[1];
        
        // Calculate positions with rotation effect
        const rad = (rotation * Math.PI) / 180;
        const x1 = centerX + Math.cos(rad) * state1.coordinates[0] * 100 - Math.sin(rad) * state1.coordinates[1] * 100;
        const y1 = centerY + Math.sin(rad) * state1.coordinates[0] * 100 + Math.cos(rad) * state1.coordinates[1] * 100;
        const x2 = centerX + Math.cos(rad) * state2.coordinates[0] * 100 - Math.sin(rad) * state2.coordinates[1] * 100;
        const y2 = centerY + Math.sin(rad) * state2.coordinates[0] * 100 + Math.cos(rad) * state2.coordinates[1] * 100;
        
        // Entanglement connection
        ctx.beginPath();
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, '#89B4FA');
        gradient.addColorStop(1, '#F5C2E7');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Entanglement strength indicator
        const entanglement = space.entanglements[0];
        if (entanglement && entanglement.entanglementResult) {
          const strength = entanglement.entanglementResult.entanglementStrength || 0;
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          
          ctx.beginPath();
          ctx.fillStyle = `rgba(245, 194, 231, ${strength})`;
          ctx.arc(midX, midY, 8, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.font = '9px monospace';
          ctx.fillStyle = '#CDD6F4';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${Math.round(strength * 100)}%`, midX, midY);
        }
      }
    }
    
  }, [space, rotation]);
  
  if (!space) {
    return (
      <Card className="w-full h-full bg-[#181825] border-[#313244]">
        <CardContent className="flex flex-col items-center justify-center h-full p-4">
          <Atom className="h-10 w-10 text-[#A6ADC8] opacity-20 mb-2" />
          <p className="text-sm text-[#A6ADC8]">No quantum space selected</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full bg-[#181825] border-[#313244]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center">
            <Atom className="h-4 w-4 mr-2 text-[#89B4FA]" />
            <span className="text-[#CDD6F4]">Quantum Space Visualizer</span>
          </div>
          <Badge variant="outline" className="text-xs bg-[#313244]">
            {space.id}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full aspect-square bg-[#11111B] rounded-md overflow-hidden mb-3">
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300}
            className="w-full h-full"
          />
        </div>
        
        <Separator className="my-3" />
        
        <div className="text-xs">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="flex items-center">
              <Box className="h-3 w-3 mr-1 text-[#89B4FA]" />
              <span className="font-medium mr-1">Dimension:</span>
              <span>{space.dimension}</span>
            </div>
            
            <div className="flex items-center">
              <Network className="h-3 w-3 mr-1 text-[#89B4FA]" />
              <span className="font-medium mr-1">States:</span>
              <span>{space.states.length}</span>
            </div>
            
            <div className="flex items-center">
              <Orbit className="h-3 w-3 mr-1 text-[#89B4FA]" />
              <span className="font-medium mr-1">Elements:</span>
              <span>{space.elements.join(', ')}</span>
            </div>
            
            <div className="flex items-center">
              <Atom className="h-3 w-3 mr-1 text-[#89B4FA]" />
              <span className="font-medium mr-1">Metric:</span>
              <span>Minkowski</span>
            </div>
          </div>
          
          {space.invariants.length > 0 && (
            <>
              <Separator className="my-3" />
              <h4 className="font-medium mb-2">Topological Invariants</h4>
              <div className="grid grid-cols-2 gap-2">
                {space.invariants.map((inv: QuantumInvariant, i: number) => (
                  <div key={i} className="flex justify-between">
                    <span>{inv.name}:</span>
                    <span>{inv.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {space.entanglements.length > 0 && space.entanglements[0].quantumEffects && (
            <>
              <Separator className="my-3" />
              <h4 className="font-medium mb-2">Quantum Effects</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Information Preservation:</span>
                  <span>{space.entanglements[0].quantumEffects.informationPreservation.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Decoherence Resistance:</span>
                  <span>{space.entanglements[0].quantumEffects.decoherenceResistance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Locality Measure:</span>
                  <span>{space.entanglements[0].quantumEffects.nonLocalityMeasure.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}