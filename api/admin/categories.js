// Unified Admin Categories API endpoint for Vercel
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
    // GET - Fetch all categories
    if (req.method === 'GET') {
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

      console.log(`Retrieved ${categories.length} categories`);
      return res.json(categories);
    }

    // POST - Create new category
    if (req.method === 'POST') {
      const data = req.body;
      
      const [category] = await sql`
        INSERT INTO categories (
          name, slug, description, image_url, show_on_homepage
        ) VALUES (
          ${data.name}, ${data.slug}, ${data.description}, 
          ${data.imageUrl}, ${data.showOnHomepage}
        ) RETURNING *
      `;

      console.log(`Created category: ${category.name}`);
      return res.json(category);
    }

    // DELETE - Delete specific category
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Category ID is required' });
      }

      await sql`DELETE FROM categories WHERE id = ${id}`;
      console.log(`Deleted category: ${id}`);
      return res.json({ message: 'Category deleted successfully' });
    }

    // PUT - Update category
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Category ID is required' });
      }

      const data = req.body;
      
      const [category] = await sql`
        UPDATE categories SET
          name = ${data.name},
          slug = ${data.slug},
          description = ${data.description},
          image_url = ${data.imageUrl},
          show_on_homepage = ${data.showOnHomepage}
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log(`Updated category: ${id}`);
      return res.json(category);
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in categories API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}