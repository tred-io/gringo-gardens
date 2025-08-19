// Vercel Blob Upload API endpoint
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-vercel-filename');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'PUT') {
      const { objectName } = req.query;
      
      if (!objectName) {
        return res.status(400).json({ error: 'objectName query parameter is required' });
      }

      // Get file data from request body
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Upload to Vercel Blob
      const blob = await put(objectName, buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      console.log(`Uploaded to Vercel Blob: ${blob.url}`);
      
      return res.json({
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        message: 'File uploaded successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
}