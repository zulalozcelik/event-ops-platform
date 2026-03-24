import { z } from 'zod';

const LOGIN_PASSWORD_MIN_LENGTH = 6;
const REGISTER_PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;
const UPPERCASE_LETTER_REGEX = /[A-Z]/;
const SPECIAL_CHARACTER_REGEX = /[^A-Za-z0-9]/;

export const authPasswordMessages = {
  required: 'Password is required',
  loginMinLength: `Password must be at least ${LOGIN_PASSWORD_MIN_LENGTH} characters`,
  registerMinLength: `Password must be at least ${REGISTER_PASSWORD_MIN_LENGTH} characters`,
  maxLength: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  requiresUppercase: 'Password must include at least 1 uppercase letter',
  requiresSpecialCharacter:
    'Password must include at least 1 special character',
} as const;

export const loginPasswordSchema = z
  .string()
  .max(PASSWORD_MAX_LENGTH, authPasswordMessages.maxLength)
  .refine((value) => value.trim().length > 0, {
    message: authPasswordMessages.required,
  })
  .refine((value) => value.trim().length >= LOGIN_PASSWORD_MIN_LENGTH, {
    message: authPasswordMessages.loginMinLength,
  });

export const registerPasswordSchema = loginPasswordSchema
  .refine((value) => value.trim().length >= REGISTER_PASSWORD_MIN_LENGTH, {
    message: authPasswordMessages.registerMinLength,
  })
  .refine((value) => UPPERCASE_LETTER_REGEX.test(value), {
    message: authPasswordMessages.requiresUppercase,
  })
  .refine((value) => SPECIAL_CHARACTER_REGEX.test(value), {
    message: authPasswordMessages.requiresSpecialCharacter,
  });
