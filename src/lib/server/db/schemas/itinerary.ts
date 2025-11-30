import { pgTable, text, timestamp, uuid, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

const timesStamps = {
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.notNull()
		.$onUpdate(() => new Date())
};

const userId = text('user_id')
	.notNull()
	.references(() => user.id, { onDelete: 'cascade' });

export const tripTable = pgTable('trip', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId,
	name: text('name').notNull(),
	...timesStamps
});

export const itineraryTable = pgTable('itinerary', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	tripId: uuid('trip_id')
		.notNull()
		.references(() => tripTable.id, { onDelete: 'cascade' }),
	...timesStamps
});

export const dayTable = pgTable('day', {
	id: uuid('id').defaultRandom().primaryKey(),
	itineraryId: uuid('itinerary_id')
		.notNull()
		.references(() => itineraryTable.id, { onDelete: 'cascade' }),
	dayNumber: integer('day_number').notNull(),
	overview: text('overview'),
	date: timestamp('date'),
	location: text('location').notNull(),

	...timesStamps
});

export const activityTable = pgTable('activity', {
	id: uuid('id').defaultRandom().primaryKey(),
	dayId: uuid('day_id')
		.notNull()
		.references(() => dayTable.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description'),
	time: timestamp('time'),
	location: text('location'),
	cost: text('cost'),
	...timesStamps
});

export const hotelTable = pgTable('hotel', {
	id: uuid('id').defaultRandom().primaryKey(),
	dayId: uuid('day_id')
		.notNull()
		.references(() => dayTable.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	address: text('address'),
	checkIn: text('check_in'),
	checkOut: text('check_out'),
	confirmationNumber: text('confirmation_number'),
	notes: text('notes'),
	cost: text('cost'),
	...timesStamps
});

export const flightTable = pgTable('flight', {
	id: uuid('id').defaultRandom().primaryKey(),
	dayId: uuid('day_id')
		.notNull()
		.references(() => dayTable.id, { onDelete: 'cascade' }),
	airline: text('airline').notNull(),
	flightNumber: text('flight_number'),
	departureAirport: text('departure_airport').notNull(),
	arrivalAirport: text('arrival_airport').notNull(),
	departureTime: text('departure_time'),
	arrivalTime: text('arrival_time'),
	confirmationNumber: text('confirmation_number'),
	notes: text('notes'),
	cost: text('cost'),
	...timesStamps
});

// Relations
export const tripRelations = relations(tripTable, ({ many, one }) => ({
	itineraries: many(itineraryTable),
	user: one(user, {
		fields: [tripTable.userId],
		references: [user.id]
	})
}));

export const itineraryRelations = relations(itineraryTable, ({ one, many }) => ({
	trip: one(tripTable, {
		fields: [itineraryTable.tripId],
		references: [tripTable.id]
	}),
	days: many(dayTable)
}));

export const dayRelations = relations(dayTable, ({ one, many }) => ({
	itinerary: one(itineraryTable, {
		fields: [dayTable.itineraryId],
		references: [itineraryTable.id]
	}),
	activities: many(activityTable),
	hotels: many(hotelTable),
	flights: many(flightTable)
}));

export const activityRelations = relations(activityTable, ({ one }) => ({
	day: one(dayTable, {
		fields: [activityTable.dayId],
		references: [dayTable.id]
	})
}));

export const hotelRelations = relations(hotelTable, ({ one }) => ({
	day: one(dayTable, {
		fields: [hotelTable.dayId],
		references: [dayTable.id]
	})
}));

export const flightRelations = relations(flightTable, ({ one }) => ({
	day: one(dayTable, {
		fields: [flightTable.dayId],
		references: [dayTable.id]
	})
}));

export type Day = typeof dayTable.$inferSelect;
export type Itinerary = typeof itineraryTable.$inferSelect;
export type Activity = typeof activityTable.$inferSelect;
export type Hotel = typeof hotelTable.$inferSelect;
export type Flight = typeof flightTable.$inferSelect;

export type Trip = typeof tripTable.$inferSelect;
export type NewTrip = typeof tripTable.$inferInsert;

// Trip with relations
export type TripWithItineraries = Trip & {
	itineraries: (Itinerary & {
		days: Day[];
	})[];
};

export type DayWithActivities = Day & {
	activities: Activity[];
	hotels: Hotel[];
	flights: Flight[];
};

export type ItineraryWithDays = Itinerary & {
	days: DayWithActivities[];
};

export type ItineraryWithBasicDays = Itinerary & {
	days: Day[];
};
