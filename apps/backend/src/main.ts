import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { FastifyPluginCallback } from 'fastify';
import type { FastifyCookieOptions } from '@fastify/cookie';
import fastifyCookie from '@fastify/cookie';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:3000',
  );
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const corsOrigin =
    nodeEnv === 'development' ? 'http://localhost:3000' : frontendUrl;
  const cookieSecret = configService.get<string>('COOKIE_SECRET', 'event-ops');

  await app.register(
    fastifyCookie as unknown as FastifyPluginCallback<FastifyCookieOptions>,
    {
      secret: cookieSecret,
    },
  );

  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new IoAdapter(app));
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Event Ops Platform API')
    .setDescription(
      'API documentation for the Event Ops Platform backend. The real authentication flow uses an httpOnly access_token cookie. Swagger also exposes a bearer token scheme so protected routes clearly show security metadata and can be tested manually when needed.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Use a JWT access token. The application normally stores this token in the access_token cookie after login.',
      },
      'bearer',
    )
    .addCookieAuth(
      'access_token',
      {
        type: 'apiKey',
        in: 'cookie',
        description:
          'Primary application auth. After login or register, the backend stores the JWT in the access_token httpOnly cookie.',
      },
      'access_token',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  await app.listen(port, '0.0.0.0');
  console.log(`Backend running on http://localhost:${port}/api/health`);
}

void bootstrap();
