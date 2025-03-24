import { 
  users, type User, type InsertUser,
  singularisProjects, type Project, type InsertProject,
  singularisFiles, type File, type InsertFile,
  quantumSimulations, type QuantumSimulation, type InsertQuantumSimulation,
  aiNegotiations, type AINegotiation, type InsertAINegotiation
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject & { createdAt: string; updatedAt: string }): Promise<Project>;
  
  // File operations
  getFilesByProject(projectId: number): Promise<File[]>;
  createFile(file: InsertFile & { createdAt: string; updatedAt: string }): Promise<File>;
  updateFile(id: number, updates: Partial<File>): Promise<File | undefined>;

  // Quantum operations
  createQuantumSimulation(simulation: InsertQuantumSimulation & { createdAt: string }): Promise<QuantumSimulation>;
  
  // AI operations
  createAINegotiation(negotiation: InsertAINegotiation & { createdAt: string }): Promise<AINegotiation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private quantumSimulations: Map<number, QuantumSimulation>;
  private aiNegotiations: Map<number, AINegotiation>;
  private userIdCounter: number;
  private projectIdCounter: number;
  private fileIdCounter: number;
  private simulationIdCounter: number;
  private negotiationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.quantumSimulations = new Map();
    this.aiNegotiations = new Map();
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.fileIdCounter = 1;
    this.simulationIdCounter = 1;
    this.negotiationIdCounter = 1;
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
      achievements: []
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
}

export const storage = new MemStorage();
