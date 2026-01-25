import { z } from 'zod';

/**
 * Validation schema for strong password requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const strongPasswordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Le mot de passe doit contenir au moins une majuscule'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Le mot de passe doit contenir au moins une minuscule'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Le mot de passe doit contenir au moins un chiffre'
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    'Le mot de passe doit contenir au moins un caractère spécial'
  );

