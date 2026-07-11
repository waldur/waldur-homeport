/**
 * These tests assert the DOM *structure* around a disabled button (the
 * inline-block wrapper span that makes the tooltip's hover target live). That
 * is inherently node-structural, and jsdom does not enforce the
 * `pointer-events: none` that hides the tooltip in a real browser — so a
 * behavioural hover assertion would pass even without the fix. Structural
 * assertions are therefore the reliable regression guard here.
 */
/* eslint-disable testing-library/no-node-access */
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { BaseButton } from './BaseButton';

describe('BaseButton disabled tooltip', () => {
  it('wraps a disabled button with a tooltip in an inline-block span so hover fires', () => {
    renderWithProviders(
      <BaseButton
        size="sm"
        label="Add"
        disabled
        tooltip="Steps can only be edited while the call is a draft."
      />,
    );
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toBeDisabled();
    expect(button.parentElement?.tagName).toBe('SPAN');
    expect(button.parentElement).toHaveClass('d-inline-block');
  });

  it('does not add the wrapper span when the button is enabled', () => {
    renderWithProviders(
      <BaseButton size="sm" label="Add" tooltip="Add a new step." />,
    );
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).not.toBeDisabled();
    expect(button.parentElement).not.toHaveClass('d-inline-block');
  });

  it('mirrors w-100 onto the wrapper so full-width disabled buttons keep their width', () => {
    renderWithProviders(
      <BaseButton
        size="lg"
        label="Submit review"
        className="w-100"
        disabled
        disabledReason="Confirm absence of conflict of interest to submit."
      />,
    );
    const button = screen.getByRole('button', { name: 'Submit review' });
    expect(button.parentElement).toHaveClass('d-inline-block');
    expect(button.parentElement).toHaveClass('w-100');
  });
});
