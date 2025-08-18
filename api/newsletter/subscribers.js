// Unified Newsletter Subscribers API endpoint for Vercel
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
    // GET - Fetch all newsletter subscribers
    if (req.method === 'GET') {
      const subscribers = await sql`
        SELECT 
          id,
          email,
          active,
          created_at as "createdAt"
        FROM newsletter_subscribers 
        ORDER BY created_at DESC
      `;

      console.log(`Retrieved ${subscribers.length} newsletter subscribers`);
      return res.json(subscribers);
    }

    // POST - Create new subscriber
    if (req.method === 'POST') {
      const data = req.body;
      
      const [subscriber] = await sql`
        INSERT INTO newsletter_subscribers (email, active) 
        VALUES (${data.email}, ${data.active !== false})
        RETURNING *
      `;

      console.log(`Created newsletter subscriber: ${subscriber.email}`);
      return res.json(subscriber);
    }

    // DELETE - Delete subscriber
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Subscriber ID is required' });
      }

      await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
      console.log(`Deleted newsletter subscriber: ${id}`);
      return res.json({ message: 'Newsletter subscriber deleted successfully' });
    }

    // PUT - Update subscriber (toggle active status)
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Subscriber ID is required' });
      }

      const data = req.body;
      
      const [subscriber] = await sql`
        UPDATE newsletter_subscribers SET
          email = ${data.email},
          active = ${data.active}
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log(`Updated newsletter subscriber: ${id}`);
      return res.json(subscriber);
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in newsletter API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}