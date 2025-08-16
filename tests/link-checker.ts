#!/usr/bin/env tsx
/**
 * Website Link Testing Script
 * Tests all links and navigation paths to ensure they work correctly
 */

const BASE_URL = 'http://localhost:5000';

interface LinkTestResult {
  path: string;
  status: number;
  success: boolean;
  error?: string;
  type: 'page' | 'api' | 'asset';
  responseTime: number;
}

const results: LinkTestResult[] = [];

async function testLink(path: string, expectedStatus: number = 200, type: 'page' | 'api' | 'asset' = 'page'): Promise<LinkTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const responseTime = Date.now() - startTime;
    
    return {
      path,
      status: response.status,
      success: response.status === expectedStatus,
      type,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      path,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      type,
      responseTime,
    };
  }
}

async function runLinkTests() {
  console.log('🔗 Starting comprehensive link testing...\n');

  // Main navigation pages
  console.log('🏠 Testing main navigation pages...');
  results.push(await testLink('/'));
  results.push(await testLink('/products'));
  results.push(await testLink('/blog'));
  results.push(await testLink('/gallery'));
  results.push(await testLink('/about'));
  results.push(await testLink('/contact'));
  results.push(await testLink('/admin'));

  // Product pages (dynamic routes)
  console.log('🌱 Testing product pages...');
  try {
    const productsResponse = await fetch(`${BASE_URL}/api/products`);
    const products = await productsResponse.json();
    
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const product = products[i];
      results.push(await testLink(`/products/${product.slug}`));
    }
    
    // Test product filtering
    results.push(await testLink('/products?category=native-plants'));
    results.push(await testLink('/products?search=plant'));
    results.push(await testLink('/products?featured=true'));
    results.push(await testLink('/products?hardinessZone=8b'));
    
  } catch (error) {
    console.log('⚠️ Could not fetch products for testing');
  }

  // Blog pages (dynamic routes)
  console.log('📝 Testing blog pages...');
  try {
    const blogResponse = await fetch(`${BASE_URL}/api/blog`);
    const posts = await blogResponse.json();
    
    for (let i = 0; i < Math.min(3, posts.length); i++) {
      const post = posts[i];
      results.push(await testLink(`/blog/${post.slug}`));
    }
    
    // Test blog filtering
    results.push(await testLink('/blog?category=gardening'));
    
  } catch (error) {
    console.log('⚠️ Could not fetch blog posts for testing');
  }

  // Gallery filtering
  console.log('📸 Testing gallery pages...');
  results.push(await testLink('/gallery?category=flowers'));
  results.push(await testLink('/gallery?featured=true'));

  // API endpoints
  console.log('🔌 Testing API endpoints...');
  const apiEndpoints = [
    '/api/categories',
    '/api/products',
    '/api/blog',
    '/api/gallery',
    '/api/reviews',
    '/api/team',
    '/api/newsletter/subscribers',
    '/api/admin/products',
    '/api/admin/categories',
    '/api/admin/blog',
    '/api/admin/gallery',
    '/api/admin/reviews',
    '/api/admin/contact',
    '/api/admin/settings',
  ];

  for (const endpoint of apiEndpoints) {
    results.push(await testLink(endpoint, 200, 'api'));
  }

  // Test 404 handling
  console.log('🚫 Testing error handling...');
  results.push(await testLink('/non-existent-page', 200)); // SPA should return 200 with HTML
  results.push(await testLink('/api/non-existent-endpoint', 404, 'api'));
  results.push(await testLink('/products/non-existent-product', 200)); // SPA routing
  results.push(await testLink('/blog/non-existent-post', 200)); // SPA routing

  // Static assets (common ones)
  console.log('📁 Testing static assets...');
  results.push(await testLink('/src/main.tsx', 200, 'asset'));
  results.push(await testLink('/src/index.css', 200, 'asset'));
  
  // Authentication routes
  console.log('🔐 Testing authentication routes...');
  results.push(await testLink('/api/auth/user', 401, 'api'));
  results.push(await testLink('/api/login', 302, 'api'));
  results.push(await testLink('/api/logout', 302, 'api'));

  // Admin routes with password authentication
  console.log('🛡️ Testing admin authentication...');
  
  // Test valid password
  try {
    const validAuth = await fetch(`${BASE_URL}/api/admin/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'GringoGardens2025!' })
    });
    results.push({
      path: '/api/admin/authenticate (valid)',
      status: validAuth.status,
      success: validAuth.status === 200,
      type: 'api',
      responseTime: 0,
    });
  } catch (error) {
    results.push({
      path: '/api/admin/authenticate (valid)',
      status: 0,
      success: false,
      error: 'Request failed',
      type: 'api',
      responseTime: 0,
    });
  }

  // Test invalid password
  try {
    const invalidAuth = await fetch(`${BASE_URL}/api/admin/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password' })
    });
    results.push({
      path: '/api/admin/authenticate (invalid)',
      status: invalidAuth.status,
      success: invalidAuth.status === 401,
      type: 'api',
      responseTime: 0,
    });
  } catch (error) {
    results.push({
      path: '/api/admin/authenticate (invalid)',
      status: 0,
      success: false,
      error: 'Request failed',
      type: 'api',
      responseTime: 0,
    });
  }

  // Test form submissions
  console.log('📋 Testing form submissions...');
  
  // Newsletter subscription
  try {
    const newsletterResponse = await fetch(`${BASE_URL}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'linktest@example.com' })
    });
    results.push({
      path: '/api/newsletter (POST)',
      status: newsletterResponse.status,
      success: newsletterResponse.status === 201,
      type: 'api',
      responseTime: 0,
    });
  } catch (error) {
    results.push({
      path: '/api/newsletter (POST)',
      status: 0,
      success: false,
      error: 'Request failed',
      type: 'api',
      responseTime: 0,
    });
  }

  // Contact form
  try {
    const contactResponse = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Link Test User',
        email: 'linktest@example.com',
        subject: 'Link Testing',
        message: 'This is a test message from the link testing suite.'
      })
    });
    results.push({
      path: '/api/contact (POST)',
      status: contactResponse.status,
      success: contactResponse.status === 201,
      type: 'api',
      responseTime: 0,
    });
  } catch (error) {
    results.push({
      path: '/api/contact (POST)',
      status: 0,
      success: false,
      error: 'Request failed',
      type: 'api',
      responseTime: 0,
    });
  }

  // Print results
  console.log('\n📊 Link Test Results:\n');
  console.log('='.repeat(90));
  console.log(
    '| Path'.padEnd(45) + 
    '| Type'.padEnd(8) + 
    '| Status'.padEnd(8) + 
    '| Result'.padEnd(10) + 
    '| Time(ms)'.padEnd(10) + 
    '| Error'
  );
  console.log('='.repeat(90));

  let passed = 0;
  let failed = 0;

  // Sort results by type for better readability
  const sortedResults = results.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.path.localeCompare(b.path);
  });

  sortedResults.forEach((result) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const errorText = result.error || '';
    const timeText = result.responseTime ? result.responseTime.toString() : '-';
    
    console.log(
      `| ${result.path.padEnd(43)} | ${result.type.padEnd(6)} | ${result.status.toString().padEnd(6)} | ${status.padEnd(8)} | ${timeText.padEnd(8)} | ${errorText}`
    );

    if (result.success) passed++;
    else failed++;
  });

  console.log('='.repeat(90));
  console.log(`\n📈 Summary: ${passed} passed, ${failed} failed, ${passed + failed} total`);

  // Performance analysis
  const pageTimes = results.filter(r => r.type === 'page' && r.success).map(r => r.responseTime);
  const apiTimes = results.filter(r => r.type === 'api' && r.success).map(r => r.responseTime);
  
  if (pageTimes.length > 0) {
    const avgPageTime = pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length;
    const maxPageTime = Math.max(...pageTimes);
    console.log(`⏱️  Page Performance: Avg ${avgPageTime.toFixed(0)}ms, Max ${maxPageTime}ms`);
  }
  
  if (apiTimes.length > 0) {
    const avgApiTime = apiTimes.reduce((a, b) => a + b, 0) / apiTimes.length;
    const maxApiTime = Math.max(...apiTimes);
    console.log(`🔌 API Performance: Avg ${avgApiTime.toFixed(0)}ms, Max ${maxApiTime}ms`);
  }

  // Detailed checks
  console.log('\n🔍 Detailed Checks:\n');

  // Check data consistency
  try {
    const categoriesRes = await fetch(`${BASE_URL}/api/categories`);
    const categories = await categoriesRes.json();
    const homepageCategories = categories.filter((cat: any) => cat.showOnHomepage);
    console.log(`✓ Homepage categories: ${homepageCategories.length}/4 configured`);

    const categoryLinks = homepageCategories.map((cat: any) => `/products?category=${cat.slug}`);
    console.log(`✓ Category links available: ${categoryLinks.join(', ')}`);

    // Check that all homepage categories have valid links
    for (const cat of homepageCategories) {
      const testResult = await testLink(`/products?category=${cat.slug}`);
      console.log(`  - /products?category=${cat.slug}: ${testResult.success ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.log('❌ Could not verify category links');
  }

  // Check navigation consistency
  const mainPages = ['/', '/products', '/blog', '/gallery', '/about', '/contact'];
  const workingPages = results.filter(r => 
    mainPages.includes(r.path) && r.success && r.type === 'page'
  ).map(r => r.path);
  
  console.log(`✓ Main navigation: ${workingPages.length}/${mainPages.length} pages working`);
  
  // Check admin functionality
  const adminPages = results.filter(r => r.path.startsWith('/api/admin') && r.success);
  console.log(`✓ Admin API endpoints: ${adminPages.length} working`);

  if (failed === 0) {
    console.log('\n🎉 All links and routes are working correctly!');
  } else {
    console.log(`\n⚠️  ${failed} links need attention.`);
  }

  console.log('\n✨ Link testing complete!');
  return { passed, failed, total: passed + failed };
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runLinkTests().catch(console.error);
}

export { runLinkTests };