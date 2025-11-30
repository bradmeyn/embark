CREATE TABLE "flight" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"airline" text NOT NULL,
	"flight_number" text,
	"departure_airport" text NOT NULL,
	"arrival_airport" text NOT NULL,
	"departure_time" text,
	"arrival_time" text,
	"confirmation_number" text,
	"notes" text,
	"cost" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hotel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_id" uuid NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"check_in" text,
	"check_out" text,
	"confirmation_number" text,
	"notes" text,
	"cost" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flight" ADD CONSTRAINT "flight_day_id_day_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."day"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotel" ADD CONSTRAINT "hotel_day_id_day_id_fk" FOREIGN KEY ("day_id") REFERENCES "public"."day"("id") ON DELETE cascade ON UPDATE no action;