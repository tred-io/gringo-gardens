// Unified Admin Gallery API endpoint for Vercel
import { neon } from '@neondatabase/serverless';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

        // Start plant identification in background
        identifyPlantAsync(id, image.imageUrl, sql);
        
        return res.json({ 
          message: 'Plant identification started',
          imageId: id 
        });
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

// Background plant identification function
async function identifyPlantAsync(imageId, imageUrl, sql) {
  try {
    console.log(`Starting AI plant identification for image ${imageId}`);
    
    // Fetch and process the image for AI analysis
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    // Call OpenAI Vision API
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this plant image and provide detailed information. Return JSON with these exact fields: common_name, latin_name, classification, hardiness_zone, sun_preference, drought_tolerance, texas_native (boolean), indoor_outdoor, description. Use "unknown" for any field you cannot determine confidently. For texas_native, only return true if you are confident it's native to Texas.`
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
    console.log(`Plant identified for image ${imageId}:`, plantDetails.common_name);
    
    // Update gallery image with plant details
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

    // Update title and description if plant was identified
    if (plantDetails.common_name !== "unknown") {
      updateData.title = plantDetails.common_name;
      if (plantDetails.latin_name !== "unknown") {
        updateData.title = `${plantDetails.common_name} (${plantDetails.latin_name})`;
      }
    }

    if (plantDetails.description) {
      updateData.description = plantDetails.description;
    }

    // Update the database
    await sql`
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
      WHERE id = ${imageId}
    `;
    
    console.log(`Successfully updated plant identification for image ${imageId}`);
    
  } catch (error) {
    console.error(`Error identifying plant for image ${imageId}:`, error);
    
    // Mark as identification attempted but failed
    try {
      await sql`
        UPDATE gallery_images SET
          ai_identified = true,
          ai_description = 'Plant identification failed'
        WHERE id = ${imageId}
      `;
    } catch (dbError) {
      console.error('Error updating failed identification:', dbError);
    }
  }
}