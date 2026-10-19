import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it } from 'vitest';

import { useFocusThroughRemovals } from './useFocusThroughRemovals';

const Dialog = () => {
  const ref = useRef<HTMLDivElement>(null);
  useFocusThroughRemovals(ref, true);
  return (
    <div ref={ref} tabIndex={-1} data-testid="content">
      <input aria-label="Project" />
      <button type="button">Cancel</button>
    </div>
  );
};

/**
 * Replays what Chrome does on a Tab out of a select in a modal Radix
 * dialog: the select's focusout heads for the next control, and the dialog's
 * focus trap, seeing nodes removed while focus is on <body>, moves focus to
 * the content, once per batch of removals. (jsdom fires focus events in one
 * go, so a real Tab doesn't reproduce it here.)
 */
describe('useFocusThroughRemovals', () => {
  const tabOutOfSelect = () => {
    const input = screen.getByRole('textbox', { name: 'Project' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    input.focus();
    input.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, relatedTarget: cancel }),
    );
    return cancel;
  };

  it('sends focus on to where it was heading when the trap takes it', () => {
    render(<Dialog />);
    const cancel = tabOutOfSelect();
    const content = screen.getByTestId('content');

    content.focus();
    expect(cancel).toHaveFocus();
    // The trap focuses the content once per batch of removals.
    content.focus();
    expect(cancel).toHaveFocus();
  });

  it('leaves the content focused once the task is over', async () => {
    render(<Dialog />);
    tabOutOfSelect();
    const content = screen.getByTestId('content');

    await new Promise((resolve) => setTimeout(resolve));
    content.focus();
    expect(content).toHaveFocus();
  });
});
