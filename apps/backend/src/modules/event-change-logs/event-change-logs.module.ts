import { Module, forwardRef } from '@nestjs/common';

import { EventChangeLogsService } from './event-change-logs.service';
import { EVENT_CHANGE_LOG_REPOSITORY } from './repositories/event-change-logs.repository.interface';
import { DrizzleEventChangeLogRepository } from './repositories/event-change-logs.repository';
import { EventChangeLogsController } from './event-change-logs.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [forwardRef(() => EventsModule)],
  controllers: [EventChangeLogsController],
  providers: [
    EventChangeLogsService,
    {
      provide: EVENT_CHANGE_LOG_REPOSITORY,
      useClass: DrizzleEventChangeLogRepository,
    },
  ],
  exports: [EventChangeLogsService],
})
export class EventChangeLogsModule {}
