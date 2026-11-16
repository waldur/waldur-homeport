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
import { useImpersonatorUser, useUser } from '@/workspace/hooks';

const state: {
  workspace: { user?: { uuid: string }; impersonatorUser?: { uuid: string } };
} = {
  workspace: { user: { uuid: 'user-1' } },
};

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
    vi.mocked(client.chatSuggestionsRetrieve).mockClear();
    state.workspace = { user: { uuid: 'user-1' } };
    vi.mocked(useUser).mockImplementation(() => state.workspace.user as any);
    vi.mocked(useImpersonatorUser).mockImplementation(
      () => state.workspace.impersonatorUser as any,
    );
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
    expect(
      screen
        .getByRole('button', { name: 'More suggestions' })
        .getAttribute('aria-expanded'),
    ).toBe('true');

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
    // The space is added in code, so a translation cannot drop it.
    expect(getSuggestionCopy(['search_docs'])[0].prompt).toBe('How do I ');
  });

  it('asks again when staff start impersonating someone', async () => {
    respond(['look_up_user']);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const view = render(
      <QueryClientProvider client={queryClient}>
        <ThreadSuggestions />
      </QueryClientProvider>,
    );
    await screen.findByText('Look up a user');

    state.workspace = {
      user: { uuid: 'user-2' },
      impersonatorUser: { uuid: 'user-1' },
    };
    respond(['create_vm']);
    view.rerender(
      <QueryClientProvider client={queryClient}>
        <ThreadSuggestions />
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Create VM')).toBeTruthy();
    expect(screen.queryByText('Look up a user')).toBeNull();
    expect(client.chatSuggestionsRetrieve).toHaveBeenCalledTimes(2);
  });

  it('collapses again with Less', async () => {
    respond([
      'resource_paused',
      'review_workload',
      'pending_orders',
      'check_credit',
      'my_resources',
      'create_vm',
    ]);
    renderSuggestions();
    await screen.findByText('Why is my resource paused?');

    await userEvent.click(
      screen.getByRole('button', { name: 'More suggestions' }),
    );
    expect(screen.getByText('Create VM')).toBeTruthy();
    await userEvent.click(
      screen.getByRole('button', { name: 'More suggestions' }),
    );
    expect(screen.queryByText('Create VM')).toBeNull();
  });

  it('shows no More for exactly five', async () => {
    respond([
      'resource_paused',
      'review_workload',
      'pending_orders',
      'check_credit',
      'my_resources',
    ]);
    renderSuggestions();

    await screen.findByText('My resources');
    expect(screen.queryByText('More')).toBeNull();
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
