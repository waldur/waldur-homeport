import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SafeMarkdown } from './SafeMarkdown';

describe('SafeMarkdown URL sanitization', () => {
  it('keeps safe https links clickable', () => {
    render(
      <SafeMarkdown text="[Support](https://support.example.com/ticket/123)" />,
    );

    const link = screen.getByRole('link', { name: 'Support' });
    expect(link.getAttribute('href')).toBe(
      'https://support.example.com/ticket/123',
    );
  });

  it('sanitizes javascript: URL links', () => {
    render(<SafeMarkdown text="[Click me](javascript:alert('xss'))" />);

    const link = screen.queryByRole('link', { name: 'Click me' });
    if (!link) {
      expect(link).toBeNull();
      return;
    }

    expect((link.getAttribute('href') || '').toLowerCase()).not.toContain(
      'javascript:',
    );
  });

  it('sanitizes encoded javascript URL links after entity decoding', () => {
    render(<SafeMarkdown text="[Click me](javascript&#x3a;alert('xss'))" />);

    const link = screen.queryByRole('link', { name: 'Click me' });
    if (!link) {
      expect(link).toBeNull();
      return;
    }

    expect((link.getAttribute('href') || '').toLowerCase()).not.toContain(
      'javascript:',
    );
  });
});
