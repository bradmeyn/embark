import {
	pgTable,
	text,
	timestamp,
	uuid,
	integer,
	real,
	uniqueIndex,
	boolean
} from 'drizzle-orm/pg-core';
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
	coverImage: text('cover_image'),
	shareToken: text('share_token').unique(),
	...timesStamps
});

export const dayTable = pgTable('day', {
	id: uuid('id').defaultRandom().primaryKey(),
	tripId: uuid('trip_id')
		.notNull()
		.references(() => tripTable.id, { onDelete: 'cascade' }),
	dayNumber: integer('day_number').notNull(),
	overview: text('overview'),
	date: timestamp('date'),
	location: text('location').notNull(),
	latitude: real('latitude'),
	longitude: real('longitude'),

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
	nights: integer('nights').default(1).notNull(),
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

export const packingItemTable = pgTable('packing_item', {
	id: uuid('id').defaultRandom().primaryKey(),
	tripId: uuid('trip_id')
		.notNull()
		.references(() => tripTable.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	packed: boolean('packed').default(false).notNull(),
	category: text('category'),
	...timesStamps
});

export const tripCollaboratorTable = pgTable(
	'trip_collaborator',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tripId: uuid('trip_id')
			.notNull()
			.references(() => tripTable.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		...timesStamps
	},
	(t) => [uniqueIndex('trip_collaborator_unique').on(t.tripId, t.userId)]
);

export const tripInviteTable = pgTable(
	'trip_invite',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tripId: uuid('trip_id')
			.notNull()
			.references(() => tripTable.id, { onDelete: 'cascade' }),
		invitedEmail: text('invited_email').notNull(),
		inviteToken: text('invite_token').notNull().unique(),
		expiresAt: timestamp('expires_at').notNull(),
		...timesStamps
	},
	(t) => [uniqueIndex('trip_invite_unique').on(t.tripId, t.invitedEmail)]
);

export const travelSegmentTable = pgTable('travel_segment', {
	id: uuid('id').defaultRandom().primaryKey(),
	tripId: uuid('trip_id')
		.notNull()
		.references(() => tripTable.id, { onDelete: 'cascade' }),
	// The day this segment departs from. Unique so there's only one segment per day boundary.
	fromDayId: uuid('from_day_id')
		.notNull()
		.unique()
		.references(() => dayTable.id, { onDelete: 'cascade' }),
	mode: text('mode').notNull().default('other'),
	departureTime: text('departure_time'),
	arrivalTime: text('arrival_time'),
	notes: text('notes'),
	cost: text('cost'),
	// Stored GeoJSON coordinate array JSON string for car routes fetched from OSRM
	routeGeometry: text('route_geometry'),
	...timesStamps
});

// Relations
export const tripRelations = relations(tripTable, ({ many, one }) => ({
	days: many(dayTable),
	user: one(user, {
		fields: [tripTable.userId],
		references: [user.id]
	}),
	collaborators: many(tripCollaboratorTable),
	invites: many(tripInviteTable),
	packingItems: many(packingItemTable),
	travelSegments: many(travelSegmentTable)
}));

export const dayRelations = relations(dayTable, ({ one, many }) => ({
	trip: one(tripTable, {
		fields: [dayTable.tripId],
		references: [tripTable.id]
	}),
	activities: many(activityTable),
	hotels: many(hotelTable),
	flights: many(flightTable),
	travelSegment: one(travelSegmentTable, {
		fields: [dayTable.id],
		references: [travelSegmentTable.fromDayId]
	})
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

export const packingItemRelations = relations(packingItemTable, ({ one }) => ({
	trip: one(tripTable, {
		fields: [packingItemTable.tripId],
		references: [tripTable.id]
	})
}));

export const tripCollaboratorRelations = relations(tripCollaboratorTable, ({ one }) => ({
	trip: one(tripTable, {
		fields: [tripCollaboratorTable.tripId],
		references: [tripTable.id]
	}),
	user: one(user, {
		fields: [tripCollaboratorTable.userId],
		references: [user.id]
	})
}));

export const tripInviteRelations = relations(tripInviteTable, ({ one }) => ({
	trip: one(tripTable, {
		fields: [tripInviteTable.tripId],
		references: [tripTable.id]
	})
}));

export const travelSegmentRelations = relations(travelSegmentTable, ({ one }) => ({
	trip: one(tripTable, {
		fields: [travelSegmentTable.tripId],
		references: [tripTable.id]
	}),
	fromDay: one(dayTable, {
		fields: [travelSegmentTable.fromDayId],
		references: [dayTable.id]
	})
}));

export type Day = typeof dayTable.$inferSelect;
export type Activity = typeof activityTable.$inferSelect;
export type Hotel = typeof hotelTable.$inferSelect;
export type Flight = typeof flightTable.$inferSelect;
export type TravelSegment = typeof travelSegmentTable.$inferSelect;

export type Trip = typeof tripTable.$inferSelect;
export type NewTrip = typeof tripTable.$inferInsert;
export type TripCollaborator = typeof tripCollaboratorTable.$inferSelect;
export type TripInvite = typeof tripInviteTable.$inferSelect;

export type DayWithActivities = Day & {
	activities: Activity[];
	hotels: Hotel[];
	flights: Flight[];
};

export type TripWithBasicDays = Trip & {
	days: Day[];
};

export type PackingItem = typeof packingItemTable.$inferSelect;

export type TripWithDays = Trip & {
	days: DayWithActivities[];
	travelSegments: TravelSegment[];
};
