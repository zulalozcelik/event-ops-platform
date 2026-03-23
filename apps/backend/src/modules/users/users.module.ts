import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';
import { UsersService } from './users.service';
import { USER_REPOSITORY } from './repositories/user.repository.tokens';
import { DrizzleUserRepository } from './repositories/users.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    UsersService,
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
  ],
  exports: [UsersService, USER_REPOSITORY],
})
export class UsersModule {}
