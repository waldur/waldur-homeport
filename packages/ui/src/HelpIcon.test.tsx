import { WarningIcon } from '@phosphor-icons/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HelpIcon } from './HelpIcon';
import { WarningTip } from './WarningTip';

describe('HelpIcon', () => {
  it('is a named, focusable button that shows its tooltip on focus', async () => {
    render(<HelpIcon label="Explains the field" />);
    const button = screen.getByRole('button', { name: 'Help' });
    await userEvent.tab();
    expect(button).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Explains the field',
    );
  });

  it('lets the caller replace the accessible name', () => {
    render(<HelpIcon label="x" aria-label="Details" />);
    expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
  });

  it('does not submit a surrounding form', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <HelpIcon label="x" />
      </form>,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('HelpIcon on a touch screen', () => {
  const original = window.matchMedia;
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(hover: none)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
  });

  it('opens its text on tap and closes on Escape', async () => {
    render(<HelpIcon label="Explains the field" />);
    expect(screen.queryByText('Explains the field')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(await screen.findByText('Explains the field')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByText('Explains the field')).not.toBeInTheDocument(),
    );
  });
});

describe('WarningTip', () => {
  it('is named "Warning" by default and accepts another icon', () => {
    render(<WarningTip label="x" icon={WarningIcon} />);
    expect(screen.getByRole('button', { name: 'Warning' })).toBeInTheDocument();
  });
});
