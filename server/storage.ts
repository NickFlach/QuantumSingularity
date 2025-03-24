import { 
  users, type User, type InsertUser,
  singularisProjects, type Project, type InsertProject,
  singularisFiles, type File, type InsertFile,
  quantumSimulations, type QuantumSimulation, type InsertQuantumSimulation,
  aiNegotiations, type AINegotiation, type InsertAINegotiation,
  notificationLogs, type NotificationLog, type InsertNotificationLog
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private files: Map<number, File>;
  private quantumSimulations: Map<number, QuantumSimulation>;
  private aiNegotiations: Map<number, AINegotiation>;
  private notificationLogs: Map<number, NotificationLog>;
  private userIdCounter: number;
  private projectIdCounter: number;
  private fileIdCounter: number;
  private simulationIdCounter: number;
  private negotiationIdCounter: number;
  private notificationIdCounter: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.files = new Map();
    this.quantumSimulations = new Map();
    this.aiNegotiations = new Map();
    this.notificationLogs = new Map();
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.fileIdCounter = 1;
    this.simulationIdCounter = 1;
    this.negotiationIdCounter = 1;
    this.notificationIdCounter = 1;
    
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
      lastNotificationSent: null
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
      ...notification,
      id,
      userId: notification.userId || null,
      sentAt: new Date()
    };
    this.notificationLogs.set(id, newNotification);
    return newNotification;
  }

  async getNotificationLogs(userId: number): Promise<NotificationLog[]> {
    return Array.from(this.notificationLogs.values()).filter(
      log => log.userId === userId
    );
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
      ...notification,
      userId: notification.userId || null,
      sentAt: new Date()
    }).returning();
    return newNotification;
  }

  async getNotificationLogs(userId: number): Promise<NotificationLog[]> {
    return await db.select().from(notificationLogs).where(eq(notificationLogs.userId, userId));
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
