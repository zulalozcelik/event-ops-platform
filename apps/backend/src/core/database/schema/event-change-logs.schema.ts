import { boolean, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { events } from './events.schema';
import { users } from './users.schema';

export const eventChangeLogs = pgTable('event_change_logs', {
  id: uuid('id').defaultRandom().primaryKey(),

  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, {
      onDelete: 'cascade',
    }),

  changedByUserId: uuid('changed_by_user_id')
    .notNull()
    .references(() => users.id, {
      onDelete: 'restrict',
    }),

  beforeData: jsonb('before_data').notNull(),
  afterData: jsonb('after_data').notNull(),
  changedFields: jsonb('changed_fields').notNull(),

  notificationCreated: boolean('notification_created').notNull().default(false),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export type EventChangeLog = typeof eventChangeLogs.$inferSelect;
export type NewEventChangeLog = typeof eventChangeLogs.$inferInsert;
