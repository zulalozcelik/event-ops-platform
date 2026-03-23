CREATE TYPE "public"."registration_status" AS ENUM('REGISTERED', 'WAITLISTED', 'CANCELLED');--> statement-breakpoint
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_event_id_user_id_unique";--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "status" "registration_status" DEFAULT 'REGISTERED' NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "registered_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "promoted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "registrations_event_id_idx" ON "registrations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "registrations_user_id_idx" ON "registrations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "registrations_status_idx" ON "registrations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "registrations_event_user_unique_idx" ON "registrations" USING btree ("event_id","user_id");