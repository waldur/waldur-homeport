import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  it('explains the section on hovering its question mark', async () => {
    renderWithProviders(
      <SectionHeading
        title="What stays on the sources"
        help="Rows that deliberately stay with the archived source offerings."
      />,
    );

    expect(screen.getByTestId('section-heading')).toHaveTextContent(
      'What stays on the sources',
    );
    await userEvent.hover(screen.getByTestId('help-tip'));
    expect(
      (
        await screen.findAllByText(
          'Rows that deliberately stay with the archived source offerings.',
        )
      ).length,
    ).toBeGreaterThan(0);
  });

  it('renders a bare heading when there is nothing to explain', () => {
    renderWithProviders(<SectionHeading title="Blockers" />);

    expect(screen.getByTestId('section-heading')).toHaveTextContent('Blockers');
    expect(screen.queryByTestId('help-tip')).toBeNull();
  });
});
