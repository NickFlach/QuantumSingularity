import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Kashiwara Genesis version types
export enum SheafModuleType {
  CATEGORY = "category",
  FUNCTOR = "functor",
  NATURAL_TRANSFORMATION = "natural_transformation",
  D_MODULE = "d_module",
  CRYSTAL = "crystal",
  SINGULARITY = "singularity"
}

// Quantum System Dimensions
export enum QuantumDimension {
  QUBIT = 2,       // Standard 2-level system (qubit)
  QUTRIT = 3,      // 3-level system (qutrit)
  QUQUAD = 4,      // 4-level system
  QUQUINT = 5,     // 5-level system
  QOCTIT = 8,      // 8-level system
  QUDECIT = 10,    // 10-level system
  HIGH_DIM_16 = 16,// 16-level system
  HIGH_DIM_32 = 32,// 32-level system
  HIGH_DIM_37 = 37,// 37-level system (from light experiment)
  HIGH_DIM_50 = 50,// 50-level system
  HIGH_DIM_64 = 64,// 64-level system
  HIGH_DIM_100 = 100// 100-level system
}

// Quantum Operation Types
export enum QuantumOperationType {
  GATE = "gate",                 // Single or multi-qudit gate
  MEASUREMENT = "measurement",   // Quantum measurement
  EVOLUTION = "evolution",       // Hamiltonian evolution
  ENTANGLEMENT = "entanglement", // Create entangled state
  RESET = "reset",               // Reset to basis state
  ERROR_CORRECTION = "error_correction", // Error correction
  ERROR_MITIGATION = "error_mitigation"  // Error mitigation
}

// Hamiltonian Types
export enum HamiltonianType {
  ISING = "ising",               // Transverse field Ising model
  HEISENBERG = "heisenberg",     // Heisenberg model
  XY = "xy",                     // XY model
  XXZ = "xxz",                   // XXZ model
  KITAEV = "kitaev",             // Kitaev honeycomb model
  HUBBARD = "hubbard",           // Hubbard model
  CUSTOM = "custom"              // Custom Hamiltonian
}

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  emailVerified: boolean("email_verified").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  profilePicture: text("profile_picture"),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarColor: text("avatar_color"),
  quantumLevel: integer("quantum_level").default(1),
  quantumPersona: text("quantum_persona"),
  specializations: jsonb("specializations"),
  achievements: jsonb("achievements"),
  createdAt: text("created_at"),
  lastActive: text("last_active"),
  lastNotificationSent: timestamp("last_notification_sent"),
  // GitHub integration fields
  githubId: text("github_id"),
  githubUsername: text("github_username"),
  githubAccessToken: text("github_access_token"),
  githubRefreshToken: text("github_refresh_token"),
  githubTokenExpiry: timestamp("github_token_expiry"),
});

export const singularisProjects = pgTable("singularis_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const singularisFiles = pgTable("singularis_files", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  name: text("name").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // "code", "quantum_circuit", "documentation"
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const quantumSimulations = pgTable("quantum_simulations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  type: text("type").notNull(), // "entanglement", "qkd", "circuit"
  parameters: jsonb("parameters").notNull(),
  results: jsonb("results").notNull(),
  createdAt: text("created_at").notNull(),
});

export const aiNegotiations = pgTable("ai_negotiations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  initiatorId: text("initiator_id").notNull(),
  responderId: text("responder_id").notNull(),
  terms: jsonb("terms").notNull(),
  negotiationLog: jsonb("negotiation_log").notNull(),
  explainabilityScore: text("explainability_score").notNull(),
  successful: boolean("successful").notNull(),
  createdAt: text("created_at").notNull(),
});

// GitHub connected repositories
export const githubRepositories = pgTable("github_repositories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  githubId: integer("github_id").notNull(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  description: text("description"),
  htmlUrl: text("html_url").notNull(),
  defaultBranch: text("default_branch").notNull(),
  ownerLogin: text("owner_login").notNull(),
  ownerAvatarUrl: text("owner_avatar_url"),
  createdAt: text("created_at").notNull(),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  explainabilityScore: text("explainability_score"),
  securityScore: text("security_score"),
  governanceScore: text("governance_score"),
  webhookId: text("webhook_id"),
  webhookSecret: text("webhook_secret"),
});

// CI/CD analysis results
export const cicdAnalyses = pgTable("cicd_analyses", {
  id: serial("id").primaryKey(),
  repositoryId: integer("repository_id").references(() => githubRepositories.id),
  branch: text("branch").notNull(),
  commitSha: text("commit_sha").notNull(),
  explainabilityScore: text("explainability_score"),
  explainabilityFactors: jsonb("explainability_factors"),
  securityScore: text("security_score"),
  securityVulnerabilities: integer("security_vulnerabilities"),
  governanceScore: text("governance_score"),
  governanceCompliant: boolean("governance_compliant"),
  humanOversight: boolean("human_oversight"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  status: text("status").notNull(), // "running", "completed", "failed"
  errorMessage: text("error_message"),
});

// Add a notification logs table
export const notificationLogs = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'email', 'in-app', etc.
  template: text("template"), // 'welcome', 'project_created', 'custom', etc.
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  status: text("status").notNull(), // 'sent', 'failed', etc.
  errorMessage: text("error_message"), // Error message if status is 'failed'
});

// Kashiwara Genesis - Sheaf modules for local logic definition
export const sheafModules = pgTable("sheaf_modules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // SheafModuleType enum
  definition: jsonb("definition").notNull(), // Structure defining the sheaf
  localSection: jsonb("local_section"), // Local section definitions
  globalSection: jsonb("global_section"), // Global properties derived from local
  gluingConditions: jsonb("gluing_conditions"), // Rules for combining local sections
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Kashiwara Genesis - D-modules for differential operators
export const dModules = pgTable("d_modules", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  name: text("name").notNull(),
  baseManifold: text("base_manifold").notNull(), // The underlying space
  differentialOperators: jsonb("differential_operators").notNull(), // Operator definitions
  solutions: jsonb("solutions"), // Known solutions to the system
  singularities: jsonb("singularities"), // Singularity points in the solution space
  holonomicity: boolean("holonomicity"), // Whether the system is holonomic
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Kashiwara Genesis - Functorial transforms between model spaces
export const functorialTransforms = pgTable("functorial_transforms", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  name: text("name").notNull(),
  sourceCategory: text("source_category").notNull(), // Source category/space
  targetCategory: text("target_category").notNull(), // Target category/space
  transformDefinition: jsonb("transform_definition").notNull(), // How objects and morphisms map
  preservedProperties: jsonb("preserved_properties"), // Invariants preserved by the transform
  adjunctions: jsonb("adjunctions"), // Related adjoint functors if any
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Kashiwara Genesis - Crystal states (discrete abstractions)
export const crystalStates = pgTable("crystal_states", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  name: text("name").notNull(),
  baseSpace: text("base_space").notNull(), // Continuous space being discretized
  latticeStructure: jsonb("lattice_structure").notNull(), // The discrete lattice
  weightSystem: jsonb("weight_system"), // Weights/values assigned to lattice points
  crystalOperators: jsonb("crystal_operators"), // Operations on the crystal
  connections: jsonb("connections"), // Connections to other crystals
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// High-Dimensional Quantum States (Qudits)
export const highDimensionalQudits = pgTable("high_dimensional_qudits", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  name: text("name").notNull(),
  dimension: integer("dimension").notNull(), // Dimension of the quantum system (2=qubit, 3=qutrit, 37=37-dim, etc)
  stateVector: jsonb("state_vector"), // Complex amplitudes of the quantum state
  isEntangled: boolean("is_entangled").default(false), // Whether this qudit is entangled with others
  entangledWith: jsonb("entangled_with"), // IDs of qudits this one is entangled with
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Quantum Hamiltonian Models
export const hamiltonians = pgTable("hamiltonians", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // HamiltonianType enum
  systemSize: integer("system_size").notNull(), // Number of quantum sites
  dimension: integer("dimension").default(2), // Dimension of each site (default=qubit)
  terms: jsonb("terms").notNull(), // Interaction and field terms in the Hamiltonian
  description: text("description"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// Quantum Magnetism Simulations
export const magnetismSimulations = pgTable("magnetism_simulations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  hamiltonianId: integer("hamiltonian_id").references(() => hamiltonians.id),
  parameters: jsonb("parameters").notNull(), // Simulation parameters
  results: jsonb("results").notNull(), // Simulation results
  evolutionData: jsonb("evolution_data"), // Time evolution data
  finalState: jsonb("final_state"), // Final system state
  resourcesUsed: jsonb("resources_used"), // Computational resources used
  errorMitigation: text("error_mitigation"), // Error mitigation strategy used
  createdAt: text("created_at").notNull(),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  emailNotifications: true,
  displayName: true,
  profilePicture: true,
  createdAt: true,
  lastActive: true,
});

export const updateUserProfileSchema = createInsertSchema(users).pick({
  displayName: true,
  bio: true,
  avatarColor: true,
  quantumPersona: true,
  specializations: true,
  email: true,
  emailNotifications: true,
  profilePicture: true,
});

export const insertNotificationLogSchema = createInsertSchema(notificationLogs).pick({
  userId: true,
  type: true,
  template: true,
  subject: true,
  content: true,
  status: true,
  errorMessage: true,
});

export const insertProjectSchema = createInsertSchema(singularisProjects).pick({
  name: true,
  description: true,
  userId: true,
});

export const insertFileSchema = createInsertSchema(singularisFiles).pick({
  projectId: true,
  name: true,
  content: true,
  type: true,
});

export const insertQuantumSimulationSchema = createInsertSchema(quantumSimulations).pick({
  projectId: true,
  type: true,
  parameters: true,
  results: true,
});

export const insertAINegotiationSchema = createInsertSchema(aiNegotiations).pick({
  projectId: true,
  initiatorId: true,
  responderId: true,
  terms: true,
  negotiationLog: true,
  explainabilityScore: true,
  successful: true,
});

export const insertGithubRepositorySchema = createInsertSchema(githubRepositories).pick({
  userId: true,
  githubId: true,
  name: true,
  fullName: true,
  description: true,
  htmlUrl: true,
  defaultBranch: true,
  ownerLogin: true,
  ownerAvatarUrl: true,
  createdAt: true,
  connectedAt: true,
});

export const insertCICDAnalysisSchema = createInsertSchema(cicdAnalyses).pick({
  repositoryId: true,
  branch: true,
  commitSha: true,
  status: true,
  explainabilityScore: true,
  explainabilityFactors: true,
  securityScore: true,
  securityVulnerabilities: true,
  governanceScore: true,
  governanceCompliant: true,
  humanOversight: true,
  createdAt: true,
  completedAt: true,
  errorMessage: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof singularisProjects.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof singularisFiles.$inferSelect;

export type InsertQuantumSimulation = z.infer<typeof insertQuantumSimulationSchema>;
export type QuantumSimulation = typeof quantumSimulations.$inferSelect;

export type InsertAINegotiation = z.infer<typeof insertAINegotiationSchema>;
export type AINegotiation = typeof aiNegotiations.$inferSelect;

export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;
export type NotificationLog = typeof notificationLogs.$inferSelect;

export type InsertGithubRepository = z.infer<typeof insertGithubRepositorySchema>;
export type GithubRepository = typeof githubRepositories.$inferSelect;

export type InsertCICDAnalysis = z.infer<typeof insertCICDAnalysisSchema>;
export type CICDAnalysis = typeof cicdAnalyses.$inferSelect;

// Kashiwara Genesis insert schemas
export const insertSheafModuleSchema = createInsertSchema(sheafModules).pick({
  projectId: true,
  name: true,
  type: true,
  definition: true,
  localSection: true,
  globalSection: true,
  gluingConditions: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDModuleSchema = createInsertSchema(dModules).pick({
  projectId: true,
  name: true,
  baseManifold: true,
  differentialOperators: true,
  solutions: true,
  singularities: true,
  holonomicity: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFunctorialTransformSchema = createInsertSchema(functorialTransforms).pick({
  projectId: true,
  name: true,
  sourceCategory: true,
  targetCategory: true,
  transformDefinition: true,
  preservedProperties: true,
  adjunctions: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCrystalStateSchema = createInsertSchema(crystalStates).pick({
  projectId: true,
  name: true,
  baseSpace: true,
  latticeStructure: true,
  weightSystem: true,
  crystalOperators: true,
  connections: true,
  createdAt: true,
  updatedAt: true,
});

// Kashiwara Genesis types
export type InsertSheafModule = z.infer<typeof insertSheafModuleSchema>;
export type SheafModule = typeof sheafModules.$inferSelect;

export type InsertDModule = z.infer<typeof insertDModuleSchema>;
export type DModule = typeof dModules.$inferSelect;

export type InsertFunctorialTransform = z.infer<typeof insertFunctorialTransformSchema>;
export type FunctorialTransform = typeof functorialTransforms.$inferSelect;

export type InsertCrystalState = z.infer<typeof insertCrystalStateSchema>;
export type CrystalState = typeof crystalStates.$inferSelect;

// High-Dimensional Quantum States (Qudits) schemas and types
export const insertQuditSchema = createInsertSchema(highDimensionalQudits).pick({
  projectId: true,
  name: true,
  dimension: true,
  stateVector: true,
  isEntangled: true,
  entangledWith: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertQudit = z.infer<typeof insertQuditSchema>;
export type Qudit = typeof highDimensionalQudits.$inferSelect;

// Quantum Hamiltonian schemas and types
export const insertHamiltonianSchema = createInsertSchema(hamiltonians).pick({
  projectId: true,
  name: true,
  type: true,
  systemSize: true,
  dimension: true,
  terms: true,
  description: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHamiltonian = z.infer<typeof insertHamiltonianSchema>;
export type Hamiltonian = typeof hamiltonians.$inferSelect;

// Quantum Magnetism Simulation schemas and types
export const insertMagnetismSimulationSchema = createInsertSchema(magnetismSimulations).pick({
  projectId: true,
  hamiltonianId: true,
  parameters: true,
  results: true,
  evolutionData: true,
  finalState: true,
  resourcesUsed: true,
  errorMitigation: true,
  createdAt: true,
  completedAt: true,
});

export type InsertMagnetismSimulation = z.infer<typeof insertMagnetismSimulationSchema>;
export type MagnetismSimulation = typeof magnetismSimulations.$inferSelect;
