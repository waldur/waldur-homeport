import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { AccordionCard } from './AccordionCard';

describe('AccordionCard', () => {
  // A button placed in `actions` is a real control: it has to be reachable by
  // assistive technology, and pressing it must not also fold the card.
  it('exposes action buttons without letting them toggle the card', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(
      <AccordionCard
        title="Resource requests"
        defaultOpen
        actions={
          <button type="button" onClick={onAdd}>
            Add resource
          </button>
        }
      >
        <p>Body</p>
      </AccordionCard>,
    );

    await user.click(screen.getByRole('button', { name: 'Add resource' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole('button', { name: 'Resource requests' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles from the keyboard on the title', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AccordionCard title="Project details" defaultOpen>
        <p>Body</p>
      </AccordionCard>,
    );
    const title = screen.getByRole('button', { name: 'Project details' });

    title.focus();
    await user.keyboard('{Enter}');

    expect(title).toHaveAttribute('aria-expanded', 'false');
  });
});
