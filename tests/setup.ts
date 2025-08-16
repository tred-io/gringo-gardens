// Test setup file
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.ADMIN_PASSWORD = 'GringoGardens2025!';

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

// Global test timeout
// jest.setTimeout(30000);