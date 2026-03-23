import { index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { events } from './events.schema';
import { users } from './users.schema';

export const waitlists = pgTable(
  'waitlists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    waitlistsEventIdx: index('waitlists_event_id_idx').on(table.eventId),
    waitlistsUserIdx: index('waitlists_user_id_idx').on(table.userId),
    waitlistsEventUserUniqueIdx: uniqueIndex(
      'waitlists_event_user_unique_idx',
    ).on(table.eventId, table.userId),
  }),
);

export type WaitlistRow = typeof waitlists.$inferSelect;
export type NewWaitlistRow = typeof waitlists.$inferInsert;
