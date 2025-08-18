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
          description,
          price,
          image_url as "imageUrl",
          category_id as "categoryId",
          featured,
          active,
          stock_quantity as "stockQuantity",
          created_at as "createdAt"
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
          name, description, price, image_url, category_id, 
          featured, active, stock_quantity
        ) VALUES (
          ${data.name}, ${data.description}, ${data.price}, 
          ${data.imageUrl}, ${data.categoryId}, ${data.featured}, 
          ${data.active}, ${data.stockQuantity}
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
          description = ${data.description},
          price = ${data.price},
          image_url = ${data.imageUrl},
          category_id = ${data.categoryId},
          featured = ${data.featured},
          active = ${data.active},
          stock_quantity = ${data.stockQuantity}
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