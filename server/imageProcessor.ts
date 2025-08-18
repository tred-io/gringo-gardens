import sharp from 'sharp';

export interface ImageSizes {
  original: Buffer;
  ai: Buffer;           // 768px max, 75% quality for AI analysis
  thumbnail: Buffer;    // 300px max, 80% quality for gallery
  lightbox: Buffer;     // 1920px max, 85% quality for viewing
}

export interface ProcessingOptions {
  aiMaxSize?: number;
  thumbnailMaxSize?: number;
  lightboxMaxSize?: number;
  aiQuality?: number;
  thumbnailQuality?: number;
  lightboxQuality?: number;
}

const DEFAULT_OPTIONS: Required<ProcessingOptions> = {
  aiMaxSize: 768,
  thumbnailMaxSize: 300,
  lightboxMaxSize: 1920,
  aiQuality: 75,
  thumbnailQuality: 80,
  lightboxQuality: 85
};

/**
 * Process an image into multiple sizes optimized for different use cases
 */
export async function processImageSizes(
  inputBuffer: Buffer,
  options: ProcessingOptions = {}
): Promise<ImageSizes> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Get original image metadata
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`Processing image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
    
    // Create base sharp instance
    const baseImage = sharp(inputBuffer);
    
    // Process AI version (small, optimized for token usage)
    const aiImage = await baseImage
      .clone()
      .resize(opts.aiMaxSize, opts.aiMaxSize, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: opts.aiQuality, mozjpeg: true })
      .toBuffer();
    
    // Process thumbnail version (for gallery)
    const thumbnailImage = await baseImage
      .clone()
      .resize(opts.thumbnailMaxSize, opts.thumbnailMaxSize, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: opts.thumbnailQuality, mozjpeg: true })
      .toBuffer();
    
    // Process lightbox version (high quality for viewing)
    const lightboxImage = await baseImage
      .clone()
      .resize(opts.lightboxMaxSize, opts.lightboxMaxSize, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: opts.lightboxQuality, mozjpeg: true })
      .toBuffer();
    
    // Keep original as-is
    const originalImage = inputBuffer;
    
    console.log(`Image processed: AI=${aiImage.length} bytes, Thumbnail=${thumbnailImage.length} bytes, Lightbox=${lightboxImage.length} bytes`);
    
    return {
      original: originalImage,
      ai: aiImage,
      thumbnail: thumbnailImage,
      lightbox: lightboxImage
    };
    
  } catch (error) {
    console.error('Error processing image sizes:', error);
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get optimized image buffer for AI analysis
 */
export async function getAIOptimizedImage(inputBuffer: Buffer): Promise<Buffer> {
  try {
    const metadata = await sharp(inputBuffer).metadata();
    console.log(`Optimizing image for AI: ${metadata.width}x${metadata.height} -> max 768px`);
    
    const optimized = await sharp(inputBuffer)
      .resize(768, 768, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 75, 
        mozjpeg: true,
        progressive: true
      })
      .toBuffer();
    
    const originalSize = inputBuffer.length;
    const optimizedSize = optimized.length;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`AI image optimization: ${originalSize} -> ${optimizedSize} bytes (${reduction}% reduction)`);
    
    return optimized;
    
  } catch (error) {
    console.error('Error optimizing image for AI:', error);
    throw new Error(`AI image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert buffer to base64 data URL
 */
export function bufferToDataUrl(buffer: Buffer, mimeType: string = 'image/jpeg'): string {
  const base64Data = buffer.toString('base64');
  return `data:${mimeType};base64,${base64Data}`;
}

/**
 * Detect image MIME type from buffer
 */
export function detectImageMimeType(buffer: Buffer): string {
  const uint8Array = new Uint8Array(buffer);
  
  // PNG signature
  if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
    return 'image/png';
  }
  
  // JPEG signature
  if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // GIF signature
  if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46) {
    return 'image/gif';
  }
  
  // WebP signature
  if (uint8Array[0] === 0x52 && uint8Array[1] === 0x49 && uint8Array[2] === 0x46 && uint8Array[3] === 0x46 &&
      uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && uint8Array[10] === 0x42 && uint8Array[11] === 0x50) {
    return 'image/webp';
  }
  
  // Default to JPEG
  return 'image/jpeg';
}