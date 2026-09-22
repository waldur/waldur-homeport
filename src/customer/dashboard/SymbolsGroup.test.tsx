import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SymbolsGroup } from './SymbolsGroup';

const members = [
  { full_name: 'Ada Lovelace', email: 'ada@example.com' },
  { full_name: 'Grace Hopper', email: 'grace@example.com' },
];

/**
 * React reports an exception thrown inside an event handler as an uncaught
 * error rather than letting it escape the interaction, so asserting
 * `.not.toThrow()` here would pass even while the handler blew up. Collecting
 * window `error` events is what actually catches it.
 */
const collectUncaughtErrors = async (run: () => Promise<void>) => {
  const errors: string[] = [];
  const onError = (event: ErrorEvent) => {
    errors.push(event.message);
    event.preventDefault();
  };
  window.addEventListener('error', onError);
  try {
    await run();
  } finally {
    window.removeEventListener('error', onError);
  }
  return errors;
};

describe('SymbolsGroup', () => {
  it('is not a control at all when no onClick prop is passed', async () => {
    const user = userEvent.setup();
    render(<SymbolsGroup items={members} />);

    const errors = await collectUncaughtErrors(async () => {
      await user.tab();
      await user.keyboard('{Enter}');
    });

    // A read-only avatar strip used to sit in the tab order announced as a
    // button, and Enter on it threw "onClick is not a function".
    expect(errors).toEqual([]);
    expect(document.body).toHaveFocus();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClick on Enter when one is passed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SymbolsGroup items={members} onClick={onClick} />);

    await user.tab();

    expect(screen.getByRole('button')).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on a mouse click when one is passed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SymbolsGroup items={members} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores keys other than Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SymbolsGroup items={members} onClick={onClick} />);

    await user.tab();
    await user.keyboard('a');

    expect(onClick).not.toHaveBeenCalled();
  });
});
