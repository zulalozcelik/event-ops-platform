import { Module } from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { NOTIFICATION_REPOSITORY } from './repositories/notifications.repository.interface';
import { DrizzleNotificationRepository } from './repositories/notifications.repository';
import { NotificationsController } from './notifications.controller';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: DrizzleNotificationRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
