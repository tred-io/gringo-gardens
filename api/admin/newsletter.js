// Admin Newsletter Management API endpoint for Vercel
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
          subscribed_at as "subscribedAt",
          active
        FROM newsletter_subscribers 
        ORDER BY subscribed_at DESC
      `;

      console.log(`Retrieved ${subscribers.length} newsletter subscribers`);
      return res.json(subscribers);
    }

    // DELETE - Delete specific subscriber
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Subscriber ID is required' });
      }

      await sql`DELETE FROM newsletter_subscribers WHERE id = ${id}`;
      console.log(`Deleted newsletter subscriber: ${id}`);
      return res.json({ message: 'Subscriber deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in admin newsletter API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}