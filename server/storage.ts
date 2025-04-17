import { 
  users, type User, type InsertUser, 
  diagrams, type Diagram, type InsertDiagram, type UpdateDiagram 
} from "@shared/schema";

// Storage interface for our application
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Diagram operations
  getDiagram(id: number): Promise<Diagram | undefined>;
  getDiagrams(userId?: number): Promise<Diagram[]>;
  createDiagram(diagram: InsertDiagram): Promise<Diagram>;
  updateDiagram(id: number, diagram: UpdateDiagram): Promise<Diagram | undefined>;
  deleteDiagram(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private diagrams: Map<number, Diagram>;
  private userCurrentId: number;
  private diagramCurrentId: number;

  constructor() {
    this.users = new Map();
    this.diagrams = new Map();
    this.userCurrentId = 1;
    this.diagramCurrentId = 1;
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
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Diagram operations
  async getDiagram(id: number): Promise<Diagram | undefined> {
    return this.diagrams.get(id);
  }

  async getDiagrams(userId?: number): Promise<Diagram[]> {
    if (userId) {
      return Array.from(this.diagrams.values()).filter(
        (diagram) => diagram.userId === userId || diagram.isPublic
      );
    }
    return Array.from(this.diagrams.values());
  }

  async createDiagram(insertDiagram: InsertDiagram): Promise<Diagram> {
    const id = this.diagramCurrentId++;
    const now = new Date();
    const diagram: Diagram = { 
      ...insertDiagram, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.diagrams.set(id, diagram);
    return diagram;
  }

  async updateDiagram(id: number, updateDiagram: UpdateDiagram): Promise<Diagram | undefined> {
    const existingDiagram = this.diagrams.get(id);
    if (!existingDiagram) return undefined;

    const updatedDiagram: Diagram = {
      ...existingDiagram,
      ...updateDiagram,
      id,
      updatedAt: new Date()
    };
    
    this.diagrams.set(id, updatedDiagram);
    return updatedDiagram;
  }

  async deleteDiagram(id: number): Promise<boolean> {
    return this.diagrams.delete(id);
  }
}

export const storage = new MemStorage();
