CREATE TABLE "auth_credentials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "auth_credentials"
ADD CONSTRAINT "auth_credentials_user_id_users_id_fk"
FOREIGN KEY ("user_id")
REFERENCES "public"."users"("id")
ON DELETE cascade
ON UPDATE no action;

INSERT INTO "auth_credentials" ("user_id", "password_hash")
SELECT "id", "password_hash"
FROM "users"
WHERE "password_hash" IS NOT NULL;

ALTER TABLE "users"
DROP COLUMN "password_hash";
