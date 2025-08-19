// Public Products API endpoint for Vercel
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
    // Fetch active products from database
    const products = await sql`
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.image_url as "imageUrl",
        p.category_id as "categoryId",
        c.name as "categoryName",
        p.hardiness_zone as "hardinessZone",
        p.sun_requirements as "sunRequirements",
        p.stock,
        p.featured,
        p.texas_native as "texasNative",
        p.drought_tolerance as "droughtTolerance",
        p.indoor_outdoor as "indoorOutdoor",
        p.bloom_season as "bloomSeason",
        p.mature_size as "matureSize",
        p.created_at as "createdAt"
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.active = true
      ORDER BY p.featured DESC, p.created_at DESC
    `;

    console.log(`Retrieved ${products.length} public products`);
    return res.json(products);
    
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
}