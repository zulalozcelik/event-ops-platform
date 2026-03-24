import { z } from 'zod';
import {
  loginPasswordSchema,
  registerPasswordSchema,
} from './auth-password.schema';

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: loginPasswordSchema,
});

export const registerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(120, 'Name must be at most 120 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: registerPasswordSchema,
  role: z.enum(['ATTENDEE', 'ORGANIZER']),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
