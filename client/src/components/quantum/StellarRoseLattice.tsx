import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Flower, 
  Network, 
  Sparkles, 
  Fingerprint, 
  Zap, 
  Grid3x3, 
  RefreshCw, 
  Magnet,
  Atom
} from 'lucide-react';

// Define types for the lattice nodes
export interface LatticeNode {
  id: string;
  type: 'core' | 'entangled' | 'observer';
  dimensions: number;
  position: { x: number; y: number; z?: number };
  entanglementPartners: string[];
  entanglementStrength: number;
  magneticProperties?: {
    field: number;
    phase?: string;
  };
  coherenceLevel?: number;
  pulseFrequency?: number;
}

export interface StellarRoseLatticeProps {
  nodes: LatticeNode[];
  title?: string;
  description?: string;
  onNodeSelected?: (nodeId: string) => void;
  readOnly?: boolean;
  showMagneticFields?: boolean;
  showCoherencePulses?: boolean;
}

// Helper function to get color based on entanglement strength
const getEntanglementColor = (strength: number): string => {
  // Gold scale for the entanglement lines
  if (strength > 0.9) return 'rgba(255, 215, 0, 0.9)'; // Very bright gold
  if (strength > 0.7) return 'rgba(255, 215, 0, 0.8)';
  if (strength > 0.5) return 'rgba(255, 215, 0, 0.6)';
  if (strength > 0.3) return 'rgba(255, 215, 0, 0.4)';
  return 'rgba(255, 215, 0, 0.3)';
};

// Helper function to get color for magnetic phases
const getMagneticPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'ferromagnetic':
      return 'rgba(255, 50, 50, 0.2)';
    case 'antiferromagnetic':
      return 'rgba(50, 50, 255, 0.2)';
    case 'paramagnetic':
      return 'rgba(255, 0, 255, 0.2)';
    case 'spin_liquid':
      return 'rgba(0, 255, 255, 0.2)';
    default:
      return 'rgba(150, 150, 150, 0.2)';
  }
};

// Default nodes for the 37-node entanglement bloom
const defaultNodes: LatticeNode[] = [
  {
    id: 'core-1',
    type: 'core',
    dimensions: 37,
    position: { x: 0.5, y: 0.5 },
    entanglementPartners: Array.from({ length: 36 }, (_, i) => `node-${i+1}`),
    entanglementStrength: 0.95,
    magneticProperties: {
      field: 0.9,
      phase: 'paramagnetic'
    },
    coherenceLevel: 0.98,
    pulseFrequency: 2.37
  },
  ...Array.from({ length: 36 }, (_, i) => ({
    id: `node-${i+1}`,
    type: 'entangled' as const,
    dimensions: 11 + Math.floor(Math.random() * 19), // Random dimensions between 11-29
    position: {
      x: 0.5 + 0.35 * Math.cos(2 * Math.PI * i / 36),
      y: 0.5 + 0.35 * Math.sin(2 * Math.PI * i / 36),
    },
    entanglementPartners: ['core-1'],
    entanglementStrength: 0.7 + Math.random() * 0.25, // Random strength between 0.7-0.95
    magneticProperties: {
      field: 0.5 + Math.random() * 0.4,
      phase: ['ferromagnetic', 'antiferromagnetic', 'paramagnetic', 'spin_liquid'][Math.floor(Math.random() * 4)]
    },
    coherenceLevel: 0.8 + Math.random() * 0.15,
    pulseFrequency: 1 + Math.random() * 3
  }))
];

