// Vercel API route for gallery image uploads
// This file handles PUT /api/gallery-images for Vercel deployment
// Updated: Fixed module import issues for reliable deployment

import { neon } from '@neondatabase/serverless';
import { nanoid } from 'nanoid';

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
    const { imageURL, title, altText, category, tags, featured } = req.body;

    if (!imageURL) {
      return res.status(400).json({ error: 'imageURL is required' });
    }

    // For Vercel deployment, we'll store the image URL directly
    // without object storage processing since that requires Replit environment
    let objectPath = imageURL;
    
    // If it's a Google Cloud Storage URL, convert to relative path
    if (imageURL.startsWith('https://storage.googleapis.com/')) {
      const url = new URL(imageURL);
      objectPath = `/objects${url.pathname}`;
    }

    // Parse tags from comma-separated string to array
    let tagsArray = [];
    if (tags && typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }

    // Initialize database connection
    const sql = neon(process.env.DATABASE_URL);
    
    const galleryImage = {
      id: nanoid(),
      title: title || "Uploaded Image",
      description: altText || title || "Gallery Image",
      imageUrl: objectPath,
      category: category || "general",
      tags: tagsArray,
      featured: featured || false,
      commonName: null,
      latinName: null,
      hardinessZone: null,
      sunPreference: null,
      droughtTolerance: null,
      texasNative: null,
      indoorOutdoor: null,
      classification: null,
      aiDescription: null,
      aiIdentified: false,
      createdAt: new Date().toISOString()
    };

    // Insert into database using raw SQL to avoid module import issues
    await sql`
      INSERT INTO gallery_images (
        id, title, description, image_url, category, tags, featured,
        common_name, latin_name, hardiness_zone, sun_preference, drought_tolerance,
        texas_native, indoor_outdoor, classification, ai_description, ai_identified, created_at
      ) VALUES (
        ${galleryImage.id},
        ${galleryImage.title},
        ${galleryImage.description},
        ${galleryImage.imageUrl},
        ${galleryImage.category},
        ${JSON.stringify(galleryImage.tags)},
        ${galleryImage.featured},
        ${galleryImage.commonName},
        ${galleryImage.latinName},
        ${galleryImage.hardinessZone},
        ${galleryImage.sunPreference},
        ${galleryImage.droughtTolerance},
        ${galleryImage.texasNative},
        ${galleryImage.indoorOutdoor},
        ${galleryImage.classification},
        ${galleryImage.aiDescription},
        ${galleryImage.aiIdentified},
        ${galleryImage.createdAt}
      )
    `;

    res.status(200).json({
      objectPath: objectPath,
      galleryImage: galleryImage,
      message: "Image uploaded successfully"
    });

  } catch (error) {
    console.error('Error creating gallery image:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}