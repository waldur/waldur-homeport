import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, ReactNode, useEffect } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThreadProvider } from '@/ai-assistant/logic/ThreadProvider';
import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { useDrawer } from '@/drawer/actions';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DrawerRoot } from '@/drawer/DrawerRoot';
import { LLMChatDrawerToggle } from '@/navigation/header/LLMChatDrawerToggle';
import { useUser } from '@/workspace/hooks';

import {
  AnonymousThreadProvider,
  useAnonymousThreadContext,
} from './AnonymousThreadProvider';

// A visitor's stream finishes into app-level state whether the drawer is open or
// not, so the "new reply" marker is derived in the header toggle — but it has to
// be *cleared* wherever the drawer is opened from. Held in the toggle's own
// state it only cleared on a header click, leaving the marker blinking behind a
// drawer the visitor had opened from somewhere else.
vi.mock('@/ai-assistant/utils', () => ({
  isAssistantEnabled: () => true,
  isAnonymousVisitor: () => true,
}));

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue(undefined);
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'public.offerings' },
    params: {},
  } as any);
});

// Drives the visitor stream the way AnonymousThreadRuntimeProvider does.
const Stream: FC<{ running: boolean }> = ({ running }) => {
  const { setIsRunning } = useAnonymousThreadContext();
  useEffect(() => {
    setIsRunning(running);
  }, [running, setIsRunning]);
  return null;
};

// Stands in for any entry point into the drawer other than the header toggle.
const ExternalOpener: FC = () => {
  const { openDrawer } = useDrawer();
  return (
    <button
      type="button"
      data-testid="external-opener"
      onClick={() => openUnifiedChatDrawer(openDrawer)}
    >
      open
    </button>
  );
};

const Page: FC<{ running: boolean }> = ({ running }) => (
  <>
    <Stream running={running} />
    <LLMChatDrawerToggle />
    <ExternalOpener />
  </>
);

const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
  >
    <ThreadProvider>
      <AnonymousThreadProvider>
        <DrawerProvider>
          {children}
          <DrawerRoot />
        </DrawerProvider>
      </AnonymousThreadProvider>
    </ThreadProvider>
  </QueryClientProvider>
);

const toggleState = () =>
  screen.getByTestId('llm-chat-drawer-toggle').dataset.state;

/** Runs a visitor reply to completion with the drawer shut. */
const finishReplyWhileClosed = async (rerender: (ui: ReactNode) => void) => {
  rerender(
    <Wrapper>
      <Page running={true} />
    </Wrapper>,
  );
  rerender(
    <Wrapper>
      <Page running={false} />
    </Wrapper>,
  );
  await waitFor(() => expect(toggleState()).toBe('unread'));
};

describe('visitor unread reply marker', () => {
  it('marks a reply that arrived while the drawer was shut', async () => {
    const { rerender } = render(
      <Wrapper>
        <Page running={false} />
      </Wrapper>,
    );
    expect(toggleState()).toBe('closed');

    await finishReplyWhileClosed(rerender);
  });

  it('clears when the drawer is opened from elsewhere, not just from the header', async () => {
    const { rerender } = render(
      <Wrapper>
        <Page running={false} />
      </Wrapper>,
    );
    await finishReplyWhileClosed(rerender);

    await userEvent.click(screen.getByTestId('external-opener'));
    // The drawer body is lazy-loaded, and the panel clears the marker from an
    // effect once it is there.
    await screen.findByPlaceholderText('Ask about offerings…');
    await waitFor(() => expect(toggleState()).toBe('closed'));
  });
});
