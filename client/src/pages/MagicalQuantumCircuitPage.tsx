import { useState } from "react";
import { Container } from "@/components/ui/container";
import MagicalQuantumCircuitDesigner, { QuantumCircuit } from "@/components/MagicalQuantumCircuitDesigner";
import { CircuitSimulationResult } from "./QuantumCircuitDesignerPage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Zap } from "lucide-react";

export default function MagicalQuantumCircuitPage() {
  const [currentCircuit, setCurrentCircuit] = useState<QuantumCircuit | null>(null);
  const [simulationResult, setSimulationResult] = useState<CircuitSimulationResult | null>(null);

  const handleSaveCircuit = (circuit: QuantumCircuit) => {
    setCurrentCircuit(circuit);
    console.log("Saved circuit:", circuit);
  };

  const handleSimulationComplete = (result: CircuitSimulationResult) => {
    setSimulationResult(result);
    console.log("Simulation result:", result);
  };

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Magical Quantum Circuit Designer</h1>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            Design quantum circuits with enchanted drag-and-drop capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-slate-50/5 border-primary/20">
            <CardHeader className="pb-0">
              <div className="flex items-center">
                <Wand2 className="h-5 w-5 mr-2 text-primary" />
                <CardTitle>Quantum Circuit Enchantment Studio</CardTitle>
              </div>
              <CardDescription>
                Create quantum magic with our intuitive drag-and-drop interface
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <MagicalQuantumCircuitDesigner 
                initialCircuit={currentCircuit || undefined} 
                onSave={handleSaveCircuit}
                onSimulate={handleSimulationComplete}
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-3">
              <Card className="bg-slate-50/5 border-primary/20">
                <CardHeader className="pb-0">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-amber-500" />
                    <CardTitle>Quantum Features</CardTitle>
                  </div>
                  <CardDescription>
                    Powerful capabilities of SINGULARIS PRIME quantum simulation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FeatureCard 
                      title="Rich Gate Library" 
                      description="Access to all essential quantum gates including H, X, Y, Z, RX, RY, RZ, CNOT, CZ, SWAP, T and S gates."
                    />
                    <FeatureCard 
                      title="Interactive Drag & Drop" 
                      description="Intuitive interface for building quantum circuits with real-time visualization and feedback."
                    />
                    <FeatureCard 
                      title="Advanced Simulation" 
                      description="High-fidelity quantum simulation with customizable shots and error rates."
                    />
                    <FeatureCard 
                      title="Bloch Sphere Visualization" 
                      description="Visualize qubit states on the Bloch sphere to understand quantum transformations."
                    />
                    <FeatureCard 
                      title="Quantum Optimization" 
                      description="AI-powered circuit optimization using multiple strategies like gradient descent and quantum annealing."
                    />
                    <FeatureCard 
                      title="Explainable Quantum Computing" 
                      description="Generated explanations of circuit behavior for better understanding of quantum principles."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-slate-100/5 border border-slate-200/10 rounded-lg p-4 hover:bg-slate-100/10 transition-colors">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}