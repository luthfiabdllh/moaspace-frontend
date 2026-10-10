import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { NotionEditor } from '../notion-editor';

describe('NotionEditor', () => {
  it('renders read-only content with link successfully', () => {
    const htmlContent = '<p>Kunjungi <a href="https://example.com" target="_blank" rel="noopener noreferrer">Website KKN</a> untuk info lebih lanjut.</p>';
    render(<NotionEditor value={htmlContent} readOnly />);

    const linkEl = screen.getByRole('link', { name: 'Website KKN' });
    expect(linkEl).toBeDefined();
    expect(linkEl.getAttribute('href')).toBe('https://example.com');
  });

  it('renders editable editor without crashing', () => {
    const { container } = render(
      <NotionEditor value="<p>Catatan penting</p>" placeholder="Tulis catatan..." />
    );
    expect(container.querySelector('.prose-notion')).toBeDefined();
  });
});
