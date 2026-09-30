import { describe, it, expect } from 'vitest';
import { updateProfileSchema, changePasswordSchema } from '../types';

describe('Profile Schemas', () => {
  describe('updateProfileSchema', () => {
    it('accepts valid display name', () => {
      const res = updateProfileSchema.safeParse({ name: 'Ahmad Luthfi' });
      expect(res.success).toBe(true);
    });

    it('rejects empty or whitespace-only name', () => {
      const res = updateProfileSchema.safeParse({ name: '   ' });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toBe('Nama tidak boleh kosong.');
    });

    it('rejects name exceeding 100 characters', () => {
      const res = updateProfileSchema.safeParse({ name: 'A'.repeat(101) });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toBe('Nama maksimal 100 karakter.');
    });
  });

  describe('changePasswordSchema', () => {
    it('accepts valid password change with current password', () => {
      const res = changePasswordSchema.safeParse({
        currentPassword: 'oldPassword123',
        newPassword: 'newSecurePassword456',
        confirmPassword: 'newSecurePassword456',
      });
      expect(res.success).toBe(true);
    });

    it('accepts password change without current password (initial password set)', () => {
      const res = changePasswordSchema.safeParse({
        newPassword: 'newSecurePassword456',
        confirmPassword: 'newSecurePassword456',
      });
      expect(res.success).toBe(true);
    });

    it('rejects new password shorter than 8 characters', () => {
      const res = changePasswordSchema.safeParse({
        newPassword: 'short',
        confirmPassword: 'short',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues.some((i) => i.path.includes('newPassword'))).toBe(true);
    });

    it('rejects mismatched new and confirm passwords', () => {
      const res = changePasswordSchema.safeParse({
        newPassword: 'newSecurePassword456',
        confirmPassword: 'differentPassword789',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues.some((i) => i.path.includes('confirmPassword'))).toBe(true);
      expect(res.error?.issues[0].message).toBe('Konfirmasi kata sandi tidak cocok.');
    });

    it('rejects empty confirm password', () => {
      const res = changePasswordSchema.safeParse({
        newPassword: 'newSecurePassword456',
        confirmPassword: '',
      });
      expect(res.success).toBe(false);
    });
  });
});
