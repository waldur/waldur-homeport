import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './Collapsible';

const Panel = (props: { keepMounted?: boolean; defaultOpen?: boolean }) => (
  <Collapsible {...props}>
    <CollapsibleTrigger>Details</CollapsibleTrigger>
    <CollapsibleContent data-testid="panel">
      <input aria-label="Name" />
    </CollapsibleContent>
  </Collapsible>
);

describe('Collapsible', () => {
  it('toggles the panel and aria-expanded on click', async () => {
    render(<Panel />);

    const trigger = screen.getByRole('button', { name: 'Details' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Name')).toBeVisible();
    expect(trigger).toHaveAttribute(
      'aria-controls',
      screen.getByTestId('panel').id,
    );
  });

  it('respects defaultOpen', () => {
    render(<Panel defaultOpen />);

    expect(screen.getByLabelText('Name')).toBeVisible();
  });

  it('supports controlled open state', async () => {
    const onOpenChange = vi.fn();
    const Controlled = () => {
      const [open, setOpen] = useState(true);
      return (
        <Collapsible
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <CollapsibleTrigger>Details</CollapsibleTrigger>
          <CollapsibleContent>Body</CollapsibleContent>
        </Collapsible>
      );
    };
    render(<Controlled />);

    expect(screen.getByText('Body')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Details' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  describe('keepMounted', () => {
    it('keeps children mounted but hidden while closed', () => {
      render(<Panel keepMounted />);

      const input = screen.getByLabelText('Name');
      expect(input).toBeInTheDocument();
      expect(input).not.toBeVisible();
      expect(screen.getByTestId('panel')).toHaveAttribute(
        'data-state',
        'closed',
      );
    });

    it('preserves child state across close and reopen', async () => {
      render(<Panel keepMounted defaultOpen />);

      await userEvent.type(screen.getByLabelText('Name'), 'alpha');
      const trigger = screen.getByRole('button', { name: 'Details' });
      await userEvent.click(trigger);
      await userEvent.click(trigger);

      expect(screen.getByLabelText('Name')).toHaveValue('alpha');
    });

    it('slides closed before hiding the panel', async () => {
      render(<Panel keepMounted defaultOpen />);

      await userEvent.click(screen.getByRole('button', { name: 'Details' }));

      const panel = screen.getByTestId('panel');
      expect(panel).toHaveAttribute('data-state', 'closed');
      // Still laid out while the rows collapse, then hidden.
      expect(panel).not.toHaveAttribute('hidden');
      expect(panel).toHaveClass('grid-rows-[0fr]');
      await waitFor(() => expect(panel).toHaveAttribute('hidden'));
    });

    it('unhides the panel and expands its rows on open', async () => {
      render(<Panel keepMounted />);

      await userEvent.click(screen.getByRole('button', { name: 'Details' }));

      const panel = screen.getByTestId('panel');
      expect(panel).not.toHaveAttribute('hidden');
      await waitFor(() => expect(panel).toHaveClass('grid-rows-[1fr]'));
    });

    // jsdom has no layout, so this pins the classes: a grid track sized
    // to its content would let a wide table widen the panel (and the card
    // around it) instead of scrolling in its own wrapper.
    it('lets its content shrink below its min-content width', () => {
      render(<Panel keepMounted defaultOpen />);

      const panel = screen.getByTestId('panel');
      expect(panel).toHaveClass('grid-cols-[minmax(0,1fr)]');
    });

    it('points aria-controls at the panel even while closed', () => {
      render(<Panel keepMounted />);

      const trigger = screen.getByRole('button', { name: 'Details' });
      expect(trigger).toHaveAttribute(
        'aria-controls',
        screen.getByTestId('panel').id,
      );
    });
  });
});
