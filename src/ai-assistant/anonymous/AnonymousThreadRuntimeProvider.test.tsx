import { useAssistantState } from '@assistant-ui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  AnonymousThreadProvider,
  useAnonymousThreadContext,
} from './AnonymousThreadProvider';
import { AnonymousThreadRuntimeProvider } from './AnonymousThreadRuntimeProvider';

const Probe = () => {
  const count = useAssistantState(({ thread }) => thread.messages.length);
  return <div data-testid="count">{count}</div>;
};

describe('AnonymousThreadRuntimeProvider', () => {
  it('mounts with an empty thread', () => {
    render(
      <AnonymousThreadProvider>
        <AnonymousThreadRuntimeProvider>
          <Probe />
        </AnonymousThreadRuntimeProvider>
      </AnonymousThreadProvider>,
    );
    expect(screen.getByTestId('count').textContent).toBe('0');
  });

  it('keeps the conversation when the drawer runtime closes and reopens', async () => {
    // The runtime provider stands in for the drawer: toggling it off/on models
    // closing and reopening the chat. The message must survive because the
    // state lives in the app-level AnonymousThreadProvider above it.
    const user = userEvent.setup();
    const Harness = () => {
      const [open, setOpen] = useState(true);
      const { setMessages } = useAnonymousThreadContext();
      return (
        <>
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'u1',
                  role: 'user',
                  content: [{ type: 'text', text: 'hi' }],
                },
              ])
            }
          >
            seed
          </button>
          <button onClick={() => setOpen((o) => !o)}>toggle</button>
          {open && (
            <AnonymousThreadRuntimeProvider>
              <Probe />
            </AnonymousThreadRuntimeProvider>
          )}
        </>
      );
    };

    render(
      <AnonymousThreadProvider>
        <Harness />
      </AnonymousThreadProvider>,
    );

    await user.click(screen.getByText('seed'));
    await waitFor(() =>
      expect(screen.getByTestId('count').textContent).toBe('1'),
    );

    await user.click(screen.getByText('toggle')); // close → runtime unmounts
    expect(screen.queryByTestId('count')).toBeNull();

    await user.click(screen.getByText('toggle')); // reopen → runtime remounts
    await waitFor(() =>
      expect(screen.getByTestId('count').textContent).toBe('1'),
    );
  });
});
