import { z } from 'zod';

export const loginSchema = z.object({
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
});

export type LoginDto = z.infer<typeof loginSchema>;
