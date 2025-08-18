// Public Categories API endpoint for Vercel
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

  try {
    // Fetch categories from database
    const categories = await sql`
      SELECT 
        id,
        name,
        slug,
        description,
        image_url as "imageUrl",
        show_on_homepage as "showOnHomepage",
        created_at as "createdAt"
      FROM categories 
      ORDER BY name
    `;

    console.log(`Retrieved ${categories.length} public categories`);
    return res.json(categories);
    
  } catch (error) {
    console.error('Error fetching public categories:', error);
    res.status(500).json({ 
      message: 'Failed to fetch categories',
      error: error.message 
    });
  }
}