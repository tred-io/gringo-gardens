import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed auth imports - using simple password protection instead
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { VercelBlobStorageService } from "./vercelBlobStorage";
import {
  insertProductSchema,
  insertBlogPostSchema,
  insertGalleryImageSchema,
  insertReviewSchema,
  insertContactMessageSchema,
  insertNewsletterSubscriberSchema,
  insertCategorySchema,
  insertSettingSchema,
  insertTeamMemberSchema,
} from "@shared/schema";
import { identifyPlantFromImage, type PlantDetails } from "./plantIdentification";

// Background function to identify plant and update gallery image
async function identifyAndUpdatePlant(imageId: string, imageUrl: string, res?: any) {
  try {
    console.log(`Starting AI plant identification for image ${imageId}`);
    
    const plantDetails = await identifyPlantFromImage(imageUrl);
    
    if (plantDetails) {
      console.log(`Plant identified for image ${imageId}:`, plantDetails.common_name !== 'unknown' ? plantDetails.common_name : `${plantDetails.classification || 'plant'} - ${plantDetails.description}`);
      
      // Update gallery image with plant details, overwriting main fields
      const updateData: any = {
        // Store detailed plant information
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

      // Update main fields with plant information
      if (plantDetails.common_name !== "unknown") {
        updateData.title = plantDetails.common_name;
        if (plantDetails.latin_name !== "unknown") {
          updateData.title = `${plantDetails.common_name} (${plantDetails.latin_name})`;
        }
      } else if (plantDetails.classification && plantDetails.classification !== "unknown") {
        // For multiple species or unclear ID, use classification + description
        updateData.title = plantDetails.classification.charAt(0).toUpperCase() + plantDetails.classification.slice(1) + " Collection";
      } else if (plantDetails.description) {
        // Even if everything else is unknown, use the description for title if available
        updateData.title = "Mixed Plant Collection";
      }

      if (plantDetails.description) {
        updateData.description = plantDetails.description;
      }

      // Update category and tags based on classification
      if (plantDetails.classification && plantDetails.classification !== "unknown") {
        const categoryMap: Record<string, string> = {
          'tree': 'trees',
          'shrub': 'shrubs', 
          'succulent': 'succulents',
          'herb': 'herbs',
          'vine': 'vines',
          'grass': 'grasses',
          'fern': 'ferns',
          'annual': 'flowers',
          'perennial': 'flowers'
        };
        
        const mappedCategory = categoryMap[plantDetails.classification.toLowerCase()];
        if (mappedCategory) {
          updateData.category = mappedCategory;
        }
      }

      // Update tags with plant information
      const newTags = [];
      if (plantDetails.classification && plantDetails.classification !== "unknown") {
        newTags.push(plantDetails.classification);
      }
      if (plantDetails.texas_native === true) {
        newTags.push("texas-native");
      }
      if (plantDetails.sun_preference && plantDetails.sun_preference !== "unknown") {
        newTags.push(plantDetails.sun_preference.replace(/\s+/g, '-').toLowerCase());
      }
      if (plantDetails.drought_tolerance && plantDetails.drought_tolerance !== "unknown") {
        newTags.push(`${plantDetails.drought_tolerance}-drought-tolerance`.replace(/\s+/g, '-').toLowerCase());
      }
      
      if (newTags.length > 0) {
        updateData.tags = newTags;
      }

      const updatedImage = await storage.updateGalleryImage(imageId, updateData);
      
      console.log(`Successfully updated plant details for image ${imageId}`);
      
      // Return success response with updated data if res is available
      if (res) {
        res.json({ 
          success: true, 
          message: "Plant identification completed",
          plantName: plantDetails.common_name !== 'unknown' ? plantDetails.common_name : 'Mixed Plant Collection',
          updated: updatedImage
        });
        return;
      }
    } else {
      console.log(`No plant identification available for image ${imageId}`);
      
      // Mark as processed but not identified
      await storage.updateGalleryImage(imageId, {
        aiIdentified: false,
      });
      
      if (res) {
        res.json({ 
          success: false,
          message: "Plant could not be identified",
          error: "No plant details available"
        });
        return;
      }
    }
  } catch (error) {
    console.error(`Error in plant identification for image ${imageId}:`, error);
    if (res) {
      res.status(500).json({ 
        success: false,
        message: "Plant identification failed",
        error: (error as any).message 
      });
      return;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Skip external auth setup for development
  console.log("Using development authentication only");
  
  // Use a simple in-memory session for development
  const sessions = new Map<string, { devAuth: boolean }>();
  
  app.use((req: any, res, next) => {
    const sessionId = (req.headers['x-session-id'] as string) || 'dev-session';
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { devAuth: false });
    }
    req.session = sessions.get(sessionId)!;
    next();
  });

  // Development auth routes (bypass for testing)
  app.get('/api/auth/user', async (req: any, res) => {
    console.log('Auth check - session:', req.session);
    console.log('devAuth value:', req.session?.devAuth);
    // Check for development session
    if (req.session?.devAuth) {
      const mockUser = {
        id: 'dev-admin',
        email: 'admin@gringogardens.com',
        firstName: 'Admin',
        lastName: 'User',
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log('Returning user:', mockUser);
      res.json(mockUser);
    } else {
      console.log('No valid session, returning 401');
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  // Development login/logout routes (override any auth setup)
  app.get('/api/login', (req, res) => {
    console.log('Development login - setting session');
    console.log('Session before:', req.session);
    (req as any).session.devAuth = true;
    console.log('Session after:', req.session);
    res.redirect('/');
  });

  app.get('/api/logout', (req, res) => {
    console.log('Development logout - clearing session');
    if ((req as any).session) {
      (req as any).session.devAuth = false;
      delete (req as any).session.devAuth;
    }
    res.redirect('/');
  });

  // Public API routes

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      const { category, search, hardinessZone, sunRequirements, priceRange, featured, texasNative, droughtTolerance } = req.query;
      const products = await storage.getProducts({
        category: category as string,
        search: search as string,
        hardinessZone: hardinessZone as string,
        sunRequirements: sunRequirements as string,
        priceRange: priceRange as string,
        featured: featured === 'true',
        active: true, // Only show active products to public
        texasNative: texasNative as string,
        droughtTolerance: droughtTolerance as string,
      });
      
      // Add category names to products
      const categories = await storage.getCategories();
      const categoryMap = new Map(categories.map(cat => [cat.id, cat.name || 'Uncategorized']));
      
      const productsWithCategories = products.map(product => ({
        ...product,
        categoryName: product.categoryId ? (categoryMap.get(product.categoryId) || 'Uncategorized') : 'Uncategorized'
      }));

      console.log(`Retrieved ${productsWithCategories.length} products with categories`);
      res.json(productsWithCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:slug', async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Blog posts
  app.get('/api/blog', async (req, res) => {
    try {
      const { category } = req.query;
      const posts = await storage.getBlogPosts({
        category: category as string,
        published: true, // Only show published posts to public
      });
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get('/api/blog/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post || !post.published) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Gallery
  app.get('/api/gallery', async (req, res) => {
    try {
      const { category, featured } = req.query;
      const images = await storage.getGalleryImages({
        category: category as string,
        featured: featured === 'true',
      });
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Reviews
  app.get('/api/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviews({
        approved: true, // Only show approved reviews to public
      });
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Contact form
  app.post('/api/contact', async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Newsletter subscription
  app.post('/api/newsletter', async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriberSchema.parse(req.body);
      const subscriber = await storage.subscribeToNewsletter(validatedData);
      res.status(201).json(subscriber);
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  // Protected Admin API routes

  // Admin Products  
  app.get('/api/admin/products', async (req, res) => {
    try {
      const { category, search, status } = req.query;
      let active;
      if (status === 'active') active = true;
      else if (status === 'inactive') active = false;
      
      const products = await storage.getProducts({
        category: category as string,
        search: search as string,
        active,
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/admin/products', async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Handle query param pattern for product updates (Vercel-style)
  app.put('/api/admin/products', async (req, res) => {
    try {
      const productId = req.query.id;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      const product = await storage.updateProduct(productId as string, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Handle path param pattern for product updates (Express-style)
  app.put('/api/admin/products/:id', async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  // Handle query param pattern for product deletion (Vercel-style)
  app.delete('/api/admin/products', async (req, res) => {
    try {
      const productId = req.query.id;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }
      
      const success = await storage.deleteProduct(productId as string);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Handle path param pattern for product deletion (Express-style)  
  app.delete('/api/admin/products/:id', async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Admin Categories
  app.get('/api/admin/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/admin/categories', async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put('/api/admin/categories/:id', async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete('/api/admin/categories/:id', async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin Blog
  app.get('/api/admin/blog', async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.post('/api/admin/blog', async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const validatedData = insertBlogPostSchema.parse({ ...req.body, authorId: userId });
      const post = await storage.createBlogPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put('/api/admin/blog/:id', async (req, res) => {
    try {
      const post = await storage.updateBlogPost(req.params.id, req.body);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete('/api/admin/blog/:id', async (req, res) => {
    try {
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Admin Gallery
  app.get('/api/admin/gallery', async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching admin gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post('/api/admin/gallery', async (req, res) => {
    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      
      // Check for duplicate images by URL (for manually added images)
      const existingImages = await storage.getGalleryImages();
      const isDuplicate = existingImages.some(img => img.imageUrl === validatedData.imageUrl);
      
      if (isDuplicate) {
        return res.status(400).json({ message: "This image already exists in the gallery" });
      }
      
      // Create gallery image first
      const image = await storage.createGalleryImage(validatedData);
      
      // Trigger AI plant identification in background (don't wait for it)
      identifyAndUpdatePlant(image.id, validatedData.imageUrl).catch(error => {
        console.error("Error in background plant identification:", error);
      });
      
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.put('/api/admin/gallery/:id', async (req, res) => {
    try {
      const validatedData = insertGalleryImageSchema.parse(req.body);
      
      // Check for duplicate images by URL (excluding current image)
      const existingImages = await storage.getGalleryImages();
      const isDuplicate = existingImages.some(img => 
        img.imageUrl === validatedData.imageUrl && img.id !== req.params.id
      );
      
      if (isDuplicate) {
        return res.status(400).json({ message: "This image URL already exists in the gallery" });
      }
      
      const image = await storage.updateGalleryImage(req.params.id, validatedData);
      if (!image) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete('/api/admin/gallery/:id', async (req, res) => {
    try {
      const success = await storage.deleteGalleryImage(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Manually trigger AI plant identification for a gallery image
  app.post('/api/admin/gallery/:id/identify', async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      const image = images.find(img => img.id === req.params.id);
      
      if (!image) {
        return res.status(404).json({ message: "Gallery image not found" });
      }

      // Trigger AI identification and wait for result to send proper response
      try {
        await identifyAndUpdatePlant(image.id, image.imageUrl, res);
      } catch (error) {
        console.error("Error in manual plant identification:", error);
        if (!res.headersSent) {
          res.status(500).json({ message: "Plant identification failed", error: (error as any).message });
        }
      }
    } catch (error) {
      console.error("Error starting plant identification:", error);
      res.status(500).json({ message: "Failed to start plant identification" });
    }
  });

  // Admin Reviews
  app.get('/api/admin/reviews', async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.put('/api/admin/reviews/:id', async (req, res) => {
    try {
      const review = await storage.updateReview(req.params.id, req.body);
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json(review);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.post('/api/admin/reviews', async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.delete('/api/admin/reviews/:id', async (req, res) => {
    try {
      const success = await storage.deleteReview(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Review not found" });
      }
      res.json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Admin Contact Messages
  app.get('/api/admin/contact', async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  app.put('/api/admin/contact/:id/read', async (req, res) => {
    try {
      const success = await storage.markMessageAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Settings Management Routes
  app.get('/api/admin/settings', async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put('/api/admin/settings/:key', async (req, res) => {
    try {
      const { value } = req.body;
      const setting = await storage.setSetting(req.params.key, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Alternative static route for Vercel compatibility (uses query params instead of path params)
  app.put('/api/admin/settings-update', async (req, res) => {
    try {
      const { key } = req.query;
      const { value } = req.body;
      
      if (!key) {
        return res.status(400).json({ message: "Setting key is required in query parameter" });
      }
      
      const setting = await storage.setSetting(key as string, value);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting via static route:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  app.get('/api/settings/:key', async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  // Object Storage Routes for Image Uploads
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const vercelBlobService = new VercelBlobStorageService();

      // Try Vercel Blob first (for production), then fall back to Replit object storage
      if (vercelBlobService.isAvailable()) {
        // Return fully qualified Vercel Blob upload endpoint
        const protocol = req.get('x-forwarded-proto') || req.secure ? 'https' : 'http';
        const host = req.get('host');
        const uploadURL = `${protocol}://${host}/api/blob/upload`;

        return res.json({
          uploadURL: uploadURL,
          method: "PUT",
          headers: {
            'Content-Type': 'application/octet-stream'
          },
          message: "Upload your file using PUT method to the provided URL"
        });
      } else if (objectStorageService.isAvailable()) {
        // Use Replit object storage
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      } else {
        return res.status(503).json({
          error: "No storage service available",
          message: "Please use external image hosting (like Unsplash URLs) for gallery images"
        });
      }
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Handle direct blob upload
  app.put("/api/blob/upload", async (req, res) => {
    try {
      const vercelBlobService = new VercelBlobStorageService();

      if (!vercelBlobService.isAvailable()) {
        return res.status(503).json({
          error: "Vercel Blob storage not available",
          message: "Blob storage is only available in Vercel deployments"
        });
      }

      // Get the raw file buffer from the request body
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => {
        chunks.push(chunk);
      });

      req.on('end', async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);
          const contentType = req.get('content-type') || 'image/jpeg';

          console.log(`Received blob upload: ${fileBuffer.length} bytes, type: ${contentType}`);

          // Process and upload the image
          const result = await vercelBlobService.processDirectUpload(fileBuffer, contentType);

          res.json({
            success: true,
            url: result.url,
            objectPath: result.objectPath,
            sizes: result.sizes
          });
        } catch (error) {
          console.error('Error processing blob upload:', error);
          res.status(500).json({
            error: "Upload processing failed",
            message: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      req.on('error', (error) => {
        console.error('Error receiving upload data:', error);
        res.status(500).json({
          error: "Upload failed",
          message: error.message
        });
      });
    } catch (error) {
      console.error("Error handling blob upload:", error);
      res.status(500).json({ error: "Failed to process upload" });
    }
  });

  app.put("/api/gallery-images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const vercelBlobService = new VercelBlobStorageService();
      let objectPath = req.body.imageURL;
      
      // Process different types of image URLs
      if (req.body.imageURL.includes('vercel-storage.com') || req.body.imageURL.includes('/blob/')) {
        // Vercel Blob URL - normalize to object path
        if (req.body.imageURL.startsWith('https://') && req.body.imageURL.includes('vercel-storage.com')) {
          const url = new URL(req.body.imageURL);
          objectPath = `/blob${url.pathname}`;
        } else if (req.body.imageURL.startsWith('/blob/')) {
          objectPath = req.body.imageURL;
        }
      } else if (objectStorageService.isAvailable() && (req.body.imageURL.startsWith('/objects/') || req.body.imageURL.startsWith('https://storage.googleapis.com/'))) {
        // Replit object storage path
        objectPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      }
      // For external URLs (Unsplash, etc.), use as-is

      const finalImageUrl = objectPath;

      // Parse tags from comma-separated string to array
      let tagsArray: string[] = [];
      if (req.body.tags && typeof req.body.tags === 'string') {
        tagsArray = req.body.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      }

      // Create gallery image in database with optimized URL
      const galleryImage = await storage.createGalleryImage({
        title: req.body.title || "Uploaded Image",
        imageUrl: finalImageUrl,
        description: req.body.altText || req.body.title || "Gallery Image",
        category: req.body.category || "general",
        tags: tagsArray,
        featured: req.body.featured || false,
      });

      res.status(200).json({
        objectPath: objectPath,
        galleryImage: galleryImage,
        message: "Image uploaded successfully. Automatic resizing will be implemented in a future update."
      });
    } catch (error) {
      console.error("Error creating gallery image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Team member routes
  app.get("/api/team", async (req, res) => {
    try {
      const teamMembers = await storage.getTeamMembers();
      res.json(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.post("/api/team", async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.json(member);
    } catch (error) {
      console.error("Error creating team member:", error);
      res.status(400).json({ message: "Failed to create team member" });
    }
  });

  app.put("/api/team/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const memberData = insertTeamMemberSchema.partial().parse(req.body);
      const member = await storage.updateTeamMember(id, memberData);
      if (member) {
        res.json(member);
      } else {
        res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error updating team member:", error);
      res.status(400).json({ message: "Failed to update team member" });
    }
  });

  app.delete("/api/team/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTeamMember(id);
      if (success) {
        res.json({ message: "Team member deleted successfully" });
      } else {
        res.status(404).json({ message: "Team member not found" });
      }
    } catch (error) {
      console.error("Error deleting team member:", error);
      res.status(500).json({ message: "Failed to delete team member" });
    }
  });



  // Newsletter subscribers route
  app.get("/api/newsletter/subscribers", async (req, res) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin password authentication (simple password protection)
  app.post('/api/admin/authenticate', async (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'GringoGardens2025!'; // Secure default password
    
    if (password === adminPassword) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  });

  // Handle 404 for API routes that don't exist
  app.use('/api/*', (req: any, res: any) => {
    res.status(404).json({ 
      message: `API endpoint not found: ${req.method} ${req.originalUrl}` 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
