import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Unified interface for quantum simulations
interface QuantumSimulation {
  id: number;
  name: string;
  dimension: number;
  type: 'quantum-state' | 'quantum-magnetism' | 'quantum-entanglement';
  state?: number[];
  isEntangled?: boolean;
  entangledWith?: number[];
  magnetization?: number[];
  correlationFunction?: number[][];
  created: string;
}

export function QuantumUnifiedDemo() {
  const [activeTab, setActiveTab] = useState('37d-quantum');
  const [dimensions, setDimensions] = useState<number>(37);
  const [hamiltonian, setHamiltonian] = useState<string>('HIGHD_HYPERCUBIC');
  const [temperature, setTemperature] = useState<number>(0.5);
  const [simulationResults, setSimulationResults] = useState<QuantumSimulation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // 37D Quantum State operations
  const runEntanglement = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/quantum/high-dimensional/entangle', 'POST', {
        dimension: dimensions,
        qudits: 2,
        entanglementType: 'GHZ'
      });
      
      setSimulationResults(prev => [...prev, {
        id: Math.floor(Math.random() * 10000),
        name: `${dimensions}D Entanglement`,
        dimension: dimensions,
        type: 'quantum-entanglement',
        state: data.state || [],
        isEntangled: true,
        entangledWith: data.quditIds || [],
        created: new Date().toISOString()
      }]);
      
      toast({
        title: 'Entanglement Simulation Complete',
        description: `${dimensions}-dimensional entanglement simulation complete!`,
      });
    } catch (error) {
      toast({
        title: 'Simulation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runBasisTransformation = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/quantum/high-dimensional/transform', 'POST', {
        dimension: dimensions,
        transformationType: 'fourier'
      });
      
      setSimulationResults(prev => [...prev, {
        id: Math.floor(Math.random() * 10000),
        name: `${dimensions}D Basis Transform`,
        dimension: dimensions,
        type: 'quantum-state',
        state: data.transformedState || [],
        isEntangled: false,
        created: new Date().toISOString()
      }]);
      
      toast({
        title: 'Basis Transformation Complete',
        description: `${dimensions}-dimensional basis transformation complete!`,
      });
    } catch (error) {
      toast({
        title: 'Transformation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quantum Magnetism operations
  const createHamiltonian = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/quantum/magnetism/hamiltonian', 'POST', {
        name: `${dimensions}D ${hamiltonian} Hamiltonian`,
        latticeType: hamiltonian,
        dimension: dimensions,
        numSites: 10,
        temperature: temperature
      });
      
      setSimulationResults(prev => [...prev, {
        id: data.hamiltonian.id,
        name: data.hamiltonian.name,
        dimension: data.hamiltonian.dimension,
        type: 'quantum-magnetism',
        created: data.hamiltonian.created
      }]);
      
      toast({
        title: 'Hamiltonian Created',
        description: `Created ${dimensions}-dimensional quantum magnetism Hamiltonian`,
      });
    } catch (error) {
      toast({
        title: 'Hamiltonian Creation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateMagnetism = async () => {
    // First create a Hamiltonian if none exists
    if (!simulationResults.some(result => result.type === 'quantum-magnetism')) {
      await createHamiltonian();
    }
    
    // Find the latest Hamiltonian
    const latestHamiltonian = [...simulationResults]
      .filter(result => result.type === 'quantum-magnetism')
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())[0];
    
    if (!latestHamiltonian) {
      toast({
        title: 'Simulation Failed',
        description: 'No Hamiltonian available for simulation',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await apiRequest('/api/quantum/magnetism/simulate', 'POST', {
        hamiltonianId: latestHamiltonian.id,
        time: 10.0,
        timeStep: 0.1,
        errorMitigation: 'READOUT_ERROR_MITIGATION',
        observables: ['magnetization', 'correlation', 'energy']
      });
      
      // Extract magnetization results from the simulation
      const magnetization = data.simulation.results.magnetization || [];
      
      // Update the UI with the results
      setSimulationResults(prev => [...prev, {
        id: Math.floor(Math.random() * 10000),
        name: `Magnetism Simulation (${latestHamiltonian.name})`,
        dimension: latestHamiltonian.dimension,
        type: 'quantum-magnetism',
        magnetization: magnetization,
        correlationFunction: data.simulation.results.correlationFunction || [],
        created: new Date().toISOString()
      }]);
      
      toast({
        title: 'Magnetism Simulation Complete',
        description: `Completed ${dimensions}D quantum magnetism simulation`,
      });
    } catch (error) {
      toast({
        title: 'Simulation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setSimulationResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Unified Quantum Framework</CardTitle>
        <CardDescription>
          Explore the integration of 37-dimensional quantum states with quantum magnetism
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="37d-quantum" onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="37d-quantum">37D Quantum States</TabsTrigger>
            <TabsTrigger value="quantum-magnetism">Quantum Magnetism</TabsTrigger>
          </TabsList>
          
          <TabsContent value="37d-quantum">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="dimensions" className="text-sm font-medium">
                    Quantum Dimensions: {dimensions}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {dimensions === 37 ? 'Optimal' : dimensions < 37 ? 'Below optimal' : 'Above optimal'}
                  </span>
                </div>
                <Slider
                  id="dimensions"
                  min={2}
                  max={50}
                  step={1}
                  value={[dimensions]}
                  onValueChange={(value) => setDimensions(value[0])}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={runEntanglement} 
                  disabled={isLoading}
                  variant="default"
                >
                  {isLoading ? 'Processing...' : 'Run GHZ Entanglement'}
                </Button>
                <Button 
                  onClick={runBasisTransformation} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Processing...' : 'Run Basis Transformation'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="quantum-magnetism">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="dimensions-magnetism" className="text-sm font-medium">
                    System Dimensions: {dimensions}
                  </label>
                </div>
                <Slider
                  id="dimensions-magnetism"
                  min={2}
                  max={50}
                  step={1}
                  value={[dimensions]}
                  onValueChange={(value) => setDimensions(value[0])}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="hamiltonian-type" className="text-sm font-medium">
                  Lattice Type
                </label>
                <Select 
                  value={hamiltonian} 
                  onValueChange={setHamiltonian}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lattice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGHD_HYPERCUBIC">High-D Hypercubic</SelectItem>
                    <SelectItem value="HIGHD_SIMPLICIAL">High-D Simplicial</SelectItem>
                    <SelectItem value="HIGHD_RANDOM">High-D Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="temperature" className="text-sm font-medium">
                    Temperature: {temperature.toFixed(2)}
                  </label>
                </div>
                <Slider
                  id="temperature"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={createHamiltonian} 
                  disabled={isLoading}
                  variant="default"
                >
                  {isLoading ? 'Processing...' : 'Create Hamiltonian'}
                </Button>
                <Button 
                  onClick={simulateMagnetism} 
                  disabled={isLoading}
                  variant="outline"
                >
                  {isLoading ? 'Processing...' : 'Run Magnetism Simulation'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {simulationResults.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Simulation Results</h3>
              <Button 
                onClick={clearResults} 
                variant="destructive"
                size="sm"
              >
                Clear Results
              </Button>
            </div>
            
            <div className="space-y-4">
              {simulationResults.map((result) => (
                <div 
                  key={result.id} 
                  className="border rounded-md p-4 bg-muted/20"
                >
                  <h3 className="text-lg font-semibold">{result.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(result.created).toLocaleString()}
                  </p>
                  <div className="mt-2">
                    <p>
                      <span className="font-medium">Dimension:</span> {result.dimension}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span> {result.type}
                    </p>
                    
                    {result.type === 'quantum-entanglement' && (
                      <>
                        <p>
                          <span className="font-medium">Entangled:</span> {result.isEntangled ? 'Yes' : 'No'}
                        </p>
                        {result.entangledWith && result.entangledWith.length > 0 && (
                          <p>
                            <span className="font-medium">Entangled with:</span> {result.entangledWith.join(', ')}
                          </p>
                        )}
                      </>
                    )}
                    
                    {result.state && result.state.length > 0 && (
                      <>
                        <p className="mt-2 text-sm">
                          <span className="font-medium">State vector sample (first 5 elements):</span>
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                          {result.state.slice(0, 5).map((val, i) => `|${i}⟩: ${val.toFixed(4)}`).join('\n')}
                          {result.state.length > 5 ? '\n...' : ''}
                        </pre>
                      </>
                    )}
                    
                    {result.magnetization && result.magnetization.length > 0 && (
                      <>
                        <p className="mt-2 text-sm">
                          <span className="font-medium">Magnetization components:</span>
                        </p>
                        <pre className="text-xs bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                          {result.magnetization.map((val, i) => `Component ${i+1}: ${val.toFixed(4)}`).join('\n')}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Unified quantum framework based on SINGULARIS PRIME language paradigms
        </p>
      </CardFooter>
    </Card>
  );
}