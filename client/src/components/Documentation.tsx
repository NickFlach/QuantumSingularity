import { FC } from 'react';
import QuantumVisualizer from './QuantumVisualizer';

interface DocumentationProps {
  activePanel: "documentation" | "visualizer";
  setActivePanel: (panel: "documentation" | "visualizer") => void;
  selectedElement: string | null;
}

const elementDocs = {
  quantumKey: {
    title: "quantumKey",
    description: "Creates a quantum key using entangled particles for secure communication between nodes.",
    syntax: "quantumKey [keyName] = entangle([nodeA], [nodeB]);",
    security: [
      "Provides post-quantum security through QKD protocol",
      "Resistant to both classical and quantum attacks",
      "Automatically detects eavesdropping attempts"
    ]
  },
  entangle: {
    title: "entangle",
    description: "Creates quantum entanglement between two nodes for secure key distribution.",
    syntax: "entangle([nodeA], [nodeB])",
    security: [
      "Uses Bell state preparation for quantum entanglement",
      "Implements BB84 or E91 QKD protocols",
      "Provides unbreakable encryption with proper implementation"
    ]
  },
  contract: {
    title: "AI_Autonomous_Trade",
    description: "Smart contract template for AI-to-AI negotiations with human oversight capabilities.",
    parameters: [
      { name: "explainabilityThreshold", description: "Minimum level of human-understandable decisions (0.0-1.0)" },
      { name: "consensusProtocol", description: "Algorithm used for achieving agreement between AI agents" }
    ],
    autonomyLevel: 0.85
  },
  deployModel: {
    title: "deployModel",
    description: "Deploys an AI model to a specified location with monitoring and fallback capabilities.",
    syntax: "deployModel [modelName] to [location] { ... }",
    parameters: [
      { name: "monitorAuditTrail", description: "Records all AI decisions for future auditing" },
      { name: "fallbackToHuman", description: "Sets conditions for human intervention when AI diverges" }
    ]
  },
  syncLedger: {
    title: "syncLedger",
    description: "Synchronizes distributed ledgers across planetary distances with latency compensation.",
    syntax: "syncLedger [ledgerName] { ... }",
    parameters: [
      { name: "adaptiveLatency", description: "Compensates for interplanetary communication delays" },
      { name: "validateZeroKnowledgeProofs", description: "Ensures privacy-preserving validation of transactions" }
    ]
  },
  resolveParadox: {
    title: "resolveParadox",
    description: "Resolves quantum information paradoxes through iterative optimization.",
    syntax: "resolveParadox [dataName] using [methodName]([parameters]);",
    parameters: [
      { name: "selfOptimizingLoop", description: "Iterative process that converges on optimal solution" },
      { name: "max_iterations", description: "Maximum number of optimization attempts" }
    ]
  }
};

const Documentation: FC<DocumentationProps> = ({ activePanel, setActivePanel, selectedElement }) => {
  const selectedDoc = selectedElement ? elementDocs[selectedElement as keyof typeof elementDocs] : null;
  
  return (
    <div className="w-2/5 flex flex-col overflow-hidden">
      <div className="bg-[#343a40] p-2 flex justify-between items-center border-b border-[#6a0dad]/30">
        <div className="flex space-x-3">
          <button 
            className={`px-2 py-1 text-sm rounded ${
              activePanel === "documentation" 
                ? "bg-[#00b4d8]/20 text-white" 
                : "bg-[#343a40] hover:bg-[#343a40]/70 text-gray-300"
            }`}
            onClick={() => setActivePanel("documentation")}
          >
            Documentation
          </button>
          <button 
            className={`px-2 py-1 text-sm rounded ${
              activePanel === "visualizer" 
                ? "bg-[#00b4d8]/20 text-white" 
                : "bg-[#343a40] hover:bg-[#343a40]/70 text-gray-300"
            }`}
            onClick={() => setActivePanel("visualizer")}
          >
            Quantum Visualizer
          </button>
        </div>
        <div>
          <button className="text-gray-400 hover:text-white">
            <i className="ri-fullscreen-line"></i>
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto p-4 space-y-6">
        {activePanel === "documentation" ? (
          selectedDoc ? (
            <>
              {'title' in selectedDoc && (
                <div>
                  <h3 className="text-lg font-bold text-[#00b4d8]">{selectedDoc.title}</h3>
                  {'description' in selectedDoc && (
                    <div className="mt-1 text-sm">
                      <p className="mb-2">{selectedDoc.description}</p>
                      {'syntax' in selectedDoc && (
                        <div className="bg-[#343a40]/40 p-3 rounded-md">
                          <h4 className="font-semibold">Syntax:</h4>
                          <pre className="mt-1 text-sm text-gray-300">{selectedDoc.syntax}</pre>
                        </div>
                      )}
                    </div>
                  )}
                  {'security' in selectedDoc && Array.isArray(selectedDoc.security) && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-sm">Security Implications:</h4>
                      <ul className="list-disc ml-5 mt-1 text-sm">
                        {selectedDoc.security.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {'autonomyLevel' in selectedDoc && (
                    <div className="mt-3">
                      <div className="p-3 rounded-md bg-[#343a40]/40">
                        <h4 className="font-semibold">AI Autonomy Level:</h4>
                        <div className="mt-2 relative">
                          <div className="h-2 w-full bg-gray-700 rounded-full">
                            <div 
                              className="h-2 bg-gradient-to-r from-[#00b4d8] to-[#6a0dad] rounded-full"
                              style={{ width: `${selectedDoc.autonomyLevel * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs text-gray-400">
                            <span>Human-Governed</span>
                            <span>Full Autonomy</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {'parameters' in selectedDoc && Array.isArray(selectedDoc.parameters) && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-sm">Parameters:</h4>
                      <ul className="ml-1 mt-1 text-sm space-y-2">
                        {selectedDoc.parameters.map((param, index) => (
                          <li key={index} className="flex">
                            <span className="text-[#00b4d8] font-mono w-40">{param.name}</span>
                            <span>{param.description}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {selectedElement === 'quantumKey' && (
                <div className="border-t border-[#6a0dad]/30 pt-4">
                  <h3 className="text-lg font-bold text-[#00b4d8]">Quantum Visual Circuit</h3>
                  <div className="mt-3 bg-[#343a40]/20 p-4 rounded-md flex justify-center">
                    <QuantumVisualizer />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-[#00b4d8]">Select an element</h3>
              <p className="text-gray-400 mt-2">Click on a syntax element in the editor to view its documentation</p>
            </div>
          )
        ) : (
          <QuantumVisualizer />
        )}
      </div>
    </div>
  );
};

export default Documentation;
