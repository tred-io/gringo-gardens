import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface PlantDetails {
  common_name: string;
  latin_name: string;
  hardiness_zone: string;
  sun_preference: string;
  drought_tolerance: string;
  texas_native: boolean;
  indoor_outdoor: string;
  classification?: string;
  description: string;
}

export async function identifyPlantFromImage(imageUrl: string): Promise<PlantDetails | null> {
  try {
    console.log(`Starting plant identification for: ${imageUrl}`);
    
    let imageContent: string;
    let isBase64 = false;
    
    if (imageUrl.startsWith('/objects/uploads/')) {
      // For object storage images, fetch the binary data and convert to base64
      console.log(`Fetching object storage image data: ${imageUrl}`);
      try {
        const response = await fetch(`http://localhost:5000${imageUrl}`);
        if (!response.ok) {
          console.error(`Failed to fetch object storage image: ${response.status}`);
          return null;
        }
        
        const buffer = await response.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString('base64');
        
        // Detect image type from the first few bytes (magic numbers)
        const uint8Array = new Uint8Array(buffer);
        let mimeType = 'image/jpeg'; // default
        
        if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
          mimeType = 'image/png';
        } else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
          mimeType = 'image/jpeg';
        } else if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) {
          mimeType = 'image/gif';
        }
        
        imageContent = `data:${mimeType};base64,${base64Data}`;
        isBase64 = true;
        console.log(`Converted object storage image to base64 (${mimeType})`);
      } catch (fetchError) {
        console.error(`Error fetching object storage image:`, fetchError);
        return null;
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // For external URLs, use them directly
      imageContent = imageUrl;
      console.log(`Using external URL: ${imageContent}`);
    } else {
      console.log(`Unsupported image URL format: ${imageUrl}`);
      return null;
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a plant identification assistant. Given an image of a plant, identify it and return ONLY a JSON payload with the following fields: common_name, latin_name, hardiness_zone, sun_preference, drought_tolerance, texas_native (true/false), indoor_outdoor, classification, description.

Rules:
- If the image clearly shows a single species, fill in all fields.
- If the image contains multiple species, provide ONLY a concise horticultural description in the "description" field and set all other fields to "unknown".
  The description should list the types of plants visible (e.g., apple, oak, citrus) when possible, in plain descriptive language, as if labeling a nursery gallery photo.
- Do not use phrases like "the image shows" or "this picture contains".
- For classification, use one of: tree, shrub, herb, succulent, vine, grass, fern, annual, perennial
- For indoor_outdoor, use: indoor, outdoor, or both

Return ONLY the JSON object. Do not include any extra commentary.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify this plant and provide details in the requested JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: imageContent
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.error("No content returned from OpenAI");
      return null;
    }
    
    console.log("OpenAI response content:", content);

    try {
      // Clean up the response by removing markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const plantDetails = JSON.parse(cleanedContent) as PlantDetails;
      
      // Validate required fields (allow "unknown" values)
      if (!plantDetails.common_name || !plantDetails.description) {
        console.error("Missing required fields in plant identification response");
        return null;
      }
      
      console.log("Successfully parsed plant details:", plantDetails);

      return plantDetails;
    } catch (parseError) {
      console.error("Error parsing plant identification JSON:", parseError);
      console.error("Raw response:", content);
      return null;
    }
  } catch (error) {
    console.error("Error identifying plant:", error);
    return null;
  }
}

// Helper function to format plant details for display
export function formatPlantDetails(details: PlantDetails): string {
  const parts = [];
  
  if (details.common_name !== "unknown") {
    parts.push(`Common Name: ${details.common_name}`);
  }
  
  if (details.latin_name !== "unknown") {
    parts.push(`Scientific Name: ${details.latin_name}`);
  }
  
  if (details.classification && details.classification !== "unknown") {
    parts.push(`Type: ${details.classification}`);
  }
  
  if (details.hardiness_zone !== "unknown") {
    parts.push(`Hardiness Zone: ${details.hardiness_zone}`);
  }
  
  if (details.sun_preference !== "unknown") {
    parts.push(`Sun: ${details.sun_preference}`);
  }
  
  if (details.drought_tolerance !== "unknown") {
    parts.push(`Drought Tolerance: ${details.drought_tolerance}`);
  }
  
  if (details.texas_native === true) {
    parts.push("Texas Native: Yes");
  } else if (details.texas_native === false) {
    parts.push("Texas Native: No");
  }
  
  if (details.indoor_outdoor !== "unknown") {
    parts.push(`Growing Location: ${details.indoor_outdoor}`);
  }
  
  return parts.join(" | ");
}