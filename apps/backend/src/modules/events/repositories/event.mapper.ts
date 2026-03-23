import { EventRow } from '../../../core/database/schema/events.schema';
import { Event } from '../entities/event.entity';

export class EventMapper {
  static toDomain(row: EventRow): Event {
    return new Event(
      row.id,
      row.title,
      row.description,
      row.location,
      row.startDate,
      row.endDate,
      row.capacity,
      row.status,
      row.organizerId,
      row.createdAt,
      row.updatedAt,
    );
  }
}
