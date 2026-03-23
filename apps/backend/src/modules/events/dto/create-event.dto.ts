import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  capacity: z.number().int().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']).optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
