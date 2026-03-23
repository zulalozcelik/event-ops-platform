import { z } from 'zod';
import type { StringValue } from 'ms';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  FRONTEND_URL: z.string().url(),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).optional(),

  COOKIE_SECRET: z.string().min(10),

  JWT_ACCESS_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRES_IN: z.custom<StringValue>(
    (value) => typeof value === 'string' && value.length > 0,
    {
      message: 'JWT_ACCESS_EXPIRES_IN must be a valid duration string',
    },
  ),
});

export type Env = z.infer<typeof envSchema>;
