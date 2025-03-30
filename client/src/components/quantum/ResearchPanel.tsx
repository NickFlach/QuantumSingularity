import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileJson, 
  FileText, 
  ArrowDownToLine,
  Calculator,
  Sigma,
  BookOpen,
  Save,
  RotateCcw,
  Eye
} from 'lucide-react';

interface QuantumNode {
  id: string;
  type: 'seed' | 'petal' | 'observer';
  dimensions: number;
  position: { x: number; y: number };
  entanglementPartners: string[];
  entanglementStrength: number;
  magneticProperties?: {
    field: number;
    phase?: string;
  };
}

interface ResearchPanelProps {
  nodes: QuantumNode[];
  selectedNode: QuantumNode | null;
  simulationParameters: {
    temperature: number;
    fieldStrength: number;
    dimensions: number;
    interactionStrength: number;
    decoherenceRate: number;
  };
  onParameterChange: (param: string, value: number) => void;
  onExportData: (format: string) => void;
}

export function ResearchPanel({ 
  nodes, 
  selectedNode, 
  simulationParameters,
  onParameterChange,
  onExportData
}: ResearchPanelProps) {
  const [activeTab, setActiveTab] = useState('equations');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Calculate entanglement entropy (simplified formula for demo)
  const calculateEntanglementEntropy = () => {
    if (!selectedNode) return 0;
    
    // S = -Tr(ρ log ρ) where ρ is the density matrix
    // Simplified calculation for demo purposes
    const partnerCount = selectedNode.entanglementPartners.length;
    const strength = selectedNode.entanglementStrength;
    
    // Simple model: more partners with stronger entanglement = higher entropy
    return -1 * (partnerCount * strength * Math.log(strength + 0.0001));
  };
  
  // Get magnetic phase transition temperature (for demo)
  const getPhaseTc = () => {
    if (!selectedNode || !selectedNode.magneticProperties) return 0;
    
    const field = selectedNode.magneticProperties.field;
    const dimension = selectedNode.dimensions;
    
    // Simplified critical temperature based on field strength and dimensions
    return field * Math.sqrt(dimension) * 2;
  };
  
  // Format for display
  const formatScientific = (num: number) => {
    if (Math.abs(num) < 0.01 || Math.abs(num) > 10000) {
      return num.toExponential(2);
    }
    return num.toFixed(4);
  };
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Calculator className="mr-2 h-5 w-5 text-primary" />
            Research Metrics
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExportData('json')}
              title="Export as JSON"
            >
              <FileJson className="mr-1 h-4 w-4" />
              JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExportData('csv')}
              title="Export as CSV"
            >
              <FileText className="mr-1 h-4 w-4" />
              CSV
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Quantum metrics and parameters for physics and mathematics research
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="equations">
              <Sigma className="h-4 w-4 mr-2" />
              Equations
            </TabsTrigger>
            <TabsTrigger value="parameters">
              <Calculator className="h-4 w-4 mr-2" />
              Parameters
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <BookOpen className="h-4 w-4 mr-2" />
              Metrics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="equations" className="space-y-4">
            <div className="rounded-md border p-4 bg-muted/50">
              <h3 className="text-sm font-medium mb-2">Hamiltonian</h3>
              <div className="text-center py-3 font-mono">
                ℋ = -J∑<sub>i,j</sub> Ŝ<sub>i</sub>·Ŝ<sub>j</sub> - h∑<sub>i</sub> Ŝ<sub>i</sub><sup>z</sup> - A∑<sub>i</sub> (Ŝ<sub>i</sub><sup>z</sup>)<sup>2</sup>
              </div>
              
              <h3 className="text-sm font-medium mt-4 mb-2">37-Dimensional Qudit State</h3>
              <div className="text-center py-3 font-mono">
                |ψ⟩ = ∑<sub>i=0</sub><sup>36</sup> c<sub>i</sub>|i⟩, ∑<sub>i</sub> |c<sub>i</sub>|<sup>2</sup> = 1
              </div>
              
              <h3 className="text-sm font-medium mt-4 mb-2">Entanglement Entropy</h3>
              <div className="text-center py-3 font-mono">
                S(ρ<sub>A</sub>) = -Tr(ρ<sub>A</sub> log ρ<sub>A</sub>)
              </div>
              
              {selectedNode?.type === 'seed' && (
                <>
                  <h3 className="text-sm font-medium mt-4 mb-2">Seed-Petal Entanglement</h3>
                  <div className="text-center py-3 font-mono">
                    |Ψ<sub>SP</sub>⟩ = (1/√d) ∑<sub>i=0</sub><sup>d-1</sup> |i⟩<sub>S</sub> |i⟩<sub>P</sub>
                  </div>
                </>
              )}
              
              {selectedNode?.magneticProperties && (
                <>
                  <h3 className="text-sm font-medium mt-4 mb-2">Quantum Magnetism</h3>
                  <div className="text-center py-3 font-mono">
                    ⟨M⟩ = ⟨ψ|∑<sub>i</sub> Ŝ<sub>i</sub><sup>z</sup>|ψ⟩
                  </div>
                </>
              )}
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="text-sm font-medium mb-2">Current System Parameters</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Temperature (T):</span>
                  <span className="font-mono">{formatScientific(simulationParameters.temperature)} K</span>
                </div>
                <div className="flex justify-between">
                  <span>Field Strength (h):</span>
                  <span className="font-mono">{formatScientific(simulationParameters.fieldStrength)} T</span>
                </div>
                <div className="flex justify-between">
                  <span>Interaction (J):</span>
                  <span className="font-mono">{formatScientific(simulationParameters.interactionStrength)} eV</span>
                </div>
                <div className="flex justify-between">
                  <span>Decoherence Rate:</span>
                  <span className="font-mono">{formatScientific(simulationParameters.decoherenceRate)} s<sup>-1</sup></span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="parameters" className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">Temperature (K)</Label>
                  <span className="text-sm font-mono">{simulationParameters.temperature.toFixed(2)}</span>
                </div>
                <Slider 
                  id="temperature"
                  min={0.01} 
                  max={10} 
                  step={0.01} 
                  value={[simulationParameters.temperature]}
                  onValueChange={(value) => onParameterChange('temperature', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Adjusts the thermal energy in the quantum system
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="fieldStrength">Magnetic Field (T)</Label>
                  <span className="text-sm font-mono">{simulationParameters.fieldStrength.toFixed(2)}</span>
                </div>
                <Slider 
                  id="fieldStrength"
                  min={0} 
                  max={2} 
                  step={0.01} 
                  value={[simulationParameters.fieldStrength]}
                  onValueChange={(value) => onParameterChange('fieldStrength', value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  External field strength affecting magnetic alignment
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="dimensions">Qudit Dimensions</Label>
                  <span className="text-sm font-mono">{simulationParameters.dimensions}</span>
                </div>
                <Select 
                  value={simulationParameters.dimensions.toString()} 
                  onValueChange={(value) => onParameterChange('dimensions', parseInt(value))}
                >
                  <SelectTrigger id="dimensions">
                    <SelectValue placeholder="Select dimensions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 (qubit)</SelectItem>
                    <SelectItem value="3">3 (qutrit)</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="11">11</SelectItem>
                    <SelectItem value="23">23</SelectItem>
                    <SelectItem value="37">37 (optimal)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Number of distinct states in the quantum system
                </p>
              </div>
              
              <Separator />
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="show-advanced" 
                  checked={showAdvancedOptions}
                  onCheckedChange={setShowAdvancedOptions}
                />
                <Label htmlFor="show-advanced">Show Advanced Parameters</Label>
              </div>
              
              {showAdvancedOptions && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="interactionStrength">Interaction Strength (eV)</Label>
                      <span className="text-sm font-mono">{simulationParameters.interactionStrength.toFixed(3)}</span>
                    </div>
                    <Slider 
                      id="interactionStrength"
                      min={0} 
                      max={1} 
                      step={0.001} 
                      value={[simulationParameters.interactionStrength]}
                      onValueChange={(value) => onParameterChange('interactionStrength', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Coupling strength between quantum particles (J parameter)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="decoherenceRate">Decoherence Rate (s<sup>-1</sup>)</Label>
                      <span className="text-sm font-mono">{simulationParameters.decoherenceRate.toExponential(2)}</span>
                    </div>
                    <Slider 
                      id="decoherenceRate"
                      min={1e-6} 
                      max={1e-1} 
                      step={0.00001} 
                      value={[simulationParameters.decoherenceRate]}
                      onValueChange={(value) => onParameterChange('decoherenceRate', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">
                      Rate at which quantum coherence is lost to environment
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              )}
              
              <Button className="w-full" disabled={!selectedNode}>
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Run Simulation
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="space-y-4">
            {selectedNode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-1">Entanglement Entropy</h3>
                    <p className="text-2xl font-bold">{calculateEntanglementEntropy().toFixed(4)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Measures quantum information shared between subsystems
                    </p>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="text-sm font-medium mb-1">Coherence Time</h3>
                    <p className="text-2xl font-bold">
                      {(1/simulationParameters.decoherenceRate).toExponential(2)} s
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected duration before quantum state decoheres
                    </p>
                  </div>
                </div>
                
                {selectedNode.magneticProperties && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium mb-1">Magnetic Phase</h3>
                      <div className="flex items-center">
                        <p className="text-lg font-bold">
                          {selectedNode.magneticProperties.phase || 'Unknown'}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${
                            selectedNode.magneticProperties.phase === 'ferromagnetic' 
                              ? 'bg-blue-100 text-blue-800' 
                              : selectedNode.magneticProperties.phase === 'antiferromagnetic'
                              ? 'bg-amber-100 text-amber-800'
                              : selectedNode.magneticProperties.phase === 'spin_liquid'
                              ? 'bg-violet-100 text-violet-800'
                              : 'bg-gray-100'
                          }`}
                        >
                          {selectedNode.magneticProperties.field.toFixed(2)} T
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Magnetic ordering in the quantum system
                      </p>
                    </div>
                    
                    <div className="rounded-md border p-4">
                      <h3 className="text-sm font-medium mb-1">Critical Temperature</h3>
                      <p className="text-2xl font-bold">{getPhaseTc().toFixed(2)} K</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Temperature of phase transition
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="rounded-md border p-4">
                  <h3 className="text-sm font-medium mb-2">System Properties</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-semibold">{selectedNode.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span className="font-semibold">{selectedNode.dimensions}D</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantum Information:</span>
                      <span className="font-semibold">
                        {Math.log2(selectedNode.dimensions).toFixed(2)} qubits
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entanglement Partners:</span>
                      <span className="font-semibold">{selectedNode.entanglementPartners.length}</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Analysis Report
                </Button>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
                <div>
                  <p>Select a node in the visualization to view detailed metrics</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}