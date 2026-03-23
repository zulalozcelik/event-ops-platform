import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { EventsModule } from '../events/events.module';
import { RegistrationsService } from './registrations.service';
import { REGISTRATION_REPOSITORY } from './repositories/registration.repository.tokens';
import { DrizzleRegistrationsRepository } from './repositories/registrations.repository';
import { RegistrationsController } from './registrations.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    NotificationsModule,
    forwardRef(() => EventsModule),
  ],
  controllers: [RegistrationsController],
  providers: [
    RegistrationsService,
    {
      provide: REGISTRATION_REPOSITORY,
      useClass: DrizzleRegistrationsRepository,
    },
  ],
  exports: [RegistrationsService, REGISTRATION_REPOSITORY],
})
export class RegistrationsModule {}
