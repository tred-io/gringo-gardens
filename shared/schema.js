// ES Module version of schema for Vercel API routes
import { pgTable, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const galleryImages = pgTable('gallery_images', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  category: text('category').default('general'),
  tags: jsonb('tags').$type().default([]),
  featured: boolean('featured').default(false),
  commonName: text('common_name'),
  latinName: text('latin_name'),
  hardinessZone: text('hardiness_zone'),
  sunPreference: text('sun_preference'),
  droughtTolerance: text('drought_tolerance'),
  texasNative: boolean('texas_native'),
  indoorOutdoor: text('indoor_outdoor'),
  classification: text('classification'),
  aiDescription: text('ai_description'),
  aiIdentified: boolean('ai_identified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});