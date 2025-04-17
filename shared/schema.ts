import { pgTable, text, serial, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Define diagram schema
export const diagrams = pgTable("diagrams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  xml: text("xml").notNull(),
  svg: text("svg"),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  metadata: jsonb("metadata")
});

export const insertDiagramSchema = createInsertSchema(diagrams).pick({
  name: true,
  description: true,
  xml: true,
  svg: true,
  userId: true,
  isPublic: true,
  metadata: true,
});

export const updateDiagramSchema = createInsertSchema(diagrams).pick({
  name: true,
  description: true,
  xml: true,
  svg: true,
  isPublic: true,
  metadata: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDiagram = z.infer<typeof insertDiagramSchema>;
export type UpdateDiagram = z.infer<typeof updateDiagramSchema>;
export type Diagram = typeof diagrams.$inferSelect;
