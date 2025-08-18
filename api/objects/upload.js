// Vercel API route for object storage upload URLs
// This file handles POST /api/objects/upload for Vercel deployment

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For Vercel deployment, object storage is not available
    // Return a placeholder response that indicates the feature is unavailable
    res.status(503).json({ 
      error: 'Object storage not available in Vercel deployment',
      message: 'Please use external image hosting (like Unsplash URLs) for gallery images in the deployed version'
    });

  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}