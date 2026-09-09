import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, ReactNode } from 'react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AnonymousThreadProvider } from '@/ai-assistant/anonymous/AnonymousThreadProvider';
import {
  consumePendingAssistantSeed,
  setPendingAssistantSeed,
} from '@/ai-assistant/logic/assistantSeed';
import { ThreadProvider } from '@/ai-assistant/logic/ThreadProvider';
import { useDrawer } from '@/drawer/actions';
import { DrawerProvider } from '@/drawer/DrawerContext';
import { DrawerRoot } from '@/drawer/DrawerRoot';
import { useUser } from '@/workspace/hooks';

import { openUnifiedChatDrawer } from './openUnifiedChatDrawer';

// Exercises the real entry-point stack — openUnifiedChatDrawer -> DrawerProvider
// -> UnifiedChatDrawer -> LLMChatDrawer -> Thread -> AssistantComposer — because
// the seed's whole risk is in the seams between them, not in any one component.
// `@/workspace/hooks` is globally mocked (test/mocks/workspace.js); it is driven
// per-test rather than re-mocked.

// jsdom here exposes no localStorage, and the AI disclosure gate reads one.
const memoryStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

beforeAll(() => {
  // assistant-ui's Viewport observes its content size; jsdom has no
  // ResizeObserver.
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
  vi.stubGlobal('localStorage', memoryStorage());
  vi.mocked(useUser).mockReturnValue({ uuid: 'u1', is_staff: true } as any);
  consumePendingAssistantSeed();
});

const OFFERING_QUESTION = 'Tell me about Elastic HPC. Is this service right?';

const Harness: FC = () => {
  const { openDrawer } = useDrawer();
  return (
    <>
      <button
        onClick={() =>
          openUnifiedChatDrawer(openDrawer, { seedPrompt: OFFERING_QUESTION })
        }
      >
        ask-about-offering
      </button>
      <button onClick={() => openUnifiedChatDrawer(openDrawer)}>
        header-toggle
      </button>
    </>
  );
};

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

const setup = () =>
  render(
    <Wrapper>
      <Harness />
    </Wrapper>,
  );

const closeDrawer = async () => {
  await userEvent.click(screen.getAllByLabelText('Close')[0]);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
};

const acknowledgeDisclosure = async () => {
  await waitFor(() =>
    expect(screen.getByText('Before you begin')).toBeTruthy(),
  );
  await userEvent.click(screen.getByText('I understand'));
};

describe('assistant composer seed', () => {
  it('prefills the composer with the entry point question', async () => {
    setup();

    await userEvent.click(screen.getByText('ask-about-offering'));
    await acknowledgeDisclosure();

    const composer = await screen.findByPlaceholderText('Ask me anything…');
    expect((composer as HTMLTextAreaElement).value).toBe(OFFERING_QUESTION);
  });

  // The composer is not guaranteed to mount when the drawer opens: the AI
  // disclosure banner stands in front of it on a first visit, and
  // LLMErrorBoundary can replace it. A seed left parked by such an open used to
  // survive indefinitely and resurface in the next composer to mount anywhere in
  // the app — a later header open with no offering context, or the resource
  // playground, which shares AssistantComposer.
  it('does not resurface a question the drawer never showed', async () => {
    setup();

    // Offering entry point, backed out of at the disclosure banner.
    await userEvent.click(screen.getByText('ask-about-offering'));
    await waitFor(() =>
      expect(screen.getByText('Before you begin')).toBeTruthy(),
    );
    expect(screen.queryByPlaceholderText('Ask me anything…')).toBeNull();
    await closeDrawer();

    // Later: the header sparkle, carrying no offering context of its own.
    await userEvent.click(screen.getByText('header-toggle'));
    await acknowledgeDisclosure();

    const composer = await screen.findByPlaceholderText('Ask me anything…');
    expect((composer as HTMLTextAreaElement).value).toBe('');
  });

  it('leaves no seed parked once the drawer has closed', async () => {
    setup();

    await userEvent.click(screen.getByText('ask-about-offering'));
    await waitFor(() =>
      expect(screen.getByText('Before you begin')).toBeTruthy(),
    );
    await closeDrawer();

    expect(consumePendingAssistantSeed()).toBeNull();
  });
});

describe('pending assistant seed store', () => {
  it('hands the parked prompt over exactly once', () => {
    setPendingAssistantSeed('why is the sky blue?');

    expect(consumePendingAssistantSeed()).toBe('why is the sky blue?');
    expect(consumePendingAssistantSeed()).toBeNull();
  });
});
