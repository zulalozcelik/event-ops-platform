import { z } from 'zod';

export const createRegistrationSchema = z.object({
  eventId: z.string().uuid(),
});

export type CreateRegistrationDto = z.infer<typeof createRegistrationSchema>;
