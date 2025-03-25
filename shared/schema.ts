import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
});

export const insertCICDAnalysisSchema = createInsertSchema(cicdAnalyses).pick({
  repositoryId: true,
  branch: true,
  commitSha: true,
  status: true,
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
