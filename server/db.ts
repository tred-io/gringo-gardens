import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

// Only use WebSockets in development (not on Vercel serverless)
// Vercel uses HTTP fetch which is built-in to @neondatabase/serverless
if (process.env.NODE_ENV === 'development' && typeof WebSocket === 'undefined') {
  try {
    // @ts-ignore - dynamic import for development only
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws;
  } catch {
    // If ws is not available, Neon will fall back to fetch
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });