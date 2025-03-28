import React from 'react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KashiwaraExampleCard } from '@/components/KashiwaraExampleCard';
import {
  sheafModuleExample,
  dModuleExample,
  functorialTransformExample,
  crystalStateExample,
  singularityAnalysisExample,
  integratedQuantumExample,
  apiExamples
} from '@/data/kashiwaraExamples';

export default function KashiwaraQuantumPage() {
  return (
    <Container className="py-10">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            SINGULARIS PRIME vΩ: The Kashiwara Genesis
          </h1>
          <p className="text-lg text-muted-foreground">
            Advanced Mathematical Framework for Quantum Computing and AI Integration
          </p>
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p>
            The Kashiwara Genesis framework integrates advanced mathematical structures such as sheaf theory, 
            D-modules, functorial transforms, and crystal states into the Singularis Prime quantum programming 
            language. This framework enables precise formalization of quantum logic, topological invariants, 
            and categorical transformations.
          </p>
        </div>

        <Tabs defaultValue="sheaf" className="w-full">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full max-w-4xl">
              <TabsTrigger value="sheaf">Sheaf Modules</TabsTrigger>
              <TabsTrigger value="dmodule">D-Modules</TabsTrigger>
              <TabsTrigger value="functor">Functorial</TabsTrigger>
              <TabsTrigger value="crystal">Crystal</TabsTrigger>
              <TabsTrigger value="singularity">Singularities</TabsTrigger>
              <TabsTrigger value="integrated">Integrated</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="sheaf" className="mt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="max-w-3xl text-center">
                <h2 className="text-2xl font-bold">Sheaf Modules</h2>
                <p className="text-muted-foreground">
                  Sheaf modules formalize local-to-global principles in quantum systems,
                  allowing precise modeling of spacetime-distributed quantum information.
                </p>
              </div>
              <KashiwaraExampleCard
                title="Quantum Sheaf Module Example"
                description="Demonstrates how local quantum states can be glued together to form a consistent global quantum system."
                code={sheafModuleExample}
                endpoint={apiExamples.sheafModule.endpoint}
                payload={apiExamples.sheafModule.payload}
              />
            </div>
          </TabsContent>

          <TabsContent value="dmodule" className="mt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="max-w-3xl text-center">
                <h2 className="text-2xl font-bold">D-Modules</h2>
                <p className="text-muted-foreground">
                  D-modules provide a powerful framework for describing quantum dynamics as systems
                  of differential equations with rich algebraic structure.
                </p>
              </div>
              <KashiwaraExampleCard
                title="Quantum D-Module Example"
                description="Demonstrates how differential equations govern quantum evolution with analysis of singularities and solutions."
                code={dModuleExample}
                endpoint={apiExamples.dModule.endpoint}
                payload={apiExamples.dModule.payload}
              />
            </div>
          </TabsContent>

          <TabsContent value="functor" className="mt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="max-w-3xl text-center">
                <h2 className="text-2xl font-bold">Functorial Transforms</h2>
                <p className="text-muted-foreground">
                  Functorial transforms provide structure-preserving mappings between different quantum
                  computing paradigms, enabling seamless translation and optimization.
                </p>
              </div>
              <KashiwaraExampleCard
                title="Quantum Functorial Transform Example"
                description="Demonstrates a structure-preserving mapping between quantum circuit and topological quantum computing models."
                code={functorialTransformExample}
                endpoint={apiExamples.functorialTransform.endpoint}
                payload={apiExamples.functorialTransform.payload}
              />
            </div>
          </TabsContent>

          <TabsContent value="crystal" className="mt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="max-w-3xl text-center">
                <h2 className="text-2xl font-bold">Crystal States</h2>
                <p className="text-muted-foreground">
                  Crystal states provide discrete abstractions of continuous quantum systems,
                  offering combinatorial tools for analyzing complex quantum behaviors.
                </p>
              </div>
              <KashiwaraExampleCard
                title="Quantum Crystal State Example"
                description="Demonstrates discrete crystalline structures that model quantum systems with symmetry and representation theory."
                code={crystalStateExample}
                endpoint={apiExamples.crystalState.endpoint}
                payload={apiExamples.crystalState.payload}
              />
            </div>
          </TabsContent>

          <TabsContent value="singularity" className="mt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="max-w-3xl text-center">
                <h2 className="text-2xl font-bold">Singularity Analysis</h2>
                <p className="text-muted-foreground">
                  Singularity analysis detects phase transitions, critical points, and computational
                  bottlenecks in quantum systems for optimal execution.
                </p>
              </div>
              <KashiwaraExampleCard
                title="Quantum Singularity Analysis Example"
                description="Demonstrates detection of quantum phase transitions and classification of critical phenomena in quantum systems."
                code={singularityAnalysisExample}
                endpoint={apiExamples.singularityAnalysis.endpoint}
                payload={apiExamples.singularityAnalysis.payload}
              />
            </div>
          </TabsContent>

          <TabsContent value="integrated" className="mt-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="max-w-3xl text-center">
                <h2 className="text-2xl font-bold">Integrated Quantum Framework</h2>
                <p className="text-muted-foreground">
                  The integrated Kashiwara Genesis framework combines all mathematical structures
                  for a comprehensive quantum programming model with rigorous foundations.
                </p>
              </div>
              <KashiwaraExampleCard
                title="Integrated Kashiwara Genesis Example"
                description="Demonstrates how sheaves, D-modules, functors, and crystals combine into a unified mathematical framework for quantum programming."
                code={integratedQuantumExample}
                endpoint="/api/kashiwara/integrated"
                payload={{
                  components: [
                    "sheaf",
                    "dmodule",
                    "functor",
                    "crystal"
                  ],
                  integration: "full"
                }}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}