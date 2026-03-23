import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';

import { DRIZZLE_DB } from '@/core/database/database.constants';
import type { DrizzleDatabase } from '@/core/database/database.types';
import { notifications } from '@/core/database/schema';

import type { INotificationRepository } from './notifications.repository.interface';
import type {
  CreateNotificationInput,
  NotificationEntity,
} from '../types/notification.type';

@Injectable()
export class DrizzleNotificationRepository implements INotificationRepository {
  constructor(
    @Inject(DRIZZLE_DB)
    private readonly db: DrizzleDatabase,
  ) {}

  async create(input: CreateNotificationInput): Promise<NotificationEntity> {
    const [createdNotification] = await this.db
      .insert(notifications)
      .values({
        userId: input.userId,
        eventId: input.eventId ?? null,
        type: input.type,
        title: input.title,
        message: input.message,
      })
      .returning();

    return createdNotification;
  }

  async createMany(inputs: CreateNotificationInput[]): Promise<void> {
    if (inputs.length === 0) {
      return;
    }

    await this.db.insert(notifications).values(
      inputs.map((input) => ({
        userId: input.userId,
        eventId: input.eventId ?? null,
        type: input.type,
        title: input.title,
        message: input.message,
      })),
    );
  }

  async findByUserId(userId: string): Promise<NotificationEntity[]> {
    const rows = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return rows;
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationEntity | null> {
    const [updatedNotification] = await this.db
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      )
      .returning();

    return updatedNotification ?? null;
  }
}
