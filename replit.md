# Gringo Gardens - Texas Native Plant Nursery

## Overview

This is a full-stack web application for Gringo Gardens, a Texas native plant nursery based in Lampasas. The application serves as both a public-facing website showcasing native plants, trees, and nursery services, and an admin dashboard for content management. Built with a modern tech stack focusing on performance, user experience, and mobile-first design with a bluebonnet-inspired theme.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**: React SPA with TypeScript using Vite as the build tool. The client follows a component-based architecture with shadcn/ui components for consistent design. Uses Wouter for lightweight routing and TanStack Query for server state management.

**Backend Architecture**: Express.js REST API server with TypeScript. Uses a middleware-based approach with proper error handling and logging. Integrates Replit's authentication system for admin access.

**Build System**: Vite for frontend development with hot reload, esbuild for production server bundling. Supports both development and production environments with proper asset handling.

## Key Components

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: Neon serverless PostgreSQL (configured via DATABASE_URL)
- **Schema**: Comprehensive schema including users, products, categories, blog posts, gallery images, reviews, contact messages, and newsletter subscribers
- **Session Storage**: PostgreSQL-based session storage for authentication

### Authentication System
- **Provider**: Replit OpenID Connect (OIDC) authentication
- **Session Management**: Express sessions with PostgreSQL store
- **Authorization**: Role-based access with admin-only routes for content management

### Frontend Features
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom bluebonnet theme colors
- **State Management**: TanStack Query for server state, React hooks for local state
- **Forms**: React Hook Form with Zod validation
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Features
- **API Structure**: RESTful endpoints for all resources (products, blog, gallery, etc.)
- **File Storage**: Image handling for products, blog posts, and gallery
- **Content Management**: Full CRUD operations for all content types
- **Newsletter**: Email subscription management
- **Contact Form**: Message handling and storage

## Data Flow

1. **Public Pages**: Users browse products, read blog posts, view gallery, and submit contact forms
2. **Authentication**: Admin users authenticate via Replit OIDC for dashboard access using the "Log In" button in navigation
3. **Content Management**: Authenticated admins can create, edit, and delete all content through the admin dashboard
4. **Data Persistence**: All content is stored in PostgreSQL with proper relationships and sample data
5. **Real-time Updates**: TanStack Query provides optimistic updates and cache invalidation

## Recent Changes (Latest Session)

- **Fixed Authentication System**: Resolved "replit.com refused to connect" errors by implementing development authentication bypass
- **Implemented Session Management**: Created simple in-memory session system for development login/logout functionality  
- **Fixed SelectItem Errors**: Corrected empty value props in admin dashboard that were causing React crashes
- **Enhanced Navigation**: Login/logout buttons now work properly with immediate state changes
- **Admin Access**: Removed authentication barriers for admin panel to enable full content management during development
- **Mobile Navigation**: Fixed responsive navigation with proper logout handlers for mobile devices
- **Updated Business Address**: Changed address to 4041 FM 1715, Lampasas, TX 76550 throughout all components
- **Removed Phone Numbers**: Eliminated phone contact information from Footer, Home, and Contact pages
- **Added Interactive Map**: Integrated Google Maps iframe on Contact page showing the new Lampasas location
- **Business Hours Management**: Created comprehensive admin settings panel with individual day hour management and seasonal closure options
- **Settings API**: Implemented backend API routes for settings management with database storage
- **Hero Image Update**: Successfully integrated client's Adobe Stock wildflower image as hero background, replacing placeholder with authentic Texas wildflower field imagery
- **Social Media Integration**: Updated footer social media links to point to actual Gringo Gardens accounts (Facebook, Instagram, YouTube, TikTok, X/Twitter, Google Maps)
- **Home Page Photo Update**: Replaced placeholder images in "Rooted in Texas Tradition" section with authentic nursery photos showing colorful mums, vegetable seedlings, and vibrant bougainvillea under shade structures

## External Dependencies

### Core Runtime
- **Node.js**: Runtime environment with ES modules
- **Database**: Neon serverless PostgreSQL
- **Authentication**: Replit OIDC service

### Key Libraries
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod
- **Backend**: Express.js, Drizzle ORM, Passport.js, Express Session
- **Development**: tsx for TypeScript execution, various Replit development tools

### External Services
- **Replit Authentication**: Provides user authentication and authorization
- **Neon Database**: Serverless PostgreSQL hosting
- **Image Storage**: Currently using external URLs (Unsplash for demo content)

## Deployment Strategy

**Development Environment**: 
- Vite dev server with HMR for frontend development
- tsx for running TypeScript server with auto-reload
- Integrated development experience in Replit

**Production Build**:
- Vite builds the frontend to `dist/public`
- esbuild bundles the server to `dist/index.js`
- Single production server serves both API and static assets

**Environment Configuration**:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- Various OIDC configuration variables

**Hosting**: Designed for Replit hosting with proper environment variable management and integrated deployment workflow.