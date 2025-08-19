// Vercel API Route for User Authentication Status
import { createServer } from 'http';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const app = express();

// Configure session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure Passport
passport.use(new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  async (username, password, done) => {
    // Simple password check for development
    if (password === 'GringoGardens2025!') {
      return done(null, { id: 'admin', username: 'admin' });
    }
    return done(null, false);
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, { id: 'admin', username: 'admin' });
});

app.use(passport.initialize());
app.use(passport.session());

// Handle the request
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if user is authenticated
    if (req.user) {
      return res.json({
        id: req.user.id,
        username: req.user.username,
        isAuthenticated: true
      });
    } else {
      return res.status(401).json({
        message: 'Unauthorized'
      });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}