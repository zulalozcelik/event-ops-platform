import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import {
  INotificationRepository,
  NOTIFICATION_REPOSITORY,
} from './repositories/notifications.repository.interface';
import type {
  CreateNotificationInput,
  NotificationEntity,
} from './types/notification.type';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async createNotification(
    input: CreateNotificationInput,
  ): Promise<NotificationEntity> {
    return this.notificationRepository.create(input);
  }

  async createManyNotifications(
    inputs: CreateNotificationInput[],
  ): Promise<void> {
    this.logger.debug(
      `Creating ${inputs.length} notifications for userIds: ${
        inputs.map((input) => input.userId).join(', ') || 'none'
      }`,
    );

    await this.notificationRepository.createMany(inputs);
  }

  async getUserNotifications(userId: string): Promise<NotificationEntity[]> {
    const notifications =
      await this.notificationRepository.findByUserId(userId);

    this.logger.debug(
      `Fetched ${notifications.length} notifications for user ${userId}`,
    );

    return notifications;
  }

  async markNotificationAsRead(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const updatedNotification = await this.notificationRepository.markAsRead(
      notificationId,
      userId,
    );

    if (!updatedNotification) {
      throw new NotFoundException('Notification not found');
    }
  }
}
