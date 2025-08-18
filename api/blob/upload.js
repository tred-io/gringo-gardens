// Vercel API route for Blob upload
// This file handles POST /api/blob/upload for direct file uploads to Vercel Blob

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

  if (req.method !== 'POST' && req.method !== 'PUT') {
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

    // Get the file from the request body
    if (!req.body) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // Generate unique filename
    const fileId = randomUUID();
    const filename = `gallery/uploads/${fileId}`;

    // Upload to Vercel Blob
    const blob = await put(filename, req.body, {
      access: 'public',
      contentType: req.headers['content-type'] || 'application/octet-stream'
    });

    res.status(200).json({
      url: blob.url,
      uploadURL: blob.url,
      message: 'File uploaded successfully to Vercel Blob'
    });

  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    res.status(500).json({ 
      error: 'Blob upload failed',
      details: error.message 
    });
  }
}

// Configure body parser for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}