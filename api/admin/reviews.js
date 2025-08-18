// Unified Admin Reviews API endpoint for Vercel
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
    // GET - Fetch all reviews
    if (req.method === 'GET') {
      const reviews = await sql`
        SELECT 
          id,
          customer_name as "customerName",
          rating,
          content,
          approved,
          featured,
          created_at as "createdAt"
        FROM reviews 
        ORDER BY created_at DESC
      `;

      console.log(`Retrieved ${reviews.length} reviews`);
      return res.json(reviews);
    }

    // POST - Create new review
    if (req.method === 'POST') {
      const data = req.body;
      
      const [review] = await sql`
        INSERT INTO reviews (
          customer_name, rating, content, approved, featured
        ) VALUES (
          ${data.customerName}, ${data.rating}, ${data.content}, 
          ${data.approved}, ${data.featured}
        ) RETURNING *
      `;

      console.log(`Created review: ${review.customer_name}`);
      return res.json(review);
    }

    // DELETE - Delete specific review
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Review ID is required' });
      }

      await sql`DELETE FROM reviews WHERE id = ${id}`;
      console.log(`Deleted review: ${id}`);
      return res.json({ message: 'Review deleted successfully' });
    }

    // PUT - Update review
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Review ID is required' });
      }

      const data = req.body;
      
      const [review] = await sql`
        UPDATE reviews SET
          customer_name = ${data.customerName},
          rating = ${data.rating},
          content = ${data.content},
          approved = ${data.approved},
          featured = ${data.featured}
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log(`Updated review: ${id}`);
      return res.json(review);
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in reviews API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}