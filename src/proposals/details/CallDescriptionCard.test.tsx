import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { CallDescriptionCard } from './CallDescriptionCard';

const renderCard = (description: string) =>
  renderWithProviders(
    <CallDescriptionCard call={{ description, backend_id: 'REF-42' } as any} />,
  );

describe('CallDescriptionCard', () => {
  it('strips class and style from raw HTML in the description', () => {
    renderCard(
      'Intro <a class="fixed inset-0 z-[9999]" style="position:fixed" href="https://example.com/">Apply</a>',
    );
    const link = screen.getByRole('link', { name: 'Apply' });
    expect(link.getAttribute('href')).toBe('https://example.com/');
    expect(link.hasAttribute('class')).toBe(false);
    expect(link.hasAttribute('style')).toBe(false);
  });

  it('renders markdown', () => {
    renderCard('Read the **rules** first.');
    expect(screen.getByText('rules').tagName).toBe('STRONG');
  });

  it('keeps strikethrough, superscript and subscript', () => {
    renderCard('~~old~~ x<sup>2</sup> H<sub>3</sub>O');
    expect(screen.getByText('old').tagName).toBe('DEL');
    expect(screen.getByText('2').tagName).toBe('SUP');
    expect(screen.getByText('3').tagName).toBe('SUB');
  });

  it('shows the call details where the placeholder is', () => {
    renderCard(
      'Before\n\n<CallDetailsFields></CallDetailsFields>\n\nAfter <CallDetailsFields />',
    );
    expect(screen.getAllByText('REF-42')).toHaveLength(2);
    expect(screen.getByText('Before')).toBeTruthy();
    expect(screen.getByText('After')).toBeTruthy();
  });

  it('shows only the call details when there is no description', () => {
    renderCard('');
    expect(screen.getByText('REF-42')).toBeTruthy();
  });
});
