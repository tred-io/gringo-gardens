// Business Hours Settings API for Vercel
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    if (req.method === 'GET') {
      // Get business hours setting
      const [setting] = await sql`
        SELECT * FROM settings WHERE key = 'business_hours'
      `;

      if (!setting) {
        // Create default business hours if none exist
        const defaultHours = {
          monday: { open: "09:00", close: "17:00", closed: false },
          tuesday: { open: "09:00", close: "17:00", closed: false },
          wednesday: { open: "09:00", close: "17:00", closed: false },
          thursday: { open: "09:00", close: "17:00", closed: false },
          friday: { open: "09:00", close: "17:00", closed: false },
          saturday: { open: "09:00", close: "15:00", closed: false },
          sunday: { open: "10:00", close: "14:00", closed: false }
        };

        const [newSetting] = await sql`
          INSERT INTO settings (id, key, value)
          VALUES (
            gen_random_uuid(),
            'business_hours',
            ${JSON.stringify(defaultHours)}
          )
          RETURNING *
        `;

        return res.json(newSetting);
      }

      return res.json(setting);
    }

    if (req.method === 'PUT') {
      const { value } = req.body;

      const [setting] = await sql`
        UPDATE settings 
        SET value = ${JSON.stringify(value)}
        WHERE key = 'business_hours'
        RETURNING *
      `;

      if (!setting) {
        return res.status(404).json({ message: 'Setting not found' });
      }

      return res.json(setting);
    }

    return res.status(405).json({ message: 'Method not allowed' });

  } catch (error) {
    console.error('Business hours API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}