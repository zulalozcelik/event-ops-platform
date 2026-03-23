import type {
  CreateNotificationInput,
  NotificationEntity,
} from '../types/notification.type';

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';

export interface INotificationRepository {
  create(input: CreateNotificationInput): Promise<NotificationEntity>;
  createMany(inputs: CreateNotificationInput[]): Promise<void>;
  findByUserId(userId: string): Promise<NotificationEntity[]>;
  markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<NotificationEntity | null>;
}
