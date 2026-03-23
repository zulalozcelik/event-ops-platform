import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(255),
  password: z.string().min(6).max(72),
  role: z.enum(['ATTENDEE', 'ORGANIZER']).default('ATTENDEE'),
});

export type RegisterDto = z.infer<typeof registerSchema>;
