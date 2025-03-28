import { 
  users, type User, type InsertUser,
  singularisProjects, type Project, type InsertProject,
  singularisFiles, type File, type InsertFile,
  quantumSimulations, type QuantumSimulation, type InsertQuantumSimulation,
  aiNegotiations, type AINegotiation, type InsertAINegotiation,
  notificationLogs, type NotificationLog, type InsertNotificationLog,
  githubRepositories, type GithubRepository, type InsertGithubRepository,
  cicdAnalyses, type CICDAnalysis, type InsertCICDAnalysis,
  sheafModules, type SheafModule, type InsertSheafModule,
  dModules, type DModule, type InsertDModule,
  functorialTransforms, type FunctorialTransform, type InsertFunctorialTransform,
  crystalStates, type CrystalState, type InsertCrystalState
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";

export interface IStorage {
  // Session store for express-session
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, updates: Partial<User>): Promise<User | undefined>;
  updateUserGitHubToken(id: number, githubData: {
    githubId: string;
    githubUsername: string;
    githubAccessToken: string;
    githubRefreshToken?: string;
    githubTokenExpiry?: Date;
  }): Promise<User | undefined>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsByUser(userId: number): Promise<Project[]>;
  createProject(project: InsertProject & { createdAt: string; updatedAt: string }): Promise<Project>;
  
  // File operations
  getFilesByProject(projectId: number): Promise<File[]>;
  createFile(file: InsertFile & { createdAt: string; updatedAt: string }): Promise<File>;
  updateFile(id: number, updates: Partial<File>): Promise<File | undefined>;

  // Quantum operations
  createQuantumSimulation(simulation: InsertQuantumSimulation & { createdAt: string }): Promise<QuantumSimulation>;
  
  // AI operations
  createAINegotiation(negotiation: InsertAINegotiation & { createdAt: string }): Promise<AINegotiation>;

  // Email notification operations
  createNotificationLog(notification: InsertNotificationLog): Promise<NotificationLog>;
  getNotificationLogs(userId: number): Promise<NotificationLog[]>;
  
  // GitHub repository operations
  getGitHubRepositories(userId: number): Promise<GithubRepository[]>;
  getGitHubRepository(id: number): Promise<GithubRepository | undefined>;
  createGitHubRepository(repository: InsertGithubRepository & { createdAt: string }): Promise<GithubRepository>;
  updateGitHubRepository(id: number, updates: Partial<GithubRepository>): Promise<GithubRepository | undefined>;
  
  // CI/CD analysis operations 
  getCICDAnalyses(repositoryId: number): Promise<CICDAnalysis[]>;
  getCICDAnalysis(id: number): Promise<CICDAnalysis | undefined>;
  createCICDAnalysis(analysis: InsertCICDAnalysis): Promise<CICDAnalysis>;
  updateCICDAnalysis(id: number, updates: Partial<CICDAnalysis>): Promise<CICDAnalysis | undefined>;
  
  // Kashiwara Genesis operations
  createSheafModule(module: InsertSheafModule): Promise<SheafModule>;
  createDModule(module: InsertDModule): Promise<DModule>;
  createFunctorialTransform(transform: InsertFunctorialTransform): Promise<FunctorialTransform>;
  createCrystalState(crystal: InsertCrystalState): Promise<CrystalState>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private quantumSimulations: Map<number, QuantumSimulation>;
  private aiNegotiations: Map<number, AINegotiation>;
  private notificationLogs: Map<number, NotificationLog>;
  private githubRepositories: Map<number, GithubRepository>;
  private cicdAnalyses: Map<number, CICDAnalysis>;
  private sheafModules: Map<number, SheafModule>;
  private dModules: Map<number, DModule>;
  private functorialTransforms: Map<number, FunctorialTransform>;
  private crystalStates: Map<number, CrystalState>;
  private userIdCounter: number;
  private projectIdCounter: number;
  private fileIdCounter: number;
  private simulationIdCounter: number;
  private negotiationIdCounter: number;
  private notificationIdCounter: number;
  private repositoryIdCounter: number;
  private analysisIdCounter: number;
  private sheafModuleIdCounter: number;
  private dModuleIdCounter: number;
  private functorialTransformIdCounter: number;
  private crystalStateIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.quantumSimulations = new Map();
    this.aiNegotiations = new Map();
    this.notificationLogs = new Map();
    this.githubRepositories = new Map();
    this.cicdAnalyses = new Map();
    this.sheafModules = new Map();
    this.dModules = new Map();
    this.functorialTransforms = new Map();
    this.crystalStates = new Map();
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.fileIdCounter = 1;
    this.simulationIdCounter = 1;
    this.negotiationIdCounter = 1;
    this.notificationIdCounter = 1;
    this.repositoryIdCounter = 1;
    this.analysisIdCounter = 1;
    this.sheafModuleIdCounter = 1;
    this.dModuleIdCounter = 1;
    this.functorialTransformIdCounter = 1;
    this.crystalStateIdCounter = 1;
    
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id,
      displayName: insertUser.username,
      bio: null,
      quantumPersona: null,
      createdAt: now,
      lastActive: now,
      quantumLevel: 1,
      avatarColor: '#89B4FA',
      specializations: [],
      achievements: [],
      email: insertUser.email || null,
      emailVerified: false,
      emailNotifications: true,
      profilePicture: insertUser.profilePicture || null,
      lastNotificationSent: null,
      // GitHub fields
      githubId: null,
      githubUsername: null,
      githubAccessToken: null,
      githubRefreshToken: null,
      githubTokenExpiry: null
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserProfile(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...updates,
      lastActive: new Date().toISOString() 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async createProject(project: InsertProject & { createdAt: string; updatedAt: string }): Promise<Project> {
    const id = this.projectIdCounter++;
    const newProject: Project = { 
      ...project, 
      id,
      description: project.description || null,
      userId: project.userId || null
    };
    this.projects.set(id, newProject);
    return newProject;
  }

  // File operations
  async getFilesByProject(projectId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(
      (file) => file.projectId === projectId
    );
  }

  async createFile(file: InsertFile & { createdAt: string; updatedAt: string }): Promise<File> {
    const id = this.fileIdCounter++;
    const newFile: File = { 
      ...file, 
      id,
      projectId: file.projectId || null
    };
    this.files.set(id, newFile);
    return newFile;
  }

  async updateFile(id: number, updates: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;
    
    const updatedFile = { ...file, ...updates };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  // Quantum operations
  async createQuantumSimulation(simulation: InsertQuantumSimulation & { createdAt: string }): Promise<QuantumSimulation> {
    const id = this.simulationIdCounter++;
    const newSimulation: QuantumSimulation = { 
      ...simulation, 
      id,
      projectId: simulation.projectId || null
    };
    this.quantumSimulations.set(id, newSimulation);
    return newSimulation;
  }

  // AI operations
  async createAINegotiation(negotiation: InsertAINegotiation & { createdAt: string }): Promise<AINegotiation> {
    const id = this.negotiationIdCounter++;
    const newNegotiation: AINegotiation = { 
      ...negotiation, 
      id,
      projectId: negotiation.projectId || null
    };
    this.aiNegotiations.set(id, newNegotiation);
    return newNegotiation;
  }

  // Projects by user
  async getProjectsByUser(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      project => project.userId === userId
    );
  }

  // Notification logs
  async createNotificationLog(notification: InsertNotificationLog): Promise<NotificationLog> {
    const id = this.notificationIdCounter++;
    const newNotification: NotificationLog = {
      id,
      userId: notification.userId || null,
      type: notification.type,
      template: notification.template || null,
      subject: notification.subject,
      content: notification.content,
      sentAt: new Date(),
      status: notification.status,
      errorMessage: notification.errorMessage || null
    };
    this.notificationLogs.set(id, newNotification);
    return newNotification;
  }

  async getNotificationLogs(userId: number): Promise<NotificationLog[]> {
    return Array.from(this.notificationLogs.values()).filter(
      log => log.userId === userId
    );
  }
  
  // GitHub user operations
  async updateUserGitHubToken(id: number, githubData: {
    githubId: string;
    githubUsername: string;
    githubAccessToken: string;
    githubRefreshToken?: string;
    githubTokenExpiry?: Date;
  }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      githubId: githubData.githubId,
      githubUsername: githubData.githubUsername,
      githubAccessToken: githubData.githubAccessToken,
      githubRefreshToken: githubData.githubRefreshToken || null,
      githubTokenExpiry: githubData.githubTokenExpiry || null,
      lastActive: new Date().toISOString() 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // GitHub repository operations
  async getGitHubRepositories(userId: number): Promise<GithubRepository[]> {
    return Array.from(this.githubRepositories.values()).filter(
      repo => repo.userId === userId
    );
  }
  
  async getGitHubRepository(id: number): Promise<GithubRepository | undefined> {
    return this.githubRepositories.get(id);
  }
  
  async createGitHubRepository(repository: InsertGithubRepository & { createdAt: string }): Promise<GithubRepository> {
    const id = this.repositoryIdCounter++;
    const now = new Date();
    
    const newRepository: GithubRepository = {
      id,
      userId: repository.userId === undefined ? null : repository.userId,
      githubId: repository.githubId,
      name: repository.name,
      fullName: repository.fullName,
      description: repository.description || null,
      htmlUrl: repository.htmlUrl,
      defaultBranch: repository.defaultBranch,
      ownerLogin: repository.ownerLogin,
      ownerAvatarUrl: repository.ownerAvatarUrl || null,
      createdAt: repository.createdAt,
      connectedAt: now,
      lastAnalyzedAt: null,
      explainabilityScore: null,
      securityScore: null,
      governanceScore: null,
      webhookId: null,
      webhookSecret: null
    };
    
    this.githubRepositories.set(id, newRepository);
    return newRepository;
  }
  
  async updateGitHubRepository(id: number, updates: Partial<GithubRepository>): Promise<GithubRepository | undefined> {
    const repository = this.githubRepositories.get(id);
    if (!repository) return undefined;
    
    const updatedRepository = { ...repository, ...updates };
    this.githubRepositories.set(id, updatedRepository);
    return updatedRepository;
  }
  
  // CI/CD analysis operations
  async getCICDAnalyses(repositoryId: number): Promise<CICDAnalysis[]> {
    return Array.from(this.cicdAnalyses.values()).filter(
      analysis => analysis.repositoryId === repositoryId
    );
  }
  
  async getCICDAnalysis(id: number): Promise<CICDAnalysis | undefined> {
    return this.cicdAnalyses.get(id);
  }
  
  async createCICDAnalysis(analysis: InsertCICDAnalysis): Promise<CICDAnalysis> {
    const id = this.analysisIdCounter++;
    const now = new Date();
    
    const newAnalysis: CICDAnalysis = {
      id,
      repositoryId: analysis.repositoryId === undefined ? null : analysis.repositoryId,
      status: analysis.status,
      branch: analysis.branch,
      commitSha: analysis.commitSha,
      explainabilityScore: null,
      explainabilityFactors: [],
      securityScore: null,
      securityVulnerabilities: null,
      governanceScore: null,
      governanceCompliant: null,
      humanOversight: null,
      createdAt: now,
      completedAt: null,
      errorMessage: null
    };
    
    this.cicdAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async updateCICDAnalysis(id: number, updates: Partial<CICDAnalysis>): Promise<CICDAnalysis | undefined> {
    const analysis = this.cicdAnalyses.get(id);
    if (!analysis) return undefined;
    
    const updatedAnalysis = { ...analysis, ...updates };
    this.cicdAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  // Kashiwara Genesis operations
  async createSheafModule(module: InsertSheafModule): Promise<SheafModule> {
    const id = this.sheafModuleIdCounter++;
    const now = new Date().toISOString();
    
    const newModule: SheafModule = {
      id,
      userId: module.userId === undefined ? null : module.userId,
      name: module.name,
      type: module.type,
      topology: module.topology,
      sections: module.sections,
      gluingConditions: module.gluingConditions,
      createdAt: module.createdAt || now
    };
    
    this.sheafModules.set(id, newModule);
    return newModule;
  }
  
  async createDModule(module: InsertDModule): Promise<DModule> {
    const id = this.dModuleIdCounter++;
    const now = new Date().toISOString();
    
    const newModule: DModule = {
      id,
      userId: module.userId === undefined ? null : module.userId,
      name: module.name,
      baseManifold: module.baseManifold,
      differentialOperators: module.differentialOperators,
      coordinates: module.coordinates,
      initialConditions: module.initialConditions,
      createdAt: module.createdAt || now
    };
    
    this.dModules.set(id, newModule);
    return newModule;
  }
  
  async createFunctorialTransform(transform: InsertFunctorialTransform): Promise<FunctorialTransform> {
    const id = this.functorialTransformIdCounter++;
    const now = new Date().toISOString();
    
    const newTransform: FunctorialTransform = {
      id,
      userId: transform.userId === undefined ? null : transform.userId,
      name: transform.name,
      sourceCategory: transform.sourceCategory,
      targetCategory: transform.targetCategory,
      objectMapping: transform.objectMapping,
      morphismMapping: transform.morphismMapping,
      preservedProperties: transform.preservedProperties,
      createdAt: transform.createdAt || now
    };
    
    this.functorialTransforms.set(id, newTransform);
    return newTransform;
  }
  
  async createCrystalState(crystal: InsertCrystalState): Promise<CrystalState> {
    const id = this.crystalStateIdCounter++;
    const now = new Date().toISOString();
    
    const newCrystal: CrystalState = {
      id,
      userId: crystal.userId === undefined ? null : crystal.userId,
      name: crystal.name,
      baseSpace: crystal.baseSpace,
      latticeStructure: crystal.latticeStructure,
      weightSystem: crystal.weightSystem,
      operators: crystal.operators,
      createdAt: crystal.createdAt || now
    };
    
    this.crystalStates.set(id, newCrystal);
    return newCrystal;
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool: this.pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date().toISOString();
    const [user] = await db.insert(users).values({
      ...insertUser,
      email: insertUser.email || null,
      emailVerified: false,
      emailNotifications: true,
      profilePicture: insertUser.profilePicture || null,
      displayName: insertUser.displayName || insertUser.username,
      bio: null,
      quantumPersona: null,
      createdAt: now,
      lastActive: now,
      quantumLevel: 1,
      avatarColor: '#89B4FA',
      specializations: [],
      achievements: []
    }).returning();
    return user;
  }

  async updateUserProfile(id: number, updates: Partial<User>): Promise<User | undefined> {
    const now = new Date().toISOString();
    const [user] = await db.update(users)
      .set({ ...updates, lastActive: now })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(singularisProjects).where(eq(singularisProjects.id, id));
    return project;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(singularisProjects);
  }

  async getProjectsByUser(userId: number): Promise<Project[]> {
    return await db.select().from(singularisProjects).where(eq(singularisProjects.userId, userId));
  }

  async createProject(project: InsertProject & { createdAt: string; updatedAt: string }): Promise<Project> {
    const [newProject] = await db.insert(singularisProjects).values(project).returning();
    return newProject;
  }

  // File operations
  async getFilesByProject(projectId: number): Promise<File[]> {
    return await db.select().from(singularisFiles).where(eq(singularisFiles.projectId, projectId));
  }

  async createFile(file: InsertFile & { createdAt: string; updatedAt: string }): Promise<File> {
    const [newFile] = await db.insert(singularisFiles).values(file).returning();
    return newFile;
  }

  async updateFile(id: number, updates: Partial<File>): Promise<File | undefined> {
    const [updatedFile] = await db.update(singularisFiles)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(singularisFiles.id, id))
      .returning();
    return updatedFile;
  }

  // Quantum operations
  async createQuantumSimulation(simulation: InsertQuantumSimulation & { createdAt: string }): Promise<QuantumSimulation> {
    const [newSimulation] = await db.insert(quantumSimulations).values(simulation).returning();
    return newSimulation;
  }

  // AI operations
  async createAINegotiation(negotiation: InsertAINegotiation & { createdAt: string }): Promise<AINegotiation> {
    const [newNegotiation] = await db.insert(aiNegotiations).values(negotiation).returning();
    return newNegotiation;
  }

  // Notification logs
  async createNotificationLog(notification: InsertNotificationLog): Promise<NotificationLog> {
    const [newNotification] = await db.insert(notificationLogs).values({
      userId: notification.userId || null,
      type: notification.type,
      template: notification.template || null,
      subject: notification.subject,
      content: notification.content,
      sentAt: new Date(),
      status: notification.status,
      errorMessage: notification.errorMessage || null
    }).returning();
    return newNotification;
  }

  async getNotificationLogs(userId: number): Promise<NotificationLog[]> {
    return await db.select().from(notificationLogs).where(eq(notificationLogs.userId, userId));
  }
  
  // GitHub user operations
  async updateUserGitHubToken(id: number, githubData: {
    githubId: string;
    githubUsername: string;
    githubAccessToken: string;
    githubRefreshToken?: string;
    githubTokenExpiry?: Date;
  }): Promise<User | undefined> {
    const now = new Date().toISOString();
    const [user] = await db.update(users)
      .set({
        githubId: githubData.githubId,
        githubUsername: githubData.githubUsername,
        githubAccessToken: githubData.githubAccessToken,
        githubRefreshToken: githubData.githubRefreshToken || null,
        githubTokenExpiry: githubData.githubTokenExpiry || null,
        lastActive: now
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // GitHub repository operations
  async getGitHubRepositories(userId: number): Promise<GithubRepository[]> {
    return await db.select().from(githubRepositories).where(eq(githubRepositories.userId, userId));
  }
  
  async getGitHubRepository(id: number): Promise<GithubRepository | undefined> {
    const [repository] = await db.select().from(githubRepositories).where(eq(githubRepositories.id, id));
    return repository;
  }
  
  async createGitHubRepository(repository: InsertGithubRepository & { createdAt: string }): Promise<GithubRepository> {
    const now = new Date();
    const [newRepository] = await db.insert(githubRepositories).values({
      ...repository,
      description: repository.description || null,
      ownerAvatarUrl: repository.ownerAvatarUrl || null,
      connectedAt: now,
      lastAnalyzedAt: null,
      explainabilityScore: null,
      securityScore: null,
      governanceScore: null,
      webhookId: null,
      webhookSecret: null
    }).returning();
    return newRepository;
  }
  
  async updateGitHubRepository(id: number, updates: Partial<GithubRepository>): Promise<GithubRepository | undefined> {
    const [updatedRepository] = await db.update(githubRepositories)
      .set(updates)
      .where(eq(githubRepositories.id, id))
      .returning();
    return updatedRepository;
  }
  
  // CI/CD analysis operations
  async getCICDAnalyses(repositoryId: number): Promise<CICDAnalysis[]> {
    return await db.select().from(cicdAnalyses).where(eq(cicdAnalyses.repositoryId, repositoryId));
  }
  
  async getCICDAnalysis(id: number): Promise<CICDAnalysis | undefined> {
    const [analysis] = await db.select().from(cicdAnalyses).where(eq(cicdAnalyses.id, id));
    return analysis;
  }
  
  async createCICDAnalysis(analysis: InsertCICDAnalysis): Promise<CICDAnalysis> {
    const now = new Date();
    const [newAnalysis] = await db.insert(cicdAnalyses).values({
      ...analysis,
      explainabilityScore: null,
      explainabilityFactors: [],
      securityScore: null,
      securityVulnerabilities: null,
      governanceScore: null,
      governanceCompliant: null,
      humanOversight: null,
      createdAt: now,
      completedAt: null,
      errorMessage: null
    }).returning();
    return newAnalysis;
  }
  
  async updateCICDAnalysis(id: number, updates: Partial<CICDAnalysis>): Promise<CICDAnalysis | undefined> {
    const [updatedAnalysis] = await db.update(cicdAnalyses)
      .set(updates)
      .where(eq(cicdAnalyses.id, id))
      .returning();
    return updatedAnalysis;
  }
  
  // Kashiwara Genesis operations
  async createSheafModule(module: InsertSheafModule): Promise<SheafModule> {
    const now = new Date().toISOString();
    const [newModule] = await db.insert(sheafModules).values({
      projectId: module.projectId,
      name: module.name,
      type: module.type,
      definition: module.definition,
      localSection: module.localSection,
      globalSection: module.globalSection,
      gluingConditions: module.gluingConditions,
      createdAt: module.createdAt || now,
      updatedAt: module.updatedAt || now
    }).returning();
    return newModule;
  }
  
  async createDModule(module: InsertDModule): Promise<DModule> {
    const now = new Date().toISOString();
    const [newModule] = await db.insert(dModules).values({
      projectId: module.projectId,
      name: module.name,
      baseManifold: module.baseManifold,
      differentialOperators: module.differentialOperators,
      solutions: module.solutions,
      singularities: module.singularities,
      holonomicity: module.holonomicity,
      createdAt: module.createdAt || now,
      updatedAt: module.updatedAt || now
    }).returning();
    return newModule;
  }
  
  async createFunctorialTransform(transform: InsertFunctorialTransform): Promise<FunctorialTransform> {
    const now = new Date().toISOString();
    const [newTransform] = await db.insert(functorialTransforms).values({
      projectId: transform.projectId,
      name: transform.name,
      sourceCategory: transform.sourceCategory,
      targetCategory: transform.targetCategory,
      transformDefinition: transform.transformDefinition,
      preservedProperties: transform.preservedProperties,
      adjunctions: transform.adjunctions,
      createdAt: transform.createdAt || now,
      updatedAt: transform.updatedAt || now
    }).returning();
    return newTransform;
  }
  
  async createCrystalState(crystal: InsertCrystalState): Promise<CrystalState> {
    const now = new Date().toISOString();
    const [newCrystal] = await db.insert(crystalStates).values({
      projectId: crystal.projectId,
      name: crystal.name,
      baseSpace: crystal.baseSpace,
      latticeStructure: crystal.latticeStructure,
      weightSystem: crystal.weightSystem,
      crystalOperators: crystal.crystalOperators,
      connections: crystal.connections,
      createdAt: crystal.createdAt || now,
      updatedAt: crystal.updatedAt || now
    }).returning();
    return newCrystal;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
