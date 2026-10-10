import { describe, it, expect } from 'vitest';
import { createUserSchema } from '@/features/users/types';

describe('createUserSchema', () => {
  it('accepts valid member registration data', () => {
    const res = createUserSchema.safeParse({
      name: 'Ahmad Dahlan',
      email: 'ahmad@example.com',
      divisionId: 'div-123',
      role: 'MEMBER',
    });
    expect(res.success).toBe(true);
  });

  it('accepts valid coordinator registration data', () => {
    const res = createUserSchema.safeParse({
      name: 'Siti Walidah',
      email: 'siti@example.com',
      divisionId: 'div-456',
      role: 'COORDINATOR',
    });
    expect(res.success).toBe(true);
  });

  it('accepts valid kormanit registration data', () => {
    const res = createUserSchema.safeParse({
      name: 'Kormanit Unit',
      email: 'kormanit@example.com',
      divisionId: 'div-789',
      role: 'KORMANIT',
    });
    expect(res.success).toBe(true);
  });

  it('accepts valid koordinator mahasiswa unit registration data', () => {
    const res = createUserSchema.safeParse({
      name: 'Koordinator Mahasiswa Unit',
      email: 'kormanit@example.com',
      divisionId: 'div-789',
      role: 'KOORDINATOR_MAHASISWA_UNIT',
    });
    expect(res.success).toBe(true);
  });

  it('rejects empty name', () => {
    const res = createUserSchema.safeParse({
      name: '',
      email: 'valid@example.com',
      divisionId: 'div-123',
      role: 'MEMBER',
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toBe('Nama lengkap wajib diisi.');
  });

  it('rejects invalid email', () => {
    const res = createUserSchema.safeParse({
      name: 'Valid Name',
      email: 'not-an-email',
      divisionId: 'div-123',
      role: 'MEMBER',
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toBe('Masukkan alamat email yang valid.');
  });

  it('rejects empty divisionId', () => {
    const res = createUserSchema.safeParse({
      name: 'Valid Name',
      email: 'valid@example.com',
      divisionId: '',
      role: 'MEMBER',
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toBe('Divisi wajib dipilih.');
  });

  it('rejects invalid role', () => {
    const res = createUserSchema.safeParse({
      name: 'Valid Name',
      email: 'valid@example.com',
      divisionId: 'div-123',
      role: 'SUPERADMIN',
    });
    expect(res.success).toBe(false);
  });

  it('accepts valid academic cluster and subunit placement', () => {
    const res = createUserSchema.safeParse({
      name: 'Ahmad Dahlan',
      email: 'ahmad@example.com',
      divisionId: 'div-123',
      role: 'MEMBER',
      cluster: 'SAINTEK',
      isClusterCoordinator: true,
      subunitId: 'sub-1',
      subunitRole: 'COORDINATOR',
    });
    expect(res.success).toBe(true);
  });
});

