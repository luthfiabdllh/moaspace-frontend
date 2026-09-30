import * as z from 'zod';

// ─── Schemas ────────────────────────────────────────────────────────────────

/**
 * Login request schema.
 * NOTE: Zod v4 uses z.email() as a top-level validator (not .string().email()).
 */
export const loginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters.' })
    .max(128, { error: 'Password is too long.' }),
});

export const loginSchemaId = z.object({
  email: z.email({ error: 'Masukkan alamat email yang valid.' }),
  password: z
    .string()
    .min(8, { error: 'Kata sandi minimal 8 karakter.' })
    .max(128, { error: 'Kata sandi terlalu panjang.' }),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user', 'moderator']).default('user'),
  createdAt: z.string().datetime().optional(),
});

export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      user: userSchema,
      accessToken: z.string(),
      refreshToken: z.string().optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
    })
    .optional(),
});

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type LoginDTO = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
