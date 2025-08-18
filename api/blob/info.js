// Vercel API route for getting blob information
// This file handles GET /api/blob/info?objectName=... to retrieve blob URLs

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { objectName } = req.query;
    
    if (!objectName || typeof objectName !== 'string') {
      return res.status(400).json({ 
        error: 'Missing or invalid objectName parameter',
        message: 'objectName query parameter is required'
      });
    }

    // Check if Vercel Blob is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(503).json({ 
        error: 'Vercel Blob storage not configured',
        message: 'BLOB_READ_WRITE_TOKEN environment variable is required'
      });
    }

    console.log('Getting blob info for object:', objectName);

    // For Vercel Blob, construct the public URL
    // The pattern we observed: https://ar8dyzdqhh48e0uf.public.blob.vercel-storage.com/<object-name>
    // We extract the storage domain from a test request or environment
    
    // Use the project's blob domain (this is consistent for the project)
    const blobDomain = "ar8dyzdqhh48e0uf.public.blob.vercel-storage.com";
    const blobUrl = `https://${blobDomain}/${objectName}`;

    console.log('Constructed blob URL:', blobUrl);

    const result = {
      url: blobUrl,
      objectName: objectName,
      message: 'Blob URL retrieved successfully'
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error getting blob info:', error);
    res.status(500).json({ 
      error: 'Failed to get blob info',
      details: error.message 
    });
  }
}