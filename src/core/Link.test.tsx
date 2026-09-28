import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Link } from './Link';

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

describe('Link', () => {
  it('does not throw on Enter when no onClick prop is passed', async () => {
    const user = userEvent.setup();
    render(<Link state="profile.details">Profile</Link>);

    const errors = await collectUncaughtErrors(async () => {
      await user.tab();
      await user.keyboard('{Enter}');
    });

    expect(screen.getByText('Profile')).toHaveFocus();
    expect(errors).toEqual([]);
  });

  it('still calls onClick on Enter when one is passed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Link state="profile.details" onClick={onClick}>
        Profile
      </Link>,
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores keys other than Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Link state="profile.details" onClick={onClick}>
        Profile
      </Link>,
    );

    await user.tab();
    await user.keyboard('a');

    expect(onClick).not.toHaveBeenCalled();
  });

  it('styles a plain text link as an anchor', () => {
    render(<Link state="profile.details">Profile</Link>);

    expect(screen.getByText('Profile')).toHaveClass('text-anchor');
  });

  it('does not add anchor styling to a link rendered as a button', () => {
    render(
      <Link state="profile.details" buttonVariant="secondary">
        Profile
      </Link>,
    );

    expect(screen.getByText('Profile')).not.toHaveClass('text-anchor');
  });

  it('keeps anchor styling when the caller only passes an unrelated btn-* class', () => {
    render(
      <Link state="profile.details" className="btn-no-focus">
        Profile
      </Link>,
    );

    expect(screen.getByText('Profile')).toHaveClass('text-anchor');
  });
});
