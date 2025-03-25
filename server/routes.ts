import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { SingularisParser } from "./language/parser";
import { SingularisInterpreter } from "./language/interpreter";
import { 
  simulateQuantumEntanglement, 
  simulateQKD,
  simulateAIOptimizedCircuit,
  createQuantumGeometricSpace,
  simulateQuantumGeometricEmbedding,
  simulateQuantumGeometricTransformation,
  simulateQuantumGeometricEntanglement,
  computeQuantumTopologicalInvariants
} from "./language/quantum";
import { simulateAINegotiation } from "./language/ai";
import {
  processAssistantChat,
  analyzeCode as assistantAnalyzeCode,
  generateCodeSuggestions,
  naturalLanguageToCode,
  explainCode,
  optimizeCode
} from "./language/singularis-assistant";
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
import { sendTemplateEmail, sendCustomEmail, EmailTemplate } from "./email-service";

import { insertFileSchema, insertProjectSchema, User } from "@shared/schema";

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import MemoryStore from "memorystore";
import { initGitHubService } from "./github-service";

const SessionStore = MemoryStore(session);

// Initialize authentication middleware
export function setupAuth(app: Express) {
  // Configure session store
  app.use(session({
    secret: "SINGULARIS_PRIME_SECRET_KEY",
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000 // Prune expired entries every 24h
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return done(null, false, { message: "Invalid username" });
      }
      
      // In a real app, we'd use bcrypt to compare hashed passwords
      if (user.password !== password) {
        return done(null, false, { message: "Invalid password" });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));

  // Configure GitHub strategy for passport
  const githubClientId = process.env.GITHUB_CLIENT_ID;
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackURL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

  if (githubClientId && githubClientSecret) {
    passport.use(new GitHubStrategy({
      clientID: githubClientId,
      clientSecret: githubClientSecret,
      callbackURL: callbackURL,
      scope: ['repo', 'user:email', 'read:user']
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
      try {
        // Try to find user by GitHub ID
        let user = await storage.getUserByUsername(profile.username);
        
        // If user exists, update GitHub tokens
        if (user) {
          user = await storage.updateUserGitHubToken(user.id, {
            githubId: profile.id,
            githubUsername: profile.username,
            githubAccessToken: accessToken,
            githubRefreshToken: refreshToken,
            githubTokenExpiry: refreshToken ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined // 30 days if refresh token exists
          });
        } else {
          // Create new user from GitHub profile
          user = await storage.createUser({
            username: profile.username,
            password: 'github-' + Math.random().toString(36).substring(2, 15), // generate random password
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
            profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            displayName: profile.displayName || profile.username,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
          });
          
          // Update with GitHub token info
          user = await storage.updateUserGitHubToken(user.id, {
            githubId: profile.id,
            githubUsername: profile.username,
            githubAccessToken: accessToken,
            githubRefreshToken: refreshToken,
            githubTokenExpiry: refreshToken ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : undefined
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }));
  } else {
    console.warn('GitHub OAuth credentials not found. GitHub authentication will not be available.');
  }

  // Configure passport serialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const createdAt = new Date().toISOString();
      
      // Create new user with email if provided
      const user = await storage.createUser({ 
        username, 
        password, 
        email,
        emailNotifications: true,
        createdAt, 
        lastActive: createdAt
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Send welcome email if email is provided
      if (email) {
        try {
          await sendTemplateEmail(user, "welcome", {
            recipientEmail: email,
            recipientName: username
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't fail registration if email fails
        }
      }
      
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to register user",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info.message || "Authentication failed" });
      }
      
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err.message });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  // GitHub authentication routes
  app.get("/api/auth/github", passport.authenticate("github", { session: false }));
  
  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { 
      failureRedirect: "/login",
      failureMessage: true
    }),
    (req: Request, res: Response) => {
      // Successful authentication, redirect home.
      res.redirect("/");
    }
  );
  
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = req.user as User;
    
    return res.json({ user: userWithoutPassword });
  });
  
  // User profile routes
  app.put("/api/user/profile", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userId = (req.user as any).id;
      const updates = req.body;
      
      // Filter out properties that shouldn't be updated directly
      const allowedUpdates = [
        'displayName', 'bio', 'avatarColor', 'quantumPersona', 'specializations'
      ];
      
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => 
          allowedUpdates.includes(key)
        )
      );
      
      const updatedUser = await storage.updateUserProfile(userId, filteredUpdates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      // Update the session user
      req.login(updatedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Session update failed" });
        }
        res.status(200).json({ user: userWithoutPassword });
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ 
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
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
  
  // Simulate AI-optimized quantum circuit
  app.post("/api/quantum/circuit/simulate", async (req: Request, res: Response) => {
    const { gates, options } = req.body;
    
    try {
      // The circuit simulation would typically be handled by an actual quantum simulator
      // For now, let's create a realistic mock response based on the circuit structure
      
      // Analyze the circuit to determine basic properties
      const numQubits = Math.max(...gates.map((gate: any) => Math.max(
        ...(gate.targets || []),
        ...(gate.controls || [])
      ))) + 1;
      
      const hasHadamard = gates.some((g: any) => g.gate === 'H');
      const hasCNOT = gates.some((g: any) => g.gate === 'CNOT' || g.gate === 'CZ');
      const hasEntanglement = hasHadamard && hasCNOT;
      
      let probabilities: Record<string, number> = {};
      
      // Generate realistic probability distributions based on circuit characteristics
      if (hasEntanglement && numQubits >= 2) {
        // Bell-like state probabilities
        if (numQubits === 2) {
          probabilities = { '00': 0.5, '11': 0.5 };
        } else if (numQubits === 3) {
          // GHZ-like state
          probabilities = { '000': 0.5, '111': 0.5 };
        } else {
          // Randomly distributed states but with quantum correlation patterns
          const states = Math.min(8, 2 ** numQubits); // Limit to reasonable number of states
          const baseProb = 1 / states;
          
          // Generate correlated state pairs
          for (let i = 0; i < states / 2; i++) {
            const bin = i.toString(2).padStart(numQubits, '0');
            const flipped = bin.split('').map(b => b === '0' ? '1' : '0').join('');
            
            // Add some quantum noise
            const noise = Math.random() * 0.1 - 0.05;
            probabilities[bin] = baseProb + noise;
            probabilities[flipped] = baseProb - noise;
          }
        }
      } else if (hasHadamard) {
        // Uniform superposition
        const states = Math.min(8, 2 ** numQubits);
        for (let i = 0; i < states; i++) {
          const bin = i.toString(2).padStart(numQubits, '0');
          probabilities[bin] = 1 / states;
        }
      } else {
        // Simple state without superposition
        probabilities['0'.repeat(numQubits)] = 1;
      }
      
      // Calculate circuit statistics
      const depth = gates.reduce((max: number, g: any) => Math.max(max, g.position || 0), 0) + 1;
      const entanglementMeasure = hasEntanglement ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
      const complexity = (gates.length / (numQubits * 3)) * 0.8;
      
      // Generate explanation if requested
      let explanation = undefined;
      if (options?.explain) {
        if (hasEntanglement && numQubits === 2) {
          explanation = "This circuit creates a Bell state (|00⟩ + |11⟩)/√2, which demonstrates quantum entanglement between two qubits. Bell states are fundamental to quantum teleportation and superdense coding protocols.";
        } else if (hasEntanglement && numQubits === 3) {
          explanation = "This circuit appears to create a GHZ state (|000⟩ + |111⟩)/√2, which is a maximally entangled state of three qubits. GHZ states are useful for testing quantum nonlocality and are important in quantum error correction.";
        } else if (hasHadamard && numQubits > 0) {
          explanation = `This circuit creates a uniform superposition of ${numQubits} qubits, placing each qubit in an equal probability of being measured as 0 or 1. This is a fundamental building block for many quantum algorithms.`;
        } else {
          explanation = `This ${numQubits}-qubit circuit applies a series of gates including ${gates.map((g: any) => g.gate).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).join(', ')}. The resulting quantum state shows the probability distribution seen in the results.`;
        }
      }
      
      res.status(200).json({
        result: {
          probabilities,
          visualization: "Circuit visualization data",
          statistics: {
            entanglement: entanglementMeasure,
            complexity: complexity,
            depth: depth
          },
          ...(explanation && { explanation })
        }
      });
    } catch (error) {
      console.error("Error simulating quantum circuit:", error);
      res.status(500).json({ error: "Failed to simulate quantum circuit" });
    }
  });
  
  app.post("/api/quantum/circuit/optimize", async (req: Request, res: Response) => {
    try {
      const { gates, numQubits, optimization } = req.body;
      
      if (!gates || !Array.isArray(gates)) {
        return res.status(400).json({ message: "Gates array is required" });
      }
      
      if (!optimization || !optimization.goal) {
        return res.status(400).json({ message: "Optimization goal is required" });
      }
      
      const qubits = numQubits && !isNaN(parseInt(numQubits)) ? parseInt(numQubits) : 2;
      
      const result = simulateAIOptimizedCircuit(gates, qubits, optimization);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to simulate AI-optimized quantum circuit",
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
        
      const analysis = await aiServiceAnalyzeCode(code, level);
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
      
      const analysis = await assistantAnalyzeCode(code);
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

  // Email notification routes
  app.post("/api/email/send-template", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { template, userId } = req.body;
      
      if (!template || typeof template !== "string") {
        return res.status(400).json({ message: "Template name is required" });
      }
      
      // Check if template is valid
      const validTemplates: EmailTemplate[] = ["welcome", "project_created", "quantum_simulation_completed", "ai_negotiation_completed", "system_update"];
      if (!validTemplates.includes(template as EmailTemplate)) {
        return res.status(400).json({ message: "Invalid template name" });
      }
      
      // Determine target user (current user or specified user if admin)
      let targetUser: User | undefined;
      
      if (userId && userId !== (req.user as User).id) {
        // Only admins can send to other users
        // (admin check would be added here in a real app)
        targetUser = await storage.getUser(userId);
        if (!targetUser) {
          return res.status(404).json({ message: "Target user not found" });
        }
      } else {
        targetUser = req.user as User;
      }
      
      // Send the email
      const result = await sendTemplateEmail(
        targetUser,
        template as Exclude<EmailTemplate, "custom">
      );
      
      return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error("Error sending template email:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to send template email",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post("/api/email/send-custom", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { email, name, subject, textContent, htmlContent } = req.body;
      
      if (!email || !subject || !textContent) {
        return res.status(400).json({ message: "Email, subject, and text content are required" });
      }
      
      // Send the email
      const result = await sendCustomEmail(
        email,
        name || email,
        subject,
        textContent,
        htmlContent || textContent,
        (req.user as User).id
      );
      
      return res.status(result.success ? 200 : 500).json(result);
    } catch (error) {
      console.error("Error sending custom email:", error);
      return res.status(500).json({ 
        success: false,
        message: "Failed to send custom email",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.get("/api/email/notification-logs", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const logs = await storage.getNotificationLogs((req.user as User).id);
      return res.json({ logs });
    } catch (error) {
      console.error("Error fetching notification logs:", error);
      return res.status(500).json({ 
        message: "Failed to fetch notification logs",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.put("/api/user/email-preferences", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { email, emailNotifications } = req.body;
      
      // Validate email if provided
      if (email && typeof email === "string") {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
      }
      
      const updates: Partial<User> = {};
      
      if (email !== undefined) {
        updates.email = email;
        updates.emailVerified = false; // Would need verification in a real system
      }
      
      if (emailNotifications !== undefined) {
        updates.emailNotifications = Boolean(emailNotifications);
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUserProfile((req.user as User).id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;
      
      // Update the session user
      req.login(updatedUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Session update failed" });
        }
        res.status(200).json({ user: userWithoutPassword });
      });
    } catch (error) {
      console.error("Error updating email preferences:", error);
      return res.status(500).json({ 
        message: "Failed to update email preferences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Update registration to send welcome email
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create new user
      const user = await storage.createUser({ username, password, email });
      
      // Send welcome email if email is provided
      if (email && typeof email === "string") {
        try {
          await sendTemplateEmail(user, "welcome");
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Continue with user creation even if email fails
        }
      }
      
      // Log in the newly created user
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Auto-login failed:", loginErr);
          // Continue even if auto-login fails
        }
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to register user",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
