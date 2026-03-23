import { Injectable } from '@nestjs/common';
import { EventCapacityGateway } from './event-capacity.gateway';
import type { EventCapacitySummary } from '@/modules/registrations/types/registration-flow.type';

export const EVENT_CAPACITY_UPDATED_EVENT = 'event.capacity.updated';

@Injectable()
export class EventCapacityRealtimeService {
  constructor(private readonly eventCapacityGateway: EventCapacityGateway) {}

  publishCapacityUpdated(summary: EventCapacitySummary): void {
    this.eventCapacityGateway.server.emit(EVENT_CAPACITY_UPDATED_EVENT, {
      eventId: summary.eventId,
      registeredCount: summary.registeredCount,
      waitlistCount: summary.waitlistCount,
      remainingCapacity: summary.remainingCapacity,
    });
  }
}
