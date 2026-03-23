import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '@/core/database/database.constants';
import type { DrizzleDatabase } from '@/core/database/database.types';
import { users } from '../../../core/database/schema';
import {
  CreateUserRepositoryInput,
  IUserRepository,
} from './user.repository.interface';
import { User } from '../entities/user.entity';
import { UserMapper } from './user.mapper';

@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  public async create(data: CreateUserRepositoryInput): Promise<User> {
    const rows = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        role: data.role,
      })
      .returning();

    const createdUser = rows[0];

    if (!createdUser) {
      throw new Error('User could not be created');
    }

    return UserMapper.toDomain(createdUser);
  }

  public async findById(id: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return null;
    }

    return UserMapper.toDomain(user);
  }
}
