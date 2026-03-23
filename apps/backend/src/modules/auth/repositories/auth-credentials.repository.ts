import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from '@/core/database/database.constants';
import type { DrizzleDatabase } from '@/core/database/database.types';
import { authCredentials } from '../../../core/database/schema';
import {
  CreateAuthCredentialRepositoryInput,
  IAuthCredentialRepository,
} from './auth-credential.repository.interface';

@Injectable()
export class DrizzleAuthCredentialRepository implements IAuthCredentialRepository {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDatabase) {}

  public async create(
    data: CreateAuthCredentialRepositoryInput,
  ): Promise<void> {
    await this.db.insert(authCredentials).values({
      userId: data.userId,
      passwordHash: data.passwordHash,
    });
  }

  public async findPasswordHashByUserId(
    userId: string,
  ): Promise<string | null> {
    const rows = await this.db
      .select({
        passwordHash: authCredentials.passwordHash,
      })
      .from(authCredentials)
      .where(eq(authCredentials.userId, userId))
      .limit(1);

    const credential = rows[0];

    if (!credential) {
      return null;
    }

    return credential.passwordHash;
  }
}
