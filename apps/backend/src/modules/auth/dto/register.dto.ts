import { z } from 'zod';
import { registerPasswordSchema } from './password.schema';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email must be at most 255 characters')
    .email('Please enter a valid email address'),
  password: registerPasswordSchema,
  role: z.enum(['ATTENDEE', 'ORGANIZER']).default('ATTENDEE'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
