// Admin Gallery API endpoint for Vercel
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Query all gallery images from the database
    const images = await sql`
      SELECT 
        id,
        title,
        description,
        image_url as "imageUrl",
        category,
        tags,
        featured,
        common_name as "commonName",
        latin_name as "latinName",
        hardiness_zone as "hardinessZone", 
        sun_preference as "sunPreference",
        drought_tolerance as "droughtTolerance",
        texas_native as "texasNative",
        indoor_outdoor as "indoorOutdoor",
        classification,
        ai_description as "aiDescription",
        ai_identified as "aiIdentified",
        created_at as "createdAt"
      FROM gallery_images 
      ORDER BY created_at DESC
    `;

    console.log(`Retrieved ${images.length} gallery images`);
    res.json(images);
    
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch gallery images',
      error: error.message 
    });
  }
}