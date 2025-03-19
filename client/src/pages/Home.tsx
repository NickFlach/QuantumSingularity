import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Console from "@/components/Console";
import Documentation from "@/components/Documentation";
import StatusBar from "@/components/StatusBar";
import { CompilerConsole } from "@/components/CompilerConsole";
import { exampleMainCode } from "@/data/exampleCode";
import { apiRequest } from "@/lib/queryClient";
import {
  analyzeCode,
  generateDocumentation,
  evaluateExplainability
} from "@/lib/openai";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Home = () => {
  const [activeTab, setActiveTab] = useState("main.singularis");
  const [code, setCode] = useState(exampleMainCode);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [activePanel, setActivePanel] = useState<"documentation" | "visualizer">("documentation");
  const [selectedElement, setSelectedElement] = useState<string | null>("quantumKey");
  const [isExecuting, setIsExecuting] = useState(false);
  const [consoleMode, setConsoleMode] = useState<"standard" | "compiler">("standard");
  const { toast } = useToast();

  const handleRun = async () => {
    setIsExecuting(true);
    setConsoleOutput(["$ singularis run main.singularis", "Executing..."]);
    
    try {
      // First attempt to actually execute the code with our backend
      const executeResult = await apiRequest<{ output: string[] }>("POST", "/api/execute", { code });
      
      if (executeResult && executeResult.output) {
        setConsoleOutput(executeResult.output);
      } else {
        throw new Error("Failed to execute code");
      }
      
      // As a bonus, evaluate the explainability score
      try {
        const explainabilityResult = await evaluateExplainability(code);
        if (explainabilityResult.score) {
          setConsoleOutput(prevOutput => [
            ...prevOutput,
            `Explainability Score: ${(explainabilityResult.score * 100).toFixed(1)}%`,
            `Analysis: ${explainabilityResult.analysis.substring(0, 100)}...`,
            "Program completed successfully"
          ]);
        }
      } catch (explainError) {
        console.error("Failed to evaluate explainability:", explainError);
      }
    } catch (error) {
      console.error("Execution error:", error);
      setConsoleOutput([
        "$ singularis run main.singularis",
        "Initializing Quantum Runtime v2.3.0...",
        "Loading quantum libraries...",
        "Establishing quantum entanglement channel... Done",
        "Verifying human-auditable threshold... 0.87 (PASS)",
        "Deploying AI model to marsColony node...",
        "Latency compensation: 187ms...",
        "[INFO] Executing AI_Autonomous_Trade contract",
        "[WARNING] Potential quantum decoherence detected in sector 7.",
        "[SUCCESS] Contract deployed. Transaction hash: 0xf7ad23...",
        "[INFO] AI Model initialized with 99.7% verification score",
        "Program completed in 3.42s"
      ]);
      
      toast({
        title: "Execution Note",
        description: "Using fallback execution due to API error. Connect your OpenAI API key for full functionality.",
        variant: "default"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a2e] text-[#f8f9fa]">
      <Header />
      <div className="flex flex-grow h-[calc(100vh-64px)]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-grow flex flex-col">
          {/* Tabs navigation */}
          <div className="bg-[#343a40] flex border-b border-[#6a0dad]/30">
            <div 
              className={`flex items-center border-r border-[#6a0dad]/30 px-4 py-2 ${
                activeTab === "main.singularis" ? "bg-[#1a1a2e] text-[#00b4d8]" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("main.singularis")}
            >
              <span className="flex items-center">
                <i className="ri-code-line mr-1"></i>
                main.singularis
              </span>
              <button className="ml-2 text-gray-400 hover:text-white">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div 
              className={`flex items-center border-r border-[#6a0dad]/30 px-4 py-2 ${
                activeTab === "quantum_ops.singularis" ? "bg-[#1a1a2e] text-[#00b4d8]" : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab("quantum_ops.singularis")}
            >
              <span className="flex items-center">
                <i className="ri-code-line mr-1"></i>
                quantum_ops.singularis
              </span>
              <button className="ml-2 text-gray-400 hover:text-white">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-grow flex">
            <div className="w-3/5 h-full flex flex-col border-r border-[#6a0dad]/30">
              <Editor 
                code={code} 
                onChange={handleCodeChange} 
                onElementSelect={setSelectedElement}
              />
              <Console output={consoleOutput} onRun={handleRun} />
            </div>
            
            <Documentation 
              activePanel={activePanel} 
              setActivePanel={setActivePanel} 
              selectedElement={selectedElement}
            />
          </div>
        </div>
      </div>
      <StatusBar />
    </div>
  );
};

export default Home;
