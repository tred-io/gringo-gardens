// Admin Settings List API endpoint for Vercel - GET /api/admin/settings
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Get all settings
    const settings = await sql`
      SELECT 
        id,
        key,
        value,
        updated_at as "updatedAt"
      FROM settings 
      ORDER BY key
    `;

    console.log(`Retrieved ${settings.length} settings`);
    return res.json(settings);
    
  } catch (error) {
    console.error('Error in settings list API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
