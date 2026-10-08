import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { DatePicker } from '../date-picker';

describe('DatePicker', () => {
  it('shows placeholder when no value is set', () => {
    render(<DatePicker value={undefined} onChange={vi.fn()} placeholder="Pilih tanggal" />);
    expect(screen.getByText('Pilih tanggal')).toBeDefined();
  });

  it('formats an existing yyyy-MM-dd value in Indonesian', () => {
    render(<DatePicker value="2026-10-15" onChange={vi.fn()} />);
    expect(screen.getByText('15 Oktober 2026')).toBeDefined();
  });

  it('opens the calendar popover and selects a date', async () => {
    const onChange = vi.fn();
    render(<DatePicker value={undefined} onChange={onChange} />);

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    // Calendar grid should render with day cells once open.
    await waitFor(() => {
      expect(screen.getAllByRole('gridcell').length).toBeGreaterThan(0);
    });

    // Click a day button (any enabled day number) and expect onChange to fire
    // with a yyyy-MM-dd formatted string.
    const dayButtons = screen.getAllByRole('button').filter((b) =>
      /^\d{1,2}$/.test(b.textContent?.trim() || '')
    );
    expect(dayButtons.length).toBeGreaterThan(0);
    fireEvent.click(dayButtons[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1);
    });
    const calledWith = onChange.mock.calls[0][0];
    expect(calledWith).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
