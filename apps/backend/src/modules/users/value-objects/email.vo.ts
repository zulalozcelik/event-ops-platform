import { z } from 'zod';

const emailSchema = z.string().trim().toLowerCase().email();

export class Email {
  private constructor(private readonly emailValue: string) {}

  public static create(value: string): Email {
    const parsed = emailSchema.safeParse(value);

    if (!parsed.success) {
      throw new Error('Invalid email address');
    }

    return new Email(parsed.data);
  }

  public get value(): string {
    return this.emailValue;
  }

  public equals(other: Email): boolean {
    return this.emailValue === other.emailValue;
  }

  public toString(): string {
    return this.emailValue;
  }
}
