// Unified Individual Settings API endpoint for Vercel
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = neon(process.env.DATABASE_URL);
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({ message: 'Setting key is required' });
  }

  try {
    // GET - Fetch specific setting
    if (req.method === 'GET') {
      const [setting] = await sql`
        SELECT 
          id,
          key,
          value,
          created_at as "createdAt"
        FROM settings 
        WHERE key = ${key}
      `;

      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }

      return res.json(setting);
    }

    // PUT - Update setting
    if (req.method === 'PUT') {
      const { value } = req.body;
      
      // Upsert setting (update if exists, insert if not)
      const [setting] = await sql`
        INSERT INTO settings (key, value) 
        VALUES (${key}, ${value})
        ON CONFLICT (key) 
        DO UPDATE SET value = EXCLUDED.value
        RETURNING *
      `;
      
      console.log(`Updated setting: ${key}`);
      return res.json(setting);
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in settings API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}