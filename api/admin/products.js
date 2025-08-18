// Unified Admin Products API endpoint for Vercel
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = neon(process.env.DATABASE_URL);
  const { id } = req.query;

  try {
    // GET - Fetch all products
    if (req.method === 'GET') {
      const products = await sql`
        SELECT 
          id,
          name,
          slug,
          description,
          price,
          image_url as "imageUrl",
          category_id as "categoryId",
          hardiness_zone as "hardinessZone",
          sun_requirements as "sunRequirements",
          stock,
          featured,
          active,
          texas_native as "texasNative",
          drought_tolerance as "droughtTolerance",
          indoor_outdoor as "indoorOutdoor",
          bloom_season as "bloomSeason",
          mature_size as "matureSize",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM products 
        ORDER BY created_at DESC
      `;

      console.log(`Retrieved ${products.length} products`);
      return res.json(products);
    }

    // POST - Create new product
    if (req.method === 'POST') {
      const data = req.body;
      
      const [product] = await sql`
        INSERT INTO products (
          name, slug, description, price, image_url, category_id, 
          hardiness_zone, sun_requirements, stock, featured, active,
          texas_native, drought_tolerance, indoor_outdoor, bloom_season, mature_size
        ) VALUES (
          ${data.name}, ${data.slug}, ${data.description}, ${data.price}, 
          ${data.imageUrl}, ${data.categoryId}, ${data.hardinessZone}, 
          ${data.sunRequirements}, ${data.stock}, ${data.featured}, 
          ${data.active}, ${data.texasNative}, ${data.droughtTolerance},
          ${data.indoorOutdoor}, ${data.bloomSeason}, ${data.matureSize}
        ) RETURNING *
      `;

      console.log(`Created product: ${product.name}`);
      return res.json(product);
    }

    // DELETE - Delete specific product
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      await sql`DELETE FROM products WHERE id = ${id}`;
      console.log(`Deleted product: ${id}`);
      return res.json({ message: 'Product deleted successfully' });
    }

    // PUT - Update product
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      const data = req.body;
      
      const [product] = await sql`
        UPDATE products SET
          name = ${data.name},
          slug = ${data.slug},
          description = ${data.description},
          price = ${data.price},
          image_url = ${data.imageUrl},
          category_id = ${data.categoryId},
          hardiness_zone = ${data.hardinessZone},
          sun_requirements = ${data.sunRequirements},
          stock = ${data.stock},
          featured = ${data.featured},
          active = ${data.active},
          texas_native = ${data.texasNative},
          drought_tolerance = ${data.droughtTolerance},
          indoor_outdoor = ${data.indoorOutdoor},
          bloom_season = ${data.bloomSeason},
          mature_size = ${data.matureSize},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log(`Updated product: ${id}`);
      return res.json(product);
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in products API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}