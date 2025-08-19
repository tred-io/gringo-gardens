// Individual Category API endpoint for Vercel - handles path parameter routing
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

  if (!id) {
    return res.status(400).json({ message: 'Category ID is required' });
  }

  try {
    // GET - Fetch specific category
    if (req.method === 'GET') {
      const [category] = await sql`
        SELECT 
          id,
          name,
          slug,
          description,
          image_url as "imageUrl",
          show_on_homepage as "showOnHomepage",
          created_at as "createdAt"
        FROM categories 
        WHERE id = ${id}
      `;

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      console.log(`Retrieved category: ${category.name}`);
      return res.json(category);
    }

    // PUT - Update category
    if (req.method === 'PUT') {
      const data = req.body;
      
      const [category] = await sql`
        UPDATE categories SET
          name = ${data.name},
          slug = ${data.slug},
          description = ${data.description},
          image_url = ${data.imageUrl},
          show_on_homepage = ${data.showOnHomepage}
        WHERE id = ${id}
        RETURNING 
          id,
          name,
          slug,
          description,
          image_url as "imageUrl",
          show_on_homepage as "showOnHomepage",
          created_at as "createdAt"
      `;

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      console.log(`Updated category: ${id}`);
      return res.json(category);
    }

    // DELETE - Delete specific category
    if (req.method === 'DELETE') {
      const [category] = await sql`
        SELECT id FROM categories WHERE id = ${id}
      `;

      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }

      await sql`DELETE FROM categories WHERE id = ${id}`;
      console.log(`Deleted category: ${id}`);
      return res.json({ message: 'Category deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in category API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}