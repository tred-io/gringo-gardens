// Unified Admin Blog API endpoint for Vercel
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
    // GET - Fetch all blog posts
    if (req.method === 'GET') {
      const posts = await sql`
        SELECT 
          id,
          title,
          slug,
          content,
          excerpt,
          image_url as "imageUrl",
          category,
          published,
          read_time as "readTime",
          author_id as "authorId",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM blog_posts 
        ORDER BY created_at DESC
      `;

      console.log(`Retrieved ${posts.length} blog posts`);
      return res.json(posts);
    }

    // POST - Create new blog post
    if (req.method === 'POST') {
      const data = req.body;
      
      const [post] = await sql`
        INSERT INTO blog_posts (
          title, slug, content, excerpt, image_url, 
          category, published, read_time, author_id
        ) VALUES (
          ${data.title}, ${data.slug}, ${data.content}, 
          ${data.excerpt}, ${data.imageUrl}, ${data.category}, 
          ${data.published}, ${data.readTime}, ${data.authorId}
        ) RETURNING *
      `;

      console.log(`Created blog post: ${post.title}`);
      return res.json(post);
    }

    // DELETE - Delete specific blog post
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Blog post ID is required' });
      }

      await sql`DELETE FROM blog_posts WHERE id = ${id}`;
      console.log(`Deleted blog post: ${id}`);
      return res.json({ message: 'Blog post deleted successfully' });
    }

    // PUT - Update blog post
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Blog post ID is required' });
      }

      const data = req.body;
      
      const [post] = await sql`
        UPDATE blog_posts SET
          title = ${data.title},
          slug = ${data.slug},
          content = ${data.content},
          excerpt = ${data.excerpt},
          image_url = ${data.imageUrl},
          category = ${data.category},
          published = ${data.published},
          read_time = ${data.readTime},
          author_id = ${data.authorId},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      
      console.log(`Updated blog post: ${id}`);
      return res.json(post);
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in blog API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}