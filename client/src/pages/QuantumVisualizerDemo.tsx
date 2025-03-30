import React, { useState } from 'react';
import { EntanglementMap } from '@/components/quantum/EntanglementMap';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Atom, 
  Network, 
  RefreshCw, 
  Zap, 
  FlaskConical,
  Flower,
  Magnet
} from 'lucide-react';

// Demo nodes for different quantum systems
const demoSystem1 = [
  {
    id: 'seed-1',
    type: 'seed' as const,
    dimensions: 37,
    position: { x: 0.5, y: 0.5 },
    entanglementPartners: ['petal-1', 'petal-2', 'petal-3', 'petal-4', 'petal-5'],
    entanglementStrength: 0.9,
    magneticProperties: {
      field: 0.75,
      phase: 'ferromagnetic'
    }
  },
  {
    id: 'petal-1',
    type: 'petal' as const,
    dimensions: 5,
    position: { x: 0.7, y: 0.3 },
    entanglementPartners: ['seed-1', 'petal-2'],
    entanglementStrength: 0.8,
    magneticProperties: {
      field: 0.6
    }
  },
  {
    id: 'petal-2',
    type: 'petal' as const,
    dimensions: 5,
    position: { x: 0.8, y: 0.6 },
    entanglementPartners: ['seed-1', 'petal-1'],
    entanglementStrength: 0.7,
    magneticProperties: {
      field: 0.5
    }
  },
  {
    id: 'petal-3',
    type: 'petal' as const,
    dimensions: 5,
    position: { x: 0.6, y: 0.8 },
    entanglementPartners: ['seed-1', 'petal-4'],
    entanglementStrength: 0.75,
    magneticProperties: {
      field: 0.55
    }
  },
  {
    id: 'petal-4',
    type: 'petal' as const,
    dimensions: 5,
    position: { x: 0.3, y: 0.7 },
    entanglementPartners: ['seed-1', 'petal-3', 'petal-5'],
    entanglementStrength: 0.85,
    magneticProperties: {
      field: 0.7
    }
  },
  {
    id: 'petal-5',
    type: 'petal' as const,
    dimensions: 5,
    position: { x: 0.2, y: 0.4 },
    entanglementPartners: ['seed-1', 'petal-4'],
    entanglementStrength: 0.65,
    magneticProperties: {
      field: 0.45
    }
  },
  {
    id: 'observer-1',
    type: 'observer' as const,
    dimensions: 1,
    position: { x: 0.1, y: 0.1 },
    entanglementPartners: [],
    entanglementStrength: 0
  }
];

// A higher dimensional system with more complex entanglement
const demoSystem2 = [
  {
    id: 'seed-alpha',
    type: 'seed' as const,
    dimensions: 37,
    position: { x: 0.4, y: 0.4 },
    entanglementPartners: ['seed-beta', 'petal-1', 'petal-2', 'petal-3'],
    entanglementStrength: 0.95,
    magneticProperties: {
      field: 0.8,
      phase: 'spin_liquid'
    }
  },
  {
    id: 'seed-beta',
    type: 'seed' as const,
    dimensions: 37,
    position: { x: 0.6, y: 0.6 },
    entanglementPartners: ['seed-alpha', 'petal-4', 'petal-5', 'petal-6'],
    entanglementStrength: 0.92,
    magneticProperties: {
      field: 0.75,
      phase: 'antiferromagnetic'
    }
  },
  {
    id: 'petal-1',
    type: 'petal' as const,
    dimensions: 11,
    position: { x: 0.2, y: 0.3 },
    entanglementPartners: ['seed-alpha', 'petal-2'],
    entanglementStrength: 0.88,
    magneticProperties: {
      field: 0.7,
      phase: 'ferromagnetic'
    }
  },
  {
    id: 'petal-2',
    type: 'petal' as const,
    dimensions: 11,
    position: { x: 0.3, y: 0.15 },
    entanglementPartners: ['seed-alpha', 'petal-1', 'petal-3'],
    entanglementStrength: 0.82,
    magneticProperties: {
      field: 0.65
    }
  },
  {
    id: 'petal-3',
    type: 'petal' as const,
    dimensions: 11,
    position: { x: 0.5, y: 0.2 },
    entanglementPartners: ['seed-alpha', 'petal-2'],
    entanglementStrength: 0.79,
    magneticProperties: {
      field: 0.6
    }
  },
  {
    id: 'petal-4',
    type: 'petal' as const,
    dimensions: 11,
    position: { x: 0.8, y: 0.5 },
    entanglementPartners: ['seed-beta', 'petal-5'],
    entanglementStrength: 0.87,
    magneticProperties: {
      field: 0.72
    }
  },
  {
    id: 'petal-5',
    type: 'petal' as const,
    dimensions: 11,
    position: { x: 0.85, y: 0.7 },
    entanglementPartners: ['seed-beta', 'petal-4', 'petal-6'],
    entanglementStrength: 0.84,
    magneticProperties: {
      field: 0.68
    }
  },
  {
    id: 'petal-6',
    type: 'petal' as const,
    dimensions: 11,
    position: { x: 0.7, y: 0.85 },
    entanglementPartners: ['seed-beta', 'petal-5'],
    entanglementStrength: 0.81,
    magneticProperties: {
      field: 0.64
    }
  },
  {
    id: 'observer-1',
    type: 'observer' as const,
    dimensions: 1,
    position: { x: 0.1, y: 0.9 },
    entanglementPartners: [],
    entanglementStrength: 0
  },
  {
    id: 'observer-2',
    type: 'observer' as const,
    dimensions: 1,
    position: { x: 0.9, y: 0.1 },
    entanglementPartners: [],
    entanglementStrength: 0
  }
];

// A quantum magnetism focused system
const demoSystem3 = [
  {
    id: 'magnet-core',
    type: 'seed' as const,
    dimensions: 37,
    position: { x: 0.5, y: 0.5 },
    entanglementPartners: ['magnet-node-1', 'magnet-node-2', 'magnet-node-3', 'magnet-node-4', 'magnet-node-5', 'magnet-node-6'],
    entanglementStrength: 0.97,
    magneticProperties: {
      field: 0.95,
      phase: 'paramagnetic'
    }
  },
  {
    id: 'magnet-node-1',
    type: 'petal' as const,
    dimensions: 23,
    position: { x: 0.3, y: 0.3 },
    entanglementPartners: ['magnet-core', 'magnet-node-2', 'magnet-node-6'],
    entanglementStrength: 0.92,
    magneticProperties: {
      field: 0.85,
      phase: 'ferromagnetic'
    }
  },
  {
    id: 'magnet-node-2',
    type: 'petal' as const,
    dimensions: 23,
    position: { x: 0.3, y: 0.7 },
    entanglementPartners: ['magnet-core', 'magnet-node-1', 'magnet-node-3'],
    entanglementStrength: 0.9,
    magneticProperties: {
      field: 0.82,
      phase: 'ferromagnetic'
    }
  },
  {
    id: 'magnet-node-3',
    type: 'petal' as const,
    dimensions: 23,
    position: { x: 0.5, y: 0.85 },
    entanglementPartners: ['magnet-core', 'magnet-node-2', 'magnet-node-4'],
    entanglementStrength: 0.89,
    magneticProperties: {
      field: 0.8,
      phase: 'antiferromagnetic'
    }
  },
  {
    id: 'magnet-node-4',
    type: 'petal' as const,
    dimensions: 23,
    position: { x: 0.7, y: 0.7 },
    entanglementPartners: ['magnet-core', 'magnet-node-3', 'magnet-node-5'],
    entanglementStrength: 0.91,
    magneticProperties: {
      field: 0.83,
      phase: 'antiferromagnetic'
    }
  },
  {
    id: 'magnet-node-5',
    type: 'petal' as const,
    dimensions: 23,
    position: { x: 0.7, y: 0.3 },
    entanglementPartners: ['magnet-core', 'magnet-node-4', 'magnet-node-6'],
    entanglementStrength: 0.93,
    magneticProperties: {
      field: 0.87,
      phase: 'spin_liquid'
    }
  },
  {
    id: 'magnet-node-6',
    type: 'petal' as const,
    dimensions: 23,
    position: { x: 0.5, y: 0.15 },
    entanglementPartners: ['magnet-core', 'magnet-node-5', 'magnet-node-1'],
    entanglementStrength: 0.95,
    magneticProperties: {
      field: 0.88,
      phase: 'spin_liquid'
    }
  },
  {
    id: 'observer-1',
    type: 'observer' as const,
    dimensions: 1,
    position: { x: 0.15, y: 0.5 },
    entanglementPartners: [],
    entanglementStrength: 0
  },
  {
    id: 'observer-2',
    type: 'observer' as const,
    dimensions: 1,
    position: { x: 0.85, y: 0.5 },
    entanglementPartners: [],
    entanglementStrength: 0
  }
];

export function QuantumVisualizerDemo() {
  const [selectedSystem, setSelectedSystem] = useState('system1');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  // Helper to get the current system data
  const getCurrentSystem = () => {
    switch (selectedSystem) {
      case 'system1':
        return { 
          nodes: demoSystem1, 
          title: "37-Dimensional Qudit Entanglement",
          description: "A visualization of the Rose Mage's 37D qudit entanglement pattern"
        };
      case 'system2':
        return { 
          nodes: demoSystem2, 
          title: "Multi-Seed High Dimensional Entanglement",
          description: "Complex entanglement pattern between multiple 37D qudits and their connected petals"
        };
      case 'system3':
        return { 
          nodes: demoSystem3, 
          title: "Quantum Magnetism Topology",
          description: "Magnetic phase exhibition in quantum-entangled systems with 37D core"
        };
      default:
        return { 
          nodes: demoSystem1, 
          title: "37-Dimensional Qudit Entanglement",
          description: "A visualization of the Rose Mage's 37D qudit entanglement pattern"
        };
    }
  };

  const handleNodeSelected = (nodeId: string) => {
    setSelectedNode(nodeId);
    setShowInfo(true);
  };

  // Get the selected node details
  const getSelectedNodeDetails = () => {
    const system = getCurrentSystem();
    return system.nodes.find(node => node.id === selectedNode);
  };
  
  const selectedNodeDetails = getSelectedNodeDetails();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quantum Visualization System</h1>
            <p className="text-muted-foreground">
              Explore topological entanglement patterns in high-dimensional quantum systems
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              SINGULARIS PRIME
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <Atom className="h-3.5 w-3.5 mr-1" />
              37D Qudits
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="entanglement" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="entanglement">
              <Network className="h-4 w-4 mr-2" />
              Entanglement Topography
            </TabsTrigger>
            <TabsTrigger value="magnetism">
              <Magnet className="h-4 w-4 mr-2" />
              Quantum Magnetism
            </TabsTrigger>
            <TabsTrigger value="experiments">
              <FlaskConical className="h-4 w-4 mr-2" />
              Experiments
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="entanglement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <Card className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>{getCurrentSystem().title}</CardTitle>
                        <CardDescription>{getCurrentSystem().description}</CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedSystem('system1')}
                          className={selectedSystem === 'system1' ? 'bg-primary/20' : ''}
                        >
                          <Flower className="h-4 w-4 mr-2" />
                          System 1
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedSystem('system2')}
                          className={selectedSystem === 'system2' ? 'bg-primary/20' : ''}
                        >
                          <Network className="h-4 w-4 mr-2" />
                          System 2
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedSystem('system3')}
                          className={selectedSystem === 'system3' ? 'bg-primary/20' : ''}
                        >
                          <Magnet className="h-4 w-4 mr-2" />
                          System 3
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-2">
                    <EntanglementMap 
                      nodes={getCurrentSystem().nodes}
                      title={getCurrentSystem().title}
                      description={getCurrentSystem().description}
                      onNodeSelected={handleNodeSelected}
                      showMagneticFields={true}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className={`h-full transition-opacity ${showInfo && selectedNodeDetails ? 'opacity-100' : 'opacity-60'}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {selectedNodeDetails ? (
                        <>
                          {selectedNodeDetails.type === 'seed' ? (
                            <Flower className="h-5 w-5 mr-2 text-primary" />
                          ) : selectedNodeDetails.type === 'petal' ? (
                            <Sparkles className="h-5 w-5 mr-2 text-primary" />
                          ) : (
                            <Zap className="h-5 w-5 mr-2 text-primary" />
                          )}
                          {selectedNodeDetails.id}
                        </>
                      ) : (
                        <>
                          <Network className="h-5 w-5 mr-2 text-muted-foreground" />
                          Node Inspector
                        </>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedNodeDetails 
                        ? `Details for the selected ${selectedNodeDetails.type}`
                        : 'Select a node to view details'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedNodeDetails ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Dimensions</h3>
                          <p className="text-xl font-bold">{selectedNodeDetails.dimensions}D</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Entanglement</h3>
                          <p className="text-xl font-bold">{(selectedNodeDetails.entanglementStrength * 100).toFixed(0)}%</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Connected to {selectedNodeDetails.entanglementPartners.length} nodes
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedNodeDetails.entanglementPartners.map(partner => (
                              <Badge key={partner} variant="secondary" className="text-xs">
                                {partner}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {selectedNodeDetails.magneticProperties && (
                          <>
                            <Separator />
                            
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Magnetic Properties</h3>
                              {selectedNodeDetails.magneticProperties.field && (
                                <p className="text-xl font-bold">
                                  Field: {(selectedNodeDetails.magneticProperties.field * 100).toFixed(0)}%
                                </p>
                              )}
                              {selectedNodeDetails.magneticProperties.phase && (
                                <div className="mt-2">
                                  <Badge className="bg-primary/20 text-primary">
                                    <Magnet className="h-3 w-3 mr-1" />
                                    Phase: {selectedNodeDetails.magneticProperties.phase}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        <Separator />
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedNode(null)}
                          >
                            Clear Selection
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Network className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Click on any node in the visualization to view detailed information</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>About Entanglement Topography</CardTitle>
                <CardDescription>Understanding the visualization and its elements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Flower className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Seeds (37D Qudits)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The large central nodes represent 37-dimensional quantum states that serve as anchor points for entanglement networks. These high-dimensional qudits can maintain stable entanglement with multiple partners simultaneously.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Petals (Connected Qudits)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Smaller connected nodes that represent lower-dimensional quantum states entangled with the seeds. The brightness and thickness of connecting lines indicate entanglement strength.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Magnet className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">Magnetic Fields</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Colored auras around nodes represent magnetic field phases: red for ferromagnetic, blue for antiferromagnetic, yellow for paramagnetic, and cyan for spin liquid states.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="magnetism">
            <Card>
              <CardHeader>
                <CardTitle>Quantum Magnetism Visualization</CardTitle>
                <CardDescription>This feature is currently in development</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin mb-4" />
                <p className="text-muted-foreground mb-2">
                  Our team is working on advanced quantum magnetism models
                </p>
                <Button variant="outline" disabled>Coming Soon</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="experiments">
            <Card>
              <CardHeader>
                <CardTitle>Quantum Experiments Laboratory</CardTitle>
                <CardDescription>This feature is currently in development</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  Interactive quantum experiments will be available in a future update
                </p>
                <Button variant="outline" disabled>Coming Soon</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}