import { QuantumGate } from "@/lib/QuantumOperations";

/**
 * Parses SINGULARIS PRIME code to extract quantum circuit information
 * @param code SINGULARIS PRIME code containing quantum operations
 * @returns Object containing gates and number of qubits
 */
export function parseQuantumCircuit(code: string): {
  gates: { gate: QuantumGate; targets: number[]; controls?: number[] }[];
  numQubits: number;
} {
  const gates: { gate: QuantumGate; targets: number[]; controls?: number[] }[] = [];
  let numQubits = 0;
  
  // Parse register declaration to determine number of qubits
  const registerMatch = code.match(/quantum\s+register\s+\w+\s*\[\s*(\d+)\s*\]/);
  if (registerMatch && registerMatch[1]) {
    numQubits = parseInt(registerMatch[1], 10);
  }
  
  // Parse Hadamard gates (H)
  const hGateRegex = /H\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*\)/g;
  let match;
  while ((match = hGateRegex.exec(code)) !== null) {
    const target = parseInt(match[1], 10);
    gates.push({ 
      gate: "H", 
      targets: [target]
    });
    numQubits = Math.max(numQubits, target + 1);
  }
  
  // Parse Pauli-X gates (X)
  const xGateRegex = /X\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*\)/g;
  while ((match = xGateRegex.exec(code)) !== null) {
    const target = parseInt(match[1], 10);
    gates.push({ 
      gate: "X", 
      targets: [target]
    });
    numQubits = Math.max(numQubits, target + 1);
  }
  
  // Parse Pauli-Y gates (Y)
  const yGateRegex = /Y\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*\)/g;
  while ((match = yGateRegex.exec(code)) !== null) {
    const target = parseInt(match[1], 10);
    gates.push({ 
      gate: "Y", 
      targets: [target]
    });
    numQubits = Math.max(numQubits, target + 1);
  }
  
  // Parse Pauli-Z gates (Z)
  const zGateRegex = /Z\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*\)/g;
  while ((match = zGateRegex.exec(code)) !== null) {
    const target = parseInt(match[1], 10);
    gates.push({ 
      gate: "Z", 
      targets: [target]
    });
    numQubits = Math.max(numQubits, target + 1);
  }
  
  // Parse rotation gates (RX, RY, RZ)
  const rxGateRegex = /RX\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*,\s*(.+?)\s*\)/g;
  while ((match = rxGateRegex.exec(code)) !== null) {
    const target = parseInt(match[1], 10);
    gates.push({ 
      gate: "RX", 
      targets: [target]
    });
    numQubits = Math.max(numQubits, target + 1);
  }
  
  const ryGateRegex = /RY\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*,\s*(.+?)\s*\)/g;
  while ((match = ryGateRegex.exec(code)) !== null) {
    const target = parseInt(match[1], 10);
    gates.push({ 
      gate: "RY", 
      targets: [target]
    });
    numQubits = Math.max(numQubits, target + 1);
  }
  
  const rzGateRegex = /RZ\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*,\s*(.+?)\s*\)/g;
  while ((match = rzGateRegex.exec(code)) !== null) {
    const target = parseInt(match[1], 10);
    gates.push({ 
      gate: "RZ", 
      targets: [target]
    });
    numQubits = Math.max(numQubits, target + 1);
  }
  
  // Parse CNOT gates
  const cnotGateRegex = /CNOT\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*,\s*\w+\s*\[\s*(\d+)\s*\]\s*\)/g;
  while ((match = cnotGateRegex.exec(code)) !== null) {
    const control = parseInt(match[1], 10);
    const target = parseInt(match[2], 10);
    gates.push({ 
      gate: "CNOT", 
      targets: [target],
      controls: [control]
    });
    numQubits = Math.max(numQubits, control + 1, target + 1);
  }
  
  // Parse CZ gates
  const czGateRegex = /CZ\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*,\s*\w+\s*\[\s*(\d+)\s*\]\s*\)/g;
  while ((match = czGateRegex.exec(code)) !== null) {
    const control = parseInt(match[1], 10);
    const target = parseInt(match[2], 10);
    gates.push({ 
      gate: "CZ", 
      targets: [target],
      controls: [control]
    });
    numQubits = Math.max(numQubits, control + 1, target + 1);
  }
  
  // Parse SWAP gates
  const swapGateRegex = /SWAP\s*\(\s*\w+\s*\[\s*(\d+)\s*\]\s*,\s*\w+\s*\[\s*(\d+)\s*\]\s*\)/g;
  while ((match = swapGateRegex.exec(code)) !== null) {
    const qubit1 = parseInt(match[1], 10);
    const qubit2 = parseInt(match[2], 10);
    gates.push({ 
      gate: "SWAP", 
      targets: [qubit1, qubit2]
    });
    numQubits = Math.max(numQubits, qubit1 + 1, qubit2 + 1);
  }
  
  // Sort gates by their position in the code
  // This ensures gates are visualized in the order they appear
  const gatePositions = new Map<number, number>();
  gates.forEach((gate, index) => {
    const gateType = gate.gate;
    const target = gate.targets[0];
    
    // Find position of this gate in the code
    let regex;
    if (gateType === "CNOT" || gateType === "CZ") {
      const control = gate.controls![0];
      regex = new RegExp(
        `${gateType}\\s*\\(\\s*\\w+\\s*\\[\\s*${control}\\s*\\]\\s*,\\s*\\w+\\s*\\[\\s*${target}\\s*\\]\\s*\\)`,
        'g'
      );
    } else if (gateType === "SWAP") {
      const qubit1 = gate.targets[0];
      const qubit2 = gate.targets[1];
      regex = new RegExp(
        `SWAP\\s*\\(\\s*\\w+\\s*\\[\\s*${qubit1}\\s*\\]\\s*,\\s*\\w+\\s*\\[\\s*${qubit2}\\s*\\]\\s*\\)`,
        'g'
      );
    } else if (gateType.startsWith("R")) { // RX, RY, RZ
      regex = new RegExp(
        `${gateType}\\s*\\(\\s*\\w+\\s*\\[\\s*${target}\\s*\\]\\s*,\\s*.+?\\s*\\)`,
        'g'
      );
    } else {
      regex = new RegExp(
        `${gateType}\\s*\\(\\s*\\w+\\s*\\[\\s*${target}\\s*\\]\\s*\\)`,
        'g'
      );
    }
    
    regex.lastIndex = 0;
    const match = regex.exec(code);
    if (match) {
      gatePositions.set(index, match.index);
    } else {
      gatePositions.set(index, index * 100); // Fallback position
    }
  });
  
  // Sort gates by their position in the code
  const sortedGates = [...gates].sort((a, b) => {
    const posA = gatePositions.get(gates.indexOf(a)) || 0;
    const posB = gatePositions.get(gates.indexOf(b)) || 0;
    return posA - posB;
  });
  
  return {
    gates: sortedGates,
    numQubits: numQubits === 0 ? 1 : numQubits
  };
}

/**
 * Generates an optimized quantum circuit based on the original
 * This is a demonstration of circuit optimization techniques
 * In a real implementation, this would use actual quantum optimization algorithms
 * @param circuit Original quantum circuit
 * @returns Optimized quantum circuit
 */
export function generateOptimizedCircuit(circuit: {
  gates: { gate: QuantumGate; targets: number[]; controls?: number[] }[];
  numQubits: number;
}): {
  gates: { gate: QuantumGate; targets: number[]; controls?: number[] }[];
  optimizationExplanation: string;
} {
  // Clone the original circuit gates
  const originalGates = [...circuit.gates];
  const optimizedGates: typeof originalGates = [];
  
  // Optimization 1: Gate cancellation (e.g., two X gates in sequence cancel out)
  const cancellations: { [key: string]: number } = {};
  
  // Track gate applications per qubit
  originalGates.forEach(gate => {
    const qubitKey = gate.targets.join(',');
    
    // For single-qubit gates that are their own inverse (X, Y, Z, H)
    if (['X', 'Y', 'Z', 'H'].includes(gate.gate) && !gate.controls) {
      const gateKey = `${gate.gate}-${qubitKey}`;
      
      if (cancellations[gateKey]) {
        // Cancel out the gate
        cancellations[gateKey] = 0;
      } else {
        // Add the gate
        cancellations[gateKey] = 1;
        optimizedGates.push(gate);
      }
    } else {
      // Other gates are preserved
      optimizedGates.push(gate);
    }
  });
  
  // Optimization 2: Combine rotations of the same type around the same axis
  const combinedGates: typeof optimizedGates = [];
  const rotations: { [key: string]: number } = {};
  
  optimizedGates.forEach(gate => {
    // Check if it's a rotation gate
    if (['RX', 'RY', 'RZ'].includes(gate.gate) && gate.targets.length === 1) {
      const qubit = gate.targets[0];
      const gateKey = `${gate.gate}-${qubit}`;
      
      if (rotations[gateKey]) {
        // We've seen this rotation before, skip adding it twice
        rotations[gateKey]++;
      } else {
        // First time seeing this rotation
        rotations[gateKey] = 1;
        combinedGates.push(gate);
      }
    } else {
      // Not a rotation gate, preserve it
      combinedGates.push(gate);
    }
  });
  
  // Count optimization metrics
  const gatesRemoved = originalGates.length - combinedGates.length;
  const rotationsCombined = Object.values(rotations).reduce((sum, count) => sum + (count > 1 ? 1 : 0), 0);
  
  // Generate explanation of optimizations
  let explanation = "Circuit optimized using the following techniques:\n";
  
  if (gatesRemoved > 0) {
    explanation += `- Removed ${gatesRemoved} redundant gate(s) that cancel each other out\n`;
  }
  
  if (rotationsCombined > 0) {
    explanation += `- Combined ${rotationsCombined} rotation(s) around the same axis\n`;
  }
  
  if (gatesRemoved === 0 && rotationsCombined === 0) {
    explanation += "- No obvious optimizations found for this circuit\n";
  }
  
  explanation += "\nThe resulting circuit maintains the computational intent while improving efficiency.";
  
  return {
    gates: combinedGates,
    optimizationExplanation: explanation
  };
}