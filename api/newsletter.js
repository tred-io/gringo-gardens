// Newsletter API endpoint for Vercel
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

  try {
    // POST - Subscribe to newsletter
    if (req.method === 'POST') {
      const { email } = req.body;
      
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Valid email is required' });
      }

      // Check if already subscribed
      const [existing] = await sql`
        SELECT id FROM newsletter_subscribers WHERE email = ${email}
      `;

      if (existing) {
        return res.json({ message: 'Email already subscribed' });
      }

      const [subscriber] = await sql`
        INSERT INTO newsletter_subscribers (email, subscribed_at)
        VALUES (${email}, NOW())
        RETURNING id, email, subscribed_at as "subscribedAt"
      `;

      console.log(`Newsletter subscription: ${email}`);
      return res.json({
        message: 'Successfully subscribed to newsletter',
        subscriber
      });
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