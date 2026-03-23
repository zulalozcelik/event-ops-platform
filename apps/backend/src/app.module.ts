import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@/core/database/database.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { EventsModule } from '@/modules/events/events.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { RegistrationsModule } from '@/modules/registrations/registrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    EventsModule,
    NotificationsModule,
    RegistrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
