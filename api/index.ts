import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let routesInitialized = false;
let routesPromise: Promise<void> | null = null;

async function initializeRoutes() {
  if (!routesInitialized && !routesPromise) {
    routesPromise = registerRoutes(app).then(() => {
      routesInitialized = true;
      console.log("Routes initialized for Vercel");
    });
  }
  return routesPromise;
}

export default async function handler(req: any, res: any) {
  // Initialize routes once
  await initializeRoutes();
  
  // Handle the request
  app(req, res);
}