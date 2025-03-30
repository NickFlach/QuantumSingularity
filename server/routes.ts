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
import {
  simulateQuantumMagnetism,
  analyzeQuantumPhases,
  generateHamiltonian,
  LatticeType,
  InteractionType
} from "./language/quantum-magnetism";

import {
  generateInitialState,
  transformState,
  generateEntangledState,
  measureQuantumState,
  TransformationType,
  EntanglementType
} from "./language/high-dimensional-quantum";
import { simulateAINegotiation } from "./language/ai";
import {
  createQuantumState,
  createEntangledState,
  createMagneticHamiltonian,
  runUnifiedSimulation,
  measureQudit,
  transformQudit,
  analyzeQuantumPhaseTransitions,
  calculateEntanglementMagnetismCorrelation,
  generateSingularisPrimeCode,
  ErrorMitigationType
} from './language/singularis-prime-unified';
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

import { 
  insertFileSchema, 
  insertProjectSchema, 
  User, 
  insertSheafModuleSchema,
  insertDModuleSchema,
  insertFunctorialTransformSchema,
  insertCrystalStateSchema,
  insertQuditSchema,
  insertHamiltonianSchema,
  insertMagnetismSimulationSchema,
  SheafModuleType,
  QuantumDimension,
  HamiltonianType
} from "@shared/schema";

import {
  createSheafModule,
  createDModule,
  createFunctorialTransform,
  createCrystalState,
  analyzeSingularities
} from "./language/kashiwara";

import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import MemoryStore from "memorystore";
import { 
  initGitHubService,
  getUserRepositories,
  getRepositoryContents,
  getFileContent,
  setupRepositoryWebhook,
  findSingularisFiles,
  analyzeRepository
} from "./github-service";

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
  
  // GitHub Repository Integration Routes
  
  // Get user's GitHub repositories
  app.get("/api/github/repositories", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      // Check if GitHub is initialized
      if (!initGitHubService()) {
        return res.status(503).json({ 
          message: "GitHub service is not available. Please configure GitHub OAuth credentials."
        });
      }
      
      const repositories = await getUserRepositories(req);
      
      return res.json(repositories);
    } catch (error) {
      console.error("Error retrieving GitHub repositories:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve GitHub repositories",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get repository contents
  app.get("/api/github/repositories/:owner/:repo/contents", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { owner, repo } = req.params;
      const path = req.query.path as string || "";
      
      if (!owner || !repo) {
        return res.status(400).json({ message: "Repository owner and name are required" });
      }
      
      // Check if GitHub is initialized
      if (!initGitHubService()) {
        return res.status(503).json({ 
          message: "GitHub service is not available. Please configure GitHub OAuth credentials."
        });
      }
      
      const contents = await getRepositoryContents(req, owner, repo, path);
      
      return res.json(contents);
    } catch (error) {
      console.error("Error retrieving repository contents:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve repository contents",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get file content
  app.get("/api/github/repositories/:owner/:repo/content/:path(*)", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { owner, repo, path } = req.params;
      
      if (!owner || !repo || !path) {
        return res.status(400).json({ message: "Repository owner, name, and file path are required" });
      }
      
      // Check if GitHub is initialized
      if (!initGitHubService()) {
        return res.status(503).json({ 
          message: "GitHub service is not available. Please configure GitHub OAuth credentials."
        });
      }
      
      const content = await getFileContent(req, owner, repo, path);
      
      return res.json(content);
    } catch (error) {
      console.error("Error retrieving file content:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve file content",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Find SINGULARIS PRIME code files in repository
  app.get("/api/github/repositories/:owner/:repo/singularis-files", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { owner, repo } = req.params;
      
      if (!owner || !repo) {
        return res.status(400).json({ message: "Repository owner and name are required" });
      }
      
      // Check if GitHub is initialized
      if (!initGitHubService()) {
        return res.status(503).json({ 
          message: "GitHub service is not available. Please configure GitHub OAuth credentials."
        });
      }
      
      const files = await findSingularisFiles(req, owner, repo);
      
      return res.json(files);
    } catch (error) {
      console.error("Error finding SINGULARIS PRIME files:", error);
      return res.status(500).json({ 
        message: "Failed to find SINGULARIS PRIME files",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Analyze repository for CI/CD
  app.post("/api/github/repositories/:owner/:repo/analyze", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { owner, repo } = req.params;
      
      if (!owner || !repo) {
        return res.status(400).json({ message: "Repository owner and name are required" });
      }
      
      // Check if GitHub is initialized
      if (!initGitHubService()) {
        return res.status(503).json({ 
          message: "GitHub service is not available. Please configure GitHub OAuth credentials."
        });
      }
      
      const analysis = await analyzeRepository(req, owner, repo);
      
      // Store the analysis results in the database
      const user = req.user as User;
      const now = new Date().toISOString();
      
      // First, find or create the GitHub repository record
      let repository = await storage.getGitHubRepositories(user.id)
        .then(repos => repos.find(r => r.fullName === `${owner}/${repo}`));
      
      if (!repository) {
        // Get basic repository information first
        const repos = await getUserRepositories(req);
        const repoInfo = repos.find(r => r.full_name === `${owner}/${repo}`);
        
        if (!repoInfo) {
          return res.status(404).json({ message: "Repository not found in user's GitHub account" });
        }
        
        repository = await storage.createGitHubRepository({
          userId: user.id,
          githubId: repoInfo.id,
          name: repoInfo.name,
          fullName: repoInfo.full_name,
          description: repoInfo.description || "",
          htmlUrl: repoInfo.html_url,
          defaultBranch: repoInfo.default_branch,
          ownerLogin: repoInfo.owner.login,
          ownerAvatarUrl: repoInfo.owner.avatar_url,
          createdAt: now,
          connectedAt: new Date()
        });
      }
      
      // Then, store the CI/CD analysis
      // Store explainability factors as JSON
      const explainabilityFactors = JSON.stringify(analysis.explainability.factors || []);
      
      const cicdAnalysis = await storage.createCICDAnalysis({
        repositoryId: repository.id,
        branch: repository.defaultBranch,
        commitSha: "HEAD", // We should ideally get the actual commit SHA
        status: "completed",
        explainabilityScore: analysis.explainability.score.toString(),
        explainabilityFactors,
        securityScore: analysis.security.score.toString(),
        securityVulnerabilities: analysis.security.vulnerabilities,
        governanceScore: analysis.governance.score.toString(),
        governanceCompliant: analysis.governance.compliant
      });
      
      return res.json({
        analysis,
        cicdAnalysis
      });
    } catch (error) {
      console.error("Error analyzing repository:", error);
      return res.status(500).json({ 
        message: "Failed to analyze repository",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Setup webhook for repository
  app.post("/api/github/repositories/:owner/:repo/webhook", async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { owner, repo } = req.params;
      
      if (!owner || !repo) {
        return res.status(400).json({ message: "Repository owner and name are required" });
      }
      
      // Check if GitHub is initialized
      if (!initGitHubService()) {
        return res.status(503).json({ 
          message: "GitHub service is not available. Please configure GitHub OAuth credentials."
        });
      }
      
      // Create webhook URL for this repository
      const webhookUrl = `${req.protocol}://${req.get('host')}/api/github/webhook/${owner}/${repo}`;
      const webhook = await setupRepositoryWebhook(req, owner, repo, webhookUrl);
      
      return res.json({ success: webhook });
    } catch (error) {
      console.error("Error setting up webhook:", error);
      return res.status(500).json({ 
        message: "Failed to set up webhook",
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
  
  // GitHub Settings endpoints
  
  // Save GitHub settings
  app.post("/api/settings/github", async (req: Request, res: Response) => {
    try {
      const { clientId, clientSecret, callbackUrl } = req.body;
      
      if (!clientId || !clientSecret || !callbackUrl) {
        return res.status(400).json({ message: "Client ID, Client Secret, and Callback URL are required" });
      }
      
      // In a production app, we would store these securely in a database
      // For this demo, we'll use environment variables
      
      // Set the environment variables for the current session
      process.env.GITHUB_CLIENT_ID = clientId;
      process.env.GITHUB_CLIENT_SECRET = clientSecret;
      process.env.GITHUB_CALLBACK_URL = callbackUrl;
      
      // Re-initialize the GitHub service
      const initialized = initGitHubService();
      
      return res.json({ 
        success: initialized,
        message: initialized
          ? "GitHub integration configured successfully"
          : "GitHub configuration saved but service initialization failed"
      });
    } catch (error) {
      console.error("Failed to save GitHub settings:", error);
      return res.status(500).json({ 
        message: "Failed to save GitHub settings",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Check GitHub configuration status
  app.get("/api/settings/github/status", async (req: Request, res: Response) => {
    try {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;
      const callbackUrl = process.env.GITHUB_CALLBACK_URL;
      
      const configured = !!(clientId && clientSecret && callbackUrl);
      
      return res.json({
        configured,
        callbackUrl: configured ? callbackUrl : null
      });
    } catch (error) {
      console.error("Failed to check GitHub settings:", error);
      return res.status(500).json({ 
        message: "Failed to check GitHub settings",
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

  // High-dimensional quantum state routes (qudits)
  
  // Create a high-dimensional qudit with specified dimension
  app.post("/api/quantum/qudits", async (req: Request, res: Response) => {
    try {
      const { projectId, name, dimension, initialState } = req.body;
      
      if (!projectId || !name || !dimension) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: projectId, name, dimension" 
        });
      }
      
      // Validate dimension is a valid enum value or number
      let validDimension: number;
      if (typeof dimension === 'string' && dimension in QuantumDimension) {
        validDimension = QuantumDimension[dimension as keyof typeof QuantumDimension];
      } else if (typeof dimension === 'number' && dimension >= 2) {
        validDimension = dimension;
      } else {
        return res.status(400).json({
          message: "Invalid dimension value. Must be a valid QuantumDimension enum or number >= 2."
        });
      }
      
      // Create qudit state vector (basis state |0⟩ or custom initialState)
      const stateVector = initialState || Array(validDimension).fill({ real: 0, imag: 0 }).map((_, i) => 
        i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
      );
      
      // Get current timestamp
      const now = new Date().toISOString();
      
      // Create qudit in database
      const qudit = await storage.createQudit({
        projectId,
        name,
        dimension: validDimension,
        stateVector,
        isEntangled: false,
        createdAt: now,
        updatedAt: now
      });
      
      return res.status(201).json({
        message: `Created ${validDimension}-dimensional quantum state '${name}'`,
        qudit
      });
    } catch (error) {
      console.error("Error creating high-dimensional qudit:", error);
      return res.status(500).json({ 
        message: "Failed to create high-dimensional quantum state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get all qudits for a project
  app.get("/api/quantum/qudits", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      const qudits = await storage.getQudits(projectId);
      
      return res.json({ qudits });
    } catch (error) {
      console.error("Error fetching qudits:", error);
      return res.status(500).json({ 
        message: "Failed to fetch quantum states",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create equal superposition of a qudit
  app.post("/api/quantum/qudits/:id/superposition", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Get the qudit from database
      const qudit = await storage.getQudit(id);
        
      if (!qudit) {
        return res.status(404).json({ message: "Quantum state not found" });
      }
      
      // Calculate equal superposition
      const amplitude = 1 / Math.sqrt(qudit.dimension);
      const superpositionState = Array(qudit.dimension).fill({ real: amplitude, imag: 0 });
      
      // Update the qudit state in database
      const updatedQudit = await storage.updateQudit(id, { 
        stateVector: superpositionState,
        updatedAt: new Date().toISOString()
      });
      
      return res.json({
        message: `Created equal superposition of ${qudit.dimension}-dimensional state '${qudit.name}'`,
        qudit: updatedQudit
      });
    } catch (error) {
      console.error("Error creating superposition:", error);
      return res.status(500).json({ 
        message: "Failed to create superposition state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Entangle multiple qudits
  app.post("/api/quantum/qudits/entangle", async (req: Request, res: Response) => {
    try {
      const { quditIds, entanglementType = "HIGH_DIM_GHZ" } = req.body;
      
      if (!quditIds || !Array.isArray(quditIds) || quditIds.length < 2) {
        return res.status(400).json({ 
          message: "At least two qudit IDs are required for entanglement" 
        });
      }
      
      // Get all qudits from database
      const qudits = await Promise.all(
        quditIds.map(id => storage.getQudit(Number(id)))
      );
      
      const validQudits = qudits.filter(q => q !== null);
      
      if (validQudits.length !== quditIds.length) {
        return res.status(404).json({ 
          message: "One or more quantum states not found" 
        });
      }
      
      // Check that all qudits have the same dimension
      const dimensions = new Set(validQudits.map(q => q!.dimension));
      if (dimensions.size !== 1) {
        return res.status(400).json({ 
          message: "All quantum states must have the same dimension for entanglement" 
        });
      }
      
      // Update all qudits as entangled with each other
      const updatedQudits = await Promise.all(
        validQudits.map(qudit => 
          storage.updateQudit(qudit!.id, { 
            isEntangled: true,
            entangledWith: quditIds.filter(id => Number(id) !== qudit!.id),
            updatedAt: new Date().toISOString()
          })
        )
      );
      
      return res.json({
        message: `Created ${entanglementType} entangled state with ${validQudits.length} ${validQudits[0]!.dimension}-dimensional quantum states`,
        qudits: updatedQudits
      });
    } catch (error) {
      console.error("Error entangling qudits:", error);
      return res.status(500).json({ 
        message: "Failed to create entangled state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Measure a qudit
  app.post("/api/quantum/qudits/:id/measure", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      
      // Get the qudit from database
      const qudit = await storage.getQudit(id);
        
      if (!qudit) {
        return res.status(404).json({ message: "Quantum state not found" });
      }
      
      // Simulate a measurement outcome
      const result = Math.floor(Math.random() * qudit.dimension);
      
      // Create collapsed state - all zeros except the measured basis state
      const collapsedState = Array(qudit.dimension).fill({ real: 0, imag: 0 });
      collapsedState[result] = { real: 1, imag: 0 };
      
      // If qudit was entangled, collect IDs of all entangled qudits
      let entangledQuditIds: number[] = [];
      if (qudit.isEntangled && qudit.entangledWith) {
        entangledQuditIds = qudit.entangledWith as number[];
      }
      
      // Update the qudit state in database
      const updatedQudit = await storage.updateQudit(id, { 
        stateVector: collapsedState,
        isEntangled: false,
        entangledWith: null,
        updatedAt: new Date().toISOString()
      });
      
      // If qudit was entangled, collapse all entangled qudits consistently
      if (entangledQuditIds.length > 0) {
        await Promise.all(
          entangledQuditIds.map(async (entangledId) => {
            const entangledQudit = await storage.getQudit(entangledId);
            
            if (entangledQudit) {
              // Create collapsed state for the entangled qudit
              // In a real quantum system with GHZ state, the outcomes would be correlated
              const entangledCollapsedState = Array(entangledQudit.dimension).fill({ real: 0, imag: 0 });
              entangledCollapsedState[result] = { real: 1, imag: 0 };
              
              // Update the entangled qudit
              await storage.updateQudit(entangledId, { 
                stateVector: entangledCollapsedState,
                isEntangled: false,
                entangledWith: null,
                updatedAt: new Date().toISOString()
              });
            }
          })
        );
      }
      
      return res.json({
        message: `Measured ${qudit.dimension}-dimensional state '${qudit.name}', got result: ${result}`,
        result,
        qudit: updatedQudit
      });
    } catch (error) {
      console.error("Error measuring qudit:", error);
      return res.status(500).json({ 
        message: "Failed to measure quantum state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Quantum Magnetism Routes
  
  // Create a quantum Hamiltonian
  app.post("/api/quantum/hamiltonians", async (req: Request, res: Response) => {
    try {
      const { projectId, name, type, systemSize, dimension, terms, description } = req.body;
      
      if (!projectId || !name || !type || !systemSize || !terms) {
        return res.status(400).json({ 
          message: "Required parameters: projectId, name, type, systemSize, terms" 
        });
      }
      
      // Validate type is a valid HamiltonianType
      if (!(type in HamiltonianType)) {
        return res.status(400).json({
          message: "Invalid Hamiltonian type. Must be one of the HamiltonianType enum values."
        });
      }
      
      // Get current timestamp
      const now = new Date().toISOString();
      
      // Create Hamiltonian in database
      const hamiltonian = await storage.createHamiltonian({
        projectId,
        name,
        type,
        systemSize,
        dimension: dimension || 2, // Default to qubits (dimension 2)
        terms,
        description,
        createdAt: now,
        updatedAt: now
      });
      
      return res.status(201).json({
        message: `Created ${type} Hamiltonian '${name}' with ${systemSize} ${dimension || 2}-dimensional sites`,
        hamiltonian
      });
    } catch (error) {
      console.error("Error creating Hamiltonian:", error);
      return res.status(500).json({ 
        message: "Failed to create quantum Hamiltonian",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get all Hamiltonians for a project
  app.get("/api/quantum/hamiltonians", async (req: Request, res: Response) => {
    try {
      const projectId = req.query.projectId ? Number(req.query.projectId) : undefined;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      const hamiltonians = await storage.getHamiltonians(projectId);
      
      return res.json({ hamiltonians });
    } catch (error) {
      console.error("Error fetching Hamiltonians:", error);
      return res.status(500).json({ 
        message: "Failed to fetch quantum Hamiltonians",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Run a quantum magnetism simulation
  app.post("/api/quantum/magnetism/simulate", async (req: Request, res: Response) => {
    try {
      const { projectId, hamiltonianId, parameters, errorMitigation } = req.body;
      
      if (!projectId || !hamiltonianId || !parameters) {
        return res.status(400).json({ 
          message: "Required parameters: projectId, hamiltonianId, parameters" 
        });
      }
      
      // Get the Hamiltonian
      const hamiltonian = await storage.getHamiltonian(Number(hamiltonianId));
      
      if (!hamiltonian) {
        return res.status(404).json({ message: "Hamiltonian not found" });
      }
      
      // Set up simulation options
      const options = {
        time: parameters.time || 10,
        timeStep: parameters.timeStep || 0.1,
        evolutionMethod: parameters.evolutionMethod || "trotter",
        errorMitigation: errorMitigation || "none",
        errorMitigationStrength: parameters.errorMitigationStrength || 0.5,
        observables: parameters.observables || ["magnetization", "correlation"],
        shots: parameters.shots || 1000,
        includeEntanglementMetrics: parameters.includeEntanglementMetrics || true
      };
      
      // Run the simulation - in a real app, this would run on a quantum simulator or device
      const simulationResults = simulateQuantumMagnetism({
        hamiltonianId: Number(hamiltonianId),
        duration: options.time,
        timeSteps: Math.ceil(options.time / options.timeStep),
        errorMitigation: options.errorMitigation
      });
      
      // Get current timestamp
      const dateNow = new Date();
      const now = dateNow.toISOString();
      
      // Create simulation record in database
      const simulation = await storage.createMagnetismSimulation({
        projectId,
        hamiltonianId: Number(hamiltonianId),
        parameters: options,
        results: simulationResults.results,
        errorMitigation: options.errorMitigation,
        createdAt: now,
        completedAt: dateNow
      });
      
      return res.status(201).json({
        message: `Completed quantum magnetism simulation for Hamiltonian '${hamiltonian.name}'`,
        simulation: {
          ...simulation,
          simulationResults
        }
      });
    } catch (error) {
      console.error("Error simulating quantum magnetism:", error);
      return res.status(500).json({ 
        message: "Failed to run quantum magnetism simulation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Analyze phases in a quantum magnetic system
  app.post("/api/quantum/magnetism/phases", async (req: Request, res: Response) => {
    try {
      const { hamiltonianId, paramRange, paramName } = req.body;
      
      if (!hamiltonianId || !paramRange) {
        return res.status(400).json({ 
          message: "Required parameters: hamiltonianId, paramRange" 
        });
      }
      
      // Get the Hamiltonian
      const hamiltonian = await storage.getHamiltonian(Number(hamiltonianId));
      
      if (!hamiltonian) {
        return res.status(404).json({ message: "Hamiltonian not found" });
      }
      
      // Validate paramRange
      if (!paramRange.start || !paramRange.end || !paramRange.steps) {
        return res.status(400).json({ 
          message: "paramRange must include start, end, and steps" 
        });
      }
      
      // Run the phase analysis
      const phaseAnalysis = analyzeQuantumPhases({
        hamiltonianId: Number(hamiltonianId),
        paramRange,
        paramName: (paramName as 'temperature' | 'fieldStrength' | 'anisotropy') || 'temperature'
      });
      
      return res.json({
        message: `Analyzed quantum phases for Hamiltonian '${hamiltonian.name}'`,
        hamiltonian: hamiltonian,
        phaseAnalysis
      });
    } catch (error) {
      console.error("Error analyzing quantum phases:", error);
      return res.status(500).json({ 
        message: "Failed to analyze quantum phases",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Kashiwara Genesis API routes
  
  // Create a sheaf module
  app.post("/api/kashiwara/sheaf-module", async (req: Request, res: Response) => {
    try {
      const { name, type, topology, sections, gluingConditions, projectId } = req.body;
      
      if (!name || !type || !topology) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: name (string), type (SheafModuleType), topology (object)" 
        });
      }
      
      // Use Kashiwara Genesis implementation to create sheaf module
      const definition = {
        type,
        definition: topology,
        localSection: sections || [],
        gluingConditions: gluingConditions || []
      };
      
      const result = createSheafModule(name, definition);
      
      // Store in database if user is authenticated
      if (req.isAuthenticated() && req.user) {
        try {
          const now = new Date().toISOString();
          const sheafData = {
            projectId: projectId || null,
            name,
            type,
            definition: topology,
            localSection: sections || [],
            globalSection: result.module?.globalSection || null,
            gluingConditions: gluingConditions || null,
            createdAt: now,
            updatedAt: now
          };
          
          await storage.createSheafModule(sheafData);
        } catch (dbError) {
          console.error("Failed to store sheaf module:", dbError);
          // Continue even if database storage fails
        }
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to create sheaf module",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a D-module (differential module)
  app.post("/api/kashiwara/d-module", async (req: Request, res: Response) => {
    try {
      const { name, baseManifold, differentialOperators, coordinates, initialConditions, projectId } = req.body;
      
      if (!name || !baseManifold || !differentialOperators || !coordinates) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: name (string), baseManifold (string), differentialOperators (array), coordinates (array)" 
        });
      }
      
      // Use Kashiwara Genesis implementation to create D-module
      const definition = {
        baseManifold,
        differentialOperators,
        coordinates,
        initialConditions
      };
      
      const result = createDModule(name, definition);
      
      // Store in database if user is authenticated
      if (req.isAuthenticated() && req.user) {
        try {
          const now = new Date().toISOString();
          const dModuleData = {
            projectId: projectId || null,
            name,
            baseManifold,
            differentialOperators,
            solutions: result.module?.solutions || null,
            singularities: result.module?.singularities || null,
            holonomicity: result.module?.holonomic || null,
            createdAt: now,
            updatedAt: now
          };
          
          await storage.createDModule(dModuleData);
        } catch (dbError) {
          console.error("Failed to store D-module:", dbError);
          // Continue even if database storage fails
        }
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to create D-module",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a functorial transform
  app.post("/api/kashiwara/functorial-transform", async (req: Request, res: Response) => {
    try {
      const { name, sourceCategory, targetCategory, objectMapping, morphismMapping, preservedProperties, projectId } = req.body;
      
      if (!name || !sourceCategory || !targetCategory || !objectMapping) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: name (string), sourceCategory (string), targetCategory (string), objectMapping (array)" 
        });
      }
      
      // Use Kashiwara Genesis implementation to create functorial transform
      const transformDefinition = {
        sourceCategory,
        targetCategory,
        objectMapping,
        morphismMapping: morphismMapping || [],
        preservedProperties
      };
      
      const result = createFunctorialTransform(name, transformDefinition);
      
      // Store in database if user is authenticated
      if (req.isAuthenticated() && req.user) {
        try {
          const now = new Date().toISOString();
          const transformData = {
            projectId: projectId || null,
            name,
            sourceCategory,
            targetCategory,
            transformDefinition,
            preservedProperties: result.transform?.preservedProperties || null,
            adjunctions: result.transform?.adjunctions || null,
            createdAt: now,
            updatedAt: now
          };
          
          await storage.createFunctorialTransform(transformData);
        } catch (dbError) {
          console.error("Failed to store functorial transform:", dbError);
          // Continue even if database storage fails
        }
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to create functorial transform",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a crystal state
  app.post("/api/kashiwara/crystal-state", async (req: Request, res: Response) => {
    try {
      const { name, baseSpace, latticeStructure, weightSystem, operators, projectId } = req.body;
      
      if (!name || !baseSpace || !latticeStructure) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: name (string), baseSpace (string), latticeStructure (object)" 
        });
      }
      
      // Use Kashiwara Genesis implementation to create crystal state
      const definition = {
        baseSpace,
        latticeStructure,
        weightSystem,
        operators
      };
      
      const result = createCrystalState(name, definition);
      
      // Store in database if user is authenticated
      if (req.isAuthenticated() && req.user) {
        try {
          const now = new Date().toISOString();
          const crystalData = {
            projectId: projectId || null,
            name,
            baseSpace,
            latticeStructure,
            weightSystem: weightSystem || null,
            crystalOperators: operators || null,
            connections: result.crystal?.connections || null,
            createdAt: now,
            updatedAt: now
          };
          
          await storage.createCrystalState(crystalData);
        } catch (dbError) {
          console.error("Failed to store crystal state:", dbError);
          // Continue even if database storage fails
        }
      }
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to create crystal state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Analyze singularities in mathematical system
  app.post("/api/kashiwara/analyze-singularities", async (req: Request, res: Response) => {
    try {
      const { code, type } = req.body;
      
      if (!code || !type) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: code (string), type (string)" 
        });
      }
      
      // Validate singularity analysis type
      const validTypes = ['differential_equation', 'algebraic_variety', 'discrete_system'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: `Invalid type: ${type}. Must be one of: ${validTypes.join(', ')}`
        });
      }
      
      // Use Kashiwara Genesis implementation to analyze singularities
      const result = analyzeSingularities(code, type as any);
      
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to analyze singularities",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Integrated Kashiwara Genesis endpoint
  app.post("/api/kashiwara/integrated", async (req: Request, res: Response) => {
    try {
      const { components, integration } = req.body;
      
      if (!components || !Array.isArray(components) || components.length === 0) {
        return res.status(400).json({ 
          message: "Invalid request, required parameters: components (array of string)" 
        });
      }
      
      // Create mock response for integrated Kashiwara Genesis components
      const response: any = {
        id: `integrated-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: "success",
        integration: integration || "full",
        components: {}
      };
      
      // Add sheaf component if requested
      if (components.includes('sheaf')) {
        const sheafDef = {
          type: SheafModuleType.D_MODULE, // Using D_MODULE from SheafModuleType enum
          definition: {
            openSets: ["U1", "U2", "U3"],
            relations: [
              { base: "U1", target: "U2" },
              { base: "U2", target: "U3" },
              { base: "U1", target: "U3" }
            ]
          },
          localSection: [
            { domain: "U1", data: { stateVector: [1, 0, 0], phase: Math.PI/4 } },
            { domain: "U2", data: { stateVector: [0, 1, 0], phase: Math.PI/2 } },
            { domain: "U3", data: { stateVector: [0, 0, 1], phase: 0 } }
          ]
        };
        
        const sheafResult = createSheafModule("IntegratedQuantumSheaf", sheafDef);
        response.components.sheaf = sheafResult;
      }
      
      // Add D-module component if requested
      if (components.includes('dmodule')) {
        const dmoduleDef = {
          baseManifold: "ComplexProjectiveSpace",
          differentialOperators: [
            {
              name: "Hamiltonian",
              order: 1,
              coefficients: [0.5, -0.5, 0.1]
            }
          ],
          coordinates: ["t", "x", "y"]
        };
        
        const dmoduleResult = createDModule("IntegratedQuantumDModule", dmoduleDef);
        response.components.dmodule = dmoduleResult;
      }
      
      // Add functorial transform component if requested
      if (components.includes('functor')) {
        const functorDef = {
          sourceCategory: "StandardQuantum",
          targetCategory: "TopologicalQuantum",
          objectMapping: [
            {
              sourceName: "qubit",
              targetName: "anyon_pair",
              mappingFunction: "standardToTopological"
            }
          ],
          morphismMapping: [
            {
              sourceMorphism: "gate",
              targetMorphism: "braiding",
              mappingFunction: "gateTobraiding"
            }
          ]
        };
        
        const functorResult = createFunctorialTransform("StandardToTopological", functorDef);
        response.components.functor = functorResult;
      }
      
      // Add crystal state component if requested
      if (components.includes('crystal')) {
        const crystalDef = {
          baseSpace: "LieAlgebra_A1",
          latticeStructure: {
            dimensions: 2,
            latticeType: "hexagonal",
            latticeConstants: [1.0, 1.0]
          },
          weightSystem: {
            weights: [
              { name: "w1", value: 1.0 },
              { name: "w2", value: 0.5 }
            ],
            dominance: "partial"
          }
        };
        
        const crystalResult = createCrystalState("IntegratedQuantumCrystal", crystalDef);
        response.components.crystal = crystalResult;
      }
      
      // Calculate integration metrics (mock data for demonstration)
      response.metrics = {
        coherence: 0.92,
        entanglement: 0.87,
        topologicalInvariants: ["Chern number: 1", "Euler characteristic: 2"],
        quantumLogic: {
          completeness: true,
          consistency: true,
          decidability: "partial"
        }
      };
      
      return res.json(response);
    } catch (error) {
      return res.status(500).json({ 
        message: "Failed to process integrated Kashiwara Genesis components",
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
  
  // Demo API endpoints for 37-dimensional quantum computing
  
  // Create a 37-dimensional quantum Hamiltonian for magnetism simulations
  app.post("/api/quantum/magnetism/hamiltonian", async (req: Request, res: Response) => {
    try {
      const { name, latticeType, dimension, numSites, temperature } = req.body;
      
      if (!name || !latticeType) {
        return res.status(400).json({ 
          message: "Required parameters: name, latticeType" 
        });
      }
      
      // Create a Hamiltonian using our quantum magnetism module
      const hamiltonian = generateHamiltonian({
        name,
        latticeType: latticeType as LatticeType,
        dimension: dimension || 37, // Default to 37D for SINGULARIS PRIME
        numSites: numSites || 10,
        temperature: temperature || 1.0
      });
      
      return res.status(201).json({
        message: `Created ${dimension || 37}-dimensional quantum magnetism Hamiltonian '${name}'`,
        hamiltonian
      });
    } catch (error) {
      console.error("Error creating magnetism Hamiltonian:", error);
      return res.status(500).json({ 
        message: "Failed to create quantum magnetism Hamiltonian",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Run quantum magnetism simulation with specific Hamiltonian
  app.post("/api/quantum/magnetism/simulate", async (req: Request, res: Response) => {
    try {
      const { hamiltonianId, duration, timeSteps, errorMitigation } = req.body;
      
      if (!hamiltonianId) {
        return res.status(400).json({ 
          message: "Required parameters: hamiltonianId" 
        });
      }
      
      // Run the simulation using our quantum magnetism module
      const simulation = simulateQuantumMagnetism({
        hamiltonianId: Number(hamiltonianId),
        duration: Number(duration) || 10,
        timeSteps: Number(timeSteps) || 50,
        errorMitigation: errorMitigation as 'ZNE' | 'QEC' | 'NONE' || 'NONE'
      });
      
      return res.json({
        message: `Completed quantum magnetism simulation for Hamiltonian ${hamiltonianId}`,
        simulation
      });
    } catch (error) {
      console.error("Error running magnetism simulation:", error);
      return res.status(500).json({ 
        message: "Failed to run quantum magnetism simulation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Analyze quantum phase transitions
  app.post("/api/quantum/magnetism/phases", async (req: Request, res: Response) => {
    try {
      const { hamiltonianId, paramRange, paramName } = req.body;
      
      if (!hamiltonianId || !paramRange || !paramName) {
        return res.status(400).json({ 
          message: "Required parameters: hamiltonianId, paramRange, paramName" 
        });
      }
      
      // Analyze phases using our quantum magnetism module
      const analysis = analyzeQuantumPhases({
        hamiltonianId: Number(hamiltonianId),
        paramRange: {
          start: paramRange.start || 0.01,
          end: paramRange.end || 2.0,
          steps: paramRange.steps || 20
        },
        paramName: paramName as 'temperature' | 'fieldStrength' | 'anisotropy'
      });
      
      return res.json({
        message: `Completed phase transition analysis for parameter ${paramName}`,
        analysis
      });
    } catch (error) {
      console.error("Error analyzing phase transitions:", error);
      return res.status(500).json({ 
        message: "Failed to analyze quantum phase transitions",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a 37-dimensional qudit
  app.post("/api/quantum/high-dimensional/qudit", async (req: Request, res: Response) => {
    try {
      const { name, dimension, initialState } = req.body;
      
      if (!name || !dimension) {
        return res.status(400).json({ 
          message: "Required parameters: name (string), dimension (number)" 
        });
      }
      
      // Create quantum state in specified dimension
      const state = initialState || generateInitialState(Number(dimension));
      
      // In a real implementation, this would be stored in a database
      const qudit = {
        id: Math.floor(1000 + Math.random() * 9000),
        name,
        dimension: Number(dimension),
        state,
        isEntangled: false,
        entangledWith: null,
        created: new Date().toISOString()
      };
      
      return res.status(201).json({
        message: `Created ${dimension}-dimensional quantum state '${name}'`,
        qudit
      });
    } catch (error) {
      console.error("Error creating high-dimensional qudit:", error);
      return res.status(500).json({ 
        message: "Failed to create high-dimensional qudit",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Entangle high-dimensional qudits
  app.post("/api/quantum/high-dimensional/entangle", async (req: Request, res: Response) => {
    try {
      const { dimension, qudits, entanglementType } = req.body;
      
      if (!dimension || !qudits || qudits < 2) {
        return res.status(400).json({ 
          message: "Required parameters: dimension (number), qudits (number, minimum 2)" 
        });
      }
      
      // Generate a simulated entanglement result
      const stateSize = Number(dimension);
      const numQudits = Number(qudits);
      
      // Generate simulated state
      const state = generateEntangledState(stateSize, (entanglementType as EntanglementType) || 'GHZ');
      
      // Create qudit IDs for tracking entanglement
      const quditIds = Array.from({length: numQudits}, (_, i) => Math.floor(1000 + Math.random() * 9000));
      
      return res.json({
        message: `Created ${stateSize}-dimensional entangled state with ${numQudits} qudits`,
        entanglementType: entanglementType || 'GHZ',
        dimension: stateSize,
        state,
        quditIds,
        entangledWith: quditIds,
        created: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error entangling high-dimensional qudits:", error);
      return res.status(500).json({ 
        message: "Failed to create entangled state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Transform high-dimensional quantum states
  app.post("/api/quantum/high-dimensional/transform", async (req: Request, res: Response) => {
    try {
      const { dimension, transformationType, state } = req.body;
      
      if (!dimension || !transformationType) {
        return res.status(400).json({ 
          message: "Required parameters: dimension (number), transformationType (string)" 
        });
      }
      
      // Generate a simulated basis transformation result
      const stateSize = Number(dimension);
      
      // Generate initial state if not provided
      const initialState = state || generateInitialState(stateSize);
      
      // Apply transformation
      const transformedState = transformState(initialState, transformationType as TransformationType);
      
      return res.json({
        message: `Applied ${transformationType} transformation to ${stateSize}-dimensional state`,
        dimension: stateSize,
        initialState,
        transformedState,
        transformationType,
        created: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error transforming high-dimensional state:", error);
      return res.status(500).json({ 
        message: "Failed to transform quantum state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Measure high-dimensional quantum state
  app.post("/api/quantum/high-dimensional/measure", async (req: Request, res: Response) => {
    try {
      const { state, dimension } = req.body;
      
      if (!state && !dimension) {
        return res.status(400).json({ 
          message: "Required parameters: either state (array) or dimension (number)" 
        });
      }
      
      // If state is provided, use it; otherwise generate a state of the specified dimension
      const quantumState = state || generateInitialState(Number(dimension));
      
      // Perform measurement
      const measurement = measureQuantumState(quantumState);
      
      return res.json({
        message: `Measured ${quantumState.length}-dimensional quantum state`,
        initialState: quantumState,
        outcome: measurement.outcome,
        probability: quantumState[measurement.outcome] * quantumState[measurement.outcome],
        collapsedState: measurement.collapsedState,
        measured: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error measuring high-dimensional state:", error);
      return res.status(500).json({ 
        message: "Failed to measure quantum state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // SINGULARIS PRIME Unified Quantum Architecture API
  
  // Create a quantum state with SINGULARIS PRIME
  app.post("/api/singularis/quantum/state", async (req: Request, res: Response) => {
    try {
      const { name, dimension, initialState } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          message: "Required parameter: name (string)" 
        });
      }
      
      // Create a quantum state with the specified dimension
      const qudit = createQuantumState(
        name,
        dimension || 37,
        initialState
      );
      
      return res.status(201).json({
        message: `Created ${qudit.dimension}-dimensional quantum state '${name}'`,
        qudit,
        code: generateSingularisPrimeCode('create_qudit', { 
          name, 
          dimension: qudit.dimension 
        })
      });
    } catch (error) {
      console.error("Error creating SINGULARIS PRIME quantum state:", error);
      return res.status(500).json({ 
        message: "Failed to create quantum state",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create entangled states with SINGULARIS PRIME
  app.post("/api/singularis/quantum/entangle", async (req: Request, res: Response) => {
    try {
      const { name, dimension, numQudits, entanglementType } = req.body;
      
      // Create entangled quantum states
      const entangledQudits = createEntangledState(
        name || "Entangled State",
        dimension || 37,
        numQudits || 2,
        entanglementType || 'GHZ'
      );
      
      return res.status(201).json({
        message: `Created ${entangledQudits.length} entangled qudits in ${dimension || 37} dimensions`,
        qudits: entangledQudits,
        entanglementType: entanglementType || 'GHZ',
        code: generateSingularisPrimeCode('entangle', { 
          dimension: dimension || 37,
          numQudits: numQudits || 2,
          type: entanglementType || 'GHZ'
        })
      });
    } catch (error) {
      console.error("Error creating SINGULARIS PRIME entangled states:", error);
      return res.status(500).json({ 
        message: "Failed to create entangled states",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a magnetism Hamiltonian with SINGULARIS PRIME
  app.post("/api/singularis/quantum/hamiltonian", async (req: Request, res: Response) => {
    try {
      const { name, dimension, latticeType, temperature, numSites } = req.body;
      
      if (!name) {
        return res.status(400).json({ 
          message: "Required parameter: name (string)" 
        });
      }
      
      // Create a quantum magnetism Hamiltonian
      const hamiltonian = createMagneticHamiltonian(
        name,
        dimension || 37,
        latticeType || 'HIGHD_HYPERCUBIC',
        temperature || 1.0,
        numSites || 10
      );
      
      return res.status(201).json({
        message: `Created ${dimension || 37}-dimensional quantum magnetism Hamiltonian '${name}'`,
        hamiltonian,
        code: generateSingularisPrimeCode('magnetism', { 
          dimension: dimension || 37,
          latticeType: latticeType || 'HIGHD_HYPERCUBIC',
          temperature: temperature || 1.0
        })
      });
    } catch (error) {
      console.error("Error creating SINGULARIS PRIME Hamiltonian:", error);
      return res.status(500).json({ 
        message: "Failed to create Hamiltonian",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Run unified simulation combining quantum states and magnetism
  app.post("/api/singularis/quantum/unified-simulation", async (req: Request, res: Response) => {
    try {
      const { states, hamiltonian, errorMitigation } = req.body;
      
      if (!states || !hamiltonian) {
        return res.status(400).json({ 
          message: "Required parameters: states (array), hamiltonian (object)" 
        });
      }
      
      // Run the unified simulation
      const result = runUnifiedSimulation(
        states,
        hamiltonian,
        errorMitigation
      );
      
      return res.json({
        message: `Completed unified ${result.states?.[0]?.dimension || 37}D quantum simulation`,
        result,
        code: generateSingularisPrimeCode('unified', {})
      });
    } catch (error) {
      console.error("Error running SINGULARIS PRIME unified simulation:", error);
      return res.status(500).json({ 
        message: "Failed to run unified simulation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get SINGULARIS PRIME code for a specific quantum operation
  app.post("/api/singularis/code/generate", async (req: Request, res: Response) => {
    try {
      const { operation, params } = req.body;
      
      if (!operation) {
        return res.status(400).json({ 
          message: "Required parameter: operation (string)" 
        });
      }
      
      // Generate SINGULARIS PRIME code for the specified operation
      const code = generateSingularisPrimeCode(
        operation,
        params || {}
      );
      
      return res.json({
        message: `Generated SINGULARIS PRIME code for ${operation}`,
        code,
        operation,
        params: params || {}
      });
    } catch (error) {
      console.error("Error generating SINGULARIS PRIME code:", error);
      return res.status(500).json({ 
        message: "Failed to generate code",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
