import React from 'react';
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Qudit37DDemo } from '@/components/examples/Qudit37DDemo';
import { QuantumMagnetismDemo } from '@/components/examples/QuantumMagnetismDemo';
import { QuantumUnifiedDemo } from '@/components/examples/QuantumUnifiedDemo';

export function ExamplesPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SINGULARIS PRIME Examples</h1>
          <p className="text-muted-foreground mt-1">
            Explore the capabilities of 37-dimensional quantum states and quantum magnetism simulations
          </p>
        </div>
        <Link href="/" className="underline text-sm text-muted-foreground hover:text-primary">
          Back to Home
        </Link>
      </div>

      <Tabs defaultValue="unified-framework" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unified-framework">Unified Framework</TabsTrigger>
          <TabsTrigger value="37d-quantum">37D Quantum States</TabsTrigger>
          <TabsTrigger value="quantum-magnetism">Quantum Magnetism</TabsTrigger>
        </TabsList>
        <TabsContent value="unified-framework" className="space-y-4 mt-4">
          <div className="prose max-w-none mb-6">
            <h2>Unified Quantum Framework</h2>
            <p>
              The SINGULARIS PRIME language has evolved to unify 37-dimensional quantum states with 
              quantum magnetism simulations, creating a coherent framework that makes complex quantum 
              operations more accessible.
            </p>
            <p>
              This unified approach enables researchers to explore quantum entanglement in high-dimensional spaces
              alongside quantum magnetic phenomena, revealing deeper connections between these domains.
            </p>
            <p>
              Key features of this unified framework include:
            </p>
            <ul>
              <li>Parametric quantum types that adapt to any dimension</li>
              <li>Entanglement as a first-class concept throughout the language</li>
              <li>Seamless integration of classical and quantum operations</li>
              <li>Linear type system for proper quantum state manipulation</li>
              <li>Advanced error mitigation strategies automatically applied</li>
            </ul>
          </div>
          <QuantumUnifiedDemo />
        </TabsContent>
        <TabsContent value="37d-quantum" className="space-y-4 mt-4">
          <div className="prose max-w-none mb-6">
            <h2>High-Dimensional Quantum States</h2>
            <p>
              Recent breakthroughs have demonstrated light existing in 37 dimensions, 
              extending the Greenberger–Horne–Zeilinger (GHZ) paradox to 37-dimensional 
              photonic states. This experiment shows that quantum reality is far more complex 
              and higher-dimensional than previously thought.
            </p>
            <p>
              SINGULARIS PRIME natively supports these high-dimensional states (qudits) and 
              provides specialized operations for manipulating them, enabling more efficient 
              quantum algorithms and enhanced information density.
            </p>
          </div>
          <Qudit37DDemo />
        </TabsContent>
        <TabsContent value="quantum-magnetism" className="space-y-4 mt-4">
          <div className="prose max-w-none mb-6">
            <h2>Quantum Magnetism Simulations</h2>
            <p>
              Quantum magnetism simulations represent a frontier where quantum computers 
              demonstrate advantage over classical systems. Recent experiments using 56-qubit 
              quantum processors successfully simulated quantum Ising models beyond what 
              classical supercomputers could handle.
            </p>
            <p>
              SINGULARIS PRIME provides abstractions for defining and simulating complex quantum 
              magnetism models with features including:
            </p>
            <ul>
              <li>High-dimensional lattice structure definitions</li>
              <li>Integrated error mitigation strategies</li>
              <li>Advanced entanglement tracking</li>
              <li>Phase transition analysis</li>
            </ul>
          </div>
          <QuantumMagnetismDemo />
        </TabsContent>
      </Tabs>

      <div className="mt-8 bg-muted/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Technical Documentation</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  High-Dimensional Quantum State API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Quantum Magnetism Simulation Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Error Mitigation Strategies in SINGULARIS PRIME
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Research Background</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  37-Dimensional Light: Experimental Results
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Quantum Advantage in Magnetism Simulations
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Entanglement-Centric Design in Quantum Languages
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}