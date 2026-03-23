import { UserRole } from '@event-ops/shared';
import { UserRow } from '../../../core/database/schema';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';

export class UserMapper {
  public static toDomain(row: UserRow): User {
    return User.create({
      id: row.id,
      name: row.name,
      email: Email.create(row.email),
      role: row.role as UserRole,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
