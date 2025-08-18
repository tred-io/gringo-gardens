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
        id,
        name,
        description,
        price,
        image_url as "imageUrl",
        category_id as "categoryId",
        featured,
        stock,
        created_at as "createdAt"
      FROM products 
      WHERE active = true
      ORDER BY featured DESC, created_at DESC
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