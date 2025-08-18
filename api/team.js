// Unified Team API endpoint for Vercel
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
    // GET - Fetch all team members
    if (req.method === 'GET') {
      const teamMembers = await sql`
        SELECT 
          id,
          name,
          position,
          bio,
          image_url as "imageUrl",
          display_order as "order",
          active,
          created_at as "createdAt"
        FROM team_members 
        WHERE active = true
        ORDER BY display_order, name
      `;

      console.log(`Retrieved ${teamMembers.length} team members`);
      return res.json(teamMembers);
    }

    // POST - Create new team member
    if (req.method === 'POST') {
      const data = req.body;
      
      const [teamMember] = await sql`
        INSERT INTO team_members (
          name, position, bio, image_url, display_order, active
        ) VALUES (
          ${data.name}, ${data.position}, ${data.bio}, 
          ${data.imageUrl}, ${data.order || 0}, ${data.active !== false}
        ) RETURNING *
      `;

      console.log(`Created team member: ${teamMember.name}`);
      return res.json(teamMember);
    }

    // DELETE - Delete team member
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Team member ID is required' });
      }

      await sql`DELETE FROM team_members WHERE id = ${id}`;
      console.log(`Deleted team member: ${id}`);
      return res.json({ message: 'Team member deleted successfully' });
    }

    // PUT - Update team member
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Team member ID is required' });
      }

      const data = req.body;
      
      const [teamMember] = await sql`
        UPDATE team_members SET
          name = ${data.name},
          position = ${data.position},
          bio = ${data.bio},
          image_url = ${data.imageUrl},
          display_order = ${data.order},
          active = ${data.active}
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log(`Updated team member: ${id}`);
      return res.json(teamMember);
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in team API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}