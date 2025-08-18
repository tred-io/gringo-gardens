// Public Newsletter Subscription API endpoint for Vercel
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const { email } = req.body;

    // Validate email field
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Please enter a valid email address' 
      });
    }

    // Check if email already exists
    const [existingSubscriber] = await sql`
      SELECT id FROM newsletter_subscribers WHERE email = ${email}
    `;

    if (existingSubscriber) {
      return res.status(409).json({ 
        message: 'Email already subscribed to newsletter' 
      });
    }

    // Save newsletter subscription to database
    const [subscriber] = await sql`
      INSERT INTO newsletter_subscribers (email, active) 
      VALUES (${email}, true)
      RETURNING id, email
    `;

    console.log(`Newsletter subscription added: ${subscriber.email}`);
    return res.json({ 
      message: 'Successfully subscribed to newsletter!',
      id: subscriber.id 
    });
    
  } catch (error) {
    console.error('Error saving newsletter subscription:', error);
    res.status(500).json({ 
      message: 'Failed to subscribe to newsletter',
      error: error.message 
    });
  }
}