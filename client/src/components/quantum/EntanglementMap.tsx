import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Flower, 
  Network, 
  RefreshCw, 
  Zap,
  Grid3x3,
  Fingerprint,
  Atom,
  Magnet
} from "lucide-react";

// Type definitions for our visualization
interface EntangledNode {
  id: string;
  type: 'seed' | 'petal' | 'observer';
  dimensions: number;
  position: { x: number; y: number };
  entanglementPartners: string[];
  entanglementStrength: number;
  magneticProperties?: {
    field?: number;
    phase?: string;
  };
}

interface EntanglementMapProps {
  nodes?: EntangledNode[];
  title?: string;
  description?: string;
  onNodeSelected?: (nodeId: string) => void;
  readOnly?: boolean;
  showMagneticFields?: boolean;
}

// Helper function to generate a color based on entanglement strength
const getEntanglementColor = (strength: number): string => {
  // From purple (low entanglement) to vibrant pink/magenta (high entanglement)
  const r = Math.floor(128 + strength * 127);
  const g = Math.floor(0 + strength * 80);
  const b = Math.floor(128 + strength * 127);
  return `rgb(${r}, ${g}, ${b})`;
};

// Helper function to get magnetic phase color
const getMagneticPhaseColor = (phase?: string): string => {
  switch (phase) {
    case 'ferromagnetic':
      return 'rgba(255, 100, 100, 0.5)'; // Red
    case 'antiferromagnetic':
      return 'rgba(100, 100, 255, 0.5)'; // Blue
    case 'paramagnetic':
      return 'rgba(255, 255, 100, 0.5)'; // Yellow
    case 'spin_liquid':
      return 'rgba(100, 255, 255, 0.5)'; // Cyan
    default:
      return 'rgba(200, 200, 200, 0.3)'; // Gray
  }
};

// Default nodes for demonstration
const defaultNodes: EntangledNode[] = [
  {
    id: 'seed-1',
    type: 'seed',
    dimensions: 37,
    position: { x: 0.5, y: 0.5 },
    entanglementPartners: ['petal-1', 'petal-2', 'petal-3', 'petal-4', 'petal-5'],
    entanglementStrength: 0.9,
    magneticProperties: {
      field: 0.75,
      phase: 'ferromagnetic'
    }
  },
  {
    id: 'petal-1',
    type: 'petal',
    dimensions: 5,
    position: { x: 0.7, y: 0.3 },
    entanglementPartners: ['seed-1', 'petal-2'],
    entanglementStrength: 0.8,
    magneticProperties: {
      field: 0.6
    }
  },
  {
    id: 'petal-2',
    type: 'petal',
    dimensions: 5,
    position: { x: 0.8, y: 0.6 },
    entanglementPartners: ['seed-1', 'petal-1'],
    entanglementStrength: 0.7,
    magneticProperties: {
      field: 0.5
    }
  },
  {
    id: 'petal-3',
    type: 'petal',
    dimensions: 5,
    position: { x: 0.6, y: 0.8 },
    entanglementPartners: ['seed-1', 'petal-4'],
    entanglementStrength: 0.75,
    magneticProperties: {
      field: 0.55
    }
  },
  {
    id: 'petal-4',
    type: 'petal',
    dimensions: 5,
    position: { x: 0.3, y: 0.7 },
    entanglementPartners: ['seed-1', 'petal-3', 'petal-5'],
    entanglementStrength: 0.85,
    magneticProperties: {
      field: 0.7
    }
  },
  {
    id: 'petal-5',
    type: 'petal',
    dimensions: 5,
    position: { x: 0.2, y: 0.4 },
    entanglementPartners: ['seed-1', 'petal-4'],
    entanglementStrength: 0.65,
    magneticProperties: {
      field: 0.45
    }
  },
  {
    id: 'observer-1',
    type: 'observer',
    dimensions: 1,
    position: { x: 0.1, y: 0.1 },
    entanglementPartners: [],
    entanglementStrength: 0
  }
];

