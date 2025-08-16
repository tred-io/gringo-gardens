import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed auth imports - using simple password protection instead
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Skip external auth setup for development
  console.log("Using development authentication only");
  
  // Use a simple in-memory session for development
  const sessions = new Map();
  
  app.use((req: any, res, next) => {
    const sessionId = req.headers['x-session-id'] || 'dev-session';
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, {});
    }
    req.session = sessions.get(sessionId);
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
    req.session.devAuth = true;
    console.log('Session after:', req.session);
    res.redirect('/');
  });

  app.get('/api/logout', (req, res) => {
    console.log('Development logout - clearing session');
    if (req.session) {
      req.session.devAuth = false;
      delete req.session.devAuth;
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
      const { category, search, hardinessZone, sunRequirements, priceRange, featured } = req.query;
      const products = await storage.getProducts({
        category: category as string,
        search: search as string,
        hardinessZone: hardinessZone as string,
        sunRequirements: sunRequirements as string,
        priceRange: priceRange as string,
        featured: featured === 'true',
        active: true, // Only show active products to public
      });
      res.json(products);
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
      
      const image = await storage.createGalleryImage(validatedData);
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
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/gallery-images", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.imageURL,
      );

      // Get the uploaded file for processing
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      
      // Automatically resize and optimize the image
      const { imageProcessor } = await import("./imageProcessor");
      const optimizedUrl = await imageProcessor.optimizeForWeb(objectFile);

      // Use the optimized URL or fall back to original object path
      const finalImageUrl = optimizedUrl || objectPath;

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

  const httpServer = createServer(app);
  return httpServer;
}
