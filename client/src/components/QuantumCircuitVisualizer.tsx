import { useRef, useEffect } from 'react';
import { CircuitGate } from './QuantumCircuitDesigner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Atom, Network } from 'lucide-react';

interface QuantumCircuitVisualizerProps {
  gates: CircuitGate[];
  numQubits: number;
  stateProbabilities?: Record<string, number>;
}

export function QuantumCircuitVisualizer({
  gates,
  numQubits,
  stateProbabilities = {}
}: QuantumCircuitVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gate and wire colors
  const colors = {
    background: '#1E1E2E',
    wire: '#6C7086',
    qubitLabel: '#CDD6F4',
    stateProbability: '#F5C2E7',
    H: '#89B4FA',
    X: '#F38BA8',
    Y: '#A6E3A1',
    Z: '#94E2D5',
    CNOT: '#FAB387',
    CZ: '#CBA6F7', 
    SWAP: '#F9E2AF',
    RX: '#EBA0AC',
    RY: '#ABE9B3',
    RZ: '#B4BEFE',
  };

  // Configuration
  const config = {
    gateSize: 30,
    wireSpacing: 50,
    leftMargin: 50,
    topMargin: 10,
    qubitRadius: 4,
    stateBarHeight: 80,
    stateBarMargin: 10,
  };

  // Draw the circuit visualization on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Find the maximum position to determine circuit width
    const maxPosition = gates.length > 0 
      ? Math.max(...gates.map(g => g.position)) + 1
      : 5;

    // Adjust canvas dimensions
    const circuitWidth = maxPosition * config.gateSize * 1.5 + config.leftMargin * 2;
    const circuitHeight = numQubits * config.wireSpacing + config.topMargin * 2;
    const canvasHeight = circuitHeight + (Object.keys(stateProbabilities).length > 0 
      ? config.stateBarHeight + config.stateBarMargin 
      : 0);

    canvas.width = circuitWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw qubit wires
    for (let i = 0; i < numQubits; i++) {
      const y = i * config.wireSpacing + config.topMargin + config.wireSpacing / 2;
      
      // Qubit label
      ctx.fillStyle = colors.qubitLabel;
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`q${i}:`, config.leftMargin - 10, y);
      
      // Initial qubit state
      ctx.beginPath();
      ctx.fillStyle = colors.qubitLabel;
      ctx.arc(config.leftMargin, y, config.qubitRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Wire
      ctx.beginPath();
      ctx.strokeStyle = colors.wire;
      ctx.lineWidth = 1;
      ctx.moveTo(config.leftMargin, y);
      ctx.lineTo(circuitWidth - config.leftMargin / 2, y);
      ctx.stroke();
    }

    // Draw gates
    gates.forEach(gate => {
      const x = gate.position * config.gateSize * 1.5 + config.leftMargin + config.gateSize;
      const y = gate.qubit * config.wireSpacing + config.topMargin + config.wireSpacing / 2;
      
      // Gate box
      ctx.fillStyle = colors[gate.type] || colors.H;
      ctx.strokeStyle = '#181825';
      ctx.lineWidth = 1;
      
      if (gate.type === 'SWAP') {
        // SWAP gate is drawn as an X
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10);
        ctx.lineTo(x - 10, y + 10);
        ctx.strokeStyle = colors.SWAP;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        // Normal gate
        ctx.beginPath();
        ctx.rect(x - config.gateSize / 2, y - config.gateSize / 2, config.gateSize, config.gateSize);
        ctx.fill();
        ctx.stroke();
        
        // Gate label
        ctx.fillStyle = '#181825';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gate.type, x, y);
      }
      
      // Control line for CNOT and CZ
      if (gate.controlQubit !== undefined) {
        const controlY = gate.controlQubit * config.wireSpacing + config.topMargin + config.wireSpacing / 2;
        ctx.beginPath();
        ctx.strokeStyle = colors[gate.type] || colors.CNOT;
        ctx.lineWidth = 2;
        ctx.moveTo(x, Math.min(y, controlY));
        ctx.lineTo(x, Math.max(y, controlY));
        ctx.stroke();
        
        // Control point
        ctx.beginPath();
        ctx.fillStyle = colors[gate.type] || colors.CNOT;
        ctx.arc(x, controlY, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw state probabilities if provided
    if (Object.keys(stateProbabilities).length > 0) {
      const stateBarY = circuitHeight + config.stateBarMargin;
      const stateBarWidth = circuitWidth - config.leftMargin * 2;
      
      // Bar background
      ctx.fillStyle = '#313244';
      ctx.fillRect(config.leftMargin, stateBarY, stateBarWidth, config.stateBarHeight - config.stateBarMargin);
      
      // Title
      ctx.fillStyle = colors.qubitLabel;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('State Probabilities:', config.leftMargin, stateBarY - 18);
      
      // Draw bars for each state
      const states = Object.entries(stateProbabilities);
      const barHeight = (config.stateBarHeight - config.stateBarMargin * 2) / states.length;
      
      states.forEach(([state, probability], index) => {
        const barY = stateBarY + index * barHeight + config.stateBarMargin / 2;
        
        // State label
        ctx.fillStyle = colors.qubitLabel;
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`|${state}⟩`, config.leftMargin + 50, barY + barHeight / 2);
        
        // State probability bar background
        ctx.fillStyle = '#313244';
        ctx.fillRect(config.leftMargin + 60, barY, stateBarWidth - 120, barHeight - 4);
        
        // State probability bar
        const gradientWidth = Math.max(2, (stateBarWidth - 120) * probability);
        const gradient = ctx.createLinearGradient(
          config.leftMargin + 60, 
          barY, 
          config.leftMargin + 60 + gradientWidth, 
          barY
        );
        gradient.addColorStop(0, colors.stateProbability);
        gradient.addColorStop(1, colors.H);
        ctx.fillStyle = gradient;
        ctx.fillRect(config.leftMargin + 60, barY, gradientWidth, barHeight - 4);
        
        // Probability text
        ctx.fillStyle = colors.qubitLabel;
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${(probability * 100).toFixed(1)}%`, config.leftMargin + 70 + gradientWidth, barY + barHeight / 2);
      });
    }

  }, [gates, numQubits, stateProbabilities]);

  if (gates.length === 0) {
    return (
      <Card className="w-full h-full bg-[#181825] border-[#313244]">
        <CardContent className="flex flex-col items-center justify-center h-80 p-4">
          <Network className="h-10 w-10 text-[#A6ADC8] opacity-20 mb-2" />
          <p className="text-sm text-[#A6ADC8]">No quantum circuit to visualize</p>
          <p className="text-xs text-[#A6ADC8] mt-1 opacity-70">Add gates to see visualization</p>
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
            <span className="text-[#CDD6F4]">Quantum Circuit Visualization</span>
          </div>
          <Badge variant="outline" className="text-xs bg-[#313244]">
            {numQubits} qubits, {gates.length} gates
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto bg-[#1E1E2E] rounded-md p-2 mb-2">
          <canvas
            ref={canvasRef}
            className="max-w-full"
            style={{ minHeight: Object.keys(stateProbabilities).length > 0 ? '350px' : '200px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}