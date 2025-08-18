// Public Reviews API endpoint for Vercel
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Fetch approved reviews from database
    const reviews = await sql`
      SELECT 
        id,
        customer_name as "customerName",
        rating,
        content,
        featured,
        created_at as "createdAt"
      FROM reviews 
      WHERE approved = true
      ORDER BY featured DESC, created_at DESC
    `;

    console.log(`Retrieved ${reviews.length} public reviews`);
    return res.json(reviews);
    
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    res.status(500).json({ 
      message: 'Failed to fetch reviews',
      error: error.message 
    });
  }
}