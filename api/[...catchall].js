const express = require('express');

// Simple in-memory storage for demo
const categories = [
  { id: "native-plants", name: "Native Plants", description: "Texas native plants", showOnHomepage: true },
  { id: "fruit-trees", name: "Fruit Trees", description: "Fresh fruit trees", showOnHomepage: true },
  { id: "shade-trees", name: "Shade Trees", description: "Decorative shade trees", showOnHomepage: true },
  { id: "hanging-baskets", name: "Hanging Baskets", description: "Beautiful hanging arrangements", showOnHomepage: true }
];

const products = [
  { id: "1", name: "Texas Bluebonnet", price: 12.99, category: "native-plants", featured: true, active: true },
  { id: "2", name: "Live Oak", price: 45.99, category: "shade-trees", featured: false, active: true },
  { id: "3", name: "Peach Tree", price: 32.99, category: "fruit-trees", featured: true, active: true }
];

const reviews = [
  { id: "1", customerName: "Sarah Johnson", rating: 5, content: "Amazing selection of native plants!", featured: true },
  { id: "2", customerName: "Mike Davis", rating: 5, content: "Great quality trees and excellent service.", featured: true }
];

const settings = [
  { id: "1", key: "temporary_closure", value: JSON.stringify({ closed: false, message: "" }) }
];

// Create Express app
const app = express();
app.use(express.json());

// Admin authentication
app.post('/api/admin/authenticate', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'GringoGardens2025!';
  
  if (password === adminPassword) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Admin routes
app.get('/api/admin/settings', (req, res) => {
  res.json(settings);
});

app.get('/api/admin/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/admin/products', (req, res) => {
  res.json(products);
});

app.get('/api/admin/reviews', (req, res) => {
  res.json(reviews);
});

app.get('/api/admin/gallery', (req, res) => {
  res.json([]);
});

app.get('/api/admin/blog', (req, res) => {
  res.json([]);
});

app.get('/api/admin/contact', (req, res) => {
  res.json([]);
});

// Public routes
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/reviews', (req, res) => {
  res.json(reviews);
});

app.get('/api/settings/:key', (req, res) => {
  const setting = settings.find(s => s.key === req.params.key);
  if (!setting) {
    return res.status(404).json({ message: "Setting not found" });
  }
  res.json(setting);
});

// Contact form
app.post('/api/contact', (req, res) => {
  console.log('Contact form submission:', req.body);
  res.json({ message: 'Message sent successfully' });
});

// Export the serverless handler
module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Handle the request with Express
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};