import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AccordionCard } from './AccordionCard';

describe('AccordionCard', () => {
  // A button placed in `actions` is a real control: it has to be reachable by
  // assistive technology, and pressing it must not also fold the card.
  it('exposes action buttons without letting them toggle the card', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
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
    render(
      <AccordionCard title="Project details" defaultOpen>
        <p>Body</p>
      </AccordionCard>,
    );
    const title = screen.getByRole('button', { name: 'Project details' });

    title.focus();
    await user.keyboard('{Enter}');

    expect(title).toHaveAttribute('aria-expanded', 'false');
  });

  // Several cards wrap react-final-form fields; folding the card must not
  // unmount them, or their values and validation are dropped.
  it('keeps its body mounted while folded', async () => {
    const user = userEvent.setup();
    render(
      <AccordionCard title="Advanced" defaultOpen>
        <input aria-label="Name" />
      </AccordionCard>,
    );

    await user.type(screen.getByLabelText('Name'), 'alpha');
    await user.click(screen.getByRole('button', { name: 'Advanced' }));

    // Hidden once the fold's slide has run.
    await waitFor(() =>
      expect(screen.getByLabelText('Name')).not.toBeVisible(),
    );
    await user.click(screen.getByRole('button', { name: 'Advanced' }));
    expect(screen.getByLabelText('Name')).toHaveValue('alpha');
  });

  it('starts folded without defaultOpen', () => {
    render(
      <AccordionCard title="Advanced">
        <p>Body</p>
      </AccordionCard>,
    );

    expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByText('Body')).not.toBeVisible();
  });

  it('follows isOpen and reports toggles in controlled mode', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <AccordionCard title="Team" isOpen onToggle={onToggle}>
        <p>Body</p>
      </AccordionCard>,
    );

    await user.click(screen.getByRole('button', { name: 'Toggle' }));

    expect(onToggle).toHaveBeenCalledWith(false);
    // Still open: the parent owns the state and has not changed it.
    expect(screen.getByText('Body')).toBeVisible();
  });
});
