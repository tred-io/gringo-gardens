import { File } from "@google-cloud/storage";
import sharp from "sharp";
import { objectStorageClient } from "./objectStorage";

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Image processing service for automatic web-friendly resizing
 * Currently provides a placeholder implementation that can be extended
 * with actual image processing libraries like Sharp or similar
 */
export class ImageProcessor {
  
  /**
   * Process and resize an uploaded image to web-friendly dimensions
   * @param sourceFile - The original uploaded file
   * @param options - Processing options including size and quality
   * @returns Promise<string> - The URL of the processed image
   */
  async processImage(sourceFile: File, options: ImageProcessingOptions = {}): Promise<string> {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 85,
      format = 'jpeg'
    } = options;
    
    try {
      // Download the original image
      const [imageBuffer] = await sourceFile.download();
      
      // Process with Sharp
      let sharpInstance = sharp(imageBuffer);
      
      // Resize while maintaining aspect ratio
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
      
      // Set format and quality
      if (format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality });
      } else if (format === 'png') {
        sharpInstance = sharpInstance.png({ quality: Math.round(quality / 10) });
      } else if (format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality });
      }
      
      const processedBuffer = await sharpInstance.toBuffer();
      
      // Create a unique file name for the processed image to avoid conflicts
      const originalName = sourceFile.name;
      const timestamp = Date.now();
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const processedName = `${baseName}_processed_${timestamp}.${format}`;
      
      // Upload the processed image to the same bucket  
      const bucket = sourceFile.bucket;
      const processedFile = bucket.file(processedName);
      
      await processedFile.save(processedBuffer, {
        metadata: {
          contentType: `image/${format}`,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        }
      });
      
      console.log(`Image processed: ${originalName} -> ${processedName} (${maxWidth}x${maxHeight}, ${quality}% quality)`);
      
      return processedFile.publicUrl();
    } catch (error) {
      console.error('Error processing image:', error);
      // Return original file URL if processing fails
      return sourceFile.publicUrl();
    }
  }

  /**
   * Create multiple sizes of an image for responsive design
   * @param sourceFile - The original uploaded file
   * @returns Promise<{thumbnail: string, medium: string, large: string}>
   */
  async createResponsiveSizes(sourceFile: File): Promise<{
    thumbnail: string;
    medium: string;
    large: string;
    original: string;
  }> {
    try {
      const [imageBuffer] = await sourceFile.download();
      const bucket = sourceFile.bucket;
      const originalName = sourceFile.name;
      const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
      
      // Create thumbnail (150x150, cropped to square)
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      // Create medium size (600x400, fit inside)
      const mediumBuffer = await sharp(imageBuffer)
        .resize(600, 400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      // Create large size (1200x800, fit inside)
      const largeBuffer = await sharp(imageBuffer)
        .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      
      // Upload all sizes
      const thumbnailFile = bucket.file(`${baseName}_thumb.jpg`);
      const mediumFile = bucket.file(`${baseName}_medium.jpg`);
      const largeFile = bucket.file(`${baseName}_large.jpg`);
      
      await Promise.all([
        thumbnailFile.save(thumbnailBuffer, {
          metadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' }
        }),
        mediumFile.save(mediumBuffer, {
          metadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' }
        }),
        largeFile.save(largeBuffer, {
          metadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' }
        })
      ]);
      
      console.log(`Created responsive sizes for: ${originalName}`);
      
      return {
        thumbnail: thumbnailFile.publicUrl(),
        medium: mediumFile.publicUrl(),
        large: largeFile.publicUrl(),
        original: sourceFile.publicUrl()
      };
    } catch (error) {
      console.error('Error creating responsive sizes:', error);
      const originalUrl = sourceFile.publicUrl();
      return {
        thumbnail: originalUrl,
        medium: originalUrl,
        large: originalUrl,
        original: originalUrl
      };
    }
  }

  /**
   * Optimize image for web delivery
   * @param sourceFile - The source file to optimize
   * @returns Promise<string> - URL of optimized image
   */
  async optimizeForWeb(sourceFile: File): Promise<string> {
    // TODO: Implement web optimization
    // This would include:
    // - Compress to appropriate quality (usually 80-85%)
    // - Convert to WebP if browser supports it
    // - Strip metadata
    // - Resize if too large (max 1920px width)
    
    return this.processImage(sourceFile, {
      maxWidth: 1920,
      maxHeight: 1280,
      quality: 85,
      format: 'jpeg'
    });
  }
}

export const imageProcessor = new ImageProcessor();