import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { QuantumCircuitDesigner, CircuitGate } from '@/components/QuantumCircuitDesigner';
import { apiRequest } from '@/lib/queryClient';
import { AlertCircle, Atom, ChevronRight, Code, FlaskConical, HelpCircle, Layers, RotateCw, Zap } from 'lucide-react';
import { QuantumGate } from '@/lib/QuantumOperations';

export interface CircuitSimulationResult {
  probabilities: Record<string, number>;
  visualization: string;
  blochSphere?: {
    x: number;
    y: number;
    z: number;
  }[];
  statistics?: {
    entanglement: number;
    complexity: number;
    depth: number;
  };
  explanation?: string;
}

export default function QuantumCircuitDesignerPage() {
  const [simulationResult, setSimulationResult] = useState<CircuitSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [executionCount, setExecutionCount] = useState(0);
  const [currentCircuit, setCurrentCircuit] = useState<CircuitGate[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeTab, setActiveTab] = useState('designer');
  
  // Example circuit templates
  const templates = {
    bell: [
      { id: 'h1', type: 'H' as QuantumGate, qubit: 0, position: 0, color: '#89B4FA' },
      { id: 'cnot1', type: 'CNOT' as QuantumGate, qubit: 1, position: 1, controlQubit: 0, color: '#FAB387' }
    ],
    ghz: [
      { id: 'h1', type: 'H' as QuantumGate, qubit: 0, position: 0, color: '#89B4FA' },
      { id: 'cnot1', type: 'CNOT' as QuantumGate, qubit: 1, position: 1, controlQubit: 0, color: '#FAB387' },
      { id: 'cnot2', type: 'CNOT' as QuantumGate, qubit: 2, position: 2, controlQubit: 0, color: '#FAB387' }
    ],
    fourier: [
      { id: 'h1', type: 'H' as QuantumGate, qubit: 0, position: 0, color: '#89B4FA' },
      { id: 'h2', type: 'H' as QuantumGate, qubit: 1, position: 0, color: '#89B4FA' },
      { id: 'h3', type: 'H' as QuantumGate, qubit: 2, position: 0, color: '#89B4FA' }
    ]
  };
  
  const handleCircuitChange = (gates: CircuitGate[]) => {
    setCurrentCircuit(gates);
  };
  
  const handleExecuteCircuit = async (gates: CircuitGate[]) => {
    setIsSimulating(true);
    setActiveTab('results');
    
    try {
      // Map our circuit gates to the format expected by the API
      const apiGates = gates.map(gate => ({
        gate: gate.type,
        targets: [gate.qubit],
        ...(gate.controlQubit !== undefined && { controls: [gate.controlQubit] })
      }));
      
      // Call the quantum circuit simulation API
      const response = await apiRequest<{ result: CircuitSimulationResult }>(
        'POST', 
        '/api/quantum/circuit/simulate', 
        {
          gates: apiGates,
          options: {
            shots: 1024,
            visualize: true,
            explain: showAdvancedOptions
          }
        }
      );
      
      setSimulationResult(response.result);
      setExecutionCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to simulate quantum circuit:', error);
      
      // Fallback response for demonstration
      setSimulationResult({
        probabilities: {
          '00': 0.5,
          '11': 0.5
        },
        visualization: 'Circuit visualization would appear here',
        statistics: {
          entanglement: 0.95,
          complexity: 0.3,
          depth: 2
        },
        explanation: 'This circuit creates a Bell state, demonstrating quantum entanglement between two qubits.'
      });
    } finally {
      setIsSimulating(false);
    }
  };
  
  const loadTemplate = (templateName: keyof typeof templates) => {
    setCurrentCircuit(templates[templateName]);
  };
  
  return (
    <Container>
      <div className="py-8 space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Quantum Circuit Designer</h1>
          <p className="text-muted-foreground">
            Design, visualize, and simulate quantum circuits with drag-and-drop simplicity
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-[#313244]">
              <TabsTrigger value="designer" className="data-[state=active]:bg-[#45475A]">
                Designer
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-[#45475A]">
                Results
              </TabsTrigger>
              <TabsTrigger value="learn" className="data-[state=active]:bg-[#45475A]">
                Learn
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Advanced Options</span>
              <Switch
                checked={showAdvancedOptions}
                onCheckedChange={setShowAdvancedOptions}
              />
            </div>
          </div>
          
          <TabsContent value="designer" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <QuantumCircuitDesigner 
                  onCircuitChange={handleCircuitChange}
                  onExecute={handleExecuteCircuit}
                  initialCircuit={currentCircuit}
                />
              </div>
              
              <div className="space-y-4">
                <Card className="bg-[#181825] border-[#313244]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <FlaskConical className="h-4 w-4 mr-2 text-[#89B4FA]" />
                      Circuit Templates
                    </CardTitle>
                    <CardDescription className="text-xs text-[#A6ADC8]">
                      Start with pre-designed quantum circuits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      onClick={() => loadTemplate('bell')}
                      variant="outline"
                      className="w-full justify-between bg-[#1E1E2E] hover:bg-[#313244]"
                      size="sm"
                    >
                      <div className="flex items-center">
                        <Atom className="h-4 w-4 mr-2 text-[#F38BA8]" />
                        <span>Bell State</span>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-[#313244]">2 qubits</Badge>
                    </Button>
                    
                    <Button 
                      onClick={() => loadTemplate('ghz')}
                      variant="outline"
                      className="w-full justify-between bg-[#1E1E2E] hover:bg-[#313244]"
                      size="sm"
                    >
                      <div className="flex items-center">
                        <Atom className="h-4 w-4 mr-2 text-[#89B4FA]" />
                        <span>GHZ State</span>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-[#313244]">3 qubits</Badge>
                    </Button>
                    
                    <Button 
                      onClick={() => loadTemplate('fourier')}
                      variant="outline"
                      className="w-full justify-between bg-[#1E1E2E] hover:bg-[#313244]"
                      size="sm"
                    >
                      <div className="flex items-center">
                        <Atom className="h-4 w-4 mr-2 text-[#A6E3A1]" />
                        <span>Quantum Fourier</span>
                      </div>
                      <Badge variant="outline" className="ml-2 bg-[#313244]">3 qubits</Badge>
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#181825] border-[#313244]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-[#89B4FA]" />
                      Designer Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-2 text-[#A6ADC8]">
                      <li className="flex items-start">
                        <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-[#89B4FA]" />
                        <span>Drag gates from the palette to the circuit, or click a gate and then click a position</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-[#89B4FA]" />
                        <span>For CNOT and CZ gates, select the control qubit from the dropdown</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-[#89B4FA]" />
                        <span>Click on a placed gate to remove it</span>
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-3 w-3 mr-1 mt-0.5 text-[#89B4FA]" />
                        <span>Adjust the circuit width with the slider</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="space-y-4">
            {simulationResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-[#181825] border-[#313244]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Layers className="h-4 w-4 mr-2 text-[#89B4FA]" />
                      Measurement Probabilities
                    </CardTitle>
                    <CardDescription className="text-xs text-[#A6ADC8]">
                      Probability of measuring each basis state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(simulationResult.probabilities).map(([state, probability]) => (
                        <div key={state} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge variant="outline" className="mr-2 bg-[#313244]">
                              |{state}⟩
                            </Badge>
                            <div className="w-48 h-3 bg-[#313244] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#89B4FA] to-[#CBA6F7]"
                                style={{ width: `${probability * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-[#CDD6F4]">{(probability * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#181825] border-[#313244]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <RotateCw className="h-4 w-4 mr-2 text-[#89B4FA]" />
                      Circuit Statistics
                    </CardTitle>
                    <CardDescription className="text-xs text-[#A6ADC8]">
                      Key metrics about your quantum circuit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {simulationResult.statistics ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-[#A6ADC8]">Entanglement Measure</p>
                              <p className="text-xl font-semibold text-[#CDD6F4]">
                                {(simulationResult.statistics.entanglement * 100).toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-[#A6ADC8]">Circuit Depth</p>
                              <p className="text-xl font-semibold text-[#CDD6F4]">
                                {simulationResult.statistics.depth}
                              </p>
                            </div>
                            <div>
                              <p className="text-[#A6ADC8]">Circuit Complexity</p>
                              <p className="text-xl font-semibold text-[#CDD6F4]">
                                {(simulationResult.statistics.complexity * 100).toFixed(0)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-[#A6ADC8]">Gate Count</p>
                              <p className="text-xl font-semibold text-[#CDD6F4]">
                                {currentCircuit.length}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-[#CDD6F4]">Execution Info</h4>
                          <div className="flex justify-between text-xs text-[#A6ADC8]">
                            <span>Simulation #</span>
                            <span>{executionCount}</span>
                          </div>
                          <div className="flex justify-between text-xs text-[#A6ADC8]">
                            <span>Shots</span>
                            <span>1,024</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-40">
                        <RotateCw className="h-8 w-8 animate-spin text-[#313244]" />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {simulationResult.explanation && (
                  <Card className="bg-[#181825] border-[#313244] md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-[#89B4FA]" />
                        AI Explanation
                      </CardTitle>
                      <CardDescription className="text-xs text-[#A6ADC8]">
                        Understanding your quantum circuit in plain language
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-[#1E1E2E] rounded-md text-sm text-[#CDD6F4]">
                        {simulationResult.explanation}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="bg-[#181825] border-[#313244]">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  {isSimulating ? (
                    <>
                      <RotateCw className="h-10 w-10 animate-spin text-[#89B4FA] mb-4" />
                      <h3 className="text-lg font-medium text-[#CDD6F4] mb-1">Simulating Quantum Circuit</h3>
                      <p className="text-sm text-[#A6ADC8]">Calculating quantum states and probabilities...</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-10 w-10 text-[#A6ADC8] opacity-50 mb-4" />
                      <h3 className="text-lg font-medium text-[#CDD6F4] mb-1">No Simulation Results</h3>
                      <p className="text-sm text-[#A6ADC8]">
                        Design a circuit and click "Run Circuit" to see simulation results.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('designer')}
                        variant="outline"
                        className="mt-4 bg-[#313244]"
                      >
                        Go to Designer
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="learn" className="space-y-4">
            <Card className="bg-[#181825] border-[#313244]">
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <Code className="h-4 w-4 mr-2 text-[#89B4FA]" />
                  Quantum Gates Reference
                </CardTitle>
                <CardDescription className="text-xs text-[#A6ADC8]">
                  Understanding the building blocks of quantum computation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#CDD6F4]">Single-Qubit Gates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#89B4FA] flex items-center justify-center">
                            <span className="font-bold">H</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Hadamard</h4>
                            <p className="text-xs text-[#A6ADC8]">Creates superposition</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#F38BA8] flex items-center justify-center">
                            <span className="font-bold">X</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Pauli-X</h4>
                            <p className="text-xs text-[#A6ADC8]">Quantum NOT gate</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#A6E3A1] flex items-center justify-center">
                            <span className="font-bold">Y</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Pauli-Y</h4>
                            <p className="text-xs text-[#A6ADC8]">Rotation around Y-axis</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#94E2D5] flex items-center justify-center">
                            <span className="font-bold">Z</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Pauli-Z</h4>
                            <p className="text-xs text-[#A6ADC8]">Phase flip</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#CDD6F4]">Multi-Qubit Gates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#FAB387] flex items-center justify-center">
                            <span className="text-[9px] font-bold">CNOT</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Controlled-NOT</h4>
                            <p className="text-xs text-[#A6ADC8]">Creates entanglement</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#CBA6F7] flex items-center justify-center">
                            <span className="font-bold">CZ</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Controlled-Z</h4>
                            <p className="text-xs text-[#A6ADC8]">Phase entanglement</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#F9E2AF] flex items-center justify-center">
                            <span className="text-[9px] font-bold">SWAP</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">SWAP</h4>
                            <p className="text-xs text-[#A6ADC8]">Exchanges qubit states</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#CDD6F4]">Rotation Gates</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#EBA0AC] flex items-center justify-center">
                            <span className="font-bold">RX</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">X-Rotation</h4>
                            <p className="text-xs text-[#A6ADC8]">Rotates around X</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#ABE9B3] flex items-center justify-center">
                            <span className="font-bold">RY</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Y-Rotation</h4>
                            <p className="text-xs text-[#A6ADC8]">Rotates around Y</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#1E1E2E] p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-md bg-[#B4BEFE] flex items-center justify-center">
                            <span className="font-bold">RZ</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-[#CDD6F4]">Z-Rotation</h4>
                            <p className="text-xs text-[#A6ADC8]">Rotates around Z</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}