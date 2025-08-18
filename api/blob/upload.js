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

    // Read the raw binary data from the request
    const fileBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      req.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      req.on('error', reject);
    });

    console.log('Received upload request - Content-Type:', req.headers['content-type']);
    console.log('File buffer length:', fileBuffer.length);

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ 
        error: 'No file data provided',
        details: 'Request body is empty or missing'
      });
    }

    const contentType = req.headers['content-type'] || 'application/octet-stream';
    console.log('Processing upload with content type:', contentType);

    // For now, do a simple direct upload to Vercel Blob without complex processing
    // This avoids import issues with TypeScript files in Vercel runtime
    
    // Use object name from query parameter if provided, otherwise generate one
    let filename;
    const objectName = req.query.objectName;
    if (objectName && typeof objectName === 'string') {
      filename = objectName;
      console.log('Using provided object name:', filename);
    } else {
      // Fallback to generated filename
      const fileId = randomUUID();
      const extension = contentType.includes('image/png') ? 'png' : 
                       contentType.includes('image/') ? 'jpg' : 'bin';
      filename = `gallery/uploads/${fileId}.${extension}`;
      console.log('Generated filename:', filename);
    }

    console.log('Uploading directly to Vercel Blob:', filename, contentType);

    // Upload directly to Vercel Blob
    const blob = await put(filename, fileBuffer, {
      access: 'public',
      contentType: contentType
    });

    const result = {
      url: blob.url,
      objectPath: `/blob/${filename}`,
      message: 'File uploaded successfully to Vercel Blob'
    };

    console.log('Upload successful - Blob URL:', result.url);
    console.log('Blob object returned by Vercel:', blob);
    console.log('blob.url value:', blob.url);
    console.log('Response being sent:', { url: result.url, uploadURL: result.url, objectPath: result.objectPath });

    res.status(200).json({
      url: result.url,
      uploadURL: result.url,
      objectPath: result.objectPath,
      message: result.message,
      debug: {
        blobUrl: blob.url,
        filename: filename,
        objectName: req.query.objectName
      }
    });

  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    res.status(500).json({ 
      error: 'Blob upload failed',
      details: error.message 
    });
  }
}

// Configure for binary file uploads - disable bodyParser to get raw data
export const config = {
  api: {
    bodyParser: false,
  },
}