export function StellarRoseLattice({
  nodes = defaultNodes,
  title = "StellarRose Lattice",
  description = "37-node entanglement bloom with quantum coherence visualization",
  onNodeSelected,
  readOnly = false,
  showMagneticFields = true,
  showCoherencePulses = true
}: StellarRoseLatticeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showIntensity, setShowIntensity] = useState<boolean>(true);
  // Local state for magnetic fields to avoid prop mutation
  const [localShowMagneticFields, setLocalShowMagneticFields] = useState<boolean>(showMagneticFields);
  const [visualMode, setVisualMode] = useState<'bloom' | 'network' | '3d'>('bloom');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(true);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const [time, setTime] = useState<number>(0);
  const [coherencePulseIntensity, setCoherencePulseIntensity] = useState<number>(0);
  
  // Animation effect
  useEffect(() => {
    if (animating) {
      const animate = () => {
        setRotationAngle(prev => (prev + 0.2) % 360);
        setTime(prev => prev + 0.05);
        // Oscillating coherence pulse effect
        setCoherencePulseIntensity(0.5 + 0.5 * Math.sin(time * 1.5));
        
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
  }, [animating, time]);
  
  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas with a dark background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw a subtle grid pattern
    ctx.lineWidth = 0.3;
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    
    const gridSize = 25;
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw magnetic fields if enabled
    const drawMagneticFields = () => {
      if (!showMagneticFields) return;
      
      nodes.forEach(node => {
        if (node.magneticProperties && node.magneticProperties.phase) {
          const x = node.position.x * canvas.width;
          const y = node.position.y * canvas.height;
          const radius = (node.type === 'core' ? 40 : 20) * (node.dimensions / 20 + 0.7);
          
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
              ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      });
    };
    
    // Draw coherence pulses
    const drawCoherencePulses = () => {
      if (!showCoherencePulses) return;
      
      nodes.forEach(node => {
        if (node.coherenceLevel && node.coherenceLevel > 0) {
          const x = node.position.x * canvas.width;
          const y = node.position.y * canvas.height;
          const baseRadius = (node.type === 'core' ? 40 : 20) * (node.dimensions / 20 + 0.7);
          
          // Multiple concentric pulses
          const pulseCount = 3;
          for (let i = 0; i < pulseCount; i++) {
            const pulseOffset = (time * (node.pulseFrequency || 1) + i / pulseCount) % 1;
            const pulseRadius = baseRadius * (1 + pulseOffset * 1.5);
            const pulseOpacity = Math.max(0, 0.5 * (1 - pulseOffset) * node.coherenceLevel * coherencePulseIntensity);
            
            ctx.beginPath();
            ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${pulseOpacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      });
    };
    
    // Draw connections
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
            ctx.lineWidth = avgStrength * 3 + 0.5;
            ctx.stroke();
            
            // Add a glow effect for stronger entanglement
            if (avgStrength > 0.7 && visualMode === 'bloom') {
              ctx.beginPath();
              ctx.moveTo(startX, startY);
              ctx.lineTo(endX, endY);
              ctx.strokeStyle = `rgba(255, 215, 0, ${avgStrength * 0.4})`;
              ctx.lineWidth = avgStrength * 6 + 2;
              ctx.stroke();
            }
            
            // Draw entanglement oscillations along the line for bloom mode
            if (visualMode === 'bloom' && showIntensity) {
              const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
              const waves = Math.ceil(distance / 30); // Number of waves based on distance
              
              for (let i = 0; i < waves; i++) {
                const t = i / waves;
                const waveX = startX + (endX - startX) * t;
                const waveY = startY + (endY - startY) * t;
                const waveTime = time * 2 + t * 3;
                const waveRadius = 2 + Math.sin(waveTime) * 1.5;
                
                ctx.beginPath();
                ctx.arc(waveX, waveY, waveRadius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 215, 0, ${avgStrength * 0.7})`;
                ctx.fill();
              }
            }
          }
        });
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
        if (node.type === 'core') {
          radius = 40 * (showDimensions ? (node.dimensions / 30 + 0.5) : 1);
        } else if (node.type === 'entangled') {
          radius = 20 * (showDimensions ? (node.dimensions / 15 + 0.7) : 1);
        } else { // observer
          radius = 12;
        }
        
        // Draw node background
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        // Different fill styles based on node type and visual mode
        if (node.type === 'core') {
          if (visualMode === 'bloom') {
            // Radial gradient for core in bloom mode
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.7)');
            gradient.addColorStop(1, 'rgba(180, 100, 0, 0.7)');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = getEntanglementColor(node.entanglementStrength);
          }
        } else if (node.type === 'entangled') {
          if (visualMode === 'bloom') {
            // Radial gradient for entangled nodes in bloom mode
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(150, 80, 0, 0.6)');
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = getEntanglementColor(node.entanglementStrength * 0.8);
          }
        } else { // observer
          ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
        }
        
        ctx.fill();
        
        // Draw node border
        ctx.strokeStyle = selected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.stroke();
        
        // Draw dimensional rings for core and entangled nodes
        if (showDimensions && (node.type === 'core' || node.type === 'entangled')) {
          const rings = Math.min(5, Math.ceil(node.dimensions / 10));
          for (let i = 1; i <= rings; i++) {
            const ringRadius = radius * (0.7 + i * 0.08);
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${0.2 + (i / rings) * 0.3})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        
        // Draw node center pattern
        if (node.type === 'core') {
          // Draw rose pattern for core
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
          ctx.arc(x, y, radius * 0.15, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
        } else if (node.type === 'entangled') {
          // Draw simple bloom shape
          const petalX = x;
          const petalY = y - radius * 0.3;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            x - radius * 0.3,
            y - radius * 0.4,
            petalX,
            petalY
          );
          ctx.quadraticCurveTo(
            x + radius * 0.3,
            y - radius * 0.4,
            x,
            y
          );
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
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
          ctx.font = selected ? 'bold 12px sans-serif' : '10px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          
          // Show node ID
          ctx.fillText(node.id, x, y + radius + 5);
          
          // Show dimensions for quantum nodes
          if (node.type !== 'observer' && showDimensions) {
            ctx.font = '9px sans-serif';
            ctx.fillText(`${node.dimensions}D`, x, y + radius + 18);
          }
        }
        
        // Draw glow effect for selected node
        if (selected) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(x, y, radius + 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    };
    
    // Draw based on visual mode
    if (visualMode === 'bloom' || visualMode === 'network') {
      if (showMagneticFields) {
        drawMagneticFields();
      }
      if (showCoherencePulses) {
        drawCoherencePulses();
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
        const z = node.position.z || 0;
        
        // Simple circular rotation around Y axis
        const rotatedX = x * Math.cos(angleRad) - z * Math.sin(angleRad);
        const rotatedZ = x * Math.sin(angleRad) + z * Math.cos(angleRad);
        
        // Project back to screen coordinates with simple depth effect
        return {
          ...node,
          projectedPosition: {
            x: (rotatedX + 0.5) * canvas.width,
            y: (y + 0.5) * canvas.height
          },
          depth: rotatedZ // Used for sorting and sizing
        };
      });
      
      // Sort by depth for proper rendering
      projectedNodes.sort((a, b) => (a.depth || 0) - (b.depth || 0));
      
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
            
            // Depth effect
            const avgDepth = ((node.depth || 0) + (partner.depth || 0)) / 2;
            const depthFactor = 0.5 + Math.max(0, 0.5 - Math.abs(avgDepth) * 0.5);
            
            // Draw the connection line with depth effect
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = color;
            ctx.lineWidth = avgStrength * 3 * depthFactor;
            ctx.globalAlpha = depthFactor;
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
        const depthFactor = 0.5 + Math.max(0, 0.5 - Math.abs(node.depth || 0) * 0.5);
        
        // Adjust size based on type, dimensions and depth
        let radius;
        if (node.type === 'core') {
          radius = 40 * (showDimensions ? (node.dimensions / 30 + 0.5) : 1) * depthFactor;
        } else if (node.type === 'entangled') {
          radius = 20 * (showDimensions ? (node.dimensions / 15 + 0.7) : 1) * depthFactor;
        } else { // observer
          radius = 12 * depthFactor;
        }
        
        // Draw node with 3D shading
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (node.type === 'core') {
          const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
          gradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.7)');
          gradient.addColorStop(1, 'rgba(180, 100, 0, 0.7)');
          ctx.fillStyle = gradient;
        } else if (node.type === 'entangled') {
          const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.6, 'rgba(255, 215, 0, 0.6)');
          gradient.addColorStop(1, 'rgba(150, 80, 0, 0.6)');
          ctx.fillStyle = gradient;
        } else { // observer
          ctx.fillStyle = 'rgba(100, 100, 100, 0.7)';
        }
        
        ctx.globalAlpha = depthFactor;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        
        // Draw node border
        ctx.strokeStyle = selected ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = selected ? 3 : 1;
        ctx.stroke();
        
        // Draw simplified node content for 3D mode
        if (node.type !== 'observer') {
          ctx.beginPath();
          ctx.arc(x, y, radius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = node.type === 'core' 
            ? 'rgba(255, 215, 0, 0.5)'
            : 'rgba(255, 200, 100, 0.5)';
          ctx.fill();
        }
        
        // Draw labels if enabled (simplified for 3D)
        if (showLabels && depthFactor > 0.6) {
          ctx.font = '10px sans-serif';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.globalAlpha = depthFactor;
          
          // Show node ID
          ctx.fillText(node.id, x, y + radius + 5);
          
          // Show dimensions for quantum nodes
          if (node.type !== 'observer' && showDimensions) {
            ctx.font = '9px sans-serif';
            ctx.fillText(`${node.dimensions}D`, x, y + radius + 18);
          }
          
          ctx.globalAlpha = 1.0;
        }
      });
    }
    
  }, [nodes, selectedNode, showDimensions, showLabels, showIntensity, visualMode, rotationAngle, showMagneticFields, showCoherencePulses, time, coherencePulseIntensity]);
  
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
      if (node.type === 'core') {
        clickRadius = 40 * (showDimensions ? (node.dimensions / 30 + 0.5) : 1) / canvas.width;
      } else if (node.type === 'entangled') {
        clickRadius = 20 * (showDimensions ? (node.dimensions / 15 + 0.7) : 1) / canvas.width;
      } else { // observer
        clickRadius = 12 / canvas.width;
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
    <Card className="w-full bg-[#0a0a0a] border-[#333333]">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#e0e0e0]">
              {visualMode === 'bloom' && <Flower className="h-5 w-5 text-amber-300" />}
              {visualMode === 'network' && <Network className="h-5 w-5 text-amber-300" />}
              {visualMode === '3d' && <Grid3x3 className="h-5 w-5 text-amber-300" />}
              {title}
            </CardTitle>
            <CardDescription className="text-[#888888]">{description}</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnimating(!animating)}
              className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
            >
              <RefreshCw className={`h-4 w-4 ${animating ? 'text-amber-300 animate-spin' : ''}`} />
              <span className="ml-1">{animating ? 'Stop' : 'Animate'}</span>
            </Button>
            {visualMode === '3d' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRotationAngle((prev) => (prev + 45) % 360)}
                className="border-amber-700 bg-black text-amber-300 hover:bg-amber-900 hover:text-amber-200"
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
          <TabsList className="w-full justify-start mb-2 bg-[#1a1a1a]">
            <TabsTrigger value="bloom" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Flower className="h-4 w-4" />
              <span>Bloom</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Network className="h-4 w-4" />
              <span>Network</span>
            </TabsTrigger>
            <TabsTrigger value="3d" className="flex items-center gap-1 data-[state=active]:bg-amber-900 data-[state=active]:text-amber-100">
              <Grid3x3 className="h-4 w-4" />
              <span>3D View</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-[#e0e0e0]">
              <Fingerprint className="h-4 w-4 text-amber-300" />
              <Label htmlFor="show-dimensions" className="text-[#e0e0e0]">Show Dimensions:</Label>
            </div>
            <Switch 
              id="show-dimensions" 
              checked={showDimensions} 
              onCheckedChange={setShowDimensions}
              className="data-[state=checked]:bg-amber-700"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <Label htmlFor="show-intensity" className="text-[#e0e0e0]">Show Intensity:</Label>
            </div>
            <Switch 
              id="show-intensity" 
              checked={showIntensity} 
              onCheckedChange={setShowIntensity}
              className="data-[state=checked]:bg-amber-700"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Magnet className="h-4 w-4 text-amber-300" />
              <Label htmlFor="show-magnetic" className="text-[#e0e0e0]">Show Magnetic Fields:</Label>
            </div>
            <Switch 
              id="show-magnetic" 
              checked={showMagneticFields} 
              onCheckedChange={() => !readOnly && setLocalShowMagneticFields(!showMagneticFields)}
              disabled={readOnly}
              className="data-[state=checked]:bg-amber-700"
            />
          </div>
        </div>
        
        <div className="relative w-full bg-black rounded-lg overflow-hidden border border-amber-900" style={{ height: '500px' }}>
          <canvas 
            ref={canvasRef} 
            className="w-full h-full cursor-pointer"
            onClick={handleCanvasClick}
          />
          
          {selectedNode && (
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/80 rounded-lg border border-amber-700 text-[#e0e0e0]">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {nodes.find(n => n.id === selectedNode)?.type === 'core' && <Zap className="h-4 w-4 text-amber-300" />}
                {nodes.find(n => n.id === selectedNode)?.type === 'entangled' && <Flower className="h-4 w-4 text-amber-300" />}
                {nodes.find(n => n.id === selectedNode)?.type === 'observer' && <Fingerprint className="h-4 w-4 text-amber-300" />}
                {selectedNode}
              </h4>
              
              {nodes.find(n => n.id === selectedNode)?.type !== 'observer' && (
                <div className="mt-2 text-xs text-[#aaaaaa]">
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span className="font-medium text-amber-300">
                      {nodes.find(n => n.id === selectedNode)?.dimensions}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Entanglement:</span>
                    <span className="font-medium text-amber-300">
                      {(
                        (nodes.find(n => n.id === selectedNode)?.entanglementStrength || 0) * 100
                      ).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Connections:</span>
                    <span className="font-medium text-amber-300">
                      {nodes.find(n => n.id === selectedNode)?.entanglementPartners.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Coherence:</span>
                    <span className="font-medium text-amber-300">
                      {(
                        (nodes.find(n => n.id === selectedNode)?.coherenceLevel || 0) * 100
                      ).toFixed(1)}%
                    </span>
                  </div>
                  
                  {nodes.find(n => n.id === selectedNode)?.magneticProperties?.phase && (
                    <div className="flex justify-between">
                      <span>Magnetic Phase:</span>
                      <span className="font-medium text-amber-300">
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
      
      <CardFooter className="flex justify-between text-[#aaaaaa]">
        <div className="text-xs">
          {nodes.filter(n => n.type === 'core').length} Core{nodes.filter(n => n.type === 'core').length !== 1 ? 's' : ''}, {' '}
          {nodes.filter(n => n.type === 'entangled').length} Entangled, {' '}
          {nodes.filter(n => n.type === 'observer').length} Observer{nodes.filter(n => n.type === 'observer').length !== 1 ? 's' : ''}
        </div>
        
        <div className="flex items-center space-x-2">
          <Atom className="h-4 w-4 text-amber-300" />
          <span className="text-xs">
            Entanglement Energy: {(
              nodes.reduce((sum, node) => sum + node.entanglementStrength, 0) * 1.23
            ).toFixed(2)} eV
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}