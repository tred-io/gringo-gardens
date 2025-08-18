import { put, del, head } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { getAIOptimizedImage, processImageSizes, detectImageMimeType } from './imageProcessor';

export interface VercelBlobUploadResult {
  url: string;
  objectPath: string;
  sizes: {
    original: string;
    thumbnail: string;
    lightbox: string;
    ai: string;
  };
}

export class VercelBlobStorageService {
  constructor() {}

  isAvailable(): boolean {
    // Check if we're in Vercel environment and have the required token
    return !!(process.env.BLOB_READ_WRITE_TOKEN && (process.env.VERCEL || process.env.VERCEL_ENV));
  }

  async uploadImage(imageBuffer: Buffer, filename?: string): Promise<VercelBlobUploadResult> {
    if (!this.isAvailable()) {
      throw new Error('Vercel Blob storage not available in this environment');
    }

    try {
      const baseId = randomUUID();
      const originalFilename = filename || `image_${baseId}`;
      const mimeType = detectImageMimeType(imageBuffer);
      const fileExtension = mimeType === 'image/png' ? 'png' : 'jpg';

      // Process image into multiple sizes
      const imageSizes = await processImageSizes(imageBuffer);

      console.log(`Uploading image with multiple sizes: ${imageSizes.original.length} bytes original`);

      // Upload all versions to Vercel Blob
      const [originalBlob, thumbnailBlob, lightboxBlob, aiBlob] = await Promise.all([
        put(`gallery/original/${baseId}.${fileExtension}`, imageSizes.original, { 
          access: 'public',
          contentType: mimeType
        }),
        put(`gallery/thumbnail/${baseId}.jpg`, imageSizes.thumbnail, { 
          access: 'public',
          contentType: 'image/jpeg'
        }),
        put(`gallery/lightbox/${baseId}.jpg`, imageSizes.lightbox, { 
          access: 'public',
          contentType: 'image/jpeg'
        }),
        put(`gallery/ai/${baseId}.jpg`, imageSizes.ai, { 
          access: 'public',
          contentType: 'image/jpeg'
        })
      ]);

      const result: VercelBlobUploadResult = {
        url: originalBlob.url,
        objectPath: `/blob/gallery/original/${baseId}.${fileExtension}`,
        sizes: {
          original: originalBlob.url,
          thumbnail: thumbnailBlob.url,
          lightbox: lightboxBlob.url,
          ai: aiBlob.url
        }
      };

      console.log(`Successfully uploaded image to Vercel Blob: ${originalBlob.url}`);
      return result;

    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      throw new Error(`Vercel Blob upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Handle direct upload via API endpoint
  async processDirectUpload(fileBuffer: Buffer, contentType: string): Promise<VercelBlobUploadResult> {
    if (!this.isAvailable()) {
      throw new Error('Vercel Blob storage not available in this environment');
    }

    try {
      const baseId = randomUUID();
      const mimeType = contentType || detectImageMimeType(fileBuffer);
      const fileExtension = mimeType === 'image/png' ? 'png' : 'jpg';

      // Process image into multiple sizes
      const imageSizes = await processImageSizes(fileBuffer);

      console.log(`Processing direct upload with multiple sizes: ${imageSizes.original.length} bytes`);

      // Upload all versions to Vercel Blob
      const [originalBlob, thumbnailBlob, lightboxBlob, aiBlob] = await Promise.all([
        put(`gallery/original/${baseId}.${fileExtension}`, imageSizes.original, { 
          access: 'public',
          contentType: mimeType
        }),
        put(`gallery/thumbnail/${baseId}.jpg`, imageSizes.thumbnail, { 
          access: 'public',
          contentType: 'image/jpeg'
        }),
        put(`gallery/lightbox/${baseId}.jpg`, imageSizes.lightbox, { 
          access: 'public',
          contentType: 'image/jpeg'
        }),
        put(`gallery/ai/${baseId}.jpg`, imageSizes.ai, { 
          access: 'public',
          contentType: 'image/jpeg'
        })
      ]);

      return {
        url: originalBlob.url,
        objectPath: `/blob/gallery/original/${baseId}.${fileExtension}`,
        sizes: {
          original: originalBlob.url,
          thumbnail: thumbnailBlob.url,
          lightbox: lightboxBlob.url,
          ai: aiBlob.url
        }
      };

    } catch (error) {
      console.error('Error processing direct upload:', error);
      throw new Error(`Direct upload processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteImage(url: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Vercel Blob storage not available in this environment');
    }

    try {
      await del(url);
      console.log(`Deleted image from Vercel Blob: ${url}`);
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error);
      throw new Error(`Vercel Blob deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getImageInfo(url: string) {
    if (!this.isAvailable()) {
      throw new Error('Vercel Blob storage not available in this environment');
    }

    try {
      return await head(url);
    } catch (error) {
      console.error('Error getting Vercel Blob info:', error);
      throw new Error(`Vercel Blob info failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Convert Vercel Blob URL to object path for database storage
  normalizeObjectEntityPath(blobUrl: string): string {
    if (blobUrl.startsWith('https://') && blobUrl.includes('vercel-storage.com')) {
      // Extract the path portion for database storage
      const url = new URL(blobUrl);
      return `/blob${url.pathname}`;
    }
    return blobUrl;
  }

  // Get optimized image URL for AI processing
  getAIImageUrl(blobUrl: string): string {
    // If it's a Vercel blob URL, try to get the AI-optimized version
    if (blobUrl.includes('/gallery/original/')) {
      return blobUrl.replace('/gallery/original/', '/gallery/ai/').replace(/\.(png|jpeg|jpg)$/, '.jpg');
    }
    return blobUrl;
  }

  // Get thumbnail URL for gallery display
  getThumbnailUrl(blobUrl: string): string {
    if (blobUrl.includes('/gallery/original/')) {
      return blobUrl.replace('/gallery/original/', '/gallery/thumbnail/').replace(/\.(png|jpeg|jpg)$/, '.jpg');
    }
    return blobUrl;
  }

  // Get lightbox URL for detailed viewing
  getLightboxUrl(blobUrl: string): string {
    if (blobUrl.includes('/gallery/original/')) {
      return blobUrl.replace('/gallery/original/', '/gallery/lightbox/').replace(/\.(png|jpeg|jpg)$/, '.jpg');
    }
    return blobUrl;
  }
}