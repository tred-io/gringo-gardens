// Static Admin Settings Update API endpoint for Vercel
// Handles PUT /api/admin/settings-update?key=temporary_closure
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers + prevent static optimization
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: `Method ${req.method} not allowed - use PUT` });
  }

  const sql = neon(process.env.DATABASE_URL);
  const { key } = req.query;

  console.log(`Settings Update API [PUT] - Key: ${key}, Body:`, req.body);

  if (!key) {
    return res.status(400).json({ message: 'Setting key is required in query parameter' });
  }

  try {
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ message: 'Value is required' });
    }
    
    // Upsert setting (update if exists, insert if not)
    const [setting] = await sql`
      INSERT INTO settings (key, value, updated_at) 
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW()
      RETURNING 
        id,
        key,
        value,
        updated_at as "updatedAt"
    `;
    
    console.log(`Updated admin setting via static route: ${key} = ${value}`);
    return res.json(setting);
    
  } catch (error) {
    console.error('Error in admin settings update API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Force dynamic behavior - no static optimization
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  runtime: 'nodejs',
};