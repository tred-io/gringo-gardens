// Public Settings API endpoint for Vercel - GET /api/settings/[key]
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers + prevent static optimization
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET method allowed for public settings' });
  }

  const sql = neon(process.env.DATABASE_URL);
  const { key } = req.query;

  console.log(`Public settings API [GET] - Key: ${key}`);

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ message: 'Setting key is required' });
  }

  try {
    // GET - Fetch specific public setting
    const [setting] = await sql`
      SELECT 
        id,
        key,
        value,
        updated_at as "updatedAt"
      FROM settings 
      WHERE key = ${key}
    `;

    if (!setting) {
      console.log(`Setting not found: ${key}`);
      return res.status(404).json({ message: 'Setting not found' });
    }

    console.log(`Returning setting: ${key} = ${setting.value.substring(0, 50)}...`);
    return res.json(setting);
    
  } catch (error) {
    console.error('Error in public settings API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Prevent static optimization - forces dynamic behavior in production
export const config = {
  runtime: 'nodejs20.x',
};