import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDiagramSchema, updateDiagramSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for diagrams
  
  // Get all diagrams
  app.get("/api/diagrams", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;
      const diagrams = await storage.getDiagrams(userId);
      res.json(diagrams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diagrams" });
    }
  });

  // Get a specific diagram
  app.get("/api/diagrams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const diagram = await storage.getDiagram(id);
      
      if (!diagram) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      
      res.json(diagram);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diagram" });
    }
  });

  // Create a new diagram
  app.post("/api/diagrams", async (req, res) => {
    try {
      const validatedData = insertDiagramSchema.parse(req.body);
      const diagram = await storage.createDiagram(validatedData);
      res.status(201).json(diagram);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid diagram data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to create diagram" });
    }
  });

  // Update an existing diagram
  app.put("/api/diagrams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateDiagramSchema.parse(req.body);
      
      const updatedDiagram = await storage.updateDiagram(id, validatedData);
      
      if (!updatedDiagram) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      
      res.json(updatedDiagram);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid diagram data", errors: error.format() });
      }
      res.status(500).json({ message: "Failed to update diagram" });
    }
  });

  // Delete a diagram
  app.delete("/api/diagrams/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await storage.deleteDiagram(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Diagram not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete diagram" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
