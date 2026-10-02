import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ThemeToggle } from '../theme-toggle';

const mockSetTheme = vi.fn();

vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}));

describe('ThemeToggle', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /beralih ke mode/i });
    expect(button).toBeDefined();
  });

  it('calls setTheme on click to toggle between light and dark', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button', { name: /beralih ke mode/i });
    fireEvent.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
