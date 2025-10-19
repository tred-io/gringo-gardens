/**
 * Helper Text Constants
 *
 * Contextual help text to guide non-technical users through forms
 */

export const helperText = {
  // Product form
  product: {
    name: "The display name customers will see (e.g., 'Texas Bluebonnet')",
    description: "Tell customers about this plant - growth habits, care requirements, special features",
    price: "Leave blank if price varies or you prefer customers to call",
    stock: "How many you currently have available. Set to 0 when sold out.",
    category: "Helps customers browse by plant type",
    image: "Recommended size: 800x600px. Shows in product listings and detail pages.",
    hardinessZone: "USDA zones where this plant thrives (e.g., '8-10')",
    sunRequirements: "Full Sun, Partial Shade, or Shade",
    texasNative: "Native plants are adapted to Texas climate and require less water",
    droughtTolerance: "How well this plant handles dry conditions once established",
    featured: "Featured products appear prominently on your homepage",
  },

  // Blog post form
  blog: {
    title: "The headline visitors will see",
    excerpt: "A short preview that appears in blog listings (1-2 sentences)",
    content: "The main blog post content. You can use paragraphs, lists, and formatting.",
    image: "Featured image shown at the top of the post. Recommended: 1200x630px",
    category: "Optional: Organize posts by topic (e.g., 'Care Tips', 'Seasonal')",
    published: "Unpublished posts are only visible to you in the admin",
    readTime: "Estimated minutes to read. Auto-calculated from content length.",
  },

  // Gallery form
  gallery: {
    title: "A descriptive name for this image",
    description: "Helps with SEO and accessibility. Describe what's in the image.",
    image: "The image URL. You can paste a link, upload a new image, or choose from your gallery.",
    category: "Group similar images (e.g., 'spring-blooms', 'native-grasses')",
    tags: "Keywords that help you find and filter images later",
    featured: "Featured images may appear in special sections of your site",
    aiIdentify: "Our AI will try to identify the plant and auto-fill details",
  },

  // Category form
  category: {
    name: "The category name (e.g., 'Native Perennials', 'Fruit Trees')",
    description: "Appears on the category page to help customers understand what's included",
    image: "Collection image shown when browsing categories. Recommended: 600x400px",
    showOnHomepage: "Show this category in the featured categories section on your homepage",
  },

  // Review form
  review: {
    customerName: "The reviewer's name as it will appear publicly",
    rating: "5 stars = excellent, 1 star = poor",
    content: "The review text from the customer",
    approved: "Only approved reviews appear on your public site",
    featured: "Featured reviews may be highlighted on your homepage",
  },

  // Team member form
  team: {
    name: "Team member's full name",
    position: "Their role or title (e.g., 'Owner & Master Gardener')",
    bio: "A brief background - experience, expertise, what they love about plants",
    image: "Professional photo. Recommended: square format, 400x400px",
    email: "Public contact email (leave blank to hide)",
    phone: "Public phone number (leave blank to hide)",
    order: "Display order (lower numbers appear first)",
    active: "Inactive team members won't appear on your public site",
  },

  // Settings
  settings: {
    businessHours: "Your regular nursery hours. Customers see these on your Contact page.",
    temporaryClosure: "Use this for seasonal closures, vacations, or weather-related closings",
    closureMessage: "What customers will see (e.g., 'Closed for winter - reopening March 1st')",
  },

  // Page content
  pages: {
    homepage: {
      heroTitle: "Main headline on your homepage (e.g., 'Texas Native Plants')",
      heroSubtitle: "Supporting text under the main headline",
      heroDescription: "Brief intro paragraph about your nursery",
      ctaText: "Button text (e.g., 'Shop Now', 'Browse Plants')",
      seoTitle: "Appears in Google search results and browser tabs",
      seoDescription: "Brief description for search engines (150-160 characters)",
      seoKeywords: "Comma-separated keywords (e.g., 'texas native plants, austin nursery')",
    },
    about: {
      story: "Tell customers about how your nursery started",
      mission: "What drives your business and makes you different",
    },
    contact: {
      description: "Message shown on your contact page",
      phone: "Your main business phone number",
      email: "Primary email for customer inquiries",
      address: "Physical address (appears on contact page and may be used for maps)",
    },
  },
};

/**
 * Image size recommendations for different contexts
 */
export const imageSizeGuide = {
  product: "Recommended: 800x600px (landscape) for best display",
  blog: "Recommended: 1200x630px (landscape) optimized for social sharing",
  category: "Recommended: 600x400px (landscape) for category grids",
  gallery: "Recommended: 1024x768px or larger for detail viewing",
  team: "Recommended: 400x400px (square) for consistent display",
  hero: "Recommended: 1920x1080px (landscape) for full-width hero sections",
};

/**
 * Common placeholder text
 */
export const placeholders = {
  productName: "e.g., Texas Bluebonnet",
  productDescription: "Describe the plant's appearance, care needs, and special features...",
  price: "12.99",
  stock: "10",
  hardinessZone: "e.g., 8-10 or 7b-9a",
  sunRequirements: "e.g., Full Sun, Partial Shade",
  blogTitle: "e.g., How to Care for Texas Native Plants in Summer",
  blogExcerpt: "A brief summary of what this post covers...",
  categoryName: "e.g., Native Perennials",
  tags: "Select from suggested tags or add your own",
  reviewerName: "e.g., John Smith",
  teamMemberName: "e.g., Jane Doe",
  teamPosition: "e.g., Owner & Master Gardener",
  email: "name@example.com",
  phone: "(512) 555-0100",
};