export function EntanglementMap({
  nodes = defaultNodes,
  title = "Quantum Entanglement Topography",
  description = "Visualization of entangled quantum states",
  onNodeSelected,
  readOnly = false,
  showMagneticFields = true
}: EntanglementMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showIntensity, setShowIntensity] = useState<boolean>(true);
  const [visualMode, setVisualMode] = useState<'garden' | 'network' | '3d'>('garden');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const [_, setShowMagneticFields] = useState<boolean>(showMagneticFields);
  
  // Animation effect
  useEffect(() => {
    if (animating) {
      const animate = () => {
        setRotationAngle(prev => (prev + 0.5) % 360);
        const frameId = requestAnimationFrame(animate);
        setAnimationFrameId(frameId);
      };
      
      const frameId = requestAnimationFrame(animate);
      setAnimationFrameId(frameId);
      
      return () => {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [animating]);
  
  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections first (so they appear behind nodes)
    const drawConnections = () => {
      nodes.forEach(node => {
        node.entanglementPartners.forEach(partnerId => {
          const partner = nodes.find(n => n.id === partnerId);
          if (partner) {
            const startX = node.position.x * canvas.width;
            const startY = node.position.y * canvas.height;
            const endX = partner.position.x * canvas.width;
            const endY = partner.position.y * canvas.height;
            
            // Get color based on average entanglement strength
            const avgStrength = (node.entanglementStrength + partner.entanglementStrength) / 2;
            const color = getEntanglementColor(avgStrength);
            
            // Draw the connection line
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = avgStrength * 4 + 1;
            ctx.stroke();
            
            // Add a glow effect for stronger entanglement
            if (avgStrength > 0.7 && visualMode === 'garden') {
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.strokeStyle = `rgba(255, 200, 255, ${avgStrength * 0.5})`;
              ctx.lineWidth = avgStrength * 8 + 2;
              ctx.stroke();
            }
            
            // Draw entanglement oscillations along the line if in garden mode
            if (visualMode === 'garden' && showIntensity) {
              const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
              const waves = Math.ceil(distance / 20); // Number of waves based on distance
              
              for (let i = 0; i < waves; i++) {
                const t = i / waves;
                const waveX = startX + (endX - startX) * t;
                const waveY = startY + (endY - startY) * t;
                const waveRadius = 3 + Math.sin((t * Math.PI * 4) + (rotationAngle * Math.PI / 180)) * 2;
                
                ctx.beginPath();
                ctx.arc(waveX, waveY, waveRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 200, 255, ${avgStrength * 0.7})`;
                ctx.fill();
              }
            }
          }
        });
      });
    };
    
    // Draw magnetic field if enabled
    const drawMagneticFields = () => {
      if (!showMagneticFields) return;
      
      nodes.forEach(node => {
        if (node.magneticProperties && node.magneticProperties.phase) {
          const x = node.position.x * canvas.width;
          const y = node.position.y * canvas.height;
          const radius = (node.type === 'seed' ? 40 : 25) * (node.dimensions / 10 + 0.7);
          
          // Draw magnetic field background
          ctx.beginPath();
          ctx.arc(x, y, radius * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = getMagneticPhaseColor(node.magneticProperties.phase);
          ctx.fill();
          
          // Draw field lines
          if (node.magneticProperties.field && node.magneticProperties.field > 0) {
            const fieldStrength = node.magneticProperties.field;
            const fieldLines = Math.ceil(fieldStrength * 8);
            
            for (let i = 0; i < fieldLines; i++) {
              const angle = (i / fieldLines) * Math.PI * 2 + (rotationAngle * Math.PI / 180);
              const innerRadius = radius * 1.3;
              const outerRadius = radius * (1.8 + fieldStrength * 0.5);
              
              const startX = x + Math.cos(angle) * innerRadius;
              const startY = y + Math.sin(angle) * innerRadius;
              const endX = x + Math.cos(angle) * outerRadius;
              const endY = y + Math.sin(angle) * outerRadius;
              
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
              ctx.lineWidth = 1.5;
              ctx.stroke();
              
              // Add arrow at the end of the field line
              ctx.beginPath();
              ctx.moveTo(endX, endY);
              ctx.lineTo(
                endX - Math.cos(angle + 0.2) * 5,
                endY - Math.sin(angle + 0.2) * 5
              );
              ctx.lineTo(
                endX - Math.cos(angle - 0.2) * 5,
                endY - Math.sin(angle - 0.2) * 5
              );
              ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
              ctx.fill();
            }
          }
        }
      });
    };
    
    // Draw nodes
    const drawNodes = () => {
      nodes.forEach(node => {
        const x = node.position.x * canvas.width;
        const y = node.position.y * canvas.height;
        const selected = node.id === selectedNode;
        
        // Adjust size based on type and dimensions
        let radius;
        if (node.type === 'seed') {
          radius = 40 * (showDimensions ? (node.dimensions / 20 + 0.5) : 1);
        } else if (node.type === 'petal') {
          radius = 25 * (showDimensions ? (node.dimensions / 10 + 0.7) : 1);
        } else { // observer
          radius = 15;
        }
        
        // Draw node background
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        // Different fill styles based on node type and visual mode
        if (node.type === 'seed') {
          if (visualMode === 'garden') {
            // Radial gradient for seed in garden mode
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 230, 255, 1)');
            gradient.addColorStop(0.6, getEntanglementColor(node.entanglementStrength));
            gradient.addColorStop(1, 'rgba(80, 0, 100, 0.8)');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = getEntanglementColor(node.entanglementStrength);
          }
        } else if (node.type === 'petal') {
          if (visualMode === 'garden') {
            // Radial gradient for petals in garden mode
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.7, getEntanglementColor(node.entanglementStrength * 0.8));
            gradient.addColorStop(1, 'rgba(60, 0, 80, 0.7)');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = getEntanglementColor(node.entanglementStrength * 0.8);
          }
        } else { // observer
          ctx.fillStyle = 'rgba(150, 150, 150, 0.7)';
        }
        
        ctx.fill();
        
        // Draw node border
        ctx.strokeStyle = selected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.stroke();
        
        // Draw dimensional rings for seeds and petals if enabled
        if (showDimensions && (node.type === 'seed' || node.type === 'petal')) {
          const rings = Math.min(5, Math.ceil(node.dimensions / 10));
          for (let i = 1; i <= rings; i++) {
            const ringRadius = radius * (0.7 + i * 0.1);
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + (i / rings) * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        
        // Draw node icon
        if (node.type === 'seed') {
          // Draw flower-like icon for seed
          const petalCount = 8;
          const petalLength = radius * 0.4;
          
          for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2 + (rotationAngle * Math.PI / 180);
            const petalX = x + Math.cos(angle) * petalLength;
            const petalY = y + Math.sin(angle) * petalLength;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
              x + Math.cos(angle + 0.2) * petalLength * 1.2,
              y + Math.sin(angle + 0.2) * petalLength * 1.2,
              petalX,
              petalY
            );
            ctx.quadraticCurveTo(
              x + Math.cos(angle - 0.2) * petalLength * 1.2,
              y + Math.sin(angle - 0.2) * petalLength * 1.2,
              x,
              y
            );
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
          }
          
          // Draw center circle
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 100, 0.9)';
          ctx.fill();
        } else if (node.type === 'petal') {
          // Draw simple petal shape
          const petalX = x;
          const petalY = y - radius * 0.3;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            x - radius * 0.4,
            y - radius * 0.5,
            petalX,
            petalY
          );
          ctx.quadraticCurveTo(
            x + radius * 0.4,
            y - radius * 0.5,
            x,
            y
          );
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.fill();
        } else if (node.type === 'observer') {
          // Draw eye-like icon for observer
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200, 200, 200, 0.9)';
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
          ctx.fill();
        }
        
        // Draw labels if enabled
        if (showLabels) {
          ctx.font = selected ? 'bold 14px sans-serif' : '12px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          // Show node ID
          ctx.fillText(node.id, x, y + radius + 5);
          
          // Show dimensions for quantum nodes
          if (node.type !== 'observer') {
            ctx.font = '11px sans-serif';
            ctx.fillText(`${node.dimensions}D`, x, y + radius + 20);
            
            // Show entanglement strength
            if (node.entanglementStrength > 0) {
              ctx.fillText(
                `E: ${(node.entanglementStrength * 100).toFixed(0)}%`,
                x,
                y + radius + 35
              );
            }
          }
        }
        
        // Draw glow effect for selected node
        if (selected) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };
    
    // Draw based on visual mode
    if (visualMode === 'garden' || visualMode === 'network') {
      if (showMagneticFields) {
        drawMagneticFields();
      }
      drawConnections();
      drawNodes();
    } else if (visualMode === '3d') {
      // Simple pseudo-3D effect with projection
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const projectedNodes = nodes.map(node => {
        // Apply rotation to node positions (simplified 3D)
        const angleRad = rotationAngle * Math.PI / 180;
        const x = node.position.x - 0.5;
        const y = node.position.y - 0.5;
        
        // Simple circular rotation
        const rotatedX = x * Math.cos(angleRad) - y * Math.sin(angleRad);
        const rotatedY = x * Math.sin(angleRad) + y * Math.cos(angleRad);
        
        // Project back to screen coordinates
        return {
          ...node,
          projectedPosition: {
            x: (rotatedX + 0.5) * canvas.width,
            y: (rotatedY + 0.5) * canvas.height
          }
        };
      });
      
      // Sort by Y position for simple depth effect
      projectedNodes.sort((a, b) => 
        (a.projectedPosition?.y || 0) - (b.projectedPosition?.y || 0)
      );
      
      // Draw connections with depth
      projectedNodes.forEach(node => {
        node.entanglementPartners.forEach(partnerId => {
          const partner = projectedNodes.find(n => n.id === partnerId);
          if (partner) {
            const startX = node.projectedPosition?.x || 0;
            const startY = node.projectedPosition?.y || 0;
            const endX = partner.projectedPosition?.x || 0;
            const endY = partner.projectedPosition?.y || 0;
            
            // Get color based on average entanglement strength
            const avgStrength = (node.entanglementStrength + partner.entanglementStrength) / 2;
            const color = getEntanglementColor(avgStrength);
            
            // Draw the connection line with depth effect
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = avgStrength * 4 + 1;
            ctx.globalAlpha = 0.5 + avgStrength * 0.5; // Depth effect with transparency
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        });
      });
      
      // Draw nodes with depth
      projectedNodes.forEach(node => {
        const x = node.projectedPosition?.x || 0;
        const y = node.projectedPosition?.y || 0;
        const selected = node.id === selectedNode;
        
        // Adjust size based on type and dimensions
        let radius;
        if (node.type === 'seed') {
          radius = 40 * (showDimensions ? (node.dimensions / 20 + 0.5) : 1);
        } else if (node.type === 'petal') {
          radius = 25 * (showDimensions ? (node.dimensions / 10 + 0.7) : 1);
        } else { // observer
          radius = 15;
        }
        
        // Draw node with 3D shading
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (node.type === 'seed') {
          const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(255, 230, 255, 1)');
          gradient.addColorStop(0.7, getEntanglementColor(node.entanglementStrength));
          gradient.addColorStop(1, 'rgba(80, 0, 100, 0.8)');
          ctx.fillStyle = gradient;
        } else if (node.type === 'petal') {
          const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
          gradient.addColorStop(0.8, getEntanglementColor(node.entanglementStrength * 0.8));
          gradient.addColorStop(1, 'rgba(60, 0, 80, 0.7)');
          ctx.fillStyle = gradient;
        } else { // observer
          ctx.fillStyle = 'rgba(150, 150, 150, 0.7)';
        }
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
        ctx.fill();
        
        // Remove shadow for other elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw node border
        ctx.strokeStyle = selected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.stroke();
        
        // Simplified node content for 3D mode
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = node.type === 'seed' 
          ? 'rgba(255, 200, 255, 0.5)'
          : (node.type === 'petal' ? 'rgba(200, 220, 255, 0.5)' : 'rgba(200, 200, 200, 0.7)');
        ctx.fill();
        
        // Draw labels if enabled (simplified for 3D)
        if (showLabels) {
          ctx.font = selected ? 'bold 14px sans-serif' : '12px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          // Show node ID
          ctx.fillText(node.id, x, y + radius + 5);
          
          // Show dimensions for quantum nodes
          if (node.type !== 'observer' && showDimensions) {
            ctx.font = '11px sans-serif';
            ctx.fillText(`${node.dimensions}D`, x, y + radius + 20);
          }
        }
      });
    }
    
  }, [nodes, selectedNode, showDimensions, showLabels, showIntensity, visualMode, rotationAngle, showMagneticFields]);
  
  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    
    // Find clicked node
    const clickedNode = nodes.find(node => {
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const distance = Math.sqrt(Math.pow(x - nodeX, 2) + Math.pow(y - nodeY, 2));
      
      // Adjust click radius based on node type
      let clickRadius;
      if (node.type === 'seed') {
        clickRadius = 40 * (showDimensions ? (node.dimensions / 20 + 0.5) : 1) / canvas.width;
      } else if (node.type === 'petal') {
        clickRadius = 25 * (showDimensions ? (node.dimensions / 10 + 0.7) : 1) / canvas.width;
      } else { // observer
        clickRadius = 15 / canvas.width;
      }
      
      return distance < clickRadius * 1.5; // Add some margin for easier clicking
    });
    
    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      onNodeSelected?.(clickedNode.id);
    } else {
      setSelectedNode(null);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {visualMode === 'garden' && <Flower className="h-5 w-5" />}
              {visualMode === 'network' && <Network className="h-5 w-5" />}
              {visualMode === '3d' && <Grid3x3 className="h-5 w-5" />}
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnimating(!animating)}
            >
              <RefreshCw className={`h-4 w-4 ${animating ? 'text-primary animate-spin' : ''}`} />
              <span className="ml-1">{animating ? 'Stop' : 'Animate'}</span>
            </Button>
            {visualMode === '3d' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="ml-1">Rotate</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={visualMode} onValueChange={(value) => setVisualMode(value as any)} className="mb-4">
          <TabsList className="w-full justify-start mb-2">
            <TabsTrigger value="garden" className="flex items-center gap-1">
              <Flower className="h-4 w-4" />
              <span>Garden</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-1">
              <Network className="h-4 w-4" />
              <span>Network</span>
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-1">
              <Grid3x3 className="h-4 w-4" />
              <span>3D View</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Fingerprint className="h-4 w-4" />
              <Label htmlFor="show-dimensions">Show Dimensions:</Label>
            </div>
            <Switch 
              id="show-dimensions" 
              checked={showDimensions} 
              onCheckedChange={setShowDimensions} 
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <Label htmlFor="show-intensity">Show Intensity:</Label>
            </div>
            <Switch 
              id="show-intensity" 
              checked={showIntensity} 
              onCheckedChange={setShowIntensity} 
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Magnet className="h-4 w-4" />
              <Label htmlFor="show-magnetic">Show Magnetic Fields:</Label>
            </div>
            <Switch 
              id="show-magnetic" 
              checked={showMagneticFields} 
              onCheckedChange={() => !readOnly && setShowMagneticFields(!showMagneticFields)} 
              disabled={readOnly}
            />
          </div>
        </div>
        
        <div className="relative w-full bg-background/5 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <canvas 
            ref={canvasRef} 
            className="w-full h-full cursor-pointer"
            onClick={handleCanvasClick}
          />
          
          {selectedNode && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-card rounded-lg shadow-lg border border-border">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {nodes.find(n => n.id === selectedNode)?.type === 'seed' && <Zap className="h-4 w-4" />}
                {nodes.find(n => n.id === selectedNode)?.type === 'petal' && <Flower className="h-4 w-4" />}
                {nodes.find(n => n.id === selectedNode)?.type === 'observer' && <Fingerprint className="h-4 w-4" />}
                {selectedNode}
              </h4>
              
              {nodes.find(n => n.id === selectedNode)?.type !== 'observer' && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="font-medium">
                      {nodes.find(n => n.id === selectedNode)?.dimensions}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Entanglement:</span>
                    <span className="font-medium">
                      {(
                        (nodes.find(n => n.id === selectedNode)?.entanglementStrength || 0) * 100
                      ).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Connections:</span>
                    <span className="font-medium">
                      {nodes.find(n => n.id === selectedNode)?.entanglementPartners.length || 0}
                    </span>
                  </div>
                  
                  {nodes.find(n => n.id === selectedNode)?.magneticProperties?.phase && (
                    <div className="flex justify-between">
                      <span>Magnetic Phase:</span>
                      <span className="font-medium">
                        {nodes.find(n => n.id === selectedNode)?.magneticProperties?.phase}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {nodes.filter(n => n.type === 'seed').length} Seeds, {' '}
          {nodes.filter(n => n.type === 'petal').length} Petals, {' '}
          {nodes.filter(n => n.type === 'observer').length} Observers
        </div>
        
        <div className="flex items-center space-x-2">
          <Atom className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Total Entanglement Energy: {(
              nodes.reduce((sum, node) => sum + node.entanglementStrength, 0) * 1.23
            ).toFixed(2)} eV
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}