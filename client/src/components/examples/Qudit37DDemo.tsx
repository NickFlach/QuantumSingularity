import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SimulationResult {
  id: number;
  name: string;
  dimension: number;
  state: number[];
  isEntangled: boolean;
  entangledWith?: number[];
  created: string;
}

export function Qudit37DDemo() {
  const [dimensions, setDimensions] = useState<number>(37);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const runEntanglement = async () => {
    setIsLoading(true);
    try {
      // Using async/await style with error handling
      const data = await apiRequest('/api/quantum/high-dimensional/entangle', 'POST', {
        dimension: dimensions,
        qudits: 2,
        entanglementType: 'GHZ'
      });
      
      setSimulationResults(prev => [...prev, {
        id: Math.floor(Math.random() * 10000),
        name: `${dimensions}D Entanglement`,
        dimension: dimensions,
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
      // Using consistent API pattern
      const data = await apiRequest('/api/quantum/high-dimensional/transform', 'POST', {
        dimension: dimensions,
        transformationType: 'fourier'
      });
      
      setSimulationResults(prev => [...prev, {
        id: Math.floor(Math.random() * 10000),
        name: `${dimensions}D Basis Transform`,
        dimension: dimensions,
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

  const clearResults = () => {
    setSimulationResults([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>37-Dimensional Quantum State Demonstration</CardTitle>
        <CardDescription>
          Explore high-dimensional quantum systems beyond traditional qubits
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
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
                    <div className="mt-2">
                      <p>
                        <span className="font-medium">Dimension:</span> {result.dimension}
                      </p>
                      <p>
                        <span className="font-medium">Entangled:</span> {result.isEntangled ? 'Yes' : 'No'}
                      </p>
                      {result.entangledWith && result.entangledWith.length > 0 && (
                        <p>
                          <span className="font-medium">Entangled with:</span> {result.entangledWith.join(', ')}
                        </p>
                      )}
                      <p className="mt-2 text-sm">
                        <span className="font-medium">State vector sample (first 5 elements):</span>
                      </p>
                      <pre className="text-xs bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                        {result.state.slice(0, 5).map((val, i) => `|${i}⟩: ${val.toFixed(4)}`).join('\n')}
                        {result.state.length > 5 ? '\n...' : ''}
                      </pre>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="visualization">
                <div className="h-64 flex items-center justify-center border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Visualization of high-dimensional states requires specialized rendering.
                    See the API response for full state details.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Based on recent breakthroughs in 37-dimensional light state manipulation
        </p>
      </CardFooter>
    </Card>
  );
}