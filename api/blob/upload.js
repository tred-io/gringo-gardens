// Vercel API route for Blob upload
// This file handles PUT /api/blob/upload for direct file uploads to Vercel Blob

import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
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

    // For PUT requests, the body should be the raw file data
    console.log('Received upload request - Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);
    console.log('Body length:', req.body?.length || 'unknown');

    if (!req.body || req.body.length === 0) {
      return res.status(400).json({ 
        error: 'No file data provided',
        details: 'Request body is empty or missing'
      });
    }

    // Generate unique filename with proper extension
    const fileId = randomUUID();
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const extension = contentType.includes('image/png') ? 'png' : 
                     contentType.includes('image/') ? 'jpg' : 'bin';
    const filename = `gallery/uploads/${fileId}.${extension}`;

    console.log('Uploading to Vercel Blob:', filename, contentType);

    // Process the upload with image optimization
    const { VercelBlobStorageService } = await import('../server/vercelBlobStorage.ts');
    const vercelBlobService = new VercelBlobStorageService();
    
    // Convert body to Buffer if needed
    const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);
    
    // Process and upload with multi-size generation
    const result = await vercelBlobService.processDirectUpload(fileBuffer, contentType);

    console.log('Upload successful with multi-size processing:', result.url);

    res.status(200).json({
      url: result.url,
      uploadURL: result.url,
      sizes: result.sizes,
      objectPath: result.objectPath,
      message: 'File uploaded successfully to Vercel Blob with multi-size processing'
    });

  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    res.status(500).json({ 
      error: 'Blob upload failed',
      details: error.message 
    });
  }
}

// Configure for binary file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}