import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

describe('Alert Component', () => {
  it('renders default alert with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Pemberitahuan</AlertTitle>
        <AlertDescription>Informasi sistem berhasil dimuat.</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('Pemberitahuan')).toBeDefined();
    expect(screen.getByText('Informasi sistem berhasil dimuat.')).toBeDefined();
  });

  it('renders destructive variant for error alerting', () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Gagal Masuk</AlertTitle>
        <AlertDescription>Email atau kata sandi tidak valid.</AlertDescription>
      </Alert>
    );

    const alertEl = screen.getByRole('alert');
    expect(alertEl.className).toContain('text-destructive');
    expect(screen.getByText('Gagal Masuk')).toBeDefined();
    expect(screen.getByText('Email atau kata sandi tidak valid.')).toBeDefined();
  });
});
