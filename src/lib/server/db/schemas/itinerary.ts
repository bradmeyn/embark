import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { user } from './auth'
import type { z } from 'zod'

const timesStamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
}

// Itineraries table (since this seems to be a travel app)
export const itineraries = pgTable('itineraries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isPublic: boolean('is_public').default(false),
  ...timesStamps,
})

export const insertItinerarySchema = createInsertSchema(itineraries)
export const selectItinerarySchema = createSelectSchema(itineraries)

// Types
export type Itinerary = z.infer<typeof selectItinerarySchema>
export type NewItinerary = z.infer<typeof insertItinerarySchema>
