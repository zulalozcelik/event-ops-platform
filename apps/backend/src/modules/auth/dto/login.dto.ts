import { z } from 'zod';
import { loginPasswordSchema } from './password.schema';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .email('Please enter a valid email address'),
  password: loginPasswordSchema,
});

export type LoginDto = z.infer<typeof loginSchema>;
