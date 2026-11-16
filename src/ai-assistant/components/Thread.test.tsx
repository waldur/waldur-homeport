import { ThreadPrimitive } from '@assistant-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as client from 'waldur-js-client';

import { getSuggestionCopy } from '@/ai-assistant/components/suggestionCopy';
import {
  ThreadSuggestions,
  VISIBLE_SUGGESTIONS,
} from '@/ai-assistant/components/Thread';

vi.mock('@assistant-ui/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@assistant-ui/react')>()),
  ThreadPrimitive: {
    Suggestion: vi.fn(({ children }: { children: ReactNode }) => children),
  },
}));

const respond = (ids: string[]) =>
  vi.mocked(client.chatSuggestionsRetrieve).mockResolvedValue({
    data: { suggestions: ids.map((id) => ({ id })) },
  } as any);

const renderSuggestions = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ThreadSuggestions />
    </QueryClientProvider>,
  );

describe('getSuggestionCopy', () => {
  it('keeps the backend order and skips ids this build does not know', () => {
    const copy = getSuggestionCopy([
      'create_vm',
      'brand_new_id',
      'search_docs',
    ]);
    expect(copy.map((item) => item.label)).toEqual([
      'Create VM',
      'Search docs',
    ]);
  });

  it('lets a template prompt fill the composer instead of sending', () => {
    const [docs, vm] = getSuggestionCopy(['search_docs', 'create_vm']);
    expect(docs.send).toBe(false);
    expect(vm.send).toBe(true);
  });
});

describe('ThreadSuggestions', () => {
  beforeEach(() => {
    vi.mocked(ThreadPrimitive.Suggestion).mockClear();
  });

  it('shows the offered prompts and no More when they all fit', async () => {
    respond(['create_vm', 'search_docs']);
    renderSuggestions();

    expect(await screen.findByText('Create VM')).toBeTruthy();
    expect(screen.getByText('Search docs')).toBeTruthy();
    expect(screen.queryByText('More')).toBeNull();
  });

  it('expands the rest in place without sending anything', async () => {
    const ids = [
      'resource_paused',
      'review_workload',
      'pending_orders',
      'check_credit',
      'my_resources',
      'analyze_usage',
      'create_vm',
    ];
    respond(ids);
    renderSuggestions();

    expect(await screen.findByText('Why is my resource paused?')).toBeTruthy();
    expect(screen.queryByText('Create VM')).toBeNull();
    // Five suggestions; More is a plain button, not a suggestion that sends.
    expect(vi.mocked(ThreadPrimitive.Suggestion)).toHaveBeenCalledTimes(5);
    const calls = vi.mocked(client.chatSuggestionsRetrieve).mock.calls.length;

    await userEvent.click(screen.getByText('More'));

    expect(screen.getByText('Create VM')).toBeTruthy();
    expect(screen.getByText('Less')).toBeTruthy();
    // More is not a suggestion: it neither sends a prompt nor refetches.
    expect(vi.mocked(client.chatSuggestionsRetrieve).mock.calls.length).toBe(
      calls,
    );
    expect(VISIBLE_SUGGESTIONS).toBe(5);
  });

  it('passes send=false for a template prompt', async () => {
    respond(['find_service']);
    renderSuggestions();

    await screen.findByText('Find a service');
    const props = vi.mocked(ThreadPrimitive.Suggestion).mock.calls[0][0];
    expect(props).toMatchObject({
      prompt: 'Help me find a service for ',
      send: false,
    });
  });

  it('shows nothing when the request fails', async () => {
    vi.mocked(client.chatSuggestionsRetrieve).mockRejectedValue(new Error('x'));
    const { container } = renderSuggestions();

    await waitFor(() =>
      expect(client.chatSuggestionsRetrieve).toHaveBeenCalled(),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    // No fallback to a fixed list of prompts that may lead nowhere.
    expect(container.innerHTML).toBe('');
    expect(screen.queryByText('Create VM')).toBeNull();
  });
});
