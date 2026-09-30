import * as z from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'Nama tidak boleh kosong.' })
    .max(100, { error: 'Nama maksimal 100 karakter.' }),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8, { error: 'Kata sandi baru minimal 8 karakter.' })
      .max(128, { error: 'Kata sandi terlalu panjang.' }),
    confirmPassword: z
      .string()
      .min(1, { error: 'Konfirmasi kata sandi wajib diisi.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
