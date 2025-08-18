// Test setup file
import '@jest/globals';

// Set up test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.ADMIN_PASSWORD = 'GringoGardens2025!';

// Mock object storage environment variables for testing
process.env.PUBLIC_OBJECT_SEARCH_PATHS = '/test-bucket/public';
process.env.PRIVATE_OBJECT_DIR = '/test-bucket/.private';

// Suppress console logs during testing unless there's an error
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  if (process.env.VERBOSE_TESTS === 'true') {
    originalLog(...args);
  }
};

console.warn = (...args) => {
  if (process.env.VERBOSE_TESTS === 'true') {
    originalWarn(...args);
  }
};

console.error = (...args) => {
  // Always show errors
  originalError(...args);
};