CREATE TABLE "travel_segment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip_id" uuid NOT NULL,
	"from_day_id" uuid NOT NULL,
	"mode" text DEFAULT 'other' NOT NULL,
	"departure_time" text,
	"arrival_time" text,
	"notes" text,
	"cost" text,
	"route_geometry" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "travel_segment_from_day_id_unique" UNIQUE("from_day_id")
);
--> statement-breakpoint
ALTER TABLE "travel_segment" ADD CONSTRAINT "travel_segment_trip_id_trip_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "travel_segment" ADD CONSTRAINT "travel_segment_from_day_id_day_id_fk" FOREIGN KEY ("from_day_id") REFERENCES "public"."day"("id") ON DELETE cascade ON UPDATE no action;
