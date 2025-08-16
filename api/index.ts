import express, { type Request, type Response } from "express";
import { registerRoutes } from "../server/routes";

// Create app instance
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Global app instance to reuse across requests
let appInitialized = false;

async function initializeApp() {
  if (!appInitialized) {
    try {
      console.log("Initializing routes for Vercel...");
      await registerRoutes(app);
      appInitialized = true;
      console.log("Routes initialized successfully");
    } catch (error) {
      console.error("Failed to initialize routes:", error);
      throw error;
    }
  }
}

// Vercel serverless function handler
export default async function handler(req: Request, res: Response) {
  try {
    console.log(`API Request: ${req.method} ${req.url}`);
    
    // Initialize app if needed
    await initializeApp();
    
    // Set CORS headers for API requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Process the request through Express app
    app(req, res);
  } catch (error) {
    console.error("Handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}