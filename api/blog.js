// Public Blog API endpoint for Vercel
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
    // Fetch published blog posts from database
    const blogPosts = await sql`
      SELECT 
        id,
        title,
        slug,
        excerpt,
        content,
        image_url as "imageUrl",
        category,
        read_time as "readTime",
        published,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM blog_posts 
      WHERE published = true
      ORDER BY created_at DESC
    `;

    console.log(`Retrieved ${blogPosts.length} public blog posts`);
    return res.json(blogPosts);
    
  } catch (error) {
    console.error('Error fetching public blog posts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch blog posts',
      error: error.message 
    });
  }
}