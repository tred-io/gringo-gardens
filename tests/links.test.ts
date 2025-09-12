import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';

describe('Website Link Testing', () => {
  let app: any;
  let server: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('Frontend Routes (Static Files)', () => {
    test('Home page should be accessible', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('Admin page should be accessible', async () => {
      const response = await request(app)
        .get('/admin')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('Products page should be accessible', async () => {
      const response = await request(app)
        .get('/products')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('Blog page should be accessible', async () => {
      const response = await request(app)
        .get('/blog')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('Gallery page should be accessible', async () => {
      const response = await request(app)
        .get('/gallery')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('About page should be accessible', async () => {
      const response = await request(app)
        .get('/about')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('Contact page should be accessible', async () => {
      const response = await request(app)
        .get('/contact')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('Dynamic Routes', () => {
    test('Product detail pages should work', async () => {
      // Get a product to test with
      const productsResponse = await request(app).get('/api/products');
      
      if (productsResponse.body.length > 0) {
        const productSlug = productsResponse.body[0].slug;
        
        const response = await request(app)
          .get(`/products/${productSlug}`)
          .expect(200);

        expect(response.text).toContain('<!DOCTYPE html>');
      }
    });

    test('Blog post detail pages should work', async () => {
      // Get a blog post to test with
      const blogResponse = await request(app).get('/api/blog');
      
      if (blogResponse.body.length > 0) {
        const blogSlug = blogResponse.body[0].slug;
        
        const response = await request(app)
          .get(`/blog/${blogSlug}`)
          .expect(200);

        expect(response.text).toContain('<!DOCTYPE html>');
      }
    });

    test('Category filtered products should work', async () => {
      const response = await request(app)
        .get('/products?category=native-plants')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('API Data Integration', () => {
    test('Categories API data should be accessible', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Test that homepage categories are properly marked
      const homepageCategories = response.body.filter((cat: any) => cat.showOnHomepage);
      expect(homepageCategories.length).toBeGreaterThan(0);
      expect(homepageCategories.length).toBeLessThanOrEqual(4);
    });

    test('Products API with different filters should work', async () => {
      // Test category filter
      const categoryResponse = await request(app)
        .get('/api/products?category=native-plants')
        .expect(200);
      expect(Array.isArray(categoryResponse.body)).toBe(true);

      // Test search filter
      const searchResponse = await request(app)
        .get('/api/products?search=plant')
        .expect(200);
      expect(Array.isArray(searchResponse.body)).toBe(true);

      // Test featured filter
      const featuredResponse = await request(app)
        .get('/api/products?featured=true')
        .expect(200);
      expect(Array.isArray(featuredResponse.body)).toBe(true);

      // Test hardiness zone filter
      const zoneResponse = await request(app)
        .get('/api/products?hardinessZone=8b')
        .expect(200);
      expect(Array.isArray(zoneResponse.body)).toBe(true);

      // Test sun requirements filter
      const sunResponse = await request(app)
        .get('/api/products?sunRequirements=Full Sun')
        .expect(200);
      expect(Array.isArray(sunResponse.body)).toBe(true);

      // Test price range filter
      const priceResponse = await request(app)
        .get('/api/products?priceRange=0-50')
        .expect(200);
      expect(Array.isArray(priceResponse.body)).toBe(true);
    });

    test('Gallery API with filters should work', async () => {
      // Test category filter
      const categoryResponse = await request(app)
        .get('/api/gallery?category=flowers')
        .expect(200);
      expect(Array.isArray(categoryResponse.body)).toBe(true);

      // Test featured filter
      const featuredResponse = await request(app)
        .get('/api/gallery?featured=true')
        .expect(200);
      expect(Array.isArray(featuredResponse.body)).toBe(true);
    });

    test('Blog API with filters should work', async () => {
      // Test category filter
      const categoryResponse = await request(app)
        .get('/api/blog?category=gardening')
        .expect(200);
      expect(Array.isArray(categoryResponse.body)).toBe(true);
    });
  });

  describe('Admin Panel Links', () => {
    test('Admin authentication should work', async () => {
      const response = await request(app)
        .post('/api/admin/authenticate')
        .send({ password: 'GringoGardens2025!' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('All admin API endpoints should be accessible', async () => {
      // Test all admin GET endpoints
      const endpoints = [
        '/api/admin/products',
        '/api/admin/categories', 
        '/api/admin/blog',
        '/api/admin/gallery',
        '/api/admin/reviews',
        '/api/admin/contact',
        '/api/admin/settings',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .expect(200);
        expect(Array.isArray(response.body)).toBe(true);
      }
    });

    test('Team and newsletter endpoints should work', async () => {
      await request(app)
        .get('/api/team')
        .expect(200);

      await request(app)
        .get('/api/newsletter/subscribers')
        .expect(200);
    });
  });

  describe('External Links and Assets', () => {
    test('Static assets should be accessible', async () => {
      // Test that the main app JavaScript file is served
      const response = await request(app)
        .get('/src/main.tsx')
        .expect(200);

      expect(response.text).toBeTruthy();
    });

    test('CSS files should be accessible', async () => {
      // Test that CSS is being served (exact path may vary due to Vite)
      const response = await request(app)
        .get('/src/index.css')
        .expect(200);

      expect(response.text).toBeTruthy();
    });
  });

  describe('Form Submissions', () => {
    test('Contact form submission should work', async () => {
      const contactData = {
        name: 'Link Test User',
        email: 'linktest@example.com',
        subject: 'Testing Contact Form',
        message: 'This is a test message from the link testing suite.',
      };

      const response = await request(app)
        .post('/api/contact')
        .send(contactData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(contactData.name);
    });

    test('Newsletter subscription should work', async () => {
      const subscriptionData = {
        email: 'linktest-newsletter@example.com',
      };

      const response = await request(app)
        .post('/api/newsletter')
        .send(subscriptionData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(subscriptionData.email);
    });
  });

  describe('Settings and Configuration', () => {
    test('Business hours settings should be accessible', async () => {
      // First set a business hours setting
      await request(app)
        .put('/api/admin/settings/business_hours')
        .send({ 
          value: JSON.stringify({
            monday: { open: '09:00', close: '17:00', closed: false },
            tuesday: { open: '09:00', close: '17:00', closed: false },
            wednesday: { open: '09:00', close: '17:00', closed: false },
            thursday: { open: '09:00', close: '17:00', closed: false },
            friday: { open: '09:00', close: '17:00', closed: false },
            saturday: { open: '09:00', close: '15:00', closed: false },
            sunday: { open: '12:00', close: '15:00', closed: false }
          })
        });

      const response = await request(app)
        .get('/api/settings/business_hours')
        .expect(200);

      expect(response.body).toHaveProperty('key');
      expect(response.body.key).toBe('business_hours');
    });

    test('Temporary closure settings should work', async () => {
      await request(app)
        .put('/api/admin/settings/temporary_closure')
        .send({ 
          value: JSON.stringify({
            active: false,
            message: 'We are temporarily closed for maintenance.'
          })
        });

      const response = await request(app)
        .get('/api/settings/temporary_closure')
        .expect(200);

      expect(response.body).toHaveProperty('key');
      expect(response.body.key).toBe('temporary_closure');
    });
  });

  describe('Error Pages', () => {
    test('Non-existent pages should return HTML (SPA routing)', async () => {
      const response = await request(app)
        .get('/non-existent-page')
        .expect(200);

      // Should return the main HTML file for SPA routing
      expect(response.text).toContain('<!DOCTYPE html>');
    });

    test('Non-existent API endpoints should return 404', async () => {
      await request(app)
        .get('/api/non-existent')
        .expect(404);
    });

    test('Invalid product slugs should return 404 from API', async () => {
      await request(app)
        .get('/api/products/non-existent-product')
        .expect(404);
    });

    test('Invalid blog slugs should return 404 from API', async () => {
      await request(app)
        .get('/api/blog/non-existent-post')
        .expect(404);
    });
  });

  describe('Navigation Links', () => {
    test('All main navigation routes should be accessible', async () => {
      const routes = [
        '/',
        '/products',
        '/blog', 
        '/gallery',
        '/about',
        '/contact',
      ];

      for (const route of routes) {
        const response = await request(app)
          .get(route)
          .expect(200);
        expect(response.text).toContain('<!DOCTYPE html>');
      }
    });

    test('Admin navigation should be accessible', async () => {
      const response = await request(app)
        .get('/admin')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('Data Consistency', () => {
    test('Homepage categories should have valid images', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      const homepageCategories = response.body.filter((cat: any) => cat.showOnHomepage);
      
      for (const category of homepageCategories) {
        expect(category).toHaveProperty('imageUrl');
        if (category.imageUrl) {
          expect(typeof category.imageUrl).toBe('string');
          expect(category.imageUrl).toMatch(/^https?:\/\/.+/);
        }
      }
    });

    test('Published blog posts should be accessible', async () => {
      const blogResponse = await request(app).get('/api/blog');
      
      for (const post of blogResponse.body) {
        expect(post.published).toBe(true);
        
        // Test individual post accessibility
        const postResponse = await request(app)
          .get(`/api/blog/${post.slug}`)
          .expect(200);
          
        expect(postResponse.body.id).toBe(post.id);
      }
    });

    test('Active products should be accessible', async () => {
      const productsResponse = await request(app).get('/api/products');
      
      for (const product of productsResponse.body) {
        expect(product.active).toBe(true);
        
        // Test individual product accessibility
        const productResponse = await request(app)
          .get(`/api/products/${product.slug}`)
          .expect(200);
          
        expect(productResponse.body.id).toBe(product.id);
      }
    });

    test('Approved reviews should be accessible', async () => {
      const reviewsResponse = await request(app).get('/api/reviews');
      
      for (const review of reviewsResponse.body) {
        expect(review.approved).toBe(true);
        expect(review).toHaveProperty('rating');
        expect(review.rating).toBeGreaterThanOrEqual(1);
        expect(review.rating).toBeLessThanOrEqual(5);
      }
    });
  });
});