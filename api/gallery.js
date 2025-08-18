// Public Gallery API endpoint for Vercel
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);
  const { featured } = req.query;

  try {
    let query;
    
    if (featured === 'true') {
      // Fetch only featured gallery images
      query = sql`
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
          ai_description as "aiDescription",
          ai_identified as "aiIdentified",
          created_at as "createdAt"
        FROM gallery_images 
        WHERE featured = true
        ORDER BY created_at DESC
      `;
    } else {
      // Fetch all gallery images
      query = sql`
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
          ai_description as "aiDescription",
          ai_identified as "aiIdentified",
          created_at as "createdAt"
        FROM gallery_images 
        ORDER BY featured DESC, created_at DESC
      `;
    }

    const galleryImages = await query;

    console.log(`Retrieved ${galleryImages.length} public gallery images${featured === 'true' ? ' (featured only)' : ''}`);
    return res.json(galleryImages);
    
  } catch (error) {
    console.error('Error fetching public gallery images:', error);
    res.status(500).json({ 
      message: 'Failed to fetch gallery images',
      error: error.message 
    });
  }
}