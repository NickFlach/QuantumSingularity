import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { SingularisParser } from "./language/parser";
import { SingularisInterpreter } from "./language/interpreter";
import { simulateQuantumEntanglement, simulateQKD } from "./language/quantum";
import { simulateAINegotiation } from "./language/ai";
import { 
  analyzeCode, 
  enhanceAINegotiation, 
  explainQuantumOperation, 
  suggestParadoxResolution,
  generateDocumentation,
  evaluateExplainability,
  suggestCode
} from "./language/openai";
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
  
  // Execute SINGULARIS PRIME code
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
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to simulate AI negotiation",
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

  const httpServer = createServer(app);
  return httpServer;
}
