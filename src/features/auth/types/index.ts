import * as z from 'zod';

// ─── Schemas ────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(8, { error: 'Password must be at least 8 characters.' })
    .max(128, { error: 'Password is too long.' }),
});

export const activateSchema = z
  .object({
    token: z.string().min(1, { error: 'Token aktivasi wajib diisi.' }),
    password: z
      .string()
      .min(8, { error: 'Kata sandi minimal 8 karakter.' })
      .max(128, { error: 'Kata sandi terlalu panjang.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Masukkan alamat email yang valid.' }),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, { error: 'Token reset wajib diisi.' }),
    password: z
      .string()
      .min(8, { error: 'Kata sandi minimal 8 karakter.' })
      .max(128, { error: 'Kata sandi terlalu panjang.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, { error: 'ID token Google wajib ada.' }),
});

export const divisionMembershipSchema = z.object({
  divisionId: z.string(),
  role: z.enum(['MEMBER', 'COORDINATOR']),
  divisionName: z.string(),
  divisionSlug: z.string(),
});

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  isSuperAdmin: z.boolean().default(false),
  isKormanit: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  role: z.string().default('user'),
  divisions: z.array(divisionMembershipSchema).default([]),
  hasPassword: z.boolean().optional(),
  googleLinked: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
});

export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      user: userSchema,
      accessToken: z.string().optional(),
      refreshToken: z.string().optional(),
    })
    .optional(),
  error: z
    .object({
      code: z.number(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
});

// ─── TypeScript Types ────────────────────────────────────────────────────────

export type LoginDTO = z.infer<typeof loginSchema>;
export type ActivateDTO = z.infer<typeof activateSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type GoogleAuthDTO = z.infer<typeof googleAuthSchema>;
export type DivisionMembership = z.infer<typeof divisionMembershipSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
