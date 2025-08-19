// Unified Admin Gallery API endpoint for Vercel
import { neon } from '@neondatabase/serverless';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Rate limiting for AI processing to prevent resource exhaustion
const aiProcessingQueue = new Set();
const MAX_CONCURRENT_AI_REQUESTS = 3;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sql = neon(process.env.DATABASE_URL);
  const { id, action } = req.query;

  try {
    // GET - Fetch all gallery images
    if (req.method === 'GET') {
      const images = await sql`
        SELECT 
          id,
          title,
          description,
          image_url as "imageUrl",
          category,
          tags,
          featured,
          common_name as "commonName",
          latin_name as "latinName",
          hardiness_zone as "hardinessZone", 
          sun_preference as "sunPreference",
          drought_tolerance as "droughtTolerance",
          texas_native as "texasNative",
          indoor_outdoor as "indoorOutdoor",
          classification,
          ai_description as "aiDescription",
          ai_identified as "aiIdentified",
          created_at as "createdAt"
        FROM gallery_images 
        ORDER BY created_at DESC
      `;

      console.log(`Retrieved ${images.length} gallery images`);
      return res.json(images);
    }

    // DELETE - Delete specific gallery image
    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
      }

      await sql`DELETE FROM gallery_images WHERE id = ${id}`;
      console.log(`Deleted gallery image: ${id}`);
      return res.json({ message: 'Gallery image deleted successfully' });
    }

    // POST - Handle actions (like plant identification)
    if (req.method === 'POST') {
      if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
      }

      // Plant identification action
      if (action === 'identify') {
        // Get the image details
        const [image] = await sql`
          SELECT image_url as "imageUrl" 
          FROM gallery_images 
          WHERE id = ${id}
        `;

        if (!image) {
          return res.status(404).json({ message: 'Image not found' });
        }

        // Check if we're already at maximum concurrent AI processing limit
        if (aiProcessingQueue.size >= MAX_CONCURRENT_AI_REQUESTS) {
          return res.status(429).json({ 
            message: 'AI processing limit reached',
            error: `Maximum ${MAX_CONCURRENT_AI_REQUESTS} concurrent AI requests allowed. Please wait and try again.`
          });
        }

        // Add to processing queue
        aiProcessingQueue.add(id);
        
        // Run plant identification with timeout protection for production stability
        try {
          // Add 30-second timeout to prevent resource exhaustion
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Plant identification timeout (30s)')), 30000)
          );
          
          const plantDetails = await Promise.race([
            identifyPlant(image.imageUrl),
            timeoutPromise
          ]);
          
          // Update gallery image with plant details immediately
          const updateData = {
            commonName: plantDetails.common_name !== "unknown" ? plantDetails.common_name : null,
            latinName: plantDetails.latin_name !== "unknown" ? plantDetails.latin_name : null,
            hardinessZone: plantDetails.hardiness_zone !== "unknown" ? plantDetails.hardiness_zone : null,
            sunPreference: plantDetails.sun_preference !== "unknown" ? plantDetails.sun_preference : null,
            droughtTolerance: plantDetails.drought_tolerance !== "unknown" ? plantDetails.drought_tolerance : null,
            texasNative: typeof plantDetails.texas_native === "boolean" ? plantDetails.texas_native : null,
            indoorOutdoor: plantDetails.indoor_outdoor !== "unknown" ? plantDetails.indoor_outdoor : null,
            classification: plantDetails.classification !== "unknown" ? plantDetails.classification : null,
            aiDescription: plantDetails.description || null,
            aiIdentified: true,
          };

          // Update title if plant was identified
          if (plantDetails.common_name !== "unknown") {
            updateData.title = plantDetails.common_name;
            if (plantDetails.latin_name !== "unknown") {
              updateData.title = `${plantDetails.common_name} (${plantDetails.latin_name})`;
            }
          }

          if (plantDetails.description) {
            updateData.description = plantDetails.description;
          }

          // Update the database synchronously
          const [updatedImage] = await sql`
            UPDATE gallery_images SET
              title = ${updateData.title || null},
              description = ${updateData.description || null},
              common_name = ${updateData.commonName},
              latin_name = ${updateData.latinName},
              hardiness_zone = ${updateData.hardinessZone},
              sun_preference = ${updateData.sunPreference},
              drought_tolerance = ${updateData.droughtTolerance},
              texas_native = ${updateData.texasNative},
              indoor_outdoor = ${updateData.indoorOutdoor},
              classification = ${updateData.classification},
              ai_description = ${updateData.aiDescription},
              ai_identified = ${updateData.aiIdentified}
            WHERE id = ${id}
            RETURNING *
          `;
          
          console.log(`Plant identification completed for image ${id}: ${plantDetails.common_name}`);
          
          return res.json({ 
            message: 'Plant identification completed',
            imageId: id,
            plantDetails: updatedImage
          });
          
        } catch (error) {
          console.error(`Error during plant identification for image ${id}:`, error);
          
          // Enhanced error handling for different failure types
          let errorMessage = 'Plant identification failed';
          let errorDetails = error.message;
          
          if (error.message.includes('timeout')) {
            errorMessage = 'Plant identification timed out';
            errorDetails = 'AI processing exceeded 30 seconds';
          } else if (error.message.includes('too large')) {
            errorMessage = 'Image too large for processing';
            errorDetails = 'Please use a smaller image file';
          } else if (error.message.includes('fetch')) {
            errorMessage = 'Could not access image';
            errorDetails = 'Image URL may be invalid or inaccessible';
          }
          
          // Mark as identification attempted but failed with specific error
          await sql`
            UPDATE gallery_images SET
              ai_identified = true,
              ai_description = ${errorDetails}
            WHERE id = ${id}
          `;
          
          return res.status(500).json({ 
            message: errorMessage,
            error: errorDetails 
          });
        } finally {
          // Always remove from processing queue when done (success or failure)
          aiProcessingQueue.delete(id);
        }
      }

      return res.status(400).json({ message: 'Invalid action' });
    }

    // PUT - Update gallery image
    if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
      }

      const updateData = req.body;
      
      // Build dynamic update query
      const updates = [];
      const values = [];
      
      if (updateData.title !== undefined) {
        updates.push('title = $' + (values.length + 1));
        values.push(updateData.title);
      }
      if (updateData.description !== undefined) {
        updates.push('description = $' + (values.length + 1));
        values.push(updateData.description);
      }
      if (updateData.category !== undefined) {
        updates.push('category = $' + (values.length + 1));
        values.push(updateData.category);
      }
      if (updateData.featured !== undefined) {
        updates.push('featured = $' + (values.length + 1));
        values.push(updateData.featured);
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No valid fields to update' });
      }

      values.push(id); // Add ID for WHERE clause
      const query = `UPDATE gallery_images SET ${updates.join(', ')} WHERE id = $${values.length}`;
      
      await sql(query, values);
      console.log(`Updated gallery image: ${id}`);
      
      return res.json({ message: 'Gallery image updated successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
    
  } catch (error) {
    console.error('Error in gallery API:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Synchronous plant identification function with image optimization
async function identifyPlant(imageUrl) {
  console.log(`Starting plant identification for: ${imageUrl}`);
  
  // Fetch and process the image for AI analysis
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }
  
  const originalBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`Original image size: ${originalBuffer.length} bytes`);
  
  // Optimize image for AI analysis (reduce size for better token efficiency)
  let sharp;
  try {
    sharp = require('sharp');
  } catch (error) {
    console.warn('Sharp not available, using unoptimized image:', error.message);
    // Fallback to unoptimized image if Sharp is not available
    const base64Image = originalBuffer.toString('base64');
    return await makeOpenAICall(base64Image);
  }
  const optimizedBuffer = await sharp(originalBuffer)
    .resize(768, 768, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 75 })
    .toBuffer();
    
  console.log(`Optimized image size: ${optimizedBuffer.length} bytes`);
  const base64Image = optimizedBuffer.toString('base64');
  
  return await makeOpenAICall(base64Image);
}

async function makeOpenAICall(base64Image) {
  // Add production memory and timeout safeguards
  if (base64Image.length > 2000000) { // ~2MB base64 limit
    throw new Error('Image too large for AI processing');
  }
  
  // Call OpenAI Vision API with optimized prompt
  const visionResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a plant identification assistant. Given an image of a plant, identify it and return ONLY a JSON payload with the following fields: common_name, latin_name, hardiness_zone, sun_preference, drought_tolerance, texas_native (true/false), indoor_outdoor, classification, description.

For hardiness_zone, use USDA zones like "8a", "9b", etc. For sun_preference, use: "full sun", "partial sun", "partial shade", or "shade". For drought_tolerance, use: "high", "moderate", or "low". For indoor_outdoor, use: "indoor", "outdoor", or "both". For texas_native, only return true if you are certain it's native to Texas.

Return "unknown" for any field you cannot determine with confidence. Be precise and factual.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Identify this plant and provide the requested JSON data."
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
  });

  const plantDetails = JSON.parse(visionResponse.choices[0].message.content);
  console.log(`Plant identification result: ${plantDetails.common_name || 'unknown'}`);
  return plantDetails;
}