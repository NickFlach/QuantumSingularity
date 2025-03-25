import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  Atom, 
  Box, 
  GitMerge, 
  Shuffle, 
  RotateCcw, 
  RotateCw, 
  Zap, 
  Shield, 
  GitBranch
} from "lucide-react";

export interface QuantumOperationsPanelProps {
  onOperationComplete: (operation: any) => void;
  onSpaceCreated: (space: any) => void;
}

export function QuantumOperationsPanel({
  onOperationComplete = () => {},
  onSpaceCreated = () => {}
}: QuantumOperationsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("gates");
  const [gateParams, setGateParams] = useState({
    angle: 90,
    fidelity: 0.95,
    errorCorrection: true
  });
  const [spaceParams, setSpaceParams] = useState({
    dimension: 3,
    metric: "minkowski",
    energy: 0.75
  });

  const handleGateOperation = (gate: string) => {
    onOperationComplete({
      type: "gate",
      gate,
      params: gateParams
    });
  };

  const handleCreateSpace = () => {
    onSpaceCreated({
      type: "space",
      params: spaceParams
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-11rem)]">
      <div className="p-4 space-y-4">
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={selectedCategory === "gates" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory("gates")}
            className="flex-1"
          >
            <Atom className="h-4 w-4 mr-2" />
            Gates
          </Button>
          <Button 
            variant={selectedCategory === "spaces" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory("spaces")}
            className="flex-1"
          >
            <Box className="h-4 w-4 mr-2" />
            Spaces
          </Button>
          <Button 
            variant={selectedCategory === "entanglement" ? "default" : "outline"} 
            size="sm"
            onClick={() => setSelectedCategory("entanglement")}
            className="flex-1"
          >
            <GitMerge className="h-4 w-4 mr-2" />
            Entangl.
          </Button>
        </div>

        {selectedCategory === "gates" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Single-Qubit Gates</CardTitle>
                <CardDescription className="text-xs">
                  Gates that operate on individual qubits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("H")}
                  >
                    <span className="text-lg font-bold">H</span>
                    <span className="text-xs mt-1">Hadamard</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("X")}
                  >
                    <span className="text-lg font-bold">X</span>
                    <span className="text-xs mt-1">Pauli-X</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("Y")}
                  >
                    <span className="text-lg font-bold">Y</span>
                    <span className="text-xs mt-1">Pauli-Y</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("Z")}
                  >
                    <span className="text-lg font-bold">Z</span>
                    <span className="text-xs mt-1">Pauli-Z</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("S")}
                  >
                    <span className="text-lg font-bold">S</span>
                    <span className="text-xs mt-1">Phase</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("T")}
                  >
                    <span className="text-lg font-bold">T</span>
                    <span className="text-xs mt-1">π/8</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Rotation Gates</CardTitle>
                <CardDescription className="text-xs">
                  Gates that rotate qubits by specified angles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("RX")}
                  >
                    <span className="text-lg font-bold">RX</span>
                    <span className="text-xs mt-1">X-Rotation</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("RY")}
                  >
                    <span className="text-lg font-bold">RY</span>
                    <span className="text-xs mt-1">Y-Rotation</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("RZ")}
                  >
                    <span className="text-lg font-bold">RZ</span>
                    <span className="text-xs mt-1">Z-Rotation</span>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="angle" className="text-xs">Angle (degrees)</Label>
                    <Badge variant="outline" className="text-xs">{gateParams.angle}°</Badge>
                  </div>
                  <Slider 
                    id="angle"
                    min={0} 
                    max={360} 
                    step={1}
                    value={[gateParams.angle]} 
                    onValueChange={(value) => setGateParams({...gateParams, angle: value[0]})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Multi-Qubit Gates</CardTitle>
                <CardDescription className="text-xs">
                  Gates that operate on multiple qubits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("CNOT")}
                  >
                    <span className="text-lg font-bold">CNOT</span>
                    <span className="text-xs mt-1">Control-NOT</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("CZ")}
                  >
                    <span className="text-lg font-bold">CZ</span>
                    <span className="text-xs mt-1">Control-Z</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("SWAP")}
                  >
                    <Shuffle className="h-4 w-4 mb-1" />
                    <span className="text-xs">SWAP</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("TOFF")}
                  >
                    <span className="text-lg font-bold">T</span>
                    <span className="text-xs mt-1">Toffoli</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("FRED")}
                  >
                    <span className="text-lg font-bold">F</span>
                    <span className="text-xs mt-1">Fredkin</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="fidelity" className="text-xs">Fidelity</Label>
                    <Badge variant="outline" className="text-xs">{gateParams.fidelity.toFixed(2)}</Badge>
                  </div>
                  <Slider 
                    id="fidelity"
                    min={0} 
                    max={1} 
                    step={0.01}
                    value={[gateParams.fidelity]} 
                    onValueChange={(value) => setGateParams({...gateParams, fidelity: value[0]})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="errorCorrection" className="text-xs">Error Correction</Label>
                    <p className="text-[10px] text-muted-foreground">Apply quantum error correction</p>
                  </div>
                  <Switch
                    id="errorCorrection"
                    checked={gateParams.errorCorrection}
                    onCheckedChange={(checked) => setGateParams({...gateParams, errorCorrection: checked})}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedCategory === "spaces" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quantum Geometric Spaces</CardTitle>
                <CardDescription className="text-xs">
                  Define geometric spaces for quantum computation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dimension" className="text-xs">Dimension</Label>
                  <Select
                    value={spaceParams.dimension.toString()}
                    onValueChange={(value) => setSpaceParams({...spaceParams, dimension: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dimension" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2D</SelectItem>
                      <SelectItem value="3">3D</SelectItem>
                      <SelectItem value="4">4D</SelectItem>
                      <SelectItem value="5">5D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metric" className="text-xs">Metric</Label>
                  <Select
                    value={spaceParams.metric}
                    onValueChange={(value) => setSpaceParams({...spaceParams, metric: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="euclidean">Euclidean</SelectItem>
                      <SelectItem value="minkowski">Minkowski</SelectItem>
                      <SelectItem value="hyperbolic">Hyperbolic</SelectItem>
                      <SelectItem value="elliptic">Elliptic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="energy" className="text-xs">Energy Density</Label>
                    <Badge variant="outline" className="text-xs">{spaceParams.energy.toFixed(2)}</Badge>
                  </div>
                  <Slider 
                    id="energy"
                    min={0} 
                    max={1} 
                    step={0.01}
                    value={[spaceParams.energy]} 
                    onValueChange={(value) => setSpaceParams({...spaceParams, energy: value[0]})}
                  />
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
                  onClick={handleCreateSpace}
                >
                  <Box className="h-4 w-4 mr-2" />
                  Create Quantum Space
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Topological Properties</CardTitle>
                <CardDescription className="text-xs">
                  Topological features for quantum computation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {}}
                  >
                    <Badge className="mr-2 bg-blue-500">C</Badge>
                    Connected
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {}}
                  >
                    <Badge className="mr-2 bg-purple-500">C</Badge>
                    Compact
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {}}
                  >
                    <Badge className="mr-2 bg-indigo-500">O</Badge>
                    Orientable
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {}}
                  >
                    <Badge className="mr-2 bg-cyan-500">S</Badge>
                    Simply-Connected
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedCategory === "entanglement" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Entanglement Operations</CardTitle>
                <CardDescription className="text-xs">
                  Create and manipulate quantum entanglement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("BELL")}
                  >
                    <GitMerge className="h-4 w-4 mb-1" />
                    <span className="text-xs">Bell State</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("GHZ")}
                  >
                    <GitBranch className="h-4 w-4 mb-1" />
                    <span className="text-xs">GHZ State</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("W")}
                  >
                    <span className="text-lg font-bold">W</span>
                    <span className="text-xs mt-1">W State</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex flex-col items-center py-3 h-auto"
                    onClick={() => handleGateOperation("CLUSTER")}
                  >
                    <RotateCw className="h-4 w-4 mb-1" />
                    <span className="text-xs">Cluster</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Entanglement Protocols</CardTitle>
                <CardDescription className="text-xs">
                  Quantum communication protocols
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {}}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Quantum Teleportation
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {}}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Quantum Key Distribution
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start"
                    onClick={() => {}}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Dense Coding
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Topological Entanglement</CardTitle>
                <CardDescription className="text-xs">
                  Entanglement based on geometric proximity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="particle1" className="text-xs">Particle 1</Label>
                  <Input id="particle1" placeholder="Enter qubit ID" className="text-xs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="particle2" className="text-xs">Particle 2</Label>
                  <Input id="particle2" placeholder="Enter qubit ID" className="text-xs" />
                </div>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => {}}
                >
                  <GitMerge className="h-4 w-4 mr-2" />
                  Entangle by Proximity
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}