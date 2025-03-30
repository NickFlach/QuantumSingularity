import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface MagnetismSimulationResult {
  id: number;
  name: string;
  latticeType: string;
  numSites: number;
  interactions: string[];
  temperature: number;
  magnetization: number[];
  correlationFunction?: number[][];
  entanglementEntropy?: number;
  timeEvolution?: {
    time: number;
    state: any[];
  }[];
  created: string;
}

export function QuantumMagnetismDemo() {
  const [numSites, setNumSites] = useState<number>(10);
  const [latticeType, setLatticeType] = useState<string>("HIGHD_HYPERCUBIC");
  const [temperature, setTemperature] = useState<number>(0.1);
  const [simulationResults, setSimulationResults] = useState<MagnetismSimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      // First create a Hamiltonian
      const hamiltonianResponse = await apiRequest('/api/quantum/magnetism/hamiltonian', 'POST', {
        name: "37D Quantum Magnetism",
        latticeType,
        dimension: 37,
        numSites,
        temperature
      });
      
      if (!hamiltonianResponse.ok) {
        throw new Error('Failed to create Hamiltonian');
      }
      
      const hamiltonianResult = await hamiltonianResponse.json();
      const hamiltonianId = hamiltonianResult.hamiltonian.id;
      
      // Now run a simulation with this Hamiltonian
      const simulationResponse = await apiRequest('/api/quantum/magnetism/simulate', 'POST', {
        hamiltonianId,
        duration: 10,
        timeSteps: 50,
        errorMitigation: 'ZNE' // Zero-noise extrapolation
      });
      
      if (!simulationResponse.ok) {
        throw new Error('Failed to run magnetism simulation');
      }
      
      const simulationResult = await simulationResponse.json();
      
      // Add to our results
      setSimulationResults(prev => [...prev, {
        id: Math.random(),
        name: `${numSites}-site ${latticeType} Simulation`,
        latticeType,
        numSites,
        temperature,
        interactions: hamiltonianResult.hamiltonian.interactions.map((i: any) => i.type),
        magnetization: simulationResult.simulation.results.magnetization || [0, 0, 0],
        correlationFunction: simulationResult.simulation.results.correlationFunction,
        entanglementEntropy: simulationResult.simulation.results.entanglementEntropy,
        timeEvolution: simulationResult.simulation.results.timeEvolution,
        created: new Date().toISOString()
      }]);
      
      toast({
        title: 'Quantum Magnetism Simulation Complete',
        description: `Completed simulation with ${numSites} sites at temperature ${temperature}.`,
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

  const analyzePhaseTransition = async () => {
    setIsLoading(true);
    try {
      // First create a Hamiltonian if we don't have one
      let hamiltonianId: number;
      
      if (simulationResults.length === 0) {
        const hamiltonianResponse = await apiRequest('/api/quantum/magnetism/hamiltonian', 'POST', {
          name: "37D Phase Analysis",
          latticeType,
          dimension: 37,
          numSites,
          temperature
        });
        
        if (!hamiltonianResponse.ok) {
          throw new Error('Failed to create Hamiltonian for phase analysis');
        }
        
        const hamiltonianResult = await hamiltonianResponse.json();
        hamiltonianId = hamiltonianResult.hamiltonian.id;
      } else {
        // Use the first result's Hamiltonian
        hamiltonianId = simulationResults[0].id;
      }
      
      // Now analyze phases
      const phaseResponse = await apiRequest('/api/quantum/magnetism/phases', 'POST', {
        hamiltonianId,
        paramRange: {
          start: 0.01,
          end: 2.0,
          steps: 20
        },
        paramName: 'temperature'
      });
      
      if (!phaseResponse.ok) {
        throw new Error('Failed to analyze phase transitions');
      }
      
      const phaseResult = await phaseResponse.json();
      
      // Show in a toast notification
      toast({
        title: 'Phase Analysis Complete',
        description: `Analyzed potential phase transitions across temperature range.`,
      });
      
      // Could add phase diagram to results in a more complex implementation
    } catch (error) {
      toast({
        title: 'Phase Analysis Failed',
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
        <CardTitle>Quantum Magnetism Simulation</CardTitle>
        <CardDescription>
          Simulate quantum magnetism phenomena in 37-dimensional space
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="latticeType" className="text-sm font-medium">
                Lattice Type
              </label>
              <Select
                value={latticeType}
                onValueChange={setLatticeType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lattice type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGHD_HYPERCUBIC">Hypercubic (37D)</SelectItem>
                  <SelectItem value="TRIANGULAR">Triangular</SelectItem>
                  <SelectItem value="KAGOME">Kagome</SelectItem>
                  <SelectItem value="HIGHD_RANDOM">Random 37D</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Number of Sites: {numSites}
              </label>
              <Slider
                min={4}
                max={20}
                step={1}
                value={[numSites]}
                onValueChange={(value) => setNumSites(value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Temperature: {temperature.toFixed(2)}
              </label>
              <Slider
                min={0.01}
                max={2}
                step={0.01}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runSimulation} 
              disabled={isLoading}
              variant="default"
            >
              {isLoading ? 'Simulating...' : 'Run Quantum Magnetism Simulation'}
            </Button>
            <Button 
              onClick={analyzePhaseTransition} 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Analyzing...' : 'Analyze Phase Transitions'}
            </Button>
            {simulationResults.length > 0 && (
              <Button 
                onClick={clearResults} 
                variant="destructive"
                size="sm"
                className="ml-auto"
              >
                Clear Results
              </Button>
            )}
          </div>

          {simulationResults.length > 0 && (
            <Tabs defaultValue="results" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="magnetization">Magnetization</TabsTrigger>
                <TabsTrigger value="correlation">Correlation</TabsTrigger>
              </TabsList>
              <TabsContent value="results" className="space-y-4">
                {simulationResults.map((result) => (
                  <div 
                    key={result.id} 
                    className="border rounded-md p-4 bg-muted/20"
                  >
                    <h3 className="text-lg font-semibold">{result.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(result.created).toLocaleString()}
                    </p>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p>
                          <span className="font-medium">Lattice Type:</span> {result.latticeType}
                        </p>
                        <p>
                          <span className="font-medium">Sites:</span> {result.numSites}
                        </p>
                        <p>
                          <span className="font-medium">Temperature:</span> {result.temperature}
                        </p>
                        <p>
                          <span className="font-medium">Interactions:</span> {result.interactions.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Magnetization:</span> [{result.magnetization.map(m => m.toFixed(3)).join(', ')}]
                        </p>
                        {result.entanglementEntropy !== undefined && (
                          <p>
                            <span className="font-medium">Entanglement Entropy:</span> {result.entanglementEntropy.toFixed(4)}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Time Steps:</span> {result.timeEvolution?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="magnetization">
                <div className="h-64 flex items-center justify-center border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Magnetization visualization would appear here.
                    Values: {simulationResults.length > 0 ? 
                      `[${simulationResults[0].magnetization.map(m => m.toFixed(3)).join(', ')}]` :
                      'No data'
                    }
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="correlation">
                <div className="h-64 flex items-center justify-center border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Correlation function visualization would appear here.
                    Matrix size: {simulationResults.length > 0 && simulationResults[0].correlationFunction ? 
                      `${simulationResults[0].correlationFunction.length}×${simulationResults[0].correlationFunction[0].length}` :
                      'No data'
                    }
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Based on quantum magnetism simulation research with 56-qubit quantum processors
        </p>
      </CardFooter>
    </Card>
  );
}