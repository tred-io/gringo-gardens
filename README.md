# Gringo Gardens - Texas Native Plant Nursery

A comprehensive full-stack web application for Gringo Gardens, a Texas native plant nursery based in Lampasas. Features e-commerce capabilities, AI-powered plant identification, admin dashboard, and deployment readiness.

## Features

### 🌱 Core Functionality
- **Product Catalog**: Browse native Texas plants, fruit trees, and specialty varieties with advanced filtering
- **AI Plant Identification**: Automatic plant identification using OpenAI GPT-4o-mini with comprehensive botanical data
- **Gallery System**: Image gallery with category-based filtering and dynamic content management
- **Content Management**: Full admin dashboard for products, categories, blog posts, team members, and settings
- **SEO Optimized**: Complete SEO implementation with Google Analytics 4 integration

### 🛠 Technical Features
- **Modern Stack**: React + TypeScript + Express + PostgreSQL with Vite build system
- **Database**: Neon serverless PostgreSQL with Drizzle ORM
- **Authentication**: Simple password-based admin authentication
- **File Storage**: Object storage integration for images and media
- **Responsive Design**: Mobile-first design with Tailwind CSS and shadcn/ui components

### 🚀 AI Integration
- **Plant Recognition**: Upload images for automatic plant identification
- **Data Transfer**: AI-identified plant data automatically populates product forms
- **Smart Categorization**: Automatic plant categorization and botanical information extraction
- **Advanced Filtering**: Filter by Texas native status, drought tolerance, hardiness zones, and sun requirements

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Operations
```bash
npm run db:push    # Push schema changes
npm run db:migrate # Run migrations
```

## Environment Variables

### Required
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for plant identification
- `SESSION_SECRET`: Session encryption key
- `ADMIN_PASSWORD`: Admin panel password (default: GringoGardens2025!)

### Optional
- `VITE_GA_MEASUREMENT_ID`: Google Analytics 4 Measurement ID
- `NODE_ENV`: Environment (development/production)

## Deployment

### Vercel + GitHub
1. Push to GitHub repository
2. Import project to Vercel
3. Configure environment variables
4. Deploy automatically via GitHub Actions

### Database Setup
- Uses Neon serverless PostgreSQL
- Automatic schema migrations on deployment
- Sample data included for development

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Express backend
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database operations
│   ├── plantIdentification.ts # AI plant identification
│   └── objectStorage.ts   # File storage handling
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and types
└── .github/workflows/      # GitHub Actions deployment
```

## Admin Features

### Content Management
- Product catalog with AI-enhanced data
- Category management with homepage selection
- Gallery image management with plant identification
- Blog post creation and editing
- Team member profiles
- Customer review moderation
- Contact message handling
- Newsletter subscriber management

### Business Configuration
- Configurable business hours
- Seasonal closure settings
- Social media links
- Contact information
- About page content

## API Endpoints

### Public
- `GET /api/products` - Product catalog with filtering
- `GET /api/categories` - Product categories
- `GET /api/gallery` - Gallery images
- `GET /api/blog` - Blog posts
- `POST /api/contact` - Contact form submissions
- `POST /api/newsletter/subscribe` - Newsletter subscriptions

### Admin (Password Protected)
- `GET /api/admin/*` - Admin data endpoints
- `POST /api/admin/*` - Create operations
- `PUT /api/admin/*` - Update operations
- `DELETE /api/admin/*` - Delete operations
- `POST /api/identify-plant` - AI plant identification

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private project for Gringo Gardens nursery.

---

Built with ❤️ for Texas native plant enthusiasts