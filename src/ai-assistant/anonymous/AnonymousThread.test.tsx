import {
  AssistantRuntimeProvider,
  ThreadMessageLike,
  useExternalStoreRuntime,
} from '@assistant-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { FC } from 'react';
import { beforeAll, describe, it, expect, vi } from 'vitest';

import { convertMessage } from '@/ai-assistant/lib/messages/messageUtils';
import { ENV } from '@/core/config';

import { AnonymousChatPanel } from './AnonymousChatPanel';
import { AnonymousThread } from './AnonymousThread';
import { AnonymousThreadProvider } from './AnonymousThreadProvider';

const queryClient = new QueryClient();

// Drives AnonymousThread against a pre-seeded external store so a message can be
// placed in a terminal error state without running the async stream pipeline.
// The QueryClientProvider lets the real feedback buttons (useManagedMutation ->
// useQueryClient) mount when a message carries feedback attribution.
const SeededThread: FC<{
  messages: ThreadMessageLike[];
  isRunning?: boolean;
}> = ({ messages, isRunning = false }) => {
  const runtime = useExternalStoreRuntime({
    isRunning,
    messages,
    convertMessage,
    onNew: async () => {},
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AssistantRuntimeProvider runtime={runtime}>
        <AnonymousThread />
      </AssistantRuntimeProvider>
    </QueryClientProvider>
  );
};

// `@/core/config` is globally mocked (test/mocks/config.js); mutate the shared
// ENV so the test controls the assistant name instead of re-mocking the module
// (which the waldur-custom/no-redundant-vi-mock rule forbids).
ENV.plugins.WALDUR_CORE.AI_ASSISTANT_NAME = 'HPC Helper';

beforeAll(() => {
  // assistant-ui's Viewport observes its content size; jsdom has no
  // ResizeObserver, so stub it like the Matrix list tests do.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('AnonymousChatPanel', () => {
  it('shows a welcome naming the assistant', () => {
    render(
      <AnonymousThreadProvider>
        <AnonymousChatPanel />
      </AnonymousThreadProvider>,
    );
    expect(screen.getByText(/HPC Helper/)).toBeTruthy();
  });

  it('shows the AI-disclaimer reminder on the empty welcome state', () => {
    render(
      <AnonymousThreadProvider>
        <AnonymousChatPanel />
      </AnonymousThreadProvider>,
    );
    expect(screen.getByText('Reminder')).toBeTruthy();
  });

  it('renders the prompt-injection warning when the backend flags one', () => {
    render(
      <SeededThread
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'hi' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                blocks: [
                  { id: 'b1', key: 'markdown', content: 'Here you go.' },
                ],
                warning:
                  'Your message appears to contain a prompt injection attempt.',
              },
            },
          },
        ]}
      />,
    );
    expect(screen.getByText('Sensitive information detected')).toBeTruthy();
    expect(screen.getByText(/prompt injection attempt/)).toBeTruthy();
  });

  it('shows the AI-disclaimer sub-text under the composer once a conversation starts', () => {
    render(
      <SeededThread
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'hi' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                blocks: [{ id: 'b1', key: 'markdown', content: 'Hello.' }],
              },
            },
          },
        ]}
      />,
    );
    expect(
      screen.getByText(
        'AI may produce inaccurate responses. Do not share sensitive credentials.',
      ),
    ).toBeTruthy();
  });

  it('does not show loading dots on an earlier errored message while a newer turn is running', () => {
    render(
      <SeededThread
        isRunning
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'a' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            status: {
              type: 'incomplete',
              reason: 'error',
              error:
                'This session has expired. Please start a new conversation.',
            },
          },
          {
            id: 'a2',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                blocks: [
                  { id: 'b1', key: 'markdown', content: 'Here you go.' },
                ],
              },
            },
          },
        ]}
      />,
    );
    expect(screen.getByText(/session has expired/)).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('does not show loading dots on a warning-only message while a newer turn is running', () => {
    render(
      <SeededThread
        isRunning
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'a' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                warning:
                  'Personal information detected and redacted (Estonian ID code).',
              },
            },
          },
          {
            id: 'a2',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                blocks: [
                  { id: 'b1', key: 'markdown', content: 'Here you go.' },
                ],
              },
            },
          },
        ]}
      />,
    );
    expect(screen.getByText('Sensitive information detected')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('surfaces the error when an assistant message fails (e.g. rate limit)', () => {
    render(
      <SeededThread
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'GPU' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            status: {
              type: 'incomplete',
              reason: 'error',
              error: 'Monthly token limit reached. Try again next month.',
            },
          },
        ]}
      />,
    );
    expect(screen.getByText(/Monthly token limit reached/)).toBeTruthy();
  });

  it('offers copy + feedback on a finished, attributed reply', () => {
    render(
      <SeededThread
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'GPU' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                blocks: [
                  { id: 'b1', key: 'markdown', content: 'Here you go.' },
                ],
                interactionUuid: 'i1',
                feedbackToken: 't1',
              },
            },
          },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Helpful' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Not helpful' })).toBeTruthy();
    // composer Send + copy + thumbs-up + thumbs-down; the extra (nameless)
    // action button over the feedback pair is the copy control.
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('offers copy even when the reply has no feedback attribution', () => {
    render(
      <SeededThread
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'GPU' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                blocks: [{ id: 'b1', key: 'markdown', content: 'Hi.' }],
              },
            },
          },
        ]}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Helpful' })).toBeNull();
    // composer Send + copy — copy renders even without feedback attribution.
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('offers feedback (but not copy) on an attributed reply that produced no blocks', () => {
    // A guardrail refusal / warning-only turn carries attribution but no
    // renderable blocks — feedback must still be reachable to rate it.
    render(
      <SeededThread
        messages={[
          { id: 'u1', role: 'user', content: [{ type: 'text', text: 'GPU' }] },
          {
            id: 'a1',
            role: 'assistant',
            content: [{ type: 'text', text: '' }],
            metadata: {
              custom: {
                warning: 'That request was blocked.',
                interactionUuid: 'i1',
                feedbackToken: 't1',
              },
            },
          },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Helpful' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Not helpful' })).toBeTruthy();
    // composer Send + thumbs-up + thumbs-down — no copy without content.
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
