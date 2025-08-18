// Public Contact Form API endpoint for Vercel
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
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: 'Name, email, and message are required' 
      });
    }

    // Save contact message to database
    const [contactMessage] = await sql`
      INSERT INTO contact_messages (name, email, message, read) 
      VALUES (${name}, ${email}, ${message}, false)
      RETURNING id
    `;

    console.log(`Contact message saved: ${contactMessage.id}`);
    return res.json({ 
      message: 'Message sent successfully',
      id: contactMessage.id 
    });
    
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ 
      message: 'Failed to send message',
      error: error.message 
    });
  }
}