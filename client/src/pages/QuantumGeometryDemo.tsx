import { useState } from "react";
import { Link } from "wouter";
import { PageHeader } from "@/components/ui/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, Atom, Cpu, Sigma, Grid3X3 } from "lucide-react";

// Import quantum types
import { QuantumSpace, QuantumState, QuantumInvariant } from "@/types/quantum";

// Sample quantum spaces for demo
const sampleQuantumSpaces: QuantumSpace[] = [
  {
    id: "space-euclidean",
    dimension: 3,
    elements: ["point", "line", "plane"],
    states: [
      { id: "state-1", coordinates: [0.5, 0.3, 0.8] },
      { id: "state-2", coordinates: [0.2, 0.7, 0.4] },
      { id: "state-3", coordinates: [0.9, 0.1, 0.6] }
    ],
    transformations: [
      {
        transformationType: "rotation",
        parameters: { angle: 45, axis: 2 },
        result: "Rotated state around z-axis",
        energyDelta: 0.05
      }
    ],
    entanglements: [
      {
        entanglementResult: {
          success: true,
          entanglementStrength: 0.85,
          description: "Strong entanglement between states"
        },
        spaceProperties: {
          spaceId: "space-euclidean",
          dimension: 3,
          metric: "euclidean"
        },
        quantumEffects: {
          informationPreservation: 0.92,
          decoherenceResistance: 0.78,
          nonLocalityMeasure: 0.89
        }
      }
    ],
    invariants: [
      { name: "Euler Characteristic", value: 2 },
      { name: "Topological Dimension", value: 3 },
      { name: "Quantum Fisher Information", value: 8.45 }
    ]
  },
  {
    id: "space-hyperbolic",
    dimension: 4,
    elements: ["point", "line", "plane", "manifold"],
    states: [
      { id: "state-h1", coordinates: [0.3, 0.6, 0.2, 0.7] },
      { id: "state-h2", coordinates: [0.5, 0.1, 0.9, 0.4] }
    ],
    transformations: [
      {
        transformationType: "hyperbolic",
        parameters: { curvature: -1, direction: 1 },
        result: "Applied negative curvature transform",
        energyDelta: 0.12
      }
    ],
    entanglements: [
      {
        entanglementResult: {
          success: true,
          entanglementStrength: 0.92,
          description: "Very strong non-Euclidean entanglement"
        },
        spaceProperties: {
          spaceId: "space-hyperbolic",
          dimension: 4,
          metric: "hyperbolic"
        },
        quantumEffects: {
          informationPreservation: 0.95,
          decoherenceResistance: 0.85,
          nonLocalityMeasure: 0.94
        }
      }
    ],
    invariants: [
      { name: "Hyperbolic Volume", value: 4.2 },
      { name: "Negative Curvature Metric", value: -1 },
      { name: "Information Density", value: 12.7 }
    ]
  },
  {
    id: "space-minkowski",
    dimension: 4,
    elements: ["point", "line", "plane", "manifold"],
    states: [
      { id: "state-m1", coordinates: [0.1, 0.4, 0.7, 0.9] },
      { id: "state-m2", coordinates: [0.8, 0.3, 0.5, 0.2] },
      { id: "state-m3", coordinates: [0.6, 0.2, 0.8, 0.1] }
    ],
    transformations: [
      {
        transformationType: "lorentz",
        parameters: { velocity: 0.7, direction: 0 },
        result: "Applied Lorentz transformation along x-axis",
        energyDelta: 0.33
      }
    ],
    entanglements: [
      {
        entanglementResult: {
          success: true,
          entanglementStrength: 0.78,
          description: "Spacetime entanglement with causal structure preservation"
        },
        spaceProperties: {
          spaceId: "space-minkowski",
          dimension: 4,
          metric: "minkowski"
        },
        quantumEffects: {
          informationPreservation: 0.82,
          decoherenceResistance: 0.68,
          nonLocalityMeasure: 0.91
        }
      }
    ],
    invariants: [
      { name: "Spacetime Interval", value: -16.2 },
      { name: "Light Cone Structure", value: 1 },
      { name: "Lorentz Invariant", value: 7.3 }
    ]
  }
];

