import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { 
  FlaskConical, 
  Atom, 
  Code, 
  GitMerge, 
  Sparkles, 
  Braces, 
  FileCode, 
  RotateCw, 
  Download, 
  ChevronRight, 
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface QuantumExperimentToCodeProps {
  onCodeGenerated: (code: string) => void;
}

export function QuantumExperimentToCode({ onCodeGenerated }: QuantumExperimentToCodeProps) {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("experiments");
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [advancedOptions, setAdvancedOptions] = useState({
    includeComments: true,
    optimizeCircuit: true,
    addErrorHandling: true,
    includeVisualization: false
  });
  
  const { toast } = useToast();

  // Sample quantum experiments
  const experiments = [
    {
      id: "bell-state",
      name: "Bell State Generation",
      description: "Creates a maximally entangled state between two qubits",
      complexity: "Basic",
      tags: ["entanglement", "superposition", "fundamental"],
      operations: ["H", "CNOT"],
      visual: "⟨00⟩ + ⟨11⟩"
    },
    {
      id: "quantum-teleportation",
      name: "Quantum Teleportation",
      description: "Transmits quantum information using entanglement and classical communication",
      complexity: "Advanced",
      tags: ["communication", "entanglement", "bell-measurement"],
      operations: ["H", "CNOT", "X", "Z", "Measure"],
      visual: "Teleport |ψ⟩"
    },
    {
      id: "grover-search",
      name: "Grover's Search Algorithm",
      description: "Finds a marked item in an unsorted database with quadratic speedup",
      complexity: "Advanced",
      tags: ["search", "amplitude-amplification", "oracle"],
      operations: ["H", "Diffusion", "Oracle", "Rotation"],
      visual: "√N steps"
    },
    {
      id: "quantum-fourier-transform",
      name: "Quantum Fourier Transform",
      description: "Quantum version of the discrete Fourier transform",
      complexity: "Advanced",
      tags: ["transform", "phase-estimation", "shor-algorithm"],
      operations: ["H", "R", "SWAP"],
      visual: "QFT|x⟩"
    },
    {
      id: "q-error-correction",
      name: "Quantum Error Correction",
      description: "Protects quantum information from decoherence and noise",
      complexity: "Advanced",
      tags: ["error-correction", "fault-tolerance", "syndrome-measurement"],
      operations: ["H", "CNOT", "Measure", "X", "Z"],
      visual: "Protect |ψ⟩"
    }
  ];

  const resetDialog = () => {
    setSelectedExperiment(null);
    setGeneratedCode("");
    setCodeGenerated(false);
    setSelectedTab("experiments");
  };

  const handleExperimentSelect = (id: string) => {
    setSelectedExperiment(id);
    setSelectedTab("options");
  };
  
  const generateCode = async () => {
    if (!selectedExperiment) return;
    
    setGeneratingCode(true);
    
    try {
      // In a real implementation, we would call the API to generate code
      // const response = await apiRequest("POST", "/api/quantum/generate", {
      //   experimentId: selectedExperiment,
      //   options: advancedOptions
      // });
      
      // For demonstration, simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const experiment = experiments.find(e => e.id === selectedExperiment);
      
      if (!experiment) {
        throw new Error("Experiment not found");
      }
      
      // Generate sample code based on experiment type
      let code = "";
      switch (selectedExperiment) {
        case "bell-state":
          code = `// SINGULARIS PRIME - Bell State Generation
${advancedOptions.includeComments ? '// Creates a maximally entangled state between two qubits (|00⟩ + |11⟩)/√2\n' : ''}
QKD_INIT("bell_experiment", "lab_origin", "lab_destination");

// Initialize qubits in |00⟩ state
QUANTUM_OPERATION {
  type: "initialize",
  state: "zero",
  target: "qubits[0:1]"
}

// Apply Hadamard gate to the first qubit
QUANTUM_OPERATION {
  type: "gate",
  gate: "H",
  target: "qubits[0]"
}

// Apply CNOT gate with first qubit as control and second as target
QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[0]",
  target: "qubits[1]"
}

${advancedOptions.addErrorHandling ? `
// Error handling and verification
TRY_QUANTUM_OPERATION({
  onError: (e) => REPORT_QUANTUM_ERROR(e)
});

// Verify entanglement with Bell measurement
BELL_MEASUREMENT("qubits[0:1]");
` : ''}

${advancedOptions.includeVisualization ? `
// Visualize the Bell state
VISUALIZE_QUANTUM_STATE("bell_state", {
  representation: "bloch",
  showProbabilities: true
});
` : ''}`;
          break;
          
        case "quantum-teleportation":
          code = `// SINGULARIS PRIME - Quantum Teleportation Protocol
${advancedOptions.includeComments ? '// Transmits quantum state from one location to another using entanglement\n' : ''}
QKD_INIT("teleportation_protocol", "sender", "receiver");

// Create shared entangled state (Bell pair) between qubits 1 and 2
QUANTUM_OPERATION {
  type: "entanglement",
  mode: "bell",
  target: "qubits[1:2]"
}

// Initialize message qubit (qubit 0) with state to be teleported
QUANTUM_OPERATION {
  type: "initialize",
  state: "custom",
  parameters: {
    alpha: 0.7071, // 1/√2
    beta: 0.7071,  // 1/√2
    phase: 0
  },
  target: "qubits[0]"
}

// Perform Bell measurement on qubits 0 and 1
QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[0]",
  target: "qubits[1]"
}

QUANTUM_OPERATION {
  type: "gate",
  gate: "H",
  target: "qubits[0]"
}

// Measure qubits 0 and 1
QUANTUM_OPERATION {
  type: "measurement",
  target: "qubits[0:1]",
  register: "classical_bits[0:1]"
}

// Apply conditional operations based on measurement results
QUANTUM_OPERATION {
  type: "conditional",
  condition: "classical_bits[1] == 1",
  operation: {
    type: "gate",
    gate: "X",
    target: "qubits[2]"
  }
}

QUANTUM_OPERATION {
  type: "conditional",
  condition: "classical_bits[0] == 1",
  operation: {
    type: "gate",
    gate: "Z",
    target: "qubits[2]"
  }
}

${advancedOptions.addErrorHandling ? `
// Error handling and verification
TRY_QUANTUM_OPERATION({
  onError: (e) => REPORT_QUANTUM_ERROR(e)
});

// Verify teleportation success
VERIFY_QUANTUM_STATE("qubits[2]", {
  referenceState: {
    alpha: 0.7071,
    beta: 0.7071,
    phase: 0
  },
  fidelityThreshold: 0.95
});
` : ''}

${advancedOptions.includeVisualization ? `
// Visualize the teleported state
VISUALIZE_QUANTUM_STATE("teleported_state", {
  target: "qubits[2]",
  representation: "bloch",
  showProbabilities: true
});
` : ''}`;
          break;
          
        case "grover-search":
          code = `// SINGULARIS PRIME - Grover's Search Algorithm
${advancedOptions.includeComments ? '// Finds a marked item in an unsorted database with quadratic speedup\n' : ''}
QKD_INIT("grover_search", "quantum_processor", "classical_control");

// Define the database size (N=8) and target item (index 3)
DEFINE_CONSTANT("N", 8);
DEFINE_CONSTANT("target_index", 3);

// Calculate the number of Grover iterations (approximately sqrt(N))
DEFINE_CONSTANT("iterations", Math.floor(Math.PI/4 * Math.sqrt(N)));

// Initialize quantum register with n qubits (where N = 2^n)
DEFINE_CONSTANT("n", Math.log2(N));
QUANTUM_OPERATION {
  type: "initialize",
  state: "zero",
  target: "qubits[0:n-1]"
}

// Apply Hadamard gates to create superposition
QUANTUM_OPERATION {
  type: "gate",
  gate: "H",
  target: "qubits[0:n-1]"
}

// Define oracle function that marks the target state
DEFINE_ORACLE({
  name: "grover_oracle",
  type: "phase_flip",
  targetState: target_index.toString(2).padStart(n, '0')
});

// Define diffusion operator (amplitude amplification)
DEFINE_OPERATOR({
  name: "diffusion",
  sequence: [
    { gate: "H", target: "qubits[0:n-1]" },
    { gate: "Z", target: "qubits[0:n-1]" },
    { gate: "CPHASE", phase: Math.PI, target: "qubits[0:n-1]" },
    { gate: "H", target: "qubits[0:n-1]" }
  ]
});

// Perform Grover iterations
FOR_LOOP(iterations, (i) => {
  // Apply oracle to mark target state
  APPLY_ORACLE("grover_oracle");
  
  // Apply diffusion operator
  APPLY_OPERATOR("diffusion");
  
  ${advancedOptions.optimizeCircuit ? `
  // Optimize circuit after each iteration
  if (i < iterations - 1) {
    OPTIMIZE_CIRCUIT({
      goal: "gate_count",
      method: "tensor_network"
    });
  }
  ` : ''}
});

// Measure the result
QUANTUM_OPERATION {
  type: "measurement",
  target: "qubits[0:n-1]",
  register: "result"
}

${advancedOptions.addErrorHandling ? `
// Verify the result
VERIFY_RESULT("result", {
  expectedValue: target_index,
  probabilityThreshold: 0.9,
  onError: (actual) => REPORT_ERROR(\`Expected \${target_index}, got \${actual}\`)
});
` : ''}

${advancedOptions.includeVisualization ? `
// Visualize the algorithm progression
VISUALIZE_QUANTUM_ALGORITHM({
  name: "grover_search",
  showAmplitudes: true,
  showProbabilities: true,
  highlightTarget: target_index
});
` : ''}`;
          break;
          
        case "quantum-fourier-transform":
          code = `// SINGULARIS PRIME - Quantum Fourier Transform
${advancedOptions.includeComments ? '// Quantum version of the discrete Fourier transform\n' : ''}
QKD_INIT("qft_experiment", "quantum_processor", "analyzer");

// Define number of qubits for the transform
DEFINE_CONSTANT("n", 4);

// Initialize qubits with some test state (binary representation of 5)
QUANTUM_OPERATION {
  type: "initialize",
  state: "computational",
  value: "0101", // Binary representation of 5
  target: "qubits[0:n-1]"
}

// Define the QFT operation
DEFINE_OPERATOR({
  name: "QFT",
  description: "Quantum Fourier Transform on n qubits"
});

// Implement the QFT circuit
FOR_LOOP(n, (i) => {
  // Apply Hadamard to the i-th qubit
  QUANTUM_OPERATION {
    type: "gate",
    gate: "H",
    target: \`qubits[\${i}]\`
  }
  
  // Apply controlled phase rotations
  FOR_LOOP(n - i - 1, (j) => {
    QUANTUM_OPERATION {
      type: "gate",
      gate: "CR",
      control: \`qubits[\${i}]\`,
      target: \`qubits[\${i + j + 1}]\`,
      parameters: {
        angle: Math.PI / Math.pow(2, j + 1)
      }
    }
  });
});

// Swap the qubits to get the correct order
FOR_LOOP(Math.floor(n / 2), (i) => {
  QUANTUM_OPERATION {
    type: "gate",
    gate: "SWAP",
    target: [\`qubits[\${i}]\`, \`qubits[\${n - i - 1}]\`]
  }
});

${advancedOptions.optimizeCircuit ? `
// Optimize the QFT circuit
OPTIMIZE_CIRCUIT({
  goal: "depth",
  method: "tensor_network",
  parameters: {
    approximation: 0.001 // Threshold for optimization
  }
});
` : ''}

// Measure the result in Fourier basis
QUANTUM_OPERATION {
  type: "measurement",
  target: "qubits[0:n-1]",
  basis: "fourier",
  register: "result"
}

${advancedOptions.addErrorHandling ? `
// Error handling and verification
TRY_QUANTUM_OPERATION({
  onError: (e) => REPORT_QUANTUM_ERROR(e)
});

// Verify QFT produces the expected distribution
VERIFY_QUANTUM_DISTRIBUTION("result", {
  reference: "classical_fft",
  fidelityThreshold: 0.9
});
` : ''}

${advancedOptions.includeVisualization ? `
// Visualize the QFT result
VISUALIZE_QUANTUM_STATE("qft_result", {
  representation: "amplitudes",
  showPhases: true,
  logScale: true
});
` : ''}`;
          break;
          
        case "q-error-correction":
          code = `// SINGULARIS PRIME - Quantum Error Correction
${advancedOptions.includeComments ? '// Protects quantum information using 3-qubit bit flip code\n' : ''}
QKD_INIT("error_correction", "encoder", "decoder");

// Define logical qubit state to protect
QUANTUM_OPERATION {
  type: "initialize",
  state: "custom",
  parameters: {
    alpha: 0.8, // Amplitudes for |0⟩ and |1⟩
    beta: 0.6,
    phase: 0
  },
  target: "qubits[0]" // Logical qubit
}

// Create ancilla qubits in |0⟩ state
QUANTUM_OPERATION {
  type: "initialize",
  state: "zero",
  target: "qubits[1:2]" // Ancilla qubits
}

// Encode logical qubit into 3-qubit code
QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[0]",
  target: "qubits[1]"
}

QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[0]",
  target: "qubits[2]"
}

// Simulate noise/error (bit flip on qubit 1)
QUANTUM_OPERATION {
  type: "gate",
  gate: "X",
  target: "qubits[1]",
  description: "Simulated bit-flip error"
}

// Error detection using syndrome measurements
DEFINE_REGISTER("syndrome", 2);

// Syndrome measurement for bit flip errors
QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[0]",
  target: "ancilla[0]"
}

QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[1]",
  target: "ancilla[0]"
}

QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[1]",
  target: "ancilla[1]"
}

QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[2]",
  target: "ancilla[1]"
}

// Measure syndrome
QUANTUM_OPERATION {
  type: "measurement",
  target: "ancilla[0:1]",
  register: "syndrome"
}

// Error correction based on syndrome
QUANTUM_OPERATION {
  type: "conditional",
  condition: "syndrome == 0b01",
  operation: {
    type: "gate",
    gate: "X",
    target: "qubits[0]"
  }
}

QUANTUM_OPERATION {
  type: "conditional",
  condition: "syndrome == 0b10",
  operation: {
    type: "gate",
    gate: "X",
    target: "qubits[1]"
  }
}

QUANTUM_OPERATION {
  type: "conditional",
  condition: "syndrome == 0b11",
  operation: {
    type: "gate",
    gate: "X",
    target: "qubits[2]"
  }
}

// Decode back to logical qubit
QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[0]",
  target: "qubits[2]"
}

QUANTUM_OPERATION {
  type: "gate",
  gate: "CNOT",
  control: "qubits[0]",
  target: "qubits[1]"
}

${advancedOptions.addErrorHandling ? `
// Verify correction was successful
VERIFY_QUANTUM_STATE("qubits[0]", {
  referenceState: {
    alpha: 0.8,
    beta: 0.6,
    phase: 0
  },
  fidelityThreshold: 0.99
});
` : ''}

${advancedOptions.includeVisualization ? `
// Visualize the protected qubit
VISUALIZE_QUANTUM_STATE("protected_qubit", {
  target: "qubits[0]",
  representation: "bloch",
  showFidelity: true,
  compareWithOriginal: true
});
` : ''}`;
          break;
          
        default:
          code = "// SINGULARIS PRIME code will be generated based on your selected experiment";
          break;
      }
      
      setGeneratedCode(code);
      setCodeGenerated(true);
      setSelectedTab("result");
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive"
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleApplyCode = () => {
    onCodeGenerated(generatedCode);
    setOpen(false);
    resetDialog();
    
    toast({
      title: "Code Applied",
      description: "Quantum experiment code has been applied to editor"
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "Basic": return "bg-blue-500";
      case "Intermediate": return "bg-amber-500";
      case "Advanced": return "bg-purple-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setOpen(true)}
        className="flex items-center"
      >
        <FlaskConical className="h-4 w-4 mr-2" />
        Experiments → Code
      </Button>
      
      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetDialog();
      }}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FlaskConical className="h-5 w-5 mr-2 text-blue-500" />
              Quantum Experiment to Code Converter
            </DialogTitle>
            <DialogDescription>
              Transform quantum experiments into SINGULARIS PRIME code templates
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="experiments" 
                  disabled={generatingCode}
                >
                  <Atom className="h-4 w-4 mr-2" />
                  Experiments
                </TabsTrigger>
                <TabsTrigger 
                  value="options" 
                  disabled={!selectedExperiment || generatingCode}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Options
                </TabsTrigger>
                <TabsTrigger 
                  value="result" 
                  disabled={!codeGenerated || generatingCode}
                >
                  <Braces className="h-4 w-4 mr-2" />
                  Generated Code
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="experiments" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-2">
                  {experiments.map((experiment) => (
                    <div 
                      key={experiment.id}
                      className={`flex p-3 rounded-md border ${
                        selectedExperiment === experiment.id 
                          ? 'bg-blue-950/20 border-blue-800/30' 
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      } cursor-pointer`}
                      onClick={() => handleExperimentSelect(experiment.id)}
                    >
                      <div className="mr-3 flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/10">
                        <Atom className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{experiment.name}</p>
                          <Badge 
                            className={`text-xs ${getComplexityColor(experiment.complexity)}`}
                          >
                            {experiment.complexity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">
                          {experiment.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {experiment.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="ml-2 self-center">
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="options" className="space-y-4 mt-4">
                {selectedExperiment && (
                  <>
                    <div className="bg-blue-950/20 border border-blue-800/30 rounded-md p-3">
                      <div className="flex items-center">
                        <Atom className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">
                          {experiments.find(e => e.id === selectedExperiment)?.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {experiments.find(e => e.id === selectedExperiment)?.description}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Code Generation Options</Label>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="includeComments" className="text-sm">Include Detailed Comments</Label>
                              <p className="text-xs text-muted-foreground">Add explanatory comments to the code</p>
                            </div>
                            <Switch
                              id="includeComments"
                              checked={advancedOptions.includeComments}
                              onCheckedChange={(checked) => 
                                setAdvancedOptions({...advancedOptions, includeComments: checked})
                              }
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="optimizeCircuit" className="text-sm">Optimize Quantum Circuit</Label>
                              <p className="text-xs text-muted-foreground">Apply quantum circuit optimizations</p>
                            </div>
                            <Switch
                              id="optimizeCircuit"
                              checked={advancedOptions.optimizeCircuit}
                              onCheckedChange={(checked) => 
                                setAdvancedOptions({...advancedOptions, optimizeCircuit: checked})
                              }
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="addErrorHandling" className="text-sm">Add Error Handling</Label>
                              <p className="text-xs text-muted-foreground">Include error detection and correction</p>
                            </div>
                            <Switch
                              id="addErrorHandling"
                              checked={advancedOptions.addErrorHandling}
                              onCheckedChange={(checked) => 
                                setAdvancedOptions({...advancedOptions, addErrorHandling: checked})
                              }
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="includeVisualization" className="text-sm">Include Visualization</Label>
                              <p className="text-xs text-muted-foreground">Add code for visualizing quantum states</p>
                            </div>
                            <Switch
                              id="includeVisualization"
                              checked={advancedOptions.includeVisualization}
                              onCheckedChange={(checked) => 
                                setAdvancedOptions({...advancedOptions, includeVisualization: checked})
                              }
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                        onClick={generateCode}
                        disabled={generatingCode}
                      >
                        {generatingCode ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating Code...
                          </>
                        ) : (
                          <>
                            <Code className="mr-2 h-4 w-4" />
                            Generate SINGULARIS PRIME Code
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="result" className="space-y-4 mt-4">
                {codeGenerated && (
                  <>
                    <div className="bg-slate-950 border border-slate-800 rounded-md overflow-hidden">
                      <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileCode className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-sm font-medium">Generated Code</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          SINGULARIS PRIME
                        </Badge>
                      </div>
                      <ScrollArea className="h-60">
                        <div className="p-3 font-mono text-xs whitespace-pre">
                          {generatedCode}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTab("options")}
                      >
                        <RotateCw className="mr-2 h-4 w-4" />
                        Modify Options
                      </Button>
                      <Button 
                        onClick={handleApplyCode}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Apply Code to Editor
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              <GitMerge className="h-3.5 w-3.5 inline-block mr-1" />
              Quantum-Classical Bridge v1.2
            </div>
            {selectedTab !== "result" && (
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}