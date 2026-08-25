import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { AnonymousChatPanel } from './AnonymousChatPanel';
import { AnonymousThreadProvider } from './AnonymousThreadProvider';

// Force a render crash inside the panel so the tests exercise the error
// boundary — the visitor panel used to mount the thread bare, letting one
// bad block render take out the whole drawer.
vi.mock('./AnonymousThread', () => ({
  AnonymousThread: () => {
    throw new Error('block renderer exploded');
  },
}));

// React logs every boundary-caught error to console.error; keep test
// output pristine.
let consoleError: ReturnType<typeof vi.spyOn>;
beforeAll(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  consoleError.mockRestore();
});

describe('AnonymousChatPanel error boundary', () => {
  it('shows the recovery UI instead of crashing the drawer', () => {
    render(
      <AnonymousThreadProvider>
        <AnonymousChatPanel />
      </AnonymousThreadProvider>,
    );
    expect(screen.getByText('Chat Temporarily Unavailable')).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('wires the drawer close handler into the recovery UI', async () => {
    const close = vi.fn();
    render(
      <AnonymousThreadProvider>
        <AnonymousChatPanel close={close} />
      </AnonymousThreadProvider>,
    );
    await userEvent.click(screen.getByText('Close'));
    expect(close).toHaveBeenCalled();
  });
});
