// Vercel API route for object storage upload URLs
// This file handles POST /api/objects/upload for Vercel deployment using Vercel Blob

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
    // Check if Vercel Blob is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({ 
        error: 'Vercel Blob storage not configured',
        message: 'BLOB_READ_WRITE_TOKEN environment variable is required'
      });
    }

    // For Vercel Blob, we return a fully qualified upload endpoint URL
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const uploadUrl = `${protocol}://${host}/api/blob/upload`;
    
    res.json({ 
      uploadURL: uploadUrl,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      message: 'Upload your file to this endpoint using PUT method'
    });

  } catch (error) {
    console.error('Error in upload endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}