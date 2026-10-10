import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StoryPointGuidePopover, SP_GUIDELINES } from '../components/story-point-guide-popover';

describe('StoryPointGuidePopover', () => {
  it('renders trigger button with Panduan SP text', () => {
    render(<StoryPointGuidePopover />);
    expect(screen.getByText('Panduan SP')).toBeDefined();
    expect(screen.getByRole('button', { name: /panduan acuan story point/i })).toBeDefined();
  });

  it('contains expected guideline data points matching PRD', () => {
    const spValues = SP_GUIDELINES.map((g) => g.sp);
    expect(spValues).toEqual(['1', '2', '3', '5', '8', '> 8']);

    const sp1 = SP_GUIDELINES.find((g) => g.sp === '1');
    expect(sp1?.effort).toBe('Kurang dari 1 jam');

    const sp2 = SP_GUIDELINES.find((g) => g.sp === '2');
    expect(sp2?.effort).toBe('Sekitar 1–2 jam');

    const sp3 = SP_GUIDELINES.find((g) => g.sp === '3');
    expect(sp3?.effort).toBe('Setengah hari');

    const sp5 = SP_GUIDELINES.find((g) => g.sp === '5');
    expect(sp5?.effort).toBe('Sekitar satu hari');

    const sp8 = SP_GUIDELINES.find((g) => g.sp === '8');
    expect(sp8?.effort).toBe('Dua hari atau lebih');

    const spOver8 = SP_GUIDELINES.find((g) => g.sp === '> 8');
    expect(spOver8?.effort).toBe('Tidak diizinkan');
    expect(spOver8?.isProhibited).toBe(true);
  });

  it('opens popover when clicked', () => {
    render(<StoryPointGuidePopover />);
    const trigger = screen.getByRole('button', { name: /panduan acuan story point/i });
    fireEvent.click(trigger);

    expect(screen.getByText('Panduan Acuan Story Point (SP)')).toBeDefined();
    expect(screen.getByText('Kurang dari 1 jam')).toBeDefined();
    expect(screen.getByText('Sekitar 1–2 jam')).toBeDefined();
    expect(screen.getByText('Setengah hari')).toBeDefined();
    expect(screen.getByText('Sekitar satu hari')).toBeDefined();
    expect(screen.getByText('Dua hari atau lebih')).toBeDefined();
    expect(screen.getByText('Wajib dipecah menjadi beberapa task')).toBeDefined();
  });
});
