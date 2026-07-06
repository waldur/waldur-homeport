import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Stubbed to avoid pulling in the Redux notify store / tooltip context; the
// panel only needs to know whether it rendered the copy button.
vi.mock('@/core/CopyToClipboardButton', () => ({
  CopyToClipboardButton: ({ value }: { value: string }) => (
    <button data-testid="copy">{value}</button>
  ),
}));

import { MessageActionPanel } from './MessageActionPanel';

describe('MessageActionPanel', () => {
  it('renders the copy button and children when a copyValue is given', () => {
    render(
      <MessageActionPanel copyValue="hello">
        <span>feedback</span>
      </MessageActionPanel>,
    );
    expect(screen.getByTestId('copy').textContent).toBe('hello');
    expect(screen.getByText('feedback')).toBeTruthy();
  });

  it('omits the copy button when no copyValue is given but still renders children', () => {
    render(
      <MessageActionPanel>
        <span>feedback</span>
      </MessageActionPanel>,
    );
    expect(screen.queryByTestId('copy')).toBeNull();
    expect(screen.getByText('feedback')).toBeTruthy();
  });
});
