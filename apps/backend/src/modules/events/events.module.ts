import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '@/core/database/database.module';
import { EventsService } from './events.service';
import { EVENT_REPOSITORY } from './repositories/event.repository.tokens';
import { DrizzleEventsRepository } from './repositories/events.repository';
import { EventsController } from './events.controller';
import { EventChangeLogsModule } from '../event-change-logs/event-change-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RegistrationsModule } from '../registrations/registrations.module';
import { EventCapacityGateway } from './realtime/event-capacity.gateway';
import { EventCapacityRealtimeService } from './realtime/event-capacity-realtime.service';

@Module({
  imports: [
    DatabaseModule,
    EventChangeLogsModule,
    NotificationsModule,
    forwardRef(() => RegistrationsModule),
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventCapacityGateway,
    EventCapacityRealtimeService,
    {
      provide: EVENT_REPOSITORY,
      useClass: DrizzleEventsRepository,
    },
  ],
  exports: [EventsService, EVENT_REPOSITORY, EventCapacityRealtimeService],
})
export class EventsModule {}
