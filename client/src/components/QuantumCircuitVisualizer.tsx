import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuantumGate } from "@/lib/QuantumOperations";

interface QuantumCircuitVisualizerProps {
  circuit: {
    gates: { gate: QuantumGate; targets: number[]; controls?: number[] }[];
    numQubits: number;
  };
  optimizedCircuit?: {
    gates: { gate: QuantumGate; targets: number[]; controls?: number[] }[];
  };
  showOptimized?: boolean;
}

export function QuantumCircuitVisualizer({
  circuit,
  optimizedCircuit,
  showOptimized = false,
}: QuantumCircuitVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Colors for different gates
  const gateColors = {
    H: "#4a9fe3", // Hadamard - blue
    X: "#de3b40", // Pauli-X - red
    Y: "#68b723", // Pauli-Y - green
    Z: "#9768d1", // Pauli-Z - purple
    CNOT: "#f9c440", // CNOT - yellow
    CZ: "#db8a33", // CZ - orange
    SWAP: "#41c6c8", // SWAP - teal
    RX: "#c061cb", // RX - pink
    RY: "#9a59b5", // RY - violet
    RZ: "#3daee9", // RZ - light blue
  };

  // Gate symbols
  const gateSymbols: Record<string, string> = {
    H: "H",
    X: "X",
    Y: "Y",
    Z: "Z",
    CNOT: "⊕",
    CZ: "Z",
    SWAP: "×",
    RX: "Rx",
    RY: "Ry",
    RZ: "Rz",
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set dimensions
      const circuitToRender = showOptimized && optimizedCircuit ? optimizedCircuit : circuit;
      const numQubits = circuit.numQubits;
      const numGates = circuitToRender.gates.length;
      
      // Canvas sizing
      const maxWidth = canvas.width;
      const maxHeight = canvas.height;
      
      const qubitSpacing = maxHeight / (numQubits + 1);
      const gateSpacing = Math.min(maxWidth / (numGates + 1), 60);
      const gateSize = Math.min(qubitSpacing * 0.6, 40);
      
      // Draw qubit lines
      ctx.strokeStyle = "#cccccc";
      ctx.lineWidth = 1;
      
      for (let i = 0; i < numQubits; i++) {
        ctx.beginPath();
        ctx.moveTo(40, (i + 1) * qubitSpacing);
        ctx.lineTo(maxWidth - 20, (i + 1) * qubitSpacing);
        ctx.stroke();
        
        // Qubit labels
        ctx.fillStyle = "#333333";
        ctx.font = "14px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`q[${i}]`, 35, (i + 1) * qubitSpacing + 5);
      }
      
      // Draw gates
      circuitToRender.gates.forEach((gate, gateIndex) => {
        const x = (gateIndex + 1) * gateSpacing + 40;
        
        // Single qubit gates
        if (!gate.controls || gate.controls.length === 0) {
          gate.targets.forEach(targetQubit => {
            const y = (targetQubit + 1) * qubitSpacing;
            
            // Gate background
            ctx.fillStyle = gateColors[gate.gate] || "#888888";
            ctx.beginPath();
            ctx.rect(x - gateSize/2, y - gateSize/2, gateSize, gateSize);
            ctx.fill();
            
            // Gate border
            ctx.strokeStyle = "#333333";
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Gate label
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(gateSymbols[gate.gate] || gate.gate, x, y);
          });
        } 
        // Multi-qubit gates (with controls)
        else {
          const allQubits = [...gate.controls, ...gate.targets].sort((a, b) => a - b);
          const minQubit = allQubits[0];
          const maxQubit = allQubits[allQubits.length - 1];
          
          // Vertical line connecting controls and targets
          ctx.strokeStyle = "#333333";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, (minQubit + 1) * qubitSpacing);
          ctx.lineTo(x, (maxQubit + 1) * qubitSpacing);
          ctx.stroke();
          
          // Draw controls (dots)
          gate.controls.forEach(controlQubit => {
            const y = (controlQubit + 1) * qubitSpacing;
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(x, y, gateSize / 4, 0, 2 * Math.PI);
            ctx.fill();
          });
          
          // Draw targets
          gate.targets.forEach(targetQubit => {
            const y = (targetQubit + 1) * qubitSpacing;
            
            if (gate.gate === "CNOT") {
              // CNOT target (⊕)
              ctx.strokeStyle = "#333333";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(x, y, gateSize / 3, 0, 2 * Math.PI);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(x, y - gateSize / 3);
              ctx.lineTo(x, y + gateSize / 3);
              ctx.moveTo(x - gateSize / 3, y);
              ctx.lineTo(x + gateSize / 3, y);
              ctx.stroke();
            } else if (gate.gate === "SWAP") {
              // SWAP gate (×)
              ctx.strokeStyle = "#333333";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x - gateSize / 3, y - gateSize / 3);
              ctx.lineTo(x + gateSize / 3, y + gateSize / 3);
              ctx.moveTo(x + gateSize / 3, y - gateSize / 3);
              ctx.lineTo(x - gateSize / 3, y + gateSize / 3);
              ctx.stroke();
            } else {
              // Other multi-qubit gates
              ctx.fillStyle = gateColors[gate.gate] || "#888888";
              ctx.beginPath();
              ctx.rect(x - gateSize/2, y - gateSize/2, gateSize, gateSize);
              ctx.fill();
              
              ctx.strokeStyle = "#333333";
              ctx.lineWidth = 1;
              ctx.stroke();
              
              ctx.fillStyle = "#ffffff";
              ctx.font = "bold 14px Arial";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(gateSymbols[gate.gate] || gate.gate, x, y);
            }
          });
        }
      });
      
      // Draw title
      ctx.fillStyle = "#000000";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        showOptimized ? "Optimized Quantum Circuit" : "Original Quantum Circuit",
        canvas.width / 2,
        20
      );
    }
  }, [circuit, optimizedCircuit, showOptimized]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {showOptimized ? "Optimized Quantum Circuit" : "Quantum Circuit Visualization"}
        </CardTitle>
        <CardDescription>
          Visual representation of quantum gates and their connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-auto border rounded"
        />
      </CardContent>
    </Card>
  );
}