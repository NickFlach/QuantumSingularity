import React, { useState } from "react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { QuantumGeometryVisualizer } from "@/components/QuantumGeometryVisualizer";

// Sample quantum spaces
const sampleSpaces = [
  {
    id: "euclidean-3d",
    dimension: 3,
    metric: "euclidean",
    properties: ["connected", "orientable", "simply-connected"],
    states: [
      { id: "ψ₁", coordinates: [0.5, 0.3, 0.2] },
      { id: "ψ₂", coordinates: [-0.5, 0.4, 0.1] },
      { id: "ψ₃", coordinates: [0.2, -0.6, 0.3] }
    ],
    entanglements: [
      { source: "ψ₁", target: "ψ₂", strength: 0.8 },
      { source: "ψ₂", target: "ψ₃", strength: 0.6 },
      { source: "ψ₁", target: "ψ₃", strength: 0.4 }
    ]
  },
  {
    id: "hyperbolic-4d",
    dimension: 4,
    metric: "hyperbolic",
    properties: ["connected", "orientable"],
    states: [
      { id: "ψ₁", coordinates: [0.3, 0.2, 0.1, 0.4] },
      { id: "ψ₂", coordinates: [-0.2, 0.5, 0.3, -0.1] },
      { id: "ψ₃", coordinates: [0.1, -0.3, 0.5, 0.2] },
      { id: "ψ₄", coordinates: [-0.4, -0.2, -0.1, 0.3] }
    ],
    entanglements: [
      { source: "ψ₁", target: "ψ₂", strength: 0.9 },
      { source: "ψ₂", target: "ψ₃", strength: 0.7 },
      { source: "ψ₃", target: "ψ₄", strength: 0.8 },
      { source: "ψ₄", target: "ψ₁", strength: 0.5 }
    ]
  },
  {
    id: "elliptic-3d",
    dimension: 3,
    metric: "elliptic",
    properties: ["connected", "compact", "orientable"],
    states: [
      { id: "ψ₁", coordinates: [0.6, 0.2, 0.1] },
      { id: "ψ₂", coordinates: [-0.3, 0.7, 0.2] },
      { id: "ψ₃", coordinates: [0.1, -0.4, 0.6] },
      { id: "ψ₄", coordinates: [-0.5, -0.3, 0.4] },
      { id: "ψ₅", coordinates: [0.4, 0.5, -0.3] }
    ],
    entanglements: [
      { source: "ψ₁", target: "ψ₂", strength: 0.6 },
      { source: "ψ₂", target: "ψ₃", strength: 0.7 },
      { source: "ψ₃", target: "ψ₄", strength: 0.5 },
      { source: "ψ₄", target: "ψ₅", strength: 0.8 },
      { source: "ψ₅", target: "ψ₁", strength: 0.9 }
    ]
  },
  {
    id: "minkowski-4d",
    dimension: 4,
    metric: "minkowski",
    properties: ["connected", "non-compact"],
    states: [
      { id: "ψ₁", coordinates: [0.0, 0.3, 0.2, 0.7] },
      { id: "ψ₂", coordinates: [0.1, -0.5, 0.4, 0.3] },
      { id: "ψ₃", coordinates: [0.2, 0.1, -0.6, 0.4] },
      { id: "ψ₄", coordinates: [0.3, 0.2, 0.3, -0.5] },
      { id: "ψ₅", coordinates: [0.4, -0.3, -0.2, 0.6] },
      { id: "ψ₆", coordinates: [0.5, 0.4, -0.1, -0.3] }
    ],
    entanglements: [
      { source: "ψ₁", target: "ψ₆", strength: 0.95 },
      { source: "ψ₂", target: "ψ₅", strength: 0.85 },
      { source: "ψ₃", target: "ψ₄", strength: 0.75 }
    ]
  }
];

// Sample topological invariants
const sampleInvariants = {
  "euclidean-3d": [
    { name: "Euler Characteristic", value: 0 },
    { name: "Betti Number b₀", value: 1 },
    { name: "Betti Number b₁", value: 0 },
    { name: "Betti Number b₂", value: 0 }
  ],
  "hyperbolic-4d": [
    { name: "Euler Characteristic", value: -2 },
    { name: "Betti Number b₀", value: 1 },
    { name: "Betti Number b₁", value: 4 },
    { name: "Betti Number b₂", value: 6 },
    { name: "Betti Number b₃", value: 4 },
    { name: "Sectional Curvature", value: -1.0 }
  ],
  "elliptic-3d": [
    { name: "Euler Characteristic", value: 2 },
    { name: "Betti Number b₀", value: 1 },
    { name: "Betti Number b₁", value: 0 },
    { name: "Betti Number b₂", value: 1 },
    { name: "Sectional Curvature", value: 1.0 }
  ],
  "minkowski-4d": [
    { name: "Euler Characteristic", value: 0 },
    { name: "Betti Number b₀", value: 1 },
    { name: "Betti Number b₁", value: 1 },
    { name: "Betti Number b₂", value: 1 },
    { name: "Betti Number b₃", value: 1 },
    { name: "Lorentzian Signature", value: -2 }
  ]
};

const QuantumGeometryDemo = () => {
  const [selectedSpace, setSelectedSpace] = useState("euclidean-3d");
  const [entanglementStrength, setEntanglementStrength] = useState(0.5);

  // Find the selected space
  const space = sampleSpaces.find(s => s.id === selectedSpace) || sampleSpaces[0];
  
  // Adjust entanglement strength based on slider
  const adjustedSpace = {
    ...space,
    entanglements: space.entanglements?.map(e => ({
      ...e,
      strength: Math.min(1, e.strength * entanglementStrength * 2)
    }))
  };

  return (
    <Container>
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <PageHeader 
        title="Quantum Geometry Visualization" 
        description="Explore quantum states in various geometric spaces using SINGULARIS PRIME"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
        <div className="md:col-span-9">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Interactive Quantum Space Visualization</span>
                <Badge variant="outline" className="ml-2">
                  {space.dimension}D {space.metric.charAt(0).toUpperCase() + space.metric.slice(1)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuantumGeometryVisualizer 
                space={adjustedSpace} 
                invariants={sampleInvariants[selectedSpace as keyof typeof sampleInvariants]} 
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Space Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Space Type</label>
                  <Select
                    value={selectedSpace}
                    onValueChange={setSelectedSpace}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Space" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="euclidean-3d">3D Euclidean</SelectItem>
                      <SelectItem value="hyperbolic-4d">4D Hyperbolic</SelectItem>
                      <SelectItem value="elliptic-3d">3D Elliptic</SelectItem>
                      <SelectItem value="minkowski-4d">4D Minkowski</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Entanglement Strength</label>
                  <Slider
                    value={[entanglementStrength]}
                    onValueChange={(values) => setEntanglementStrength(values[0])}
                    max={1}
                    step={0.01}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Weak</span>
                    <span>Strong</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Space Properties</h4>
                  <div className="flex flex-wrap gap-2">
                    {space.properties.map((property, index) => (
                      <Badge key={index} variant="secondary">
                        {property}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Quantum States</h4>
                  <div className="text-xs text-muted-foreground">
                    {space.states.length} states with {space.entanglements?.length || 0} entanglements
                  </div>
                </div>
                
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="text-sm font-medium">Explanation</h4>
                  <p className="text-xs text-muted-foreground">
                    {space.metric === "euclidean" && "Euclidean space represents flat quantum geometry with standard distance measurements."}
                    {space.metric === "hyperbolic" && "Hyperbolic space has negative curvature, allowing more quantum states to be packed in a given volume."}
                    {space.metric === "elliptic" && "Elliptic space has positive curvature, creating a compact, bounded quantum geometric structure."}
                    {space.metric === "minkowski" && "Minkowski space models relativistic quantum physics with a time dimension and is foundational to quantum field theory."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default QuantumGeometryDemo;