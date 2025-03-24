import React, { useEffect, useRef } from 'react';
import { QuantumSpace } from '@/types/quantum';

interface QuantumVisualizerProps {
  space: QuantumSpace;
}

export function QuantumVisualizer({ space }: QuantumVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2;
    
    // x-axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // y-axis
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    
    // Draw states
    space.states.forEach((state, index) => {
      // Use the first two coordinates for 2D visualization
      const x = state.coordinates[0] * canvas.width;
      const y = state.coordinates[1] * canvas.height;
      
      // Draw point
      ctx.beginPath();
      
      // Create gradient for the point
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
      
      // Different colors based on space type
      if (space.id.includes('euclidean')) {
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');
      } else if (space.id.includes('hyperbolic')) {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      } else {
        gradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
      }
      
      ctx.fillStyle = gradient;
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Add label
      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.fillText(`S${index + 1}`, x + 12, y - 8);
      
      // If there are at least 3 states and space has entanglements
      if (index > 0 && space.entanglements && space.entanglements.length > 0 && space.entanglements[0].entanglementResult.success) {
        // Draw entanglement lines between points
        const prevState = space.states[index - 1];
        const prevX = prevState.coordinates[0] * canvas.width;
        const prevY = prevState.coordinates[1] * canvas.height;
        
        // Create entanglement line
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        
        // Set line style based on entanglement strength
        const strength = space.entanglements[0].entanglementResult.entanglementStrength;
        ctx.strokeStyle = `rgba(99, 102, 241, ${strength})`;
        ctx.lineWidth = 2 * strength;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    
    // Draw entanglement field if applicable
    if (space.entanglements && space.entanglements.length > 0 && space.entanglements[0].entanglementResult.entanglementStrength > 0.7) {
      // Draw entanglement field with low opacity
      ctx.fillStyle = space.id.includes('euclidean') 
        ? 'rgba(99, 102, 241, 0.05)' 
        : space.id.includes('hyperbolic')
          ? 'rgba(139, 92, 246, 0.05)'
          : 'rgba(236, 72, 153, 0.05)';
          
      const fieldPoints: [number, number][] = [];
      
      // Create field points based on states
      space.states.forEach(state => {
        fieldPoints.push([
          state.coordinates[0] * canvas.width,
          state.coordinates[1] * canvas.height
        ]);
      });
      
      if (fieldPoints.length >= 3) {
        ctx.beginPath();
        ctx.moveTo(fieldPoints[0][0], fieldPoints[0][1]);
        
        for (let i = 1; i < fieldPoints.length; i++) {
          ctx.lineTo(fieldPoints[i][0], fieldPoints[i][1]);
        }
        
        ctx.closePath();
        ctx.fill();
      }
    }
    
  }, [space]);
  
  return (
    <div className="w-full h-[240px] rounded-md border overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{ touchAction: 'none' }}
      />
    </div>
  );
}