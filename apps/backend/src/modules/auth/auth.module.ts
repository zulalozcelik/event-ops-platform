import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { env } from '@/config/env';
import { DatabaseModule } from '../../core/database/database.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from '@/modules/auth/jwt.strategy';
import { AUTH_CREDENTIAL_REPOSITORY } from './repositories/auth-credential.repository.tokens';
import { DrizzleAuthCredentialRepository } from './repositories/auth-credentials.repository';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env.JWT_ACCESS_SECRET,
      signOptions: {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: AUTH_CREDENTIAL_REPOSITORY,
      useClass: DrizzleAuthCredentialRepository,
    },
  ],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
