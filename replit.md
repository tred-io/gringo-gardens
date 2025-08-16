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