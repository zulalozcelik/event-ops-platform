import { z } from 'zod';

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
  password: z
    .string()
    .max(72, 'Password must be at most 72 characters')
    .refine((value) => value.trim().length > 0, {
      message: 'Password is required',
    })
    .refine((value) => value.trim().length >= 6, {
      message: 'Password must be at least 6 characters',
    }),
  role: z.enum(['ATTENDEE', 'ORGANIZER']).default('ATTENDEE'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
