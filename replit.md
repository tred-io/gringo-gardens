# Gringo Gardens - Texas Native Plant Nursery

## Overview

This is a full-stack web application for Gringo Gardens, a Texas native plant nursery based in Lampasas. The application serves as both a public-facing website showcasing native plants, trees, and nursery services, and an admin dashboard for content management. The project aims to provide a performant, user-friendly, and mobile-first experience with a bluebonnet-inspired theme. Key capabilities include dynamic content management for products, blog posts, and galleries, robust authentication for administrators, and integration of AI-powered plant identification for gallery images and product creation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**: React SPA with TypeScript, built using Vite. It employs a component-based approach with shadcn/ui for consistent design, Wouter for routing, and TanStack Query for server state management. Styling is handled with Tailwind CSS, customized to a bluebonnet theme. Forms utilize React Hook Form with Zod validation. The design is responsive and optimized for mobile devices.

**Backend Architecture**: Express.js REST API server with TypeScript. It features a middleware-based approach with robust error handling and logging. The system includes a comprehensive database schema managed by Drizzle ORM (PostgreSQL dialect) on Neon serverless PostgreSQL, covering users, products, categories, blog posts, gallery images, reviews, contact messages, and newsletter subscribers. Authentication is a simple password-based protection system for admin access, with session management using PostgreSQL-based storage. Full CRUD operations are available for all content types, including image handling for various media.

**Key Features**:
- **Content Management**: Full CRUD operations for all content, including dynamic home page categories and comprehensive gallery management with tagging, filtering, and duplicate prevention.
- **Plant Identification**: Integration with OpenAI GPT-4o-mini for automatic plant identification from uploaded gallery images, extracting botanical details and populating product fields.
- **Business Operations**: Management of business hours, contact messages, and newsletter subscribers.
- **SEO & Analytics**: Comprehensive Google Analytics 4 integration and SEO optimization with dynamic meta tags, Open Graph, Twitter cards, and JSON-LD structured data.

## External Dependencies

- **Node.js**: Runtime environment.
- **Neon Database**: Serverless PostgreSQL for data persistence.
- **Frontend Libraries**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Wouter.
- **Backend Libraries**: Express.js, Drizzle ORM, Passport.js, Express Session.
- **AI Service**: OpenAI GPT-4o-mini for plant identification.
- **Image Storage**: Currently uses external URLs (e.g., Unsplash for demo content); system designed to handle image data directly for AI processing.

## Recent Changes (August 2025)

**CSS Configuration Resolution (August 17, 2025)**: Completely resolved local/Vercel styling inconsistencies.
- **Problem**: Local development showed broken styling while Vercel displayed correctly due to configuration conflicts
- **Root Cause**: Conflicting Tailwind configs between root and client directories, causing inconsistent build behavior
- **Solution**: Created delegation config system where root `tailwind.config.ts` delegates to `client/tailwind.config.ts`
- **Key Fixes**: Updated content paths to work from both directories, simplified PostCSS config, removed .vercelignore exclusions
- **Status**: Both local and Vercel now generate consistent 70KB CSS files with full bluebonnet theme
- **Result**: Reliable styling with bluebonnet blue (#004bac), Texas green (#7ed856), and earth tones across all environments

**Build System Resolution**: Completely resolved all import resolution issues that were causing Vercel deployment failures.
- **Problem**: Recurring build failures due to incompatible alias imports (`@/...` and `@assets/...`) throughout the codebase
- **Solution**: Systematically converted all alias imports to relative imports across entire application
- **Status**: Build consistently successful (487KB bundle, ~8-10s), ready for reliable Vercel deployment
- **Components Fixed**: All pages (Home, Blog, Gallery, Products, Contact, About), all critical UI components, all asset references
- **TypeScript**: All LSP diagnostics resolved, proper type checking restored
- **Deployment**: Configured for Vercel with file-based API routing, static build optimization, and comprehensive import resolution fixes for reliable builds.

**Object Storage & Image Processing (August 18, 2025)**: Implemented advanced image optimization and multi-platform storage support.
- **AI Image Optimization**: Created Sharp-based image processor with 768px max dimension and 75% quality for AI plant identification, reducing OpenAI token usage by up to 80%
- **Multi-Size Processing**: Built comprehensive image processor generating AI-optimized, thumbnail, and lightbox versions for optimal performance
- **Vercel Blob Integration**: Added full Vercel Blob storage support with multi-size image processing and automatic optimization
- **Dual Storage System**: Replit object storage for development, Vercel Blob for production deployment - seamless environment detection
- **API Coverage**: Complete API endpoints for both storage systems with automatic fallbacks and error handling
- **Status**: ✅ COMPLETE - File upload functionality confirmed working in both environments: Replit object storage (development) with full image processing, Vercel Blob (production) with direct upload and AI compatibility
- **Database Fix**: Resolved PostgreSQL text[] array handling for gallery image tags - fixed "column is of type text[] but expression is of type jsonb" error in Vercel deployment
- **Upload Flow Fix**: Implemented custom Uppy response handler to properly extract blob URLs from Vercel API JSON responses
- **Backend Validation**: Added API validation to reject upload endpoint URLs and ensure only proper blob storage URLs are accepted