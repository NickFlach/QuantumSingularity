import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof singularisProjects.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof singularisFiles.$inferSelect;

export type InsertQuantumSimulation = z.infer<typeof insertQuantumSimulationSchema>;
export type QuantumSimulation = typeof quantumSimulations.$inferSelect;

export type InsertAINegotiation = z.infer<typeof insertAINegotiationSchema>;
export type AINegotiation = typeof aiNegotiations.$inferSelect;
