#!/usr/bin/env tsx
/**
 * Manual API endpoint testing script
 * Tests all API endpoints to ensure they work correctly
 */

const BASE_URL = 'http://localhost:5000';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  error?: string;
  responseType?: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  expectedStatus: number = 200
): Promise<TestResult> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await response.text();
    
    let responseType = 'unknown';
    try {
      JSON.parse(text);
      responseType = 'json';
    } catch {
      if (text.includes('<!DOCTYPE html>')) {
        responseType = 'html';
      } else {
        responseType = 'text';
      }
    }

    const result: TestResult = {
      endpoint,
      method,
      status: response.status,
      success: response.status === expectedStatus,
      responseType,
    };

    if (!result.success) {
      result.error = `Expected ${expectedStatus}, got ${response.status}`;
    }

    return result;
  } catch (error) {
    return {
      endpoint,
      method,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function runTests() {
  console.log('🧪 Starting API endpoint tests...\n');

  // Public API endpoints
  console.log('📍 Testing Public API endpoints...');
  results.push(await testEndpoint('/api/categories'));
  results.push(await testEndpoint('/api/products'));
  results.push(await testEndpoint('/api/products?category=native-plants'));
  results.push(await testEndpoint('/api/products?featured=true'));
  results.push(await testEndpoint('/api/blog'));
  results.push(await testEndpoint('/api/blog?category=gardening'));
  results.push(await testEndpoint('/api/gallery'));
  results.push(await testEndpoint('/api/gallery?featured=true'));
  results.push(await testEndpoint('/api/reviews'));
  results.push(await testEndpoint('/api/team'));
  results.push(await testEndpoint('/api/newsletter/subscribers'));

  // Test specific product/blog by slug (if they exist)
  const productsResponse = await fetch(`${BASE_URL}/api/products`);
  const products = await productsResponse.json();
  if (products.length > 0) {
    results.push(await testEndpoint(`/api/products/${products[0].slug}`));
  }

  const blogResponse = await fetch(`${BASE_URL}/api/blog`);
  const posts = await blogResponse.json();
  if (posts.length > 0) {
    results.push(await testEndpoint(`/api/blog/${posts[0].slug}`));
  }

  // Test 404 cases
  results.push(await testEndpoint('/api/products/non-existent', 'GET', undefined, 404));
  results.push(await testEndpoint('/api/blog/non-existent', 'GET', undefined, 404));
  results.push(await testEndpoint('/api/settings/non_existent', 'GET', undefined, 404));

  // Admin API endpoints
  console.log('🔐 Testing Admin API endpoints...');
  results.push(await testEndpoint('/api/admin/products'));
  results.push(await testEndpoint('/api/admin/categories'));
  results.push(await testEndpoint('/api/admin/blog'));
  results.push(await testEndpoint('/api/admin/gallery'));
  results.push(await testEndpoint('/api/admin/reviews'));
  results.push(await testEndpoint('/api/admin/contact'));
  results.push(await testEndpoint('/api/admin/settings'));

  // Test POST endpoints with valid data
  console.log('📝 Testing POST endpoints...');
  
  // Newsletter subscription
  results.push(await testEndpoint('/api/newsletter', 'POST', {
    email: 'test@example.com'
  }, 201));

  // Contact form
  results.push(await testEndpoint('/api/contact', 'POST', {
    name: 'Test User',
    email: 'test@example.com',
    subject: 'Test Subject',
    message: 'Test message content'
  }, 201));

  // Admin authentication
  results.push(await testEndpoint('/api/admin/authenticate', 'POST', {
    password: 'GringoGardens2025!'
  }));

  results.push(await testEndpoint('/api/admin/authenticate', 'POST', {
    password: 'wrong-password'
  }, 401));

  // Object storage
  results.push(await testEndpoint('/api/objects/upload', 'POST'));

  // Auth endpoints
  console.log('🔑 Testing Auth endpoints...');
  results.push(await testEndpoint('/api/auth/user', 'GET', undefined, 401));
  results.push(await testEndpoint('/api/login', 'GET', undefined, 302));
  results.push(await testEndpoint('/api/logout', 'GET', undefined, 302));

  // Frontend routes (should return HTML)
  console.log('🌐 Testing Frontend routes...');
  const frontendRoutes = ['/', '/products', '/blog', '/gallery', '/about', '/contact', '/admin'];
  for (const route of frontendRoutes) {
    results.push(await testEndpoint(route));
  }

  // Print results
  console.log('\n📊 Test Results:\n');
  console.log('='.repeat(80));
  console.log(
    '| Endpoint'.padEnd(40) + 
    '| Method'.padEnd(8) + 
    '| Status'.padEnd(8) + 
    '| Result'.padEnd(10) + 
    '| Type'.padEnd(8) + 
    '| Error'
  );
  console.log('='.repeat(80));

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const errorText = result.error || '';
    
    console.log(
      `| ${result.endpoint.padEnd(38)} | ${result.method.padEnd(6)} | ${result.status.toString().padEnd(6)} | ${status.padEnd(8)} | ${(result.responseType || '').padEnd(6)} | ${errorText}`
    );

    if (result.success) passed++;
    else failed++;
  });

  console.log('='.repeat(80));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  
  if (failed === 0) {
    console.log('🎉 All API endpoints are working correctly!');
  } else {
    console.log(`⚠️  ${failed} endpoints need attention.`);
  }

  // Additional checks
  console.log('\n🔍 Additional Checks:\n');

  // Check category images
  const categoriesResponse = await fetch(`${BASE_URL}/api/categories`);
  const categories = await categoriesResponse.json();
  const homepageCategories = categories.filter((cat: any) => cat.showOnHomepage);
  console.log(`✓ Found ${homepageCategories.length} categories marked for homepage display`);
  
  const categoriesWithImages = homepageCategories.filter((cat: any) => cat.imageUrl);
  console.log(`✓ ${categoriesWithImages.length}/${homepageCategories.length} homepage categories have images`);

  // Check data consistency
  const approvedReviews = await fetch(`${BASE_URL}/api/reviews`);
  const reviewsData = await approvedReviews.json();
  console.log(`✓ Found ${reviewsData.length} approved reviews`);

  const activeProducts = await fetch(`${BASE_URL}/api/products`);
  const productsData = await activeProducts.json();
  console.log(`✓ Found ${productsData.length} active products`);

  const publishedPosts = await fetch(`${BASE_URL}/api/blog`);
  const postsData = await publishedPosts.json();
  console.log(`✓ Found ${postsData.length} published blog posts`);

  console.log('\n✨ API endpoint testing complete!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, testEndpoint };