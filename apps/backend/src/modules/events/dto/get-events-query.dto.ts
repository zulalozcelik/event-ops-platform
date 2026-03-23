import { z } from 'zod';

export const getEventsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type GetEventsQueryDto = z.infer<typeof getEventsQuerySchema>;
