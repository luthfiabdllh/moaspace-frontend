import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  activateSchema,
  resetPasswordSchema,
} from '@/features/auth/types';

describe('loginSchema (Zod v4)', () => {
  describe('valid inputs', () => {
    it('accepts a valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'SecureP@ss1',
      });
      expect(result.success).toBe(true);
    });

    it('accepts password at minimum length (8 chars)', () => {
      const result = loginSchema.safeParse({
        email: 'test@test.com',
        password: '12345678',
      });
      expect(result.success).toBe(true);
    });

    it('accepts rememberMe boolean flag when true or false', () => {
      const resultWithTrue = loginSchema.safeParse({
        email: 'test@test.com',
        password: '12345678',
        rememberMe: true,
      });
      expect(resultWithTrue.success).toBe(true);
      if (resultWithTrue.success) {
        expect(resultWithTrue.data.rememberMe).toBe(true);
      }

      const resultWithFalse = loginSchema.safeParse({
        email: 'test@test.com',
        password: '12345678',
        rememberMe: false,
      });
      expect(resultWithFalse.success).toBe(true);
      if (resultWithFalse.success) {
        expect(resultWithFalse.data.rememberMe).toBe(false);
      }
    });
  });

  describe('invalid inputs', () => {
    it('rejects an invalid email format', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'ValidPass1',
      });
      expect(result.success).toBe(false);
      // Zod v4: use error.issues instead of error.errors
      expect(result.error?.issues[0].path).toContain('email');
    });

    it('rejects an empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'ValidPass1',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('email');
    });

    it('rejects a password shorter than 8 characters', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '1234567', // 7 chars — below minimum
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('password');
    });

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('password');
    });

    it('rejects when both fields are missing', () => {
      const result = loginSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error?.issues.length).toBeGreaterThanOrEqual(2);
    });

    it('rejects a password longer than 128 characters', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'A'.repeat(129),
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0].path).toContain('password');
    });
  });

  describe('error messages', () => {
    it('returns the correct error message for invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-valid',
        password: 'ValidPass1',
      });
      expect(result.success).toBe(false);
      const emailIssue = result.error?.issues.find((i) =>
        i.path.includes('email')
      );
      expect(emailIssue?.message).toBe('Please enter a valid email address.');
    });

    it('returns the correct error message for short password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      const passIssue = result.error?.issues.find((i) =>
        i.path.includes('password')
      );
      expect(passIssue?.message).toBe('Password must be at least 8 characters.');
    });
  });

  describe('activateSchema', () => {
    it('accepts valid token and matching passwords', () => {
      const res = activateSchema.safeParse({
        token: 'valid-token-123',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });
      expect(res.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const res = activateSchema.safeParse({
        token: 'valid-token-123',
        password: 'Password123!',
        confirmPassword: 'MismatchPassword!',
      });
      expect(res.success).toBe(false);
      expect(res.error?.issues[0].message).toBe('Konfirmasi kata sandi tidak cocok.');
    });
  });

  describe('resetPasswordSchema', () => {
    it('accepts valid reset payload', () => {
      const res = resetPasswordSchema.safeParse({
        token: 'reset-token-456',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
      expect(res.success).toBe(true);
    });

    it('rejects mismatched passwords', () => {
      const res = resetPasswordSchema.safeParse({
        token: 'reset-token-456',
        password: 'NewPassword123!',
        confirmPassword: 'DifferentPassword!',
      });
      expect(res.success).toBe(false);
    });
  });
});
