import type { Express, Request, Response } from "express";
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

  // ======= Mock API endpoints for the dynamic property panel system =======
  
  // Service operations API - for dynamic dropdowns based on selected endpoint
  app.get("/api/services", (req: Request, res: Response) => {
    const endpoint = req.query.endpoint as string || '';
    
    // Simulate a slight delay to demonstrate loading states
    setTimeout(() => {
      // Return different operations based on the endpoint
      if (!endpoint || endpoint.trim() === '') {
        res.status(200).json([]);
      } else if (endpoint.includes('payment')) {
        res.status(200).json([
          { id: 'process_payment', name: 'Process Payment', deprecated: false },
          { id: 'refund_payment', name: 'Refund Payment', deprecated: false },
          { id: 'verify_payment', name: 'Verify Payment', deprecated: false }
        ]);
      } else if (endpoint.includes('notification')) {
        res.status(200).json([
          { id: 'send_email', name: 'Send Email', deprecated: false },
          { id: 'send_sms', name: 'Send SMS', deprecated: false },
          { id: 'send_push', name: 'Send Push Notification', deprecated: true }
        ]);
      } else if (endpoint.includes('order')) {
        res.status(200).json([
          { id: 'create_order', name: 'Create Order', deprecated: false },
          { id: 'update_order', name: 'Update Order', deprecated: false },
          { id: 'cancel_order', name: 'Cancel Order', deprecated: false },
          { id: 'ship_order', name: 'Ship Order', deprecated: false }
        ]);
      } else {
        // Default operations for any other endpoints
        res.status(200).json([
          { id: 'get_data', name: 'Get Data', deprecated: false },
          { id: 'update_data', name: 'Update Data', deprecated: false },
          { id: 'delete_data', name: 'Delete Data', deprecated: false }
        ]);
      }
    }, 500); // 500ms delay
  });
  
  // Users endpoint - for dynamic user assignment dropdowns
  app.get("/api/users/search", (req: Request, res: Response) => {
    const query = (req.query.q as string || '').toLowerCase();
    
    // Simulate user search based on query
    const allUsers = [
      { id: 'user1', name: 'John Smith', role: 'admin' },
      { id: 'user2', name: 'Jane Doe', role: 'manager' },
      { id: 'user3', name: 'Michael Johnson', role: 'developer' },
      { id: 'user4', name: 'Sarah Williams', role: 'designer' },
      { id: 'user5', name: 'Robert Brown', role: 'analyst' }
    ];
    
    // Filter users based on query
    const filteredUsers = query
      ? allUsers.filter(user => 
          user.name.toLowerCase().includes(query) || 
          user.id.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
        )
      : allUsers;
    
    setTimeout(() => {
      res.status(200).json(filteredUsers);
    }, 300);
  });
  
  // Roles endpoint - for role assignment dropdowns
  app.get("/api/roles", (req: Request, res: Response) => {
    setTimeout(() => {
      res.status(200).json([
        { id: 'admin', name: 'Administrator' },
        { id: 'manager', name: 'Manager' },
        { id: 'developer', name: 'Developer' },
        { id: 'designer', name: 'Designer' },
        { id: 'analyst', name: 'Analyst' },
        { id: 'qa', name: 'Quality Assurance' }
      ]);
    }, 300);
  });
  
  // Process variables endpoint - for dynamic process variables in expressions
  app.get("/api/process/variables", (req: Request, res: Response) => {
    const processId = req.query.processId as string;
    
    // Return different variables based on the process ID
    setTimeout(() => {
      if (processId === 'order_process') {
        res.status(200).json([
          { name: 'orderId', type: 'string' },
          { name: 'orderAmount', type: 'number' },
          { name: 'customer', type: 'object' },
          { name: 'items', type: 'array' },
          { name: 'approved', type: 'boolean' }
        ]);
      } else if (processId === 'payment_process') {
        res.status(200).json([
          { name: 'paymentId', type: 'string' },
          { name: 'amount', type: 'number' },
          { name: 'currency', type: 'string' },
          { name: 'paymentMethod', type: 'string' },
          { name: 'successful', type: 'boolean' }
        ]);
      } else {
        res.status(200).json([
          { name: 'id', type: 'string' },
          { name: 'name', type: 'string' },
          { name: 'value', type: 'number' },
          { name: 'status', type: 'string' },
          { name: 'complete', type: 'boolean' }
        ]);
      }
    }, 400);
  });
  
  // XML validation endpoint - simulates checking XML validity
  app.post("/api/xml/validate", (req: Request, res: Response) => {
    const { xml } = req.body;
    
    if (!xml) {
      return res.status(400).json({ valid: false, errors: ["No XML provided"] });
    }
    
    // Very simple validation just for demonstration
    if (!xml.includes('<?xml')) {
      return res.status(200).json({ 
        valid: false, 
        errors: ["Missing XML declaration"]
      });
    }
    
    if (xml.includes('<invalid>')) {
      return res.status(200).json({ 
        valid: false, 
        errors: ["Found invalid element: <invalid>"]
      });
    }
    
    // Simulate longer processing for complex XML
    setTimeout(() => {
      res.status(200).json({ valid: true });
    }, xml.length > 1000 ? 800 : 300);
  });
  
  // Custom model endpoint - returns different models based on useCustom parameter
  app.get("/api/custom-models", (req: Request, res: Response) => {
    const useCustom = req.query.useCustom === 'true';
    
    setTimeout(() => {
      if (useCustom) {
        // Return custom models if useCustom is true
        res.status(200).json([
          { id: 'CustomOrder', name: 'Custom Order', description: 'Custom order model' },
          { id: 'CustomInvoice', name: 'Custom Invoice', description: 'Custom invoice model' },
          { id: 'CustomReceipt', name: 'Custom Receipt', description: 'Custom receipt model' },
          { id: 'CustomRequest', name: 'Custom Request', description: 'Custom request model' },
          { id: 'CustomForm', name: 'Custom Form', description: 'Custom form model' },
        ]);
      } else {
        // Return real models if useCustom is false
        res.status(200).json([
          { id: 'Order', name: 'Order', description: 'Order management model' },
          { id: 'Invoice', name: 'Invoice', description: 'Invoice management model' },
          { id: 'Receipt', name: 'Receipt', description: 'Receipt management model' },
          { id: 'Request', name: 'Request', description: 'Request management model' },
          { id: 'Form', name: 'Form', description: 'Form management model' },
          { id: 'User', name: 'User', description: 'User management model' },
          { id: 'Product', name: 'Product', description: 'Product management model' },
        ]);
      }
    }, 300);
  });

  const httpServer = createServer(app);

  return httpServer;
}
