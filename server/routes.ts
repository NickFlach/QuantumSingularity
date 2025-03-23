import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { SingularisParser } from "./language/parser";
import { SingularisInterpreter } from "./language/interpreter";
import { 
  simulateQuantumEntanglement, 
  simulateQKD,
  createQuantumGeometricSpace,
  simulateQuantumGeometricEmbedding,
  simulateQuantumGeometricTransformation,
  simulateQuantumGeometricEntanglement,
  computeQuantumTopologicalInvariants
} from "./language/quantum";
import { simulateAINegotiation } from "./language/ai";
import { 
  analyzeCode as aiServiceAnalyzeCode, 
  enhanceAINegotiation, 
  explainQuantumOperation, 
  suggestParadoxResolution,
  generateDocumentation,
  evaluateExplainability,
  suggestCode,
  getAIProviders,
  configureAIProvider,
  setActiveAIProvider
} from "./language/ai-service";
import {
  processAssistantChat,
  analyzeCode as assistantAnalyzeCode,
  generateCodeSuggestions,
  naturalLanguageToCode,
  explainCode,
  optimizeCode
} from "./language/singularis-assistant";
import { insertFileSchema, insertProjectSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for SINGULARIS PRIME language services
  
  // Parse SINGULARIS PRIME code
  app.post("/api/parse", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const parser = new SingularisParser();
      const result = parser.parse(code);
      
      return res.json(result);
    } catch (error) {
      console.error("Parse error:", error);
      return res.status(500).json({ 
        message: "Failed to parse code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Execute SINGULARIS PRIME code - AST based execution
  app.post("/api/execute", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const parser = new SingularisParser();
      const ast = parser.parse(code);
      
      const interpreter = new SingularisInterpreter(ast);
      const result = interpreter.execute();
      
      return res.json({ output: result });
    } catch (error) {
      console.error("Execution error:", error);
      return res.status(500).json({ 
        message: "Failed to execute code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Execute SINGULARIS PRIME code directly with the compiler-based execution
  app.post("/api/execute/direct", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const interpreter = new SingularisInterpreter([]);
      const result = interpreter.executeSource(code);
      
      return res.json({ output: result });
    } catch (error) {
      console.error("Direct execution error:", error);
      return res.status(500).json({ 
        message: "Failed to execute code directly",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Compile SINGULARIS PRIME code to bytecode
  app.post("/api/compile", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const parser = new SingularisParser();
      const bytecode = parser.compile(code);
      
      return res.json({ bytecode });
    } catch (error) {
      console.error("Compilation error:", error);
      return res.status(500).json({ 
        message: "Failed to compile code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Simulate quantum entanglement
  app.post("/api/quantum/entangle", async (req: Request, res: Response) => {
    try {
      const { nodeA, nodeB } = req.body;
      
      if (!nodeA || !nodeB) {
        return res.status(400).json({ message: "Two nodes are required for entanglement" });
      }
      
      const result = simulateQuantumEntanglement(nodeA, nodeB);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to simulate quantum entanglement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Simulate quantum key distribution
  app.post("/api/quantum/qkd", async (req: Request, res: Response) => {
    try {
      const { bits } = req.body;
      const keyBits = bits && !isNaN(parseInt(bits)) ? parseInt(bits) : 256;
      
      const result = simulateQKD(keyBits);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to simulate quantum key distribution",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Simulate AI-to-AI negotiation
  app.post("/api/ai/negotiate", async (req: Request, res: Response) => {
    try {
      const { initiator, responder, terms, explainabilityThreshold } = req.body;
      
      if (!initiator || !responder || !terms) {
        return res.status(400).json({ message: "Initiator, responder, and terms are required" });
      }
      
      const threshold = explainabilityThreshold !== undefined ? 
        parseFloat(explainabilityThreshold) : 0.8;
      
      const result = simulateAINegotiation(initiator, responder, terms, threshold);
      
      // Store the negotiation in the database
      try {
        const now = new Date().toISOString();
        await storage.createAINegotiation({
          projectId: 1, // Default project for prototype
          initiatorId: typeof initiator === 'string' ? initiator : initiator.id,
          responderId: typeof responder === 'string' ? responder : responder.id,
          terms,
          negotiationLog: result.negotiations,
          explainabilityScore: result.explainabilityScore.toString(),
          successful: result.success,
          createdAt: now
        });
      } catch (dbError) {
        console.error("Failed to store AI negotiation:", dbError);
        // Continue with the response even if storage fails
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to simulate AI negotiation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Enhanced AI-to-AI negotiation with OpenAI
  app.post("/api/ai/negotiate/enhanced", async (req: Request, res: Response) => {
    try {
      const { initiator, responder, terms, explainabilityThreshold } = req.body;
      
      if (!initiator || !responder || !terms) {
        return res.status(400).json({ message: "Initiator, responder, and terms are required" });
      }
      
      const threshold = explainabilityThreshold !== undefined ? 
        parseFloat(explainabilityThreshold) : 0.8;
      
      // First run the simulation
      const simulationResult = simulateAINegotiation(initiator, responder, terms, threshold);
      
      // Then enhance with OpenAI
      const aiEnhancement = await enhanceAINegotiation(
        typeof initiator === 'string' ? initiator : initiator.name,
        typeof responder === 'string' ? responder : responder.name,
        simulationResult.contract || terms,
        simulationResult.negotiations
      );
      
      const result = {
        ...simulationResult,
        enhancedTerms: aiEnhancement.enhancedTerms,
        additionalInsights: aiEnhancement.additionalInsights,
        humanOversightRecommendations: aiEnhancement.humanOversightRecommendations
      };
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to enhance AI negotiation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Projects CRUD
  app.post("/api/projects", async (req: Request, res: Response) => {
    try {
      const projectData = insertProjectSchema.parse({
        ...req.body,
        userId: 1, // Default user for prototype
      });
      
      const now = new Date().toISOString();
      const project = await storage.createProject({
        ...projectData,
        createdAt: now,
        updatedAt: now,
      });
      
      return res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      
      return res.status(500).json({ 
        message: "Failed to create project",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getProjects();
      return res.json(projects);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to retrieve projects",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/projects/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      return res.json(project);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to retrieve project",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Files CRUD
  app.post("/api/files", async (req: Request, res: Response) => {
    try {
      const fileData = insertFileSchema.parse(req.body);
      
      const now = new Date().toISOString();
      const file = await storage.createFile({
        ...fileData,
        createdAt: now,
        updatedAt: now,
      });
      
      return res.status(201).json(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid file data", errors: error.errors });
      }
      
      return res.status(500).json({ 
        message: "Failed to create file",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/projects/:projectId/files", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      
      const files = await storage.getFilesByProject(projectId);
      return res.json(files);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to retrieve files",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.put("/api/files/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid file ID" });
      }
      
      const { content } = req.body;
      if (content === undefined) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const file = await storage.updateFile(id, {
        content,
        updatedAt: new Date().toISOString(),
      });
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      return res.json(file);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to update file",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // OpenAI-powered endpoints
  
  // Code analysis
  app.post("/api/analyze", async (req: Request, res: Response) => {
    try {
      const { code, detailLevel } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const level = detailLevel === "basic" || detailLevel === "comprehensive" 
        ? detailLevel 
        : "moderate";
        
      const analysis = await analyzeCode(code, level);
      return res.json({ analysis });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to analyze code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Self-documentation
  app.post("/api/documentation", async (req: Request, res: Response) => {
    try {
      const { code, detailLevel } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const level = detailLevel === "basic" || detailLevel === "comprehensive" 
        ? detailLevel 
        : "moderate";
        
      const documentation = await generateDocumentation(code, level);
      return res.json({ documentation });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to generate documentation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Quantum explanation
  app.post("/api/quantum/explain", async (req: Request, res: Response) => {
    try {
      const { operationType, parameters, results } = req.body;
      
      if (!operationType) {
        return res.status(400).json({ message: "Operation type is required" });
      }
      
      const explanation = await explainQuantumOperation(
        operationType,
        parameters || {},
        results || {}
      );
      
      return res.json({ explanation });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to explain quantum operation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Paradox resolution suggestion
  app.post("/api/quantum/paradox", async (req: Request, res: Response) => {
    try {
      const { paradoxDescription, currentApproach } = req.body;
      
      if (!paradoxDescription) {
        return res.status(400).json({ message: "Paradox description is required" });
      }
      
      const resolution = await suggestParadoxResolution(
        paradoxDescription,
        currentApproach || "No current approach specified"
      );
      
      return res.json(resolution);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to suggest paradox resolution",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Explainability evaluation
  app.post("/api/evaluate/explainability", async (req: Request, res: Response) => {
    try {
      const { code, threshold } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const explainabilityThreshold = threshold !== undefined ? 
        parseFloat(threshold) : 0.8;
        
      const evaluation = await evaluateExplainability(code, explainabilityThreshold);
      return res.json(evaluation);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to evaluate explainability",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Code suggestions
  app.post("/api/suggest", async (req: Request, res: Response) => {
    try {
      const { description, existingCode } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      const suggestion = await suggestCode(description, existingCode || "");
      return res.json({ suggestion });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to generate code suggestion",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // AI Provider management
  
  // Get available AI providers
  app.get("/api/ai/providers", async (req: Request, res: Response) => {
    try {
      const providers = await getAIProviders();
      return res.json(providers);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to get AI providers",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Configure an AI provider
  app.post("/api/ai/providers/:id/configure", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const config = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Provider ID is required" });
      }
      
      const success = configureAIProvider(id, config);
      
      if (success) {
        return res.json({ success, message: `Provider ${id} configured successfully` });
      } else {
        return res.status(500).json({ success, message: `Failed to configure provider ${id}` });
      }
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to configure AI provider",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Set active AI provider
  app.post("/api/ai/providers/active", async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ message: "Provider ID is required" });
      }
      
      const success = setActiveAIProvider(id);
      
      if (success) {
        return res.json({ success, message: `Provider ${id} set as active` });
      } else {
        return res.status(500).json({ success, message: `Failed to set provider ${id} as active` });
      }
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to set active AI provider",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Quantum Geometry operations
  
  // Create a quantum geometric space
  app.post("/api/quantum/geometry/create-space", async (req: Request, res: Response) => {
    try {
      const { spaceId, dimension, elements } = req.body;
      
      if (!spaceId || !dimension || !elements || !Array.isArray(elements)) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: spaceId (string), dimension (number), elements (array)" 
        });
      }
      
      const space = createQuantumGeometricSpace(spaceId, dimension, elements);
      const spaceCreationResult = space.createSpace();
      
      return res.json({
        space: {
          id: space.spaceId,
          dimension: space.dimension,
          elements: space.elements,
          metric: space.metric,
          topologicalProperties: space.topologicalProperties,
          energyDensity: space.energyDensity
        },
        creationResult: spaceCreationResult
      });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to create quantum geometric space",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Embed quantum states in a geometric space
  app.post("/api/quantum/geometry/embed-states", async (req: Request, res: Response) => {
    try {
      const { spaceId, dimension, elements, stateIds, coordinateSets } = req.body;
      
      if (!spaceId || !dimension || !elements || !Array.isArray(elements) || 
          !stateIds || !coordinateSets || !Array.isArray(stateIds) || !Array.isArray(coordinateSets)) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: spaceId, dimension, elements, stateIds (array), coordinateSets (array of arrays)" 
        });
      }
      
      const space = createQuantumGeometricSpace(spaceId, dimension, elements);
      const result = simulateQuantumGeometricEmbedding(space, stateIds, coordinateSets);
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to embed quantum states in geometric space",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Perform geometric transformations on quantum states
  app.post("/api/quantum/geometry/transform", async (req: Request, res: Response) => {
    try {
      const { spaceId, dimension, elements, transformationType, parameters } = req.body;
      
      if (!spaceId || !dimension || !elements || !transformationType || !parameters) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: spaceId, dimension, elements, transformationType, parameters" 
        });
      }
      
      const space = createQuantumGeometricSpace(spaceId, dimension, elements);
      const result = simulateQuantumGeometricTransformation(space, transformationType, parameters);
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to perform quantum geometric transformation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Simulate entanglement in geometric space
  app.post("/api/quantum/geometry/entangle", async (req: Request, res: Response) => {
    try {
      const { spaceId, dimension, elements, stateA, stateB, distance } = req.body;
      
      if (!spaceId || !dimension || !elements || !stateA || !stateB || distance === undefined) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: spaceId, dimension, elements, stateA, stateB, distance" 
        });
      }
      
      const space = createQuantumGeometricSpace(spaceId, dimension, elements);
      const result = simulateQuantumGeometricEntanglement(space, stateA, stateB, distance);
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to simulate geometric entanglement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Compute topological invariants
  app.post("/api/quantum/geometry/invariants", async (req: Request, res: Response) => {
    try {
      const { spaceId, dimension, elements, metric, topologicalProperties, energyDensity } = req.body;
      
      if (!spaceId || !dimension || !elements) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: spaceId, dimension, elements" 
        });
      }
      
      const space = createQuantumGeometricSpace(spaceId, dimension, elements);
      
      // Optionally update space properties if provided
      if (metric) space.metric = metric;
      if (topologicalProperties) space.topologicalProperties = topologicalProperties;
      if (energyDensity !== undefined) space.energyDensity = energyDensity;
      
      const result = computeQuantumTopologicalInvariants(space);
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to compute topological invariants",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // SINGULARIS PRIME Code Assistant API routes
  
  // Chat with the code assistant
  app.post("/api/ai/assistant/chat", async (req: Request, res: Response) => {
    try {
      const { prompt, context, history } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      
      const response = await processAssistantChat(
        prompt,
        context || "",
        history || []
      );
      
      return res.json({ response });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to process assistant chat",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Analyze code with assistant
  app.post("/api/ai/assistant/analyze", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const analysis = await analyzeCode(code);
      return res.json({ analysis });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to analyze code with assistant",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Generate code suggestions
  app.post("/api/ai/assistant/suggest", async (req: Request, res: Response) => {
    try {
      const { context } = req.body;
      
      const suggestions = await generateCodeSuggestions(context || "");
      return res.json({ suggestions });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to generate code suggestions",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Generate code from natural language
  app.post("/api/ai/assistant/generate", async (req: Request, res: Response) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      const code = await naturalLanguageToCode(description);
      return res.json({ code });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to generate code from description",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Explain code
  app.post("/api/ai/assistant/explain", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const explanation = await explainCode(code);
      return res.json({ explanation });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to explain code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Optimize code
  app.post("/api/ai/assistant/optimize", async (req: Request, res: Response) => {
    try {
      const { code, focus } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "Code is required" });
      }
      
      const optimizedCode = await optimizeCode(
        code, 
        focus === 'security' || focus === 'explainability' ? focus : 'performance'
      );
      
      return res.json({ optimizedCode });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to optimize code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
