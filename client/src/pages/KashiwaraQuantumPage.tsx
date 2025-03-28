import React from 'react';
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
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code } from '../components/ui/code';

export default function KashiwaraQuantumPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="py-4">
        <h1 className="text-3xl font-bold">Kashiwara Genesis: Quantum Computing</h1>
        <p className="text-muted-foreground">Explore the unified mathematical framework for quantum computation</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Singularis Prime vΩ: Kashiwara Genesis</CardTitle>
          <CardDescription>
            A revolutionary mathematical framework integrating sheaf theory, D-modules, functorial transforms, 
            and crystal bases with quantum computing to create a unified programming ontology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Kashiwara Genesis transforms abstract mathematics into programming constructs, 
            enabling topological quantum computing with human-auditable execution models.
            The examples below demonstrate how these mathematical structures can model 
            quantum phenomena and algorithms with formal guarantees.
          </p>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sheaf">Sheaf Modules</TabsTrigger>
              <TabsTrigger value="dmodule">D-Modules</TabsTrigger>
              <TabsTrigger value="functor">Functorial Transforms</TabsTrigger>
              <TabsTrigger value="crystal">Crystal States</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>What is Kashiwara Genesis?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Kashiwara Genesis, named after mathematician Masaki Kashiwara, is a mathematical framework
                      that unifies continuous and discrete mathematics, local and global perspectives into a
                      coherent programming paradigm. It provides:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Sheaf Modules: Local logic with gluing laws</li>
                      <li>∂ Operators & D-Structures: Differential systems as native syntax</li>
                      <li>Functorial Transforms: Structure-preserving mappings</li>
                      <li>Singularity Awareness: Topological signals</li>
                      <li>Crystal States: Discrete abstractions of continuous intelligence</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Integrated Example</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 overflow-auto">
                    <Code language="typescript" className="text-xs">
                      {integratedQuantumExample}
                    </Code>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sheaf">
              <div className="mt-4">
                <KashiwaraExampleCard 
                  title="Quantum Sheaf Module"
                  description="Sheaf modules represent local quantum state behaviors that can be glued together to form a coherent global quantum system."
                  code={sheafModuleExample}
                  endpoint={apiExamples.sheafModule.endpoint}
                  payload={apiExamples.sheafModule.payload}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="dmodule">
              <div className="mt-4">
                <KashiwaraExampleCard 
                  title="Quantum D-Module"
                  description="D-modules represent differential operators that govern quantum state evolution under Hamiltonian dynamics."
                  code={dModuleExample}
                  endpoint={apiExamples.dModule.endpoint}
                  payload={apiExamples.dModule.payload}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="functor">
              <div className="mt-4">
                <KashiwaraExampleCard 
                  title="Quantum Functorial Transform"
                  description="Functorial transforms provide mappings between classical and quantum computing paradigms with rigorous property preservation."
                  code={functorialTransformExample}
                  endpoint={apiExamples.functorialTransform.endpoint}
                  payload={apiExamples.functorialTransform.payload}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="crystal">
              <div className="mt-4">
                <KashiwaraExampleCard 
                  title="Quantum Crystal State"
                  description="Crystal states provide a discrete representation of quantum systems, making it tractable to analyze phase transitions and topological effects."
                  code={crystalStateExample}
                  endpoint={apiExamples.crystalState.endpoint}
                  payload={apiExamples.crystalState.payload}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quantum Singularity Analysis</CardTitle>
          <CardDescription>
            Detecting quantum phase transitions and computational bottlenecks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-4">
                Kashiwara Genesis can analyze singularities in quantum systems, identifying phase transitions
                as mathematically rigorous singularities in the system's behavior. This is particularly
                useful for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Identifying quantum phase transitions</li>
                <li>Detecting computational bottlenecks in quantum algorithms</li>
                <li>Understanding the scaling behavior of quantum algorithms</li>
                <li>Verifying the correctness of quantum implementations</li>
              </ul>
            </div>
            
            <div>
              <Code language="typescript" className="h-64 overflow-auto">
                {singularityAnalysisExample}
              </Code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}