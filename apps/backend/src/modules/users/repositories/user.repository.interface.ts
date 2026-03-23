import { UserRole } from '@event-ops/shared';
import { User } from '../entities/user.entity';

export type CreateUserRepositoryInput = {
  name: string;
  email: string;
  role: UserRole;
};

export interface IUserRepository {
  create(data: CreateUserRepositoryInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
