import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: 'Password is required',
    })
    .refine((value) => value.trim().length >= 6, {
      message: 'Password must be at least 6 characters',
    }),
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
  password: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: 'Password is required',
    })
    .refine((value) => value.trim().length >= 6, {
      message: 'Password must be at least 6 characters',
    }),
  role: z.enum(['ATTENDEE', 'ORGANIZER']),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
