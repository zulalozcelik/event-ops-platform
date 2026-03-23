export interface NotificationEntity {
  id: string;
  userId: string;
  eventId: string | null;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  eventId?: string | null;
  type: string;
  title: string;
  message: string;
}
