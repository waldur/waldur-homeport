/**
 * Structural assertions (`.querySelector`) verify the pending spinner DOM structure.
 */
/* eslint-disable testing-library/no-node-access */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { BaseButton } from './BaseButton';

describe('BaseButton disabled tooltip', () => {
  it('sets disabled and data-disabled on a disabled button with tooltip', () => {
    render(
      <BaseButton
        size="sm"
        label="Add"
        disabled
        tooltip="Steps can only be edited while the call is a draft."
      />,
    );
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
  });

  it('does not set data-disabled when enabled', () => {
    render(<BaseButton size="sm" label="Add" tooltip="Add a new step." />);
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveAttribute('data-disabled');
  });

  it('keeps the same <button> DOM node across a disabled<->enabled toggle when only disabledReason (no permanent tooltip) is set', () => {
    const { rerender } = render(
      <BaseButton size="sm" label="Save" disabledReason="Saving..." />,
    );
    const button = screen.getByRole('button', { name: 'Save' });

    rerender(
      <BaseButton
        size="sm"
        label="Saving"
        disabled
        disabledReason="Saving..."
      />,
    );
    expect(screen.getByRole('button')).toBe(button);
    expect(button.isConnected).toBe(true);
    expect(button).toHaveAttribute('data-disabled');

    rerender(<BaseButton size="sm" label="Save" disabledReason="Saving..." />);
    expect(screen.getByRole('button')).toBe(button);
    expect(button.isConnected).toBe(true);
    expect(button).not.toHaveAttribute('data-disabled');
  });

  it('preserves w-100 on the button directly', () => {
    render(
      <BaseButton
        size="lg"
        label="Submit review"
        className="w-100"
        disabled
        disabledReason="Confirm absence of conflict of interest to submit."
      />,
    );
    const button = screen.getByRole('button', { name: 'Submit review' });
    expect(button).toHaveClass('w-100');
  });

  it('preserves flex self-alignment classes on the button directly', () => {
    render(
      <BaseButton
        size="sm"
        label="Back"
        className="me-3 align-self-center"
        tooltip="Go back"
      />,
    );
    const button = screen.getByRole('button', { name: 'Back' });
    expect(button).toHaveClass('align-self-center');
  });
});

describe('BaseButton pending state', () => {
  it('disables the button and shows a spinner instead of the icon', () => {
    render(
      <BaseButton
        size="lg"
        label="Save"
        pending
        iconNode={<span data-testid="icon">icon</span>}
      />,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument();
    expect(button.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('disabledReason overrides tooltip while pending, same as while disabled', () => {
    render(
      <BaseButton
        size="lg"
        label="Save"
        pending
        tooltip="Save your changes."
        disabledReason="Saving is already in progress."
      />,
    );
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('data-disabled');
  });
});

describe('BaseButton icon-only aria-label fallback', () => {
  it('falls back to the tooltip text as aria-label when there is no visible label', () => {
    render(
      <BaseButton size="lg" tooltip="Add resource" iconNode={<span>+</span>} />,
    );
    expect(
      screen.getByRole('button', { name: 'Add resource' }),
    ).toBeInTheDocument();
  });

  it('does not set aria-label when a visible label is present', () => {
    render(<BaseButton size="lg" label="Add" tooltip="Add resource" />);
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).not.toHaveAttribute('aria-label');
  });
});

describe('BaseButton ref and prop passthrough', () => {
  it('forwards ref to the underlying HTMLButtonElement', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<BaseButton ref={ref} size="sm" label="Add" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.textContent).toContain('Add');
  });

  it('forwards arbitrary DOM props (e.g. data-testid) onto the button', () => {
    render(<BaseButton size="sm" label="Add" data-testid="add-button" />);
    expect(screen.getByTestId('add-button')).toBeInTheDocument();
  });
});

describe('BaseButton two-tone secondary variant', () => {
  it('applies signature two-tone icon token to secondary buttons', () => {
    render(
      <BaseButton
        variant="secondary"
        label="Sync"
        iconNode={<span data-testid="sync-icon">sync</span>}
      />,
    );
    const button = screen.getByRole('button', { name: /sync/i });
    expect(button).toHaveClass('[--btn-icon-color:var(--btn-secondary-icon)]');
    const iconWrapper = screen.getByTestId('sync-icon').parentElement;
    expect(iconWrapper).toHaveClass(
      'text-[var(--btn-icon-color,currentColor)]',
    );
  });

  it('resets icon color to disabled text token when secondary button is disabled', () => {
    render(
      <BaseButton
        variant="secondary"
        label="Sync"
        disabled
        disabledReason="Sync in progress"
        iconNode={<span data-testid="sync-icon">sync</span>}
      />,
    );
    const button = screen.getByRole('button', { name: /sync/i });
    expect(button).toHaveClass(
      'disabled:[--btn-icon-color:var(--btn-disabled-text)]',
    );
    expect(button).toHaveClass(
      'data-disabled:[--btn-icon-color:var(--btn-disabled-text)]',
    );
  });

  it('does not set --btn-icon-color on monochromatic variants like primary', () => {
    render(
      <BaseButton
        variant="primary"
        label="Save"
        iconNode={<span data-testid="save-icon">save</span>}
      />,
    );
    const button = screen.getByRole('button', { name: /save/i });
    expect(button.className).not.toContain('--btn-icon-color');
  });
});
