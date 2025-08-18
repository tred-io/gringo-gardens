// Unified Admin Contact API endpoint for Vercel
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
  const { id, action } = req.query;

  try {
    // GET - Fetch all contact messages
    if (req.method === 'GET') {
      const messages = await sql`
        SELECT 
          id,
          name,
          email,
          message,
          read,
          created_at as "createdAt"
        FROM contact_messages 
        ORDER BY created_at DESC
      `;

      console.log(`Retrieved ${messages.length} contact messages`);
      return res.json(messages);
    }

    // POST - Handle actions (like marking as read)
    if (req.method === 'POST') {
      if (!id) {
        return res.status(400).json({ message: 'Contact message ID is required' });
      }

      // Mark as read action
      if (action === 'read') {
        await sql`
          UPDATE contact_messages SET read = true WHERE id = ${id}
        `;
        
        console.log(`Marked contact message as read: ${id}`);
        return res.json({ message: 'Contact message marked as read' });
      }

      return res.status(400).json({ message: 'Invalid action' });
    }

    // DELETE - Delete contact message
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Contact message ID is required' });
      }

      await sql`DELETE FROM contact_messages WHERE id = ${id}`;
      console.log(`Deleted contact message: ${id}`);
      return res.json({ message: 'Contact message deleted successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in contact API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}