import { Inject, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';

import { DRIZZLE_DB } from '@/core/database/database.constants';
import type { DrizzleDatabase } from '@/core/database/database.types';
import { eventChangeLogs } from '@/core/database/schema';

import type { IEventChangeLogRepository } from './event-change-logs.repository.interface';
import type {
  ChangedFieldDetail,
  CreateEventChangeLogInput,
  EventChangeLogEntity,
  EventComparableSnapshot,
} from '../types/event-change-log.type';

function toEventComparableSnapshot(value: unknown): EventComparableSnapshot {
  return value as EventComparableSnapshot;
}

function toChangedFieldsMap(
  value: unknown,
): Record<string, ChangedFieldDetail> {
  return value as Record<string, ChangedFieldDetail>;
}

@Injectable()
export class DrizzleEventChangeLogRepository implements IEventChangeLogRepository {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: DrizzleDatabase,
  ) {}

  async create(
    input: CreateEventChangeLogInput,
  ): Promise<EventChangeLogEntity> {
    const [createdLog] = await this.db
      .insert(eventChangeLogs)
      .values({
        eventId: input.eventId,
        changedByUserId: input.changedByUserId,
        beforeData: input.beforeData,
        afterData: input.afterData,
        changedFields: input.changedFields,
        notificationCreated: input.notificationCreated ?? false,
      })
      .returning();

    return {
      ...createdLog,
      beforeData: toEventComparableSnapshot(createdLog.beforeData),
      afterData: toEventComparableSnapshot(createdLog.afterData),
      changedFields: toChangedFieldsMap(createdLog.changedFields),
    };
  }

  async findByEventId(eventId: string): Promise<EventChangeLogEntity[]> {
    const rows = await this.db
      .select()
      .from(eventChangeLogs)
      .where(eq(eventChangeLogs.eventId, eventId))
      .orderBy(desc(eventChangeLogs.createdAt));

    return rows.map((row) => ({
      ...row,
      beforeData: toEventComparableSnapshot(row.beforeData),
      afterData: toEventComparableSnapshot(row.afterData),
      changedFields: toChangedFieldsMap(row.changedFields),
    }));
  }

  async markNotificationCreated(logId: string): Promise<void> {
    await this.db
      .update(eventChangeLogs)
      .set({
        notificationCreated: true,
      })
      .where(eq(eventChangeLogs.id, logId));
  }
}
