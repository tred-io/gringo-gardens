import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { storage } from '../server/storage';

describe('API Endpoints Tests', () => {
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

  describe('Public API Endpoints', () => {
    describe('Categories', () => {
      test('GET /api/categories should return categories', async () => {
        const response = await request(app)
          .get('/api/categories')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('slug');
        }
      });
    });

    describe('Products', () => {
      test('GET /api/products should return products', async () => {
        const response = await request(app)
          .get('/api/products')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('price');
        }
      });

      test('GET /api/products with filters should work', async () => {
        const response = await request(app)
          .get('/api/products?featured=true')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('GET /api/products/:slug should return single product', async () => {
        // First get a product to test with
        const productsResponse = await request(app).get('/api/products');
        
        if (productsResponse.body.length > 0) {
          const slug = productsResponse.body[0].slug;
          const response = await request(app)
            .get(`/api/products/${slug}`)
            .expect(200);

          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('name');
          expect(response.body.slug).toBe(slug);
        }
      });

      test('GET /api/products/:slug with invalid slug should return 404', async () => {
        await request(app)
          .get('/api/products/non-existent-slug')
          .expect(404);
      });
    });

    describe('Blog', () => {
      test('GET /api/blog should return blog posts', async () => {
        const response = await request(app)
          .get('/api/blog')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('title');
          expect(response.body[0]).toHaveProperty('slug');
          expect(response.body[0].published).toBe(true);
        }
      });

      test('GET /api/blog with category filter should work', async () => {
        const response = await request(app)
          .get('/api/blog?category=gardening')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('GET /api/blog/:slug should return single blog post', async () => {
        const blogsResponse = await request(app).get('/api/blog');
        
        if (blogsResponse.body.length > 0) {
          const slug = blogsResponse.body[0].slug;
          const response = await request(app)
            .get(`/api/blog/${slug}`)
            .expect(200);

          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('title');
          expect(response.body.slug).toBe(slug);
          expect(response.body.published).toBe(true);
        }
      });

      test('GET /api/blog/:slug with invalid slug should return 404', async () => {
        await request(app)
          .get('/api/blog/non-existent-slug')
          .expect(404);
      });
    });

    describe('Gallery', () => {
      test('GET /api/gallery should return gallery images', async () => {
        const response = await request(app)
          .get('/api/gallery')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('imageUrl');
        }
      });

      test('GET /api/gallery with filters should work', async () => {
        const response = await request(app)
          .get('/api/gallery?featured=true')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('Reviews', () => {
      test('GET /api/reviews should return approved reviews', async () => {
        const response = await request(app)
          .get('/api/reviews')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('customerName');
          expect(response.body[0]).toHaveProperty('rating');
          expect(response.body[0].approved).toBe(true);
        }
      });
    });

    describe('Contact', () => {
      test('POST /api/contact should create contact message', async () => {
        const contactData = {
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'Test message content',
        };

        const response = await request(app)
          .post('/api/contact')
          .send(contactData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(contactData.name);
        expect(response.body.email).toBe(contactData.email);
      });

      test('POST /api/contact with invalid data should return 500', async () => {
        const invalidData = {
          name: '',  // Invalid - required field
          email: 'invalid-email',  // Invalid email format
        };

        await request(app)
          .post('/api/contact')
          .send(invalidData)
          .expect(500);
      });
    });

    describe('Newsletter', () => {
      test('POST /api/newsletter should subscribe user', async () => {
        const subscriptionData = {
          email: 'newsletter@example.com',
        };

        const response = await request(app)
          .post('/api/newsletter')
          .send(subscriptionData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(subscriptionData.email);
        expect(response.body.active).toBe(true);
      });

      test('POST /api/newsletter with invalid email should return 500', async () => {
        const invalidData = {
          email: 'invalid-email-format',
        };

        await request(app)
          .post('/api/newsletter')
          .send(invalidData)
          .expect(500);
      });
    });

    describe('Team', () => {
      test('GET /api/team should return team members', async () => {
        const response = await request(app)
          .get('/api/team')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        if (response.body.length > 0) {
          expect(response.body[0]).toHaveProperty('id');
          expect(response.body[0]).toHaveProperty('name');
          expect(response.body[0]).toHaveProperty('position');
        }
      });
    });

    describe('Settings', () => {
      test('GET /api/settings/:key should return setting', async () => {
        // First create a setting to test with
        const testKey = 'test_setting';
        await storage.setSetting(testKey, 'test value');

        const response = await request(app)
          .get(`/api/settings/${testKey}`)
          .expect(200);

        expect(response.body).toHaveProperty('key');
        expect(response.body).toHaveProperty('value');
        expect(response.body.key).toBe(testKey);
      });

      test('GET /api/settings/:key with invalid key should return 404', async () => {
        await request(app)
          .get('/api/settings/non_existent_key')
          .expect(404);
      });
    });
  });

  describe('Admin API Endpoints', () => {
    describe('Admin Products', () => {
      test('GET /api/admin/products should return all products', async () => {
        const response = await request(app)
          .get('/api/admin/products')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('POST /api/admin/products should create product', async () => {
        const productData = {
          name: 'Test Plant',
          slug: 'test-plant',
          description: 'A test plant for unit testing',
          price: '29.99',
          categoryId: 'native-plants',
          hardinessZone: '8b',
          sunRequirements: 'Full Sun',
          stock: 10,
        };

        const response = await request(app)
          .post('/api/admin/products')
          .send(productData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(productData.name);
        expect(response.body.slug).toBe(productData.slug);
      });

      test('PUT /api/admin/products/:id should update product', async () => {
        // First create a product
        const productData = {
          name: 'Update Test Plant',
          slug: 'update-test-plant',
          description: 'A plant to test updates',
          price: '19.99',
          categoryId: 'native-plants',
        };

        const createResponse = await request(app)
          .post('/api/admin/products')
          .send(productData);

        const productId = createResponse.body.id;

        // Now update it
        const updateData = {
          name: 'Updated Plant Name',
          price: '24.99',
        };

        const response = await request(app)
          .put(`/api/admin/products/${productId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.price).toBe(updateData.price);
      });

      test('DELETE /api/admin/products/:id should delete product', async () => {
        // First create a product
        const productData = {
          name: 'Delete Test Plant',
          slug: 'delete-test-plant',
          description: 'A plant to test deletion',
          price: '15.99',
          categoryId: 'native-plants',
        };

        const createResponse = await request(app)
          .post('/api/admin/products')
          .send(productData);

        const productId = createResponse.body.id;

        // Now delete it
        await request(app)
          .delete(`/api/admin/products/${productId}`)
          .expect(200);

        // Verify it's deleted
        await request(app)
          .put(`/api/admin/products/${productId}`)
          .send({ name: 'Should fail' })
          .expect(404);
      });
    });

    describe('Admin Categories', () => {
      test('GET /api/admin/categories should return all categories', async () => {
        const response = await request(app)
          .get('/api/admin/categories')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('POST /api/admin/categories should create category', async () => {
        const categoryData = {
          name: 'Test Category',
          slug: 'test-category',
          description: 'A test category for unit testing',
          showOnHomepage: false,
        };

        const response = await request(app)
          .post('/api/admin/categories')
          .send(categoryData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(categoryData.name);
        expect(response.body.slug).toBe(categoryData.slug);
      });

      test('PUT /api/admin/categories/:id should update category', async () => {
        // First create a category
        const categoryData = {
          name: 'Update Test Category',
          slug: 'update-test-category',
          description: 'A category to test updates',
        };

        const createResponse = await request(app)
          .post('/api/admin/categories')
          .send(categoryData);

        const categoryId = createResponse.body.id;

        // Now update it
        const updateData = {
          name: 'Updated Category Name',
          imageUrl: 'https://example.com/new-image.jpg',
          showOnHomepage: true,
        };

        const response = await request(app)
          .put(`/api/admin/categories/${categoryId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.imageUrl).toBe(updateData.imageUrl);
        expect(response.body.showOnHomepage).toBe(updateData.showOnHomepage);
      });

      test('DELETE /api/admin/categories/:id should delete category', async () => {
        // First create a category
        const categoryData = {
          name: 'Delete Test Category',
          slug: 'delete-test-category',
          description: 'A category to test deletion',
        };

        const createResponse = await request(app)
          .post('/api/admin/categories')
          .send(categoryData);

        const categoryId = createResponse.body.id;

        // Now delete it
        await request(app)
          .delete(`/api/admin/categories/${categoryId}`)
          .expect(200);

        // Verify it's deleted
        await request(app)
          .put(`/api/admin/categories/${categoryId}`)
          .send({ name: 'Should fail' })
          .expect(404);
      });
    });

    describe('Admin Blog', () => {
      test('GET /api/admin/blog should return all blog posts', async () => {
        const response = await request(app)
          .get('/api/admin/blog')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('POST /api/admin/blog should create blog post', async () => {
        const blogData = {
          title: 'Test Blog Post',
          slug: 'test-blog-post',
          content: 'This is test blog content',
          excerpt: 'Test excerpt',
          published: false,
        };

        const response = await request(app)
          .post('/api/admin/blog')
          .send(blogData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(blogData.title);
        expect(response.body.slug).toBe(blogData.slug);
      });

      test('PUT /api/admin/blog/:id should update blog post', async () => {
        // First create a blog post
        const blogData = {
          title: 'Update Test Blog',
          slug: 'update-test-blog',
          content: 'Original content',
          published: false,
        };

        const createResponse = await request(app)
          .post('/api/admin/blog')
          .send(blogData);

        const postId = createResponse.body.id;

        // Now update it
        const updateData = {
          title: 'Updated Blog Title',
          content: 'Updated content',
          published: true,
        };

        const response = await request(app)
          .put(`/api/admin/blog/${postId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.content).toBe(updateData.content);
        expect(response.body.published).toBe(updateData.published);
      });

      test('DELETE /api/admin/blog/:id should delete blog post', async () => {
        // First create a blog post
        const blogData = {
          title: 'Delete Test Blog',
          slug: 'delete-test-blog',
          content: 'Content to be deleted',
          published: false,
        };

        const createResponse = await request(app)
          .post('/api/admin/blog')
          .send(blogData);

        const postId = createResponse.body.id;

        // Now delete it
        await request(app)
          .delete(`/api/admin/blog/${postId}`)
          .expect(200);

        // Verify it's deleted
        await request(app)
          .put(`/api/admin/blog/${postId}`)
          .send({ title: 'Should fail' })
          .expect(404);
      });
    });

    describe('Admin Gallery', () => {
      test('GET /api/admin/gallery should return all gallery images', async () => {
        const response = await request(app)
          .get('/api/admin/gallery')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('POST /api/admin/gallery should create gallery image', async () => {
        const galleryData = {
          title: 'Test Gallery Image',
          description: 'A test gallery image',
          imageUrl: 'https://example.com/test-image.jpg',
          category: 'flowers',
          featured: false,
          tags: 'test,gallery,flowers',
        };

        const response = await request(app)
          .post('/api/admin/gallery')
          .send(galleryData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(galleryData.title);
        expect(response.body.imageUrl).toBe(galleryData.imageUrl);
      });

      test('PUT /api/admin/gallery/:id should update gallery image', async () => {
        // First create a gallery image
        const galleryData = {
          title: 'Update Test Gallery',
          imageUrl: 'https://example.com/original.jpg',
          category: 'plants',
          featured: false,
        };

        const createResponse = await request(app)
          .post('/api/admin/gallery')
          .send(galleryData);

        const imageId = createResponse.body.id;

        // Now update it
        const updateData = {
          title: 'Updated Gallery Title',
          featured: true,
          tags: 'updated,featured',
        };

        const response = await request(app)
          .put(`/api/admin/gallery/${imageId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.title).toBe(updateData.title);
        expect(response.body.featured).toBe(updateData.featured);
      });

      test('DELETE /api/admin/gallery/:id should delete gallery image', async () => {
        // First create a gallery image
        const galleryData = {
          title: 'Delete Test Gallery',
          imageUrl: 'https://example.com/delete.jpg',
          category: 'test',
        };

        const createResponse = await request(app)
          .post('/api/admin/gallery')
          .send(galleryData);

        const imageId = createResponse.body.id;

        // Now delete it
        await request(app)
          .delete(`/api/admin/gallery/${imageId}`)
          .expect(200);

        // Verify it's deleted
        await request(app)
          .put(`/api/admin/gallery/${imageId}`)
          .send({ title: 'Should fail' })
          .expect(404);
      });
    });

    describe('Admin Reviews', () => {
      test('GET /api/admin/reviews should return all reviews', async () => {
        const response = await request(app)
          .get('/api/admin/reviews')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('POST /api/admin/reviews should create review', async () => {
        const reviewData = {
          customerName: 'Test Customer',
          rating: 5,
          comment: 'Great plants and service!',
          approved: false,
          featured: false,
        };

        const response = await request(app)
          .post('/api/admin/reviews')
          .send(reviewData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.customerName).toBe(reviewData.customerName);
        expect(response.body.rating).toBe(reviewData.rating);
      });

      test('PUT /api/admin/reviews/:id should update review', async () => {
        // First create a review
        const reviewData = {
          customerName: 'Update Test Customer',
          rating: 4,
          comment: 'Good service',
          approved: false,
          featured: false,
        };

        const createResponse = await request(app)
          .post('/api/admin/reviews')
          .send(reviewData);

        const reviewId = createResponse.body.id;

        // Now update it
        const updateData = {
          approved: true,
          featured: true,
        };

        const response = await request(app)
          .put(`/api/admin/reviews/${reviewId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.approved).toBe(updateData.approved);
        expect(response.body.featured).toBe(updateData.featured);
      });

      test('DELETE /api/admin/reviews/:id should delete review', async () => {
        // First create a review
        const reviewData = {
          customerName: 'Delete Test Customer',
          rating: 3,
          comment: 'Review to be deleted',
          approved: false,
        };

        const createResponse = await request(app)
          .post('/api/admin/reviews')
          .send(reviewData);

        const reviewId = createResponse.body.id;

        // Now delete it
        await request(app)
          .delete(`/api/admin/reviews/${reviewId}`)
          .expect(200);

        // Verify it's deleted
        await request(app)
          .put(`/api/admin/reviews/${reviewId}`)
          .send({ approved: true })
          .expect(404);
      });
    });

    describe('Admin Contact', () => {
      test('GET /api/admin/contact should return all contact messages', async () => {
        const response = await request(app)
          .get('/api/admin/contact')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('PUT /api/admin/contact/:id/read should mark message as read', async () => {
        // First create a contact message
        const contactData = {
          name: 'Read Test User',
          email: 'readtest@example.com',
          subject: 'Test Read Message',
          message: 'This message will be marked as read',
        };

        const createResponse = await request(app)
          .post('/api/contact')
          .send(contactData);

        const messageId = createResponse.body.id;

        // Now mark it as read
        await request(app)
          .put(`/api/admin/contact/${messageId}/read`)
          .expect(200);
      });
    });

    describe('Admin Settings', () => {
      test('GET /api/admin/settings should return all settings', async () => {
        const response = await request(app)
          .get('/api/admin/settings')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      test('PUT /api/admin/settings/:key should update setting', async () => {
        const testKey = 'admin_test_setting';
        const testValue = 'updated test value';

        const response = await request(app)
          .put(`/api/admin/settings/${testKey}`)
          .send({ value: testValue })
          .expect(200);

        expect(response.body.key).toBe(testKey);
        expect(response.body.value).toBe(testValue);
      });
    });

    describe('Team Management', () => {
      test('POST /api/team should create team member', async () => {
        const teamData = {
          name: 'Test Team Member',
          position: 'Test Position',
          bio: 'A test team member',
          imageUrl: 'https://example.com/team.jpg',
          order: 1,
          active: true,
        };

        const response = await request(app)
          .post('/api/team')
          .send(teamData)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(teamData.name);
        expect(response.body.position).toBe(teamData.position);
      });

      test('PUT /api/team/:id should update team member', async () => {
        // First create a team member
        const teamData = {
          name: 'Update Team Member',
          position: 'Original Position',
          bio: 'Original bio',
        };

        const createResponse = await request(app)
          .post('/api/team')
          .send(teamData);

        const memberId = createResponse.body.id;

        // Now update it
        const updateData = {
          name: 'Updated Team Member',
          position: 'Updated Position',
        };

        const response = await request(app)
          .put(`/api/team/${memberId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.name).toBe(updateData.name);
        expect(response.body.position).toBe(updateData.position);
      });

      test('DELETE /api/team/:id should delete team member', async () => {
        // First create a team member
        const teamData = {
          name: 'Delete Team Member',
          position: 'Test Position',
        };

        const createResponse = await request(app)
          .post('/api/team')
          .send(teamData);

        const memberId = createResponse.body.id;

        // Now delete it
        await request(app)
          .delete(`/api/team/${memberId}`)
          .expect(200);

        // Verify it's deleted
        await request(app)
          .put(`/api/team/${memberId}`)
          .send({ name: 'Should fail' })
          .expect(404);
      });
    });

    describe('Newsletter Subscribers', () => {
      test('GET /api/newsletter/subscribers should return subscribers', async () => {
        const response = await request(app)
          .get('/api/newsletter/subscribers')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('Admin Authentication', () => {
      test('POST /api/admin/authenticate should validate password', async () => {
        const validPassword = {
          password: 'GringoGardens2025!',
        };

        const response = await request(app)
          .post('/api/admin/authenticate')
          .send(validPassword)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      test('POST /api/admin/authenticate with invalid password should return 401', async () => {
        const invalidPassword = {
          password: 'wrong-password',
        };

        const response = await request(app)
          .post('/api/admin/authenticate')
          .send(invalidPassword)
          .expect(401);

        expect(response.body.success).toBe(false);
      });
    });
  });

  describe('Object Storage Endpoints', () => {
    test('POST /api/objects/upload should return upload URL', async () => {
      const response = await request(app)
        .post('/api/objects/upload')
        .expect(200);

      expect(response.body).toHaveProperty('uploadURL');
      expect(typeof response.body.uploadURL).toBe('string');
    });

    test('PUT /api/gallery-images should update gallery image after upload', async () => {
      const uploadData = {
        imageUrl: 'https://storage.googleapis.com/test-bucket/test-image.jpg',
        title: 'Test Uploaded Image',
        category: 'flowers',
        featured: false,
      };

      const response = await request(app)
        .put('/api/gallery-images')
        .send(uploadData)
        .expect(200);

      expect(response.body).toHaveProperty('objectPath');
    });
  });

  describe('Auth Endpoints', () => {
    test('GET /api/auth/user without session should return 401', async () => {
      await request(app)
        .get('/api/auth/user')
        .expect(401);
    });

    test('GET /api/login should set session and redirect', async () => {
      const response = await request(app)
        .get('/api/login')
        .expect(302);

      expect(response.headers.location).toBe('/');
    });

    test('GET /api/logout should clear session and redirect', async () => {
      const response = await request(app)
        .get('/api/logout')
        .expect(302);

      expect(response.headers.location).toBe('/');
    });
  });

  describe('Error Handling', () => {
    test('Non-existent endpoints should return 404', async () => {
      await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);
    });

    test('Invalid HTTP methods should return appropriate errors', async () => {
      await request(app)
        .patch('/api/categories')  // PATCH not supported
        .expect(404);
    });
  });

  describe('Team Members API', () => {
    test('GET /api/team should return team members', async () => {
      const response = await request(app)
        .get('/api/team')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('position');
        expect(response.body[0]).toHaveProperty('active');
      }
    });

    test('POST /api/team should create team member', async () => {
      const teamData = {
        name: 'Test Manager',
        position: 'Plant Specialist',
        bio: 'Expert in native Texas plants',
        active: true,
        order: 1
      };

      const response = await request(app)
        .post('/api/team')
        .send(teamData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(teamData.name);
      expect(response.body.position).toBe(teamData.position);
    });
  });

  describe('Newsletter Subscribers API', () => {
    test('GET /api/newsletter/subscribers should return subscribers', async () => {
      const response = await request(app)
        .get('/api/newsletter/subscribers')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('email');
        expect(response.body[0]).toHaveProperty('active');
      }
    });
  });
});