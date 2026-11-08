import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { SubmitButton } from './SubmitButton';

const renderButton = (options = {}) =>
  render(
    <SubmitButton
      submitting={false}
      disabled={false}
      label="Create project"
      {...options}
    />,
  );

describe('SubmitButton', () => {
  it('renders enabled button without spinner', () => {
    renderButton();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).not.toHaveClass('animation-spin');
  });

  it('renders disabled button without spinner', () => {
    renderButton({ disabled: true });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).not.toHaveClass('animation-spin');
  });

  it('renders spinner and blocks button', () => {
    renderButton({ submitting: true });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('SpinnerIcon')).toBeInTheDocument();
  });
});

/**
 * The --dialog-action-min-w floor. It is conditional on `size`, and a caller
 * overrides it by passing its own min-w, so both halves are easy to break by
 * "simplifying" the cn() call. Most of the app's dialogs rely on the first
 * case here: they pass no `size` at all and inherit the lg default.
 */
describe('SubmitButton dialog action width floor', () => {
  const FLOOR = 'min-w-[var(--dialog-action-min-w)]';

  it('applies the floor when no size is passed, via the lg default', () => {
    renderButton();
    expect(screen.getByRole('button')).toHaveClass(FLOOR);
  });

  it('applies the floor for an explicit lg', () => {
    renderButton({ size: 'lg' });
    expect(screen.getByRole('button')).toHaveClass(FLOOR);
  });

  it('leaves a small button unfloored, for popovers and inline forms', () => {
    renderButton({ size: 'sm' });
    expect(screen.getByRole('button')).not.toHaveClass(FLOOR);
  });

  it("lets a caller's own min-w replace the floor", () => {
    renderButton({ className: 'min-w-[60px]' });
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-w-[60px]');
    expect(button).not.toHaveClass(FLOOR);
  });

  it('keeps the floor beside an unrelated class from the caller', () => {
    renderButton({ className: 'me-auto' });
    const button = screen.getByRole('button');
    expect(button).toHaveClass('me-auto');
    expect(button).toHaveClass(FLOOR);
  });
});
