import { z } from 'zod';

const DEVELOPMENT_API_URL = 'http://localhost:3001/api';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
});

function getNextPublicApiUrl(): string {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredApiUrl) {
    return configuredApiUrl;
  }

  if (process.env.NODE_ENV !== 'production') {
    return DEVELOPMENT_API_URL;
  }

  throw new Error(
    'NEXT_PUBLIC_API_URL is required in production builds.',
  );
}

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_URL: getNextPublicApiUrl(),
});
