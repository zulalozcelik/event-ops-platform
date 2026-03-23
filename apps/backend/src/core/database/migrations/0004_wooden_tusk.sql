CREATE TABLE "waitlists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "waitlists" ADD CONSTRAINT "waitlists_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "waitlists" ADD CONSTRAINT "waitlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "waitlists" ("event_id", "user_id", "created_at", "updated_at")
SELECT
  "event_id",
  "user_id",
  "created_at",
  COALESCE("updated_at", "created_at")
FROM "registrations"
WHERE "status" = 'WAITLISTED';
--> statement-breakpoint
DELETE FROM "registrations"
WHERE "status" IN ('WAITLISTED', 'CANCELLED');
--> statement-breakpoint
DROP INDEX "registrations_status_idx";
--> statement-breakpoint
CREATE INDEX "waitlists_event_id_idx" ON "waitlists" USING btree ("event_id");
--> statement-breakpoint
CREATE INDEX "waitlists_user_id_idx" ON "waitlists" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "waitlists_event_user_unique_idx" ON "waitlists" USING btree ("event_id","user_id");
--> statement-breakpoint
ALTER TABLE "registrations" DROP COLUMN "status";
--> statement-breakpoint
ALTER TABLE "registrations" DROP COLUMN "registered_at";
--> statement-breakpoint
ALTER TABLE "registrations" DROP COLUMN "promoted_at";
--> statement-breakpoint
ALTER TABLE "registrations" DROP COLUMN "cancelled_at";
--> statement-breakpoint
DROP TYPE "public"."registration_status";
