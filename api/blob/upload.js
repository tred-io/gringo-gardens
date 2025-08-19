// Vercel Blob Upload API endpoint
import { put } from '@vercel/blob';

// Rate limiting for concurrent uploads to prevent failures
const uploadQueue = new Set();
const MAX_CONCURRENT_UPLOADS = 5;

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

  console.log(`Blob upload handler - Method: ${req.method}, URL: ${req.url}`);

  try {
    // Handle POST request to get upload URL
    if (req.method === 'POST') {
      console.log('Providing Vercel Blob upload URL');
      // Return the current endpoint URL for upload - use relative path
      return res.json({
        uploadURL: `/api/blob/upload`,
        method: "PUT"
      });
    }
    if (req.method === 'PUT') {
      const { objectName } = req.query;
      
      if (!objectName) {
        return res.status(400).json({ error: 'objectName query parameter is required' });
      }

      // Rate limiting to prevent bulk upload failures
      if (uploadQueue.size >= MAX_CONCURRENT_UPLOADS) {
        return res.status(429).json({ 
          error: 'Upload limit reached',
          message: `Maximum ${MAX_CONCURRENT_UPLOADS} concurrent uploads allowed. Please retry in a moment.`
        });
      }

      // Add to upload queue
      uploadQueue.add(objectName);

      try {
        // Add timeout protection for upload process
        const uploadPromise = (async () => {
          // Get file data from request body
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          // Validate buffer size
          if (buffer.length > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('File too large for upload');
          }

          // Upload to Vercel Blob with proper content type
          console.log(`Uploading to Vercel Blob: ${objectName}, size: ${buffer.length} bytes`);
          const blob = await put(objectName, buffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            contentType: req.headers['content-type'] || 'image/jpeg',
          });

          console.log(`Successfully uploaded to Vercel Blob: ${blob.url}`);
          console.log(`Object name: ${objectName}, Buffer size: ${buffer.length} bytes`);
          
          // Verify the blob exists by trying to get its metadata
          try {
            const headResponse = await fetch(blob.url, { method: 'HEAD' });
            console.log(`Blob URL verification: ${headResponse.status}`);
          } catch (verifyError) {
            console.error('Blob verification failed:', verifyError);
          }
          
          return {
            url: blob.url,
            size: blob.size,
            uploadedAt: blob.uploadedAt,
            message: 'File uploaded successfully'
          };
        })();

        // Add 30-second timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout (30s)')), 30000)
        );

        const result = await Promise.race([uploadPromise, timeoutPromise]);
        return res.json(result);

      } finally {
        // Always remove from queue when done
        uploadQueue.delete(objectName);
      }
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