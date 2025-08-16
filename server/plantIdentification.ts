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
    // Convert internal object storage URLs to publicly accessible ones
    let publicImageUrl = imageUrl;
    
    if (imageUrl.startsWith('/objects/uploads/')) {
      // For development, we can't use localhost URLs with OpenAI
      // Skip object storage images for now and return null
      console.log(`Skipping object storage image: ${imageUrl} (requires public URL for OpenAI)`);
      return null;
    }
    
    // Only process external URLs (like Unsplash URLs)
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      console.log(`Skipping non-public URL: ${imageUrl}`);
      return null;
    }
    
    console.log(`Analyzing image URL: ${publicImageUrl}`);
    
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
                url: publicImageUrl
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

    try {
      // Clean up the response by removing markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const plantDetails = JSON.parse(cleanedContent) as PlantDetails;
      
      // Validate required fields
      if (!plantDetails.common_name || !plantDetails.latin_name || !plantDetails.description) {
        console.error("Missing required fields in plant identification response");
        return null;
      }

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