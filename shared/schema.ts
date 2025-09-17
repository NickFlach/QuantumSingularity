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

// =============================================================================
// DISTRIBUTED QUANTUM NETWORKS (DQN) SCHEMAS
// =============================================================================

// Distributed Quantum Node Status
export enum DistributedNodeStatus {
  ONLINE = "online",
  OFFLINE = "offline", 
  DEGRADED = "degraded",
  SYNCHRONIZING = "synchronizing",
  FAULT = "fault"
}

// EPR Channel Status
export enum EPRChannelStatus {
  ACTIVE = "active",
  IDLE = "idle",
  DEGRADED = "degraded", 
  FAILED = "failed",
  MAINTENANCE = "maintenance"
}

// Distributed Session Status
export enum DistributedSessionStatus {
  INITIALIZING = "initializing",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  TERMINATING = "terminating", 
  TERMINATED = "terminated",
  ERROR = "error"
}

// Distributed Operation Status
export enum DistributedOperationStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  TIMEOUT = "timeout",
  CANCELLED = "cancelled",
  ROLLED_BACK = "rolled_back"
}

// Distributed Operation Types
export enum DistributedOperationType {
  TELEPORTATION = "teleportation",
  ENTANGLEMENT_SWAPPING = "entanglement_swapping",
  DISTRIBUTED_MEASUREMENT = "distributed_measurement",
  QUANTUM_ERROR_CORRECTION = "quantum_error_correction",
  EPR_GENERATION = "epr_generation",
  STATE_MIGRATION = "state_migration",
  BARRIER_SYNCHRONIZATION = "barrier_synchronization"
}

// Distributed Quantum Nodes - Participants in the quantum network
export const distributedQuantumNodes = pgTable("distributed_quantum_nodes", {
  id: serial("id").primaryKey(),
  nodeId: text("node_id").notNull().unique(), // NodeId brand type as string
  name: text("name").notNull(),
  networkAddress: text("network_address").notNull(),
  publicKey: text("public_key").notNull(),
  trustLevel: text("trust_level").notNull(), // "untrusted", "verified", "trusted", "critical"
  status: text("status").notNull(), // DistributedNodeStatus enum
  
  // Capabilities
  maxQubits: integer("max_qubits").notNull(),
  availableQubits: integer("available_qubits").notNull(),
  coherenceTime: integer("coherence_time").notNull(), // microseconds
  fidelityThreshold: text("fidelity_threshold").notNull(), // decimal as string
  canTeleport: boolean("can_teleport").default(true),
  canPurify: boolean("can_purify").default(true),
  canSwapEntanglement: boolean("can_swap_entanglement").default(true),
  maxEntangledStates: integer("max_entangled_states").notNull(),
  supportedDimensions: jsonb("supported_dimensions").notNull(), // Array of QuantumDimension
  minFidelity: text("min_fidelity").notNull(), // decimal as string
  maxLatency: integer("max_latency").notNull(), // milliseconds
  cryptographicProtocols: jsonb("cryptographic_protocols").notNull(), // Array of strings
  
  // Network metrics
  lastHeartbeat: timestamp("last_heartbeat").notNull(),
  lastAuthenticated: timestamp("last_authenticated").notNull(),
  networkLatency: jsonb("network_latency"), // Map<NodeId, LatencyMetrics>
  connectedNodes: jsonb("connected_nodes"), // Set of NodeId
  routingTable: jsonb("routing_table"), // Map<NodeId, NodeId> destination -> next hop
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// EPR Channels - Quantum communication channels between nodes
export const eprChannels = pgTable("epr_channels", {
  id: serial("id").primaryKey(),
  channelId: text("channel_id").notNull().unique(), // ChannelId brand type as string
  nodeAId: text("node_a_id").notNull(),
  nodeBId: text("node_b_id").notNull(),
  status: text("status").notNull(), // EPRChannelStatus enum
  
  // Quality metrics
  fidelity: text("fidelity").notNull(), // decimal as string (0-1)
  entanglementStrength: text("entanglement_strength").notNull(), // decimal as string
  coherenceTime: integer("coherence_time").notNull(), // microseconds
  errorRate: text("error_rate").notNull(), // decimal as string
  purificationLevel: integer("purification_level").default(0),
  
  // EPR pair pool metrics
  totalPairs: integer("total_pairs").notNull(),
  availablePairs: integer("available_pairs").notNull(),
  generationRate: text("generation_rate").notNull(), // pairs per second as decimal
  maxUsage: integer("max_usage").notNull(),
  usageCount: integer("usage_count").default(0),
  
  // Protocol support
  supportedProtocols: jsonb("supported_protocols").notNull(), // Array of QuantumProtocol
  
  // Authentication and encryption
  authMethod: text("auth_method").notNull(), // "quantum_signature", "classical_cert", "hybrid"
  publicKeyA: text("public_key_a").notNull(),
  publicKeyB: text("public_key_b").notNull(),
  trustScore: text("trust_score").notNull(), // decimal as string
  encryptionEnabled: boolean("encryption_enabled").default(true),
  encryptionAlgorithm: text("encryption_algorithm"),
  keyRotationPeriod: integer("key_rotation_period").notNull(), // seconds
  lastKeyRotation: timestamp("last_key_rotation").notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastUsed: timestamp("last_used"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Distributed Sessions - Multi-node quantum computation sessions  
export const distributedSessions = pgTable("distributed_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(), // SessionId brand type as string
  projectId: integer("project_id").references(() => singularisProjects.id),
  coordinatorNodeId: text("coordinator_node_id").notNull(),
  status: text("status").notNull(), // DistributedSessionStatus enum
  
  // Participants
  participantNodes: jsonb("participant_nodes").notNull(), // Set of NodeId
  
  // Capabilities and requirements
  maxNodes: integer("max_nodes").notNull(),
  maxQubits: integer("max_qubits").notNull(),
  supportedProtocols: jsonb("supported_protocols").notNull(), // Set of QuantumProtocol
  minFidelity: text("min_fidelity").notNull(), // decimal as string
  maxLatency: integer("max_latency").notNull(), // milliseconds
  minNodes: integer("min_nodes").notNull(),
  requiredProtocols: jsonb("required_protocols").notNull(), // Set of QuantumProtocol
  fidelityThreshold: text("fidelity_threshold").notNull(), // decimal as string
  latencyThreshold: integer("latency_threshold").notNull(), // milliseconds
  coherenceTime: integer("coherence_time").notNull(), // microseconds
  reliabilityTarget: text("reliability_target").notNull(), // decimal as string
  securityLevel: text("security_level").notNull(), // "public", "restricted", "confidential", "secret", "top_secret"
  
  // Resource allocation
  allocatedResources: jsonb("allocated_resources"), // Map<NodeId, AllocatedResources>
  reservedChannels: jsonb("reserved_channels"), // Set of ChannelId
  globalCoherenceBudget: jsonb("global_coherence_budget"), // CoherenceBudget object
  
  // Time window
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: integer("duration").notNull(), // milliseconds
  bufferTime: integer("buffer_time").notNull(), // milliseconds
  extensions: integer("extensions").default(0),
  maxExtensions: integer("max_extensions").notNull(),
  
  // Security and authentication
  authMethod: text("auth_method").notNull(), // "quantum_id", "classical_pki", "hybrid"
  sessionKey: text("session_key").notNull(),
  keyRotationPeriod: integer("key_rotation_period").notNull(), // seconds
  lastAuthentication: timestamp("last_authentication").notNull(),
  encryptionLevel: text("encryption_level").notNull(), // "none", "classical", "quantum", "hybrid"
  
  // Quality of service
  latencyTarget: integer("latency_target").notNull(), // milliseconds
  throughputTarget: text("throughput_target").notNull(), // operations/sec as decimal
  availabilityTarget: text("availability_target").notNull(), // decimal 0-1
  reliabilityTargetQos: text("reliability_target_qos").notNull(), // decimal 0-1
  fidelityTarget: text("fidelity_target").notNull(), // decimal 0-1
  consistencyLevel: text("consistency_level").notNull(), // "eventual", "strong", "linearizable"
  
  // Monitoring and fault tolerance
  metricsCollection: boolean("metrics_collection").default(true),
  realTimeAlerts: boolean("real_time_alerts").default(true),
  performanceLogging: boolean("performance_logging").default(true),
  securityAuditing: boolean("security_auditing").default(true),
  quantumStateLogging: boolean("quantum_state_logging").default(false),
  networkTracing: boolean("network_tracing").default(false),
  nodeFaultTolerance: integer("node_fault_tolerance").notNull(),
  channelFaultTolerance: integer("channel_fault_tolerance").notNull(),
  automaticRecovery: boolean("automatic_recovery").default(true),
  checkpointFrequency: integer("checkpoint_frequency").notNull(), // seconds
  rollbackCapability: boolean("rollback_capability").default(true),
  gracefulDegradation: boolean("graceful_degradation").default(true),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Distributed Operations - Operations spanning multiple nodes
export const distributedOperations = pgTable("distributed_operations", {
  id: serial("id").primaryKey(),
  operationId: text("operation_id").notNull().unique(),
  sessionId: text("session_id").notNull(),
  type: text("type").notNull(), // DistributedOperationType enum
  status: text("status").notNull(), // DistributedOperationStatus enum
  priority: text("priority").notNull(), // "low", "normal", "high", "critical", "emergency"
  
  // Involved resources
  involvedNodes: jsonb("involved_nodes").notNull(), // Set of NodeId
  requiredChannels: jsonb("required_channels").notNull(), // Set of ChannelId
  sourceStates: jsonb("source_states").notNull(), // Array of QuantumReferenceId
  targetNodes: jsonb("target_nodes").notNull(), // Array of NodeId
  channels: jsonb("channels").notNull(), // Array of ChannelId
  
  // Operation parameters
  fidelityThreshold: text("fidelity_threshold").notNull(), // decimal as string
  timeoutMs: integer("timeout_ms").notNull(),
  additionalParams: jsonb("additional_params"), // Record<string, any>
  
  // Coherence and deadlines
  coherenceBudget: jsonb("coherence_budget").notNull(), // CoherenceBudget object
  deadline: timestamp("deadline").notNull(),
  
  // Preconditions and postconditions
  preconditions: jsonb("preconditions").notNull(), // Array of OperationPrecondition
  postconditions: jsonb("postconditions").notNull(), // Array of OperationPostcondition
  
  // Execution tracking
  phase: text("phase"),
  completionPercent: integer("completion_percent").default(0),
  currentStep: text("current_step"),
  estimatedTimeRemaining: integer("estimated_time_remaining"), // milliseconds
  resourcesUsed: jsonb("resources_used"), // ResourceUsage object
  errors: jsonb("errors"), // Array of DistributedError
  
  // Retry and fallback
  maxRetries: integer("max_retries").notNull(),
  retryCount: integer("retry_count").default(0),
  backoffStrategy: text("backoff_strategy").notNull(), // "linear", "exponential", "adaptive"
  initialDelayMs: integer("initial_delay_ms").notNull(),
  maxDelayMs: integer("max_delay_ms").notNull(),
  retryableErrors: jsonb("retryable_errors").notNull(), // Set of DistributedErrorType
  fallbackStrategy: text("fallback_strategy").notNull(), // "abort", "classical", "degraded", "alternative_path", "wait_and_retry"
  rollbackCapability: boolean("rollback_capability").default(false),
  
  // Results
  result: jsonb("result"), // Operation-specific result object
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  lastUpdate: timestamp("last_update").notNull().defaultNow(),
});

// Quantum Network Topology - Store network topology information
export const quantumNetworkTopology = pgTable("quantum_network_topology", {
  id: serial("id").primaryKey(),
  topologyId: text("topology_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  
  // Topology structure
  type: text("type").notNull(), // "star", "linear", "ring", "mesh", "tree", "custom"
  centralNode: text("central_node"), // for star topology
  adjacencyMatrix: jsonb("adjacency_matrix").notNull(), // Array<Array<boolean>>
  shortestPaths: jsonb("shortest_paths"), // Map<[NodeId, NodeId], Array<NodeId>>
  diameter: integer("diameter").notNull(), // maximum shortest path length
  
  // Network properties
  nodeCount: integer("node_count").notNull(),
  edgeCount: integer("edge_count").notNull(),
  averageLatency: text("average_latency").notNull(), // decimal as string (milliseconds)
  maxLatency: text("max_latency").notNull(), // decimal as string (milliseconds)
  reliability: text("reliability").notNull(), // decimal as string (0-1)
  
  // Fault tolerance
  nodeFaultTolerance: integer("node_fault_tolerance").notNull(),
  edgeFaultTolerance: integer("edge_fault_tolerance").notNull(),
  alternativePaths: jsonb("alternative_paths"), // Map for redundant routing
  
  // Active configuration
  isActive: boolean("is_active").default(false),
  configurationHash: text("configuration_hash").notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Distributed Entanglement Groups - Multi-node entangled quantum systems
export const distributedEntanglementGroups = pgTable("distributed_entanglement_groups", {
  id: serial("id").primaryKey(),
  groupId: text("group_id").notNull().unique(), // EntanglementGroupId brand type as string
  sessionId: text("session_id"),
  operationId: text("operation_id"),
  
  // Group properties
  entanglementType: text("entanglement_type").notNull(), // "bell_state", "ghz_state", "cluster_state", "custom"
  strength: text("strength").notNull(), // decimal as string (0-1)
  coherenceTime: integer("coherence_time").notNull(), // microseconds
  
  // Network distribution
  participatingNodes: jsonb("participating_nodes").notNull(), // Map<NodeId, Array<QuantumReferenceId>>
  topologyType: text("topology_type").notNull(), // "star", "linear", "ring", "mesh", "tree", "custom"
  networkSpan: integer("network_span").notNull(), // maximum distance between nodes
  maxLatency: integer("max_latency").notNull(), // milliseconds
  minFidelity: text("min_fidelity").notNull(), // decimal as string
  coherenceBound: integer("coherence_bound").notNull(), // microseconds
  
  // Consistency and synchronization
  consistencyLevel: text("consistency_level").notNull(), // "weak", "strong", "sequential", "linearizable"
  lastConsistencyCheck: timestamp("last_consistency_check").notNull(),
  inconsistencyCount: integer("inconsistency_count").default(0),
  repairAttempts: integer("repair_attempts").default(0),
  maximumInconsistencyTime: integer("maximum_inconsistency_time").notNull(), // milliseconds
  
  // Clock synchronization
  clockSyncProtocol: text("clock_sync_protocol").notNull(), // "ntp", "ptp", "quantum_clock"
  clockAccuracy: integer("clock_accuracy").notNull(), // nanoseconds
  lastClockSync: timestamp("last_clock_sync").notNull(),
  clockDriftRate: text("clock_drift_rate").notNull(), // decimal as string
  maxClockOffset: integer("max_clock_offset").notNull(), // nanoseconds
  
  // State synchronization
  stateSyncFrequency: text("state_sync_frequency").notNull(), // Hz as decimal
  lastStateSync: timestamp("last_state_sync").notNull(),
  deltaCompression: boolean("delta_compression").default(true),
  checksumVerification: boolean("checksum_verification").default(true),
  conflictResolution: text("conflict_resolution").notNull(), // "last_write_wins", "vector_clock", "quantum_voting"
  
  // Operation ordering
  orderingProtocol: text("ordering_protocol").notNull(), // "lamport", "vector_clock", "quantum_causal"
  globalClock: integer("global_clock").notNull(),
  causalityViolations: integer("causality_violations").default(0),
  pendingOperations: jsonb("pending_operations"), // Array of DistributedOperation
  
  // Fault tolerance
  redundancy: integer("redundancy").notNull(),
  repairCapability: text("repair_capability").notNull(), // "none", "basic", "correcting", "tolerant"
  isolationStrategy: text("isolation_strategy").notNull(), // "abort", "degrade", "isolate", "repair"
  
  // Status
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").notNull().defaultNow(),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// EPR Pairs - Individual EPR pairs within channels
export const eprPairs = pgTable("epr_pairs", {
  id: serial("id").primaryKey(),
  pairId: text("pair_id").notNull().unique(), // QuantumReferenceId as string
  channelId: text("channel_id").notNull(),
  
  // Entangled states
  stateAId: text("state_a_id").notNull(), // QuantumReferenceId on node A
  stateBId: text("state_b_id").notNull(), // QuantumReferenceId on node B
  entanglementType: text("entanglement_type").notNull(), // "bell_state", "maximally_entangled"
  
  // Quality metrics
  fidelity: text("fidelity").notNull(), // decimal as string
  coherenceTime: integer("coherence_time").notNull(), // microseconds
  
  // Usage tracking
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
  usedBy: text("used_by"), // operation ID
  
  // Purification history
  purificationHistory: jsonb("purification_history"), // Array of PurificationStep
  purificationLevel: integer("purification_level").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Distributed Quantum State Registry - Track quantum states across nodes
export const distributedQuantumStates = pgTable("distributed_quantum_states", {
  id: serial("id").primaryKey(),
  stateId: text("state_id").notNull().unique(), // QuantumReferenceId as string
  nodeId: text("node_id").notNull(),
  sessionId: text("session_id"),
  entanglementGroupId: text("entanglement_group_id"),
  
  // State properties
  dimension: integer("dimension").notNull(), // QuantumDimension
  purity: text("purity").notNull(), // "pure", "mixed", "entangled"
  coherence: text("coherence").notNull(), // "coherent", "decoherent", "decohering"
  measurementStatus: text("measurement_status").notNull(), // "unmeasured", "measured", "partial"
  
  // Network properties
  isLocal: boolean("is_local").notNull(),
  networkMetadata: jsonb("network_metadata"), // NetworkMetadata object
  coherenceBudget: jsonb("coherence_budget"), // CoherenceBudget object
  networkPath: jsonb("network_path"), // Array of NodeId
  reliability: text("reliability").notNull(), // decimal as string
  estimatedLifetime: integer("estimated_lifetime").notNull(), // microseconds
  
  // Entanglement relationships
  entangledWith: jsonb("entangled_with"), // Set of QuantumReferenceId
  remoteEntanglements: jsonb("remote_entanglements"), // Map<QuantumReferenceId, NodeId>
  
  // Tracking
  lastInteraction: timestamp("last_interaction").notNull().defaultNow(),
  syncFrequency: integer("sync_frequency").notNull(), // milliseconds
  lastSync: timestamp("last_sync").notNull().defaultNow(),
  
  // Migration history
  migrationHistory: jsonb("migration_history"), // Array of migration records
  originalNode: text("original_node").notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  decoherenceDeadline: timestamp("decoherence_deadline").notNull(),
});

// =============================================================================
// DISTRIBUTED QUANTUM NETWORKS (DQN) INSERT SCHEMAS
// =============================================================================

export const insertDistributedQuantumNodeSchema = createInsertSchema(distributedQuantumNodes).pick({
  nodeId: true,
  name: true,
  networkAddress: true,
  publicKey: true,
  trustLevel: true,
  status: true,
  maxQubits: true,
  availableQubits: true,
  coherenceTime: true,
  fidelityThreshold: true,
  canTeleport: true,
  canPurify: true,
  canSwapEntanglement: true,
  maxEntangledStates: true,
  supportedDimensions: true,
  minFidelity: true,
  maxLatency: true,
  cryptographicProtocols: true,
  lastHeartbeat: true,
  lastAuthenticated: true,
  networkLatency: true,
  connectedNodes: true,
  routingTable: true,
});

export const insertEPRChannelSchema = createInsertSchema(eprChannels).pick({
  channelId: true,
  nodeAId: true,
  nodeBId: true,
  status: true,
  fidelity: true,
  entanglementStrength: true,
  coherenceTime: true,
  errorRate: true,
  purificationLevel: true,
  totalPairs: true,
  availablePairs: true,
  generationRate: true,
  maxUsage: true,
  usageCount: true,
  supportedProtocols: true,
  authMethod: true,
  publicKeyA: true,
  publicKeyB: true,
  trustScore: true,
  encryptionEnabled: true,
  encryptionAlgorithm: true,
  keyRotationPeriod: true,
  lastKeyRotation: true,
  lastUsed: true,
});

export const insertDistributedSessionSchema = createInsertSchema(distributedSessions).pick({
  sessionId: true,
  projectId: true,
  coordinatorNodeId: true,
  status: true,
  participantNodes: true,
  maxNodes: true,
  maxQubits: true,
  supportedProtocols: true,
  minFidelity: true,
  maxLatency: true,
  minNodes: true,
  requiredProtocols: true,
  fidelityThreshold: true,
  latencyThreshold: true,
  coherenceTime: true,
  reliabilityTarget: true,
  securityLevel: true,
  allocatedResources: true,
  reservedChannels: true,
  globalCoherenceBudget: true,
  startTime: true,
  endTime: true,
  duration: true,
  bufferTime: true,
  extensions: true,
  maxExtensions: true,
  authMethod: true,
  sessionKey: true,
  keyRotationPeriod: true,
  lastAuthentication: true,
  encryptionLevel: true,
  latencyTarget: true,
  throughputTarget: true,
  availabilityTarget: true,
  reliabilityTargetQos: true,
  fidelityTarget: true,
  consistencyLevel: true,
  metricsCollection: true,
  realTimeAlerts: true,
  performanceLogging: true,
  securityAuditing: true,
  quantumStateLogging: true,
  networkTracing: true,
  nodeFaultTolerance: true,
  channelFaultTolerance: true,
  automaticRecovery: true,
  checkpointFrequency: true,
  rollbackCapability: true,
  gracefulDegradation: true,
  lastActivity: true,
});

export const insertDistributedOperationSchema = createInsertSchema(distributedOperations).pick({
  operationId: true,
  sessionId: true,
  type: true,
  status: true,
  priority: true,
  involvedNodes: true,
  requiredChannels: true,
  sourceStates: true,
  targetNodes: true,
  channels: true,
  fidelityThreshold: true,
  timeoutMs: true,
  additionalParams: true,
  coherenceBudget: true,
  deadline: true,
  preconditions: true,
  postconditions: true,
  phase: true,
  completionPercent: true,
  currentStep: true,
  estimatedTimeRemaining: true,
  resourcesUsed: true,
  errors: true,
  maxRetries: true,
  retryCount: true,
  backoffStrategy: true,
  initialDelayMs: true,
  maxDelayMs: true,
  retryableErrors: true,
  fallbackStrategy: true,
  rollbackCapability: true,
  result: true,
  startTime: true,
  endTime: true,
  lastUpdate: true,
});

export const insertQuantumNetworkTopologySchema = createInsertSchema(quantumNetworkTopology).pick({
  topologyId: true,
  name: true,
  description: true,
  type: true,
  centralNode: true,
  adjacencyMatrix: true,
  shortestPaths: true,
  diameter: true,
  nodeCount: true,
  edgeCount: true,
  averageLatency: true,
  maxLatency: true,
  reliability: true,
  nodeFaultTolerance: true,
  edgeFaultTolerance: true,
  alternativePaths: true,
  isActive: true,
  configurationHash: true,
});

export const insertDistributedEntanglementGroupSchema = createInsertSchema(distributedEntanglementGroups).pick({
  groupId: true,
  sessionId: true,
  operationId: true,
  entanglementType: true,
  strength: true,
  coherenceTime: true,
  participatingNodes: true,
  topologyType: true,
  networkSpan: true,
  maxLatency: true,
  minFidelity: true,
  coherenceBound: true,
  consistencyLevel: true,
  lastConsistencyCheck: true,
  inconsistencyCount: true,
  repairAttempts: true,
  maximumInconsistencyTime: true,
  clockSyncProtocol: true,
  clockAccuracy: true,
  lastClockSync: true,
  clockDriftRate: true,
  maxClockOffset: true,
  stateSyncFrequency: true,
  lastStateSync: true,
  deltaCompression: true,
  checksumVerification: true,
  conflictResolution: true,
  orderingProtocol: true,
  globalClock: true,
  causalityViolations: true,
  pendingOperations: true,
  redundancy: true,
  repairCapability: true,
  isolationStrategy: true,
  isActive: true,
  lastActivity: true,
});

export const insertEPRPairSchema = createInsertSchema(eprPairs).pick({
  pairId: true,
  channelId: true,
  stateAId: true,
  stateBId: true,
  entanglementType: true,
  fidelity: true,
  coherenceTime: true,
  isUsed: true,
  usedAt: true,
  usedBy: true,
  purificationHistory: true,
  purificationLevel: true,
  expiresAt: true,
});

export const insertDistributedQuantumStateSchema = createInsertSchema(distributedQuantumStates).pick({
  stateId: true,
  nodeId: true,
  sessionId: true,
  entanglementGroupId: true,
  dimension: true,
  purity: true,
  coherence: true,
  measurementStatus: true,
  isLocal: true,
  networkMetadata: true,
  coherenceBudget: true,
  networkPath: true,
  reliability: true,
  estimatedLifetime: true,
  entangledWith: true,
  remoteEntanglements: true,
  lastInteraction: true,
  syncFrequency: true,
  lastSync: true,
  migrationHistory: true,
  originalNode: true,
  decoherenceDeadline: true,
});

// =============================================================================
// DISTRIBUTED QUANTUM NETWORKS (DQN) TYPES
// =============================================================================

export type InsertDistributedQuantumNode = z.infer<typeof insertDistributedQuantumNodeSchema>;
export type DistributedQuantumNode = typeof distributedQuantumNodes.$inferSelect;

export type InsertEPRChannel = z.infer<typeof insertEPRChannelSchema>;
export type EPRChannel = typeof eprChannels.$inferSelect;

export type InsertDistributedSession = z.infer<typeof insertDistributedSessionSchema>;
export type DistributedSession = typeof distributedSessions.$inferSelect;

export type InsertDistributedOperation = z.infer<typeof insertDistributedOperationSchema>;
export type DistributedOperation = typeof distributedOperations.$inferSelect;

export type InsertQuantumNetworkTopology = z.infer<typeof insertQuantumNetworkTopologySchema>;
export type QuantumNetworkTopology = typeof quantumNetworkTopology.$inferSelect;

export type InsertDistributedEntanglementGroup = z.infer<typeof insertDistributedEntanglementGroupSchema>;
export type DistributedEntanglementGroup = typeof distributedEntanglementGroups.$inferSelect;

export type InsertEPRPair = z.infer<typeof insertEPRPairSchema>;
export type EPRPair = typeof eprPairs.$inferSelect;

export type InsertDistributedQuantumState = z.infer<typeof insertDistributedQuantumStateSchema>;
export type DistributedQuantumState = typeof distributedQuantumStates.$inferSelect;

// =============================================================================
// PARADOX RESOLUTION ENGINE SCHEMAS
// =============================================================================

// Paradox Resolution Types
export enum ParadoxResolutionType {
  QUANTUM_INFORMATION = "quantum_information",
  TEMPORAL_LOOP = "temporal_loop",
  CAUSAL_VIOLATION = "causal_violation",
  MEASUREMENT_OBSERVER = "measurement_observer",
  ENTANGLEMENT_CONTRADICTION = "entanglement_contradiction",
  INFORMATION_CONSERVATION = "information_conservation",
  BOOTSTRAP_PARADOX = "bootstrap_paradox",
  SCHRODINGERS_CAT = "schrodingers_cat",
  EPR_PARADOX = "epr_paradox"
}

export enum ParadoxSeverityLevel {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  CRITICAL = "critical",
  FATAL = "fatal"
}

export enum ResolutionStrategyType {
  AUTOMATIC = "automatic",
  STATISTICAL = "statistical",
  QUANTUM_DECOHERENCE = "quantum_decoherence",
  MEASUREMENT_COLLAPSE = "measurement_collapse",
  ROLLBACK = "rollback",
  RECOMPUTE = "recompute",
  HUMAN_OVERSIGHT = "human_oversight",
  GRACEFUL_DEGRADATION = "graceful_degradation",
  MANY_WORLDS_BRANCHING = "many_worlds_branching",
  INFORMATION_PRESERVATION = "information_preservation"
}

// Detected Paradoxes
export const detectedParadoxes = pgTable("detected_paradoxes", {
  id: serial("id").primaryKey(),
  paradoxId: text("paradox_id").notNull().unique(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  type: text("type").notNull(), // ParadoxResolutionType enum
  severity: text("severity").notNull(), // ParadoxSeverityLevel enum
  description: text("description").notNull(),
  
  // Detection context
  detectionMethod: text("detection_method").notNull(),
  sourceLocation: jsonb("source_location"), // {line, column, file}
  codeFragment: text("code_fragment"),
  algorithmicContext: text("algorithmic_context"),
  
  // Affected quantum states
  involvedStates: jsonb("involved_states"), // Array of QuantumReferenceId
  quantumOperations: jsonb("quantum_operations"), // Array of operation traces
  entanglementHistory: jsonb("entanglement_history"), // Array of entanglement events
  measurementHistory: jsonb("measurement_history"), // Array of measurement events
  temporalSequence: jsonb("temporal_sequence"), // Array of temporal events
  
  // Causal analysis
  causalChain: jsonb("causal_chain"), // Array of causal events
  causalViolations: jsonb("causal_violations"), // Array of violations
  lightconeValid: boolean("lightcone_valid").default(true),
  spacelikeEvents: jsonb("spacelike_events"), // Array of spacelike events
  
  // Resolution tracking
  resolved: boolean("resolved").default(false),
  resolutionStrategy: text("resolution_strategy"), // ResolutionStrategyType enum
  resolutionAttempts: integer("resolution_attempts").default(0),
  lastResolutionAttempt: timestamp("last_resolution_attempt"),
  
  // Explainability and oversight
  explainabilityScore: text("explainability_score").notNull(), // decimal as string
  humanOversightRequired: boolean("human_oversight_required").default(false),
  humanOversightCompleted: boolean("human_oversight_completed").default(false),
  oversightUserId: integer("oversight_user_id").references(() => users.id),
  oversightNotes: text("oversight_notes"),
  
  // Metadata
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Paradox Resolution History
export const paradoxResolutions = pgTable("paradox_resolutions", {
  id: serial("id").primaryKey(),
  resolutionId: text("resolution_id").notNull().unique(),
  paradoxId: text("paradox_id").notNull().references(() => detectedParadoxes.paradoxId),
  projectId: integer("project_id").references(() => singularisProjects.id),
  
  // Resolution details
  strategy: text("strategy").notNull(), // ResolutionStrategyType enum
  success: boolean("success").notNull(),
  explanation: text("explanation").notNull(),
  explainabilityScore: text("explainability_score").notNull(), // decimal as string
  
  // Resolution steps
  stepsExecuted: jsonb("steps_executed").notNull(), // Array of resolution steps
  statesModified: jsonb("states_modified"), // Array of QuantumReferenceId
  entanglementChanges: jsonb("entanglement_changes"), // Array of entanglement events
  measurementsCaused: jsonb("measurements_caused"), // Array of measurement events
  
  // Performance metrics
  executionTime: integer("execution_time").notNull(), // milliseconds
  memoryUsed: integer("memory_used").notNull(), // bytes
  quantumOperations: integer("quantum_operations").default(0),
  classicalOperations: integer("classical_operations").default(0),
  
  // Impact assessment
  quantumStatesAffected: integer("quantum_states_affected").default(0),
  entanglementChanged: boolean("entanglement_changed").default(false),
  coherenceLoss: text("coherence_loss").default("0"), // decimal as string
  informationPreserved: boolean("information_preserved").default(true),
  unitarityMaintained: boolean("unitarity_maintained").default(true),
  causalConsistency: boolean("causal_consistency").default(true),
  
  // Rollback information
  rollbackPoints: jsonb("rollback_points"), // Array of rollback points
  rollbackUsed: boolean("rollback_used").default(false),
  rollbackReason: text("rollback_reason"),
  
  // Human oversight
  humanInteractions: integer("human_interactions").default(0),
  humanApprovalRequired: boolean("human_approval_required").default(false),
  humanApprovalReceived: boolean("human_approval_received").default(false),
  approvedBy: integer("approved_by").references(() => users.id),
  approvalNotes: text("approval_notes"),
  
  // Warnings and issues
  warnings: jsonb("warnings"), // Array of resolution warnings
  errors: jsonb("errors"), // Array of resolution errors
  
  // Metadata
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Self-Optimizing Loop Patterns
export const loopOptimizationPatterns = pgTable("loop_optimization_patterns", {
  id: serial("id").primaryKey(),
  patternId: text("pattern_id").notNull().unique(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  
  // Pattern identification
  loopSignature: text("loop_signature").notNull(),
  patternType: text("pattern_type").notNull(), // LoopPatternType enum
  functionName: text("function_name"),
  sourceLocation: jsonb("source_location"), // {line, column, file}
  
  // Loop characteristics
  iterationBounds: jsonb("iteration_bounds").notNull(), // IterationBounds
  convergenceProperties: jsonb("convergence_properties").notNull(), // ConvergenceProperties
  resourcePattern: jsonb("resource_pattern").notNull(), // ResourcePattern
  quantumFeatures: jsonb("quantum_features").notNull(), // QuantumLoopFeatures
  temporalFeatures: jsonb("temporal_features").notNull(), // TemporalFeatures
  complexityMetrics: jsonb("complexity_metrics").notNull(), // ComplexityMetrics
  
  // Optimization opportunities
  optimizationStrategies: jsonb("optimization_strategies"), // Array of strategies
  optimizationRecommendations: jsonb("optimization_recommendations"), // Array of recommendations
  riskAssessment: jsonb("risk_assessment").notNull(), // LoopRiskAssessment
  
  // Performance baselines
  baselineMetrics: jsonb("baseline_metrics"), // LoopPerformanceMetrics
  optimizedMetrics: jsonb("optimized_metrics"), // LoopPerformanceMetrics
  performanceGain: text("performance_gain").default("0"), // decimal as string
  resourceSaving: text("resource_saving").default("0"), // decimal as string
  
  // Pattern recognition confidence
  confidenceScore: text("confidence_score").notNull(), // decimal as string
  detectionMethod: text("detection_method").notNull(),
  patternMatches: integer("pattern_matches").default(1),
  falsePositives: integer("false_positives").default(0),
  
  // Usage tracking
  timesOptimized: integer("times_optimized").default(0),
  lastOptimization: timestamp("last_optimization"),
  averageOptimizationGain: text("average_optimization_gain").default("0"), // decimal as string
  
  // Metadata
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

// Recursive Function Evaluations
export const recursiveEvaluations = pgTable("recursive_evaluations", {
  id: serial("id").primaryKey(),
  evaluationId: text("evaluation_id").notNull().unique(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  
  // Function context
  functionId: text("function_id").notNull(),
  functionName: text("function_name").notNull(),
  recursionType: text("recursion_type").notNull(), // RecursionType enum
  maxDepth: integer("max_depth").notNull(),
  maxDepthReached: integer("max_depth_reached").notNull(),
  
  // Execution context
  parameters: jsonb("parameters").notNull(),
  quantumStates: jsonb("quantum_states"), // Array of QuantumReferenceId
  callSite: jsonb("call_site").notNull(), // CallSite information
  parentEvaluationId: text("parent_evaluation_id"),
  
  // Execution results
  success: boolean("success").notNull(),
  result: jsonb("result"),
  errors: jsonb("errors"), // Array of recursion errors
  
  // Performance metrics
  totalCalls: integer("total_calls").notNull(),
  executionTime: integer("execution_time").notNull(), // milliseconds
  memoryUsage: integer("memory_usage").notNull(), // bytes
  quantumResourceUsage: jsonb("quantum_resource_usage").notNull(), // QuantumResourceUsage
  stackOverflowPrevented: boolean("stack_overflow_prevented").default(false),
  
  // Optimizations applied
  optimizationsApplied: jsonb("optimizations_applied"), // Array of optimizations
  cacheHits: integer("cache_hits").default(0),
  cacheMisses: integer("cache_misses").default(0),
  cacheEfficiency: text("cache_efficiency").default("0"), // decimal as string
  tailCallsOptimized: integer("tail_calls_optimized").default(0),
  
  // Quantum state changes
  quantumStateChanges: jsonb("quantum_state_changes"), // Array of state changes
  coherencePreservation: text("coherence_preservation").default("1.0"), // decimal as string
  entanglementMaintained: boolean("entanglement_maintained").default(true),
  
  // Memoization data
  memoizationUsed: boolean("memoization_used").default(false),
  memoizationKey: text("memoization_key"),
  computationCost: integer("computation_cost").default(0),
  
  // Explainability
  explanation: text("explanation").notNull(),
  explainabilityScore: text("explainability_score").notNull(), // decimal as string
  
  // Metadata
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Quantum Paradox Handler Results
export const quantumParadoxHandlerResults = pgTable("quantum_paradox_handler_results", {
  id: serial("id").primaryKey(),
  handlerResultId: text("handler_result_id").notNull().unique(),
  paradoxId: text("paradox_id").notNull().references(() => detectedParadoxes.paradoxId),
  projectId: integer("project_id").references(() => singularisProjects.id),
  
  // Paradox specifics
  quantumParadoxType: text("quantum_paradox_type").notNull(), // QuantumParadoxType enum
  paradoxData: jsonb("paradox_data").notNull(), // Specific paradox state data
  
  // Resolution details
  resolutionStrategy: text("resolution_strategy").notNull(), // QuantumResolutionStrategy enum
  success: boolean("success").notNull(),
  explanation: text("explanation").notNull(),
  explainabilityScore: text("explainability_score").notNull(), // decimal as string
  
  // Quantum effects
  quantumStateChanges: jsonb("quantum_state_changes"), // Array of quantum state changes
  informationPreserved: boolean("information_preserved").default(true),
  unitarityMaintained: boolean("unitarity_maintained").default(true),
  causalConsistency: boolean("causal_consistency").default(true),
  
  // Schrödinger's Cat specific
  catStates: jsonb("cat_states"), // SchrodingersCatState data
  observationAttempts: jsonb("observation_attempts"), // Array of observation attempts
  collapseEvents: jsonb("collapse_events"), // Array of collapse events
  superpositionResolved: boolean("superposition_resolved").default(false),
  
  // EPR Paradox specific
  eprStates: jsonb("epr_states"), // EPRParadoxState data
  entangledPairs: jsonb("entangled_pairs"), // Array of entangled pairs
  simultaneousMeasurements: jsonb("simultaneous_measurements"), // Array of measurements
  localRealismViolations: jsonb("local_realism_violations"), // Array of violations
  bellInequalityResults: jsonb("bell_inequality_results"), // Array of test results
  
  // Information Paradox specific
  informationFlow: jsonb("information_flow"), // Array of information flow events
  conservationViolations: jsonb("conservation_violations"), // Array of violations
  unitarityTests: jsonb("unitarity_tests"), // Array of unitarity tests
  entanglementEntropy: jsonb("entanglement_entropy"), // Array of entropy measures
  
  // Bootstrap Paradox specific
  informationLoops: jsonb("information_loops"), // Array of information loops
  causalLoops: jsonb("causal_loops"), // Array of causal loops
  selfConsistencyAnalysis: jsonb("self_consistency_analysis"), // SelfConsistencyAnalysis
  retroactiveEffects: jsonb("retroactive_effects"), // Array of retroactive effects
  
  // Performance metrics
  processingTime: integer("processing_time").notNull(), // milliseconds
  quantumResourcesUsed: jsonb("quantum_resources_used"), // QuantumResourceUsage
  classicalResourcesUsed: jsonb("classical_resources_used"), // Classical resource usage
  
  // Human oversight
  humanOversightRequired: boolean("human_oversight_required").default(false),
  humanOversightProvided: boolean("human_oversight_provided").default(false),
  oversightUserId: integer("oversight_user_id").references(() => users.id),
  oversightDecision: text("oversight_decision"), // approve/reject/modify
  oversightReasoning: text("oversight_reasoning"),
  
  // Metadata
  handledAt: timestamp("handled_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Paradox Resolution System Configuration
export const paradoxResolutionConfig = pgTable("paradox_resolution_config", {
  id: serial("id").primaryKey(),
  configId: text("config_id").notNull().unique(),
  projectId: integer("project_id").references(() => singularisProjects.id),
  
  // Detection configuration
  enableRealTimeDetection: boolean("enable_real_time_detection").default(true),
  detectionSensitivity: text("detection_sensitivity").default("high"), // low/medium/high/maximum
  monitoringInterval: integer("monitoring_interval").default(100), // milliseconds
  
  // Resolution thresholds
  autoResolutionThreshold: text("auto_resolution_threshold").default("medium"), // ParadoxSeverityLevel
  humanOversightThreshold: text("human_oversight_threshold").default("high"), // ParadoxSeverityLevel
  explainabilityThreshold: text("explainability_threshold").default("0.85"), // decimal as string
  maxResolutionTime: integer("max_resolution_time").default(30000), // milliseconds
  
  // Loop optimization settings
  enableLoopOptimization: boolean("enable_loop_optimization").default(true),
  optimizationSensitivity: text("optimization_sensitivity").default("moderate"), // conservative/moderate/aggressive
  performanceThreshold: text("performance_threshold").default("0.1"), // decimal as string
  maxOptimizationAttempts: integer("max_optimization_attempts").default(3),
  
  // Recursion settings
  maxRecursionDepth: integer("max_recursion_depth").default(1000),
  enableMemoization: boolean("enable_memoization").default(true),
  enableTailCallOptimization: boolean("enable_tail_call_optimization").default(true),
  memoizationCacheSize: integer("memoization_cache_size").default(1000),
  
  // Quantum specific settings
  enableTemporalLoopDetection: boolean("enable_temporal_loop_detection").default(true),
  enableCausalConsistencyChecking: boolean("enable_causal_consistency_checking").default(true),
  coherencePreservationThreshold: text("coherence_preservation_threshold").default("0.9"), // decimal as string
  quantumStackLimit: integer("quantum_stack_limit").default(100),
  
  // Rollback settings
  rollbackCapacity: integer("rollback_capacity").default(10),
  enableAutoRollback: boolean("enable_auto_rollback").default(true),
  rollbackOnCriticalParadox: boolean("rollback_on_critical_paradox").default(true),
  
  // Notification settings
  notifyOnParadoxDetection: boolean("notify_on_paradox_detection").default(true),
  notifyOnResolutionFailure: boolean("notify_on_resolution_failure").default(true),
  notifyOnHumanOversightRequired: boolean("notify_on_human_oversight_required").default(true),
  
  // Metadata
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  isActive: boolean("is_active").default(true),
});

// Insert schemas for paradox resolution tables
export const insertDetectedParadoxSchema = createInsertSchema(detectedParadoxes).pick({
  paradoxId: true,
  projectId: true,
  type: true,
  severity: true,
  description: true,
  detectionMethod: true,
  sourceLocation: true,
  codeFragment: true,
  algorithmicContext: true,
  involvedStates: true,
  quantumOperations: true,
  entanglementHistory: true,
  measurementHistory: true,
  temporalSequence: true,
  causalChain: true,
  causalViolations: true,
  lightconeValid: true,
  spacelikeEvents: true,
  explainabilityScore: true,
  humanOversightRequired: true,
});

export const insertParadoxResolutionSchema = createInsertSchema(paradoxResolutions).pick({
  resolutionId: true,
  paradoxId: true,
  projectId: true,
  strategy: true,
  success: true,
  explanation: true,
  explainabilityScore: true,
  stepsExecuted: true,
  statesModified: true,
  entanglementChanges: true,
  measurementsCaused: true,
  executionTime: true,
  memoryUsed: true,
  quantumOperations: true,
  classicalOperations: true,
  quantumStatesAffected: true,
  entanglementChanged: true,
  coherenceLoss: true,
  informationPreserved: true,
  unitarityMaintained: true,
  causalConsistency: true,
  rollbackPoints: true,
  humanInteractions: true,
  warnings: true,
  startTime: true,
  endTime: true,
});

export const insertLoopOptimizationPatternSchema = createInsertSchema(loopOptimizationPatterns).pick({
  patternId: true,
  projectId: true,
  loopSignature: true,
  patternType: true,
  functionName: true,
  sourceLocation: true,
  iterationBounds: true,
  convergenceProperties: true,
  resourcePattern: true,
  quantumFeatures: true,
  temporalFeatures: true,
  complexityMetrics: true,
  optimizationStrategies: true,
  optimizationRecommendations: true,
  riskAssessment: true,
  baselineMetrics: true,
  confidenceScore: true,
  detectionMethod: true,
});

export const insertRecursiveEvaluationSchema = createInsertSchema(recursiveEvaluations).pick({
  evaluationId: true,
  projectId: true,
  functionId: true,
  functionName: true,
  recursionType: true,
  maxDepth: true,
  maxDepthReached: true,
  parameters: true,
  quantumStates: true,
  callSite: true,
  parentEvaluationId: true,
  success: true,
  result: true,
  totalCalls: true,
  executionTime: true,
  memoryUsage: true,
  quantumResourceUsage: true,
  optimizationsApplied: true,
  quantumStateChanges: true,
  explanation: true,
  explainabilityScore: true,
  startTime: true,
  endTime: true,
});

export const insertQuantumParadoxHandlerResultSchema = createInsertSchema(quantumParadoxHandlerResults).pick({
  handlerResultId: true,
  paradoxId: true,
  projectId: true,
  quantumParadoxType: true,
  paradoxData: true,
  resolutionStrategy: true,
  success: true,
  explanation: true,
  explainabilityScore: true,
  quantumStateChanges: true,
  informationPreserved: true,
  unitarityMaintained: true,
  causalConsistency: true,
  processingTime: true,
  quantumResourcesUsed: true,
  humanOversightRequired: true,
});

export const insertParadoxResolutionConfigSchema = createInsertSchema(paradoxResolutionConfig).pick({
  configId: true,
  projectId: true,
  enableRealTimeDetection: true,
  detectionSensitivity: true,
  monitoringInterval: true,
  autoResolutionThreshold: true,
  humanOversightThreshold: true,
  explainabilityThreshold: true,
  maxResolutionTime: true,
  enableLoopOptimization: true,
  optimizationSensitivity: true,
  performanceThreshold: true,
  maxOptimizationAttempts: true,
  maxRecursionDepth: true,
  enableMemoization: true,
  enableTailCallOptimization: true,
  memoizationCacheSize: true,
  enableTemporalLoopDetection: true,
  enableCausalConsistencyChecking: true,
  coherencePreservationThreshold: true,
  quantumStackLimit: true,
  rollbackCapacity: true,
  enableAutoRollback: true,
  rollbackOnCriticalParadox: true,
});

// Paradox resolution types
export type InsertDetectedParadox = z.infer<typeof insertDetectedParadoxSchema>;
export type DetectedParadox = typeof detectedParadoxes.$inferSelect;

export type InsertParadoxResolution = z.infer<typeof insertParadoxResolutionSchema>;
export type ParadoxResolution = typeof paradoxResolutions.$inferSelect;

export type InsertLoopOptimizationPattern = z.infer<typeof insertLoopOptimizationPatternSchema>;
export type LoopOptimizationPattern = typeof loopOptimizationPatterns.$inferSelect;

export type InsertRecursiveEvaluation = z.infer<typeof insertRecursiveEvaluationSchema>;
export type RecursiveEvaluation = typeof recursiveEvaluations.$inferSelect;

export type InsertQuantumParadoxHandlerResult = z.infer<typeof insertQuantumParadoxHandlerResultSchema>;
export type QuantumParadoxHandlerResult = typeof quantumParadoxHandlerResults.$inferSelect;

export type InsertParadoxResolutionConfig = z.infer<typeof insertParadoxResolutionConfigSchema>;
export type ParadoxResolutionConfig = typeof paradoxResolutionConfig.$inferSelect;