export default function QuantumGeometryDemo() {
  const [selectedSpace, setSelectedSpace] = useState<string>("space-euclidean");
  const [selectedView, setSelectedView] = useState<string>("states");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [visualization3D, setVisualization3D] = useState<boolean>(true);
  
  const getSpaceById = (id: string) => {
    return sampleQuantumSpaces.find(space => space.id === id) || sampleQuantumSpaces[0];
  };

  const currentSpace = getSpaceById(selectedSpace);
  
  return (
    <Container>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <PageHeader 
            title="Quantum Geometry Visualizer" 
            description="Explore quantum states in various geometric spaces"
          />
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
              <CardDescription>Adjust quantum space parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantum Space</label>
                <Select 
                  value={selectedSpace} 
                  onValueChange={setSelectedSpace}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a space" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="space-euclidean">Euclidean Space</SelectItem>
                    <SelectItem value="space-hyperbolic">Hyperbolic Space</SelectItem>
                    <SelectItem value="space-minkowski">Minkowski Space</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rotation Angle</label>
                <Slider 
                  value={[rotationAngle]} 
                  onValueChange={(values) => setRotationAngle(values[0])}
                  min={0} 
                  max={360} 
                  step={1}
                />
                <div className="text-xs text-right text-muted-foreground">
                  {rotationAngle}°
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Visualization</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant={visualization3D ? "default" : "outline"}
                    onClick={() => setVisualization3D(true)}
                    className={visualization3D ? "bg-gradient-to-r from-indigo-600 to-blue-500" : ""}
                  >
                    3D View
                  </Button>
                  <Button 
                    size="sm" 
                    variant={!visualization3D ? "default" : "outline"}
                    onClick={() => setVisualization3D(false)}
                    className={!visualization3D ? "bg-gradient-to-r from-indigo-600 to-blue-500" : ""}
                  >
                    2D Projection
                  </Button>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
                  Generate New Simulation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Visualization Panel */}
          <Card className="lg:col-span-3 min-h-[400px]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" /> 
                {selectedSpace === "space-euclidean" ? "Euclidean" : 
                 selectedSpace === "space-hyperbolic" ? "Hyperbolic" : 
                 "Minkowski"} Space Visualization
              </CardTitle>
              <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="states" className="flex items-center gap-1">
                    <Atom className="h-4 w-4" /> States
                  </TabsTrigger>
                  <TabsTrigger value="entanglement" className="flex items-center gap-1">
                    <Cpu className="h-4 w-4" /> Entanglement
                  </TabsTrigger>
                  <TabsTrigger value="invariants" className="flex items-center gap-1">
                    <Sigma className="h-4 w-4" /> Invariants
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <TabsContent value="states" className="mt-0">
                <div className="rounded-md bg-muted p-4 min-h-[320px] flex flex-col items-center justify-center">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Quantum States in {currentSpace.dimension}D Space</h3>
                    <p className="text-sm text-muted-foreground">
                      {visualization3D ? '3D Visualization' : '2D Projection'} with {rotationAngle}° rotation
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {currentSpace.states.map((state, i) => (
                      <div key={state.id} className="border rounded-md p-3 bg-background">
                        <div className="text-sm font-medium">State {i+1}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Coordinates: [{state.coordinates.map(c => c.toFixed(2)).join(', ')}]
                        </div>
                        <div className="mt-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${state.coordinates[0] * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="entanglement" className="mt-0">
                <div className="rounded-md bg-muted p-4 min-h-[320px]">
                  {currentSpace.entanglements.map((entanglement, i) => (
                    <div key={i} className="border rounded-md p-4 bg-background mb-4">
                      <h3 className="text-lg font-medium">Entanglement Properties</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {entanglement.entanglementResult.description}
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Entanglement Strength</div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                              style={{ width: `${entanglement.entanglementResult.entanglementStrength * 100}%` }}
                            />
                          </div>
                          <div className="text-xs text-right mt-1">
                            {(entanglement.entanglementResult.entanglementStrength * 100).toFixed(1)}%
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="border rounded-md p-2">
                            <div className="text-xs font-medium mb-1">Information Preservation</div>
                            <div className="text-lg">{(entanglement.quantumEffects.informationPreservation * 100).toFixed(1)}%</div>
                          </div>
                          <div className="border rounded-md p-2">
                            <div className="text-xs font-medium mb-1">Decoherence Resistance</div>
                            <div className="text-lg">{(entanglement.quantumEffects.decoherenceResistance * 100).toFixed(1)}%</div>
                          </div>
                          <div className="border rounded-md p-2">
                            <div className="text-xs font-medium mb-1">Non-Locality Measure</div>
                            <div className="text-lg">{(entanglement.quantumEffects.nonLocalityMeasure * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="invariants" className="mt-0">
                <div className="rounded-md bg-muted p-4 min-h-[320px]">
                  <h3 className="text-lg font-medium mb-4">Topological Invariants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSpace.invariants.map((inv, i) => (
                      <div key={i} className="border rounded-md p-4 bg-background">
                        <div className="text-sm font-medium">{inv.name}</div>
                        <div className="flex items-end justify-between mt-2">
                          <div className="text-2xl font-bold">{inv.value.toFixed(2)}</div>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs">
                            {i+1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quantum Geometry Information</CardTitle>
            <CardDescription>Understanding the principles of quantum geometric spaces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Quantum geometry provides a framework for representing quantum states and operations in geometric spaces. 
              Each type of space offers different properties that affect how quantum information behaves:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="border rounded-md p-4">
                <h3 className="text-md font-medium">Euclidean Space</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Standard geometric space with flat geometry, following usual distance metrics. Quantum states behave
                  more intuitively in this space, making it ideal for simpler quantum operations.
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-md font-medium">Hyperbolic Space</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Negatively curved space that expands exponentially, allowing for richer encoding of quantum information.
                  Supports more complex entanglement patterns and quantum error correction codes.
                </p>
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-md font-medium">Minkowski Space</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Spacetime geometry with both spatial and temporal dimensions. Critical for quantum operations that
                  involve relativistic effects or light-like separations between quantum events.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}