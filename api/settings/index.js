// Public Settings List API endpoint for Vercel - GET /api/settings
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

  console.log('Public settings list API [GET] - Fetching all public settings');

  try {
    // GET - Fetch all public settings (non-sensitive ones)
    const settings = await sql`
      SELECT 
        id,
        key,
        value,
        updated_at as "updatedAt"
      FROM settings 
      WHERE key IN ('business_hours', 'temporary_closure', 'contact_info', 'service_areas')
      ORDER BY key
    `;
    
    console.log(`Returning ${settings.length} public settings`);
    return res.json(settings);
    
  } catch (error) {
    console.error('Error in public settings list API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Prevent static optimization
export const config = {
  runtime: 'nodejs',
  regions: ['iad1'],
};