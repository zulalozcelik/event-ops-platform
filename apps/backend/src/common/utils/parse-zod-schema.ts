import { BadRequestException } from '@nestjs/common';
import { ZodError, type ZodType } from 'zod';

function buildValidationMessages(error: ZodError): string[] {
  return error.issues.map((issue) => issue.message);
}

export function parseZodSchema<TSchema extends ZodType>(
  schema: TSchema,
  payload: unknown,
): ReturnType<TSchema['parse']> {
  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new BadRequestException(buildValidationMessages(error));
    }

    throw error;
  }
}
