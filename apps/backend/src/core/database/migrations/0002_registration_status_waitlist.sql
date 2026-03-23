DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'registration_status'
  ) THEN
    CREATE TYPE registration_status AS ENUM (
      'REGISTERED',
      'WAITLISTED',
      'CANCELLED'
    );
  END IF;
END $$;

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS status registration_status NOT NULL DEFAULT 'REGISTERED';

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS registered_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS promoted_at timestamptz NULL;

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz NULL;

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS registrations_event_id_idx
  ON registrations (event_id);

CREATE INDEX IF NOT EXISTS registrations_user_id_idx
  ON registrations (user_id);

CREATE INDEX IF NOT EXISTS registrations_status_idx
  ON registrations (status);

CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_user_unique_idx
  ON registrations (event_id, user_id);
