# Gringo Gardens - Texas Native Plant Nursery

## Overview

This is a full-stack web application for Gringo Gardens, a Texas native plant nursery. It functions as a public website showcasing native plants, trees, and nursery services, and an admin dashboard for content management. The project aims for a performant, user-friendly, mobile-first experience with a bluebonnet-inspired theme. Key capabilities include dynamic content management for products, blog posts, and galleries, robust administrator authentication, and AI-powered plant identification for gallery images and product creation. The business vision is to provide a comprehensive online presence for the nursery, enhancing customer engagement and streamlining internal content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

**Frontend Architecture**: A React SPA with TypeScript, built using Vite. It features a component-based approach with shadcn/ui for consistent design, Wouter for routing, and TanStack Query for server state management. Styling utilizes Tailwind CSS, customized to a bluebonnet theme. Forms are managed with React Hook Form and Zod validation. The design is responsive and optimized for mobile devices.

**Backend Architecture**: An Express.js REST API server developed with TypeScript. It employs a middleware-based approach with comprehensive error handling and logging. The system's database schema, managed by Drizzle ORM (PostgreSQL dialect) on Neon serverless PostgreSQL, covers users, products, categories, blog posts, gallery images, reviews, contact messages, and newsletter subscribers. Authentication uses a simple password-based protection system for admin access, with session management. Full CRUD operations are available for all content types, including image handling.

**Key Features**:
- **Content Management**: Full CRUD operations for all content types, including dynamic home page categories and comprehensive gallery management with tagging, filtering, and duplicate prevention.
- **Plant Identification**: Integration with OpenAI GPT-4o-mini for automatic plant identification from uploaded gallery images, extracting botanical details and populating product fields.
- **Business Operations**: Management of business hours, contact messages, and newsletter subscribers.
- **SEO & Analytics**: Integration with Google Analytics 4 and SEO optimization via dynamic meta tags, Open Graph, Twitter cards, and JSON-LD structured data.
- **Image Management**: Advanced image optimization using Sharp for AI processing, multi-size image generation, and dual storage system support (Replit object storage for development, Vercel Blob for production).
- **API Unification**: Consolidated all admin and public API endpoints for consistent database connectivity and schema alignment across the application.
- **Robustness**: Implemented rate limiting, timeout protection, and memory safeguards for image processing and AI calls to ensure production stability.
- **Bulk Upload**: Fixed bulk image upload with proper URL extraction for both development (Replit object storage) and production (Vercel Blob) environments, resolving duplicate variable declarations and broken image display issues.

## External Dependencies

- **Node.js**: Runtime environment.
- **Neon Database**: Serverless PostgreSQL for data persistence.
- **Frontend Libraries**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod, Wouter.
- **Backend Libraries**: Express.js, Drizzle ORM, Passport.js, Express Session, Sharp.
- **AI Service**: OpenAI GPT-4o-mini for plant identification.
- **Image Storage**: Vercel Blob (production) and Replit object storage (development).
```