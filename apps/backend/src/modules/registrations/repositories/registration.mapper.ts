import { RegistrationRow } from '../../../core/database/schema/registrations.schema';
import { Registration } from '../entities/registration.entity';

export class RegistrationMapper {
  static toDomain(row: RegistrationRow): Registration {
    return new Registration(row.id, row.eventId, row.userId, row.createdAt);
  }
}
