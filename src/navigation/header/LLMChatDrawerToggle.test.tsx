import { render, screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { isAnonymousVisitor, isAssistantEnabled } from '@/ai-assistant/utils';
import { useUser } from '@/workspace/hooks';

vi.mock('@/ai-assistant/utils', () => ({
  isAssistantEnabled: vi.fn(),
  isAnonymousVisitor: vi.fn(),
}));
vi.mock('@/ai-assistant/components/LLMChatDrawer', () => ({
  resetDrawerDOM: vi.fn(),
  LLMChatDrawerToolbar: () => null,
}));
vi.mock('@/navigation/useTabs', () => ({ isDescendantOf: () => false }));
vi.mock('@/drawer/actions', () => ({
  useDrawer: () => ({ openDrawer: vi.fn(), closeDrawer: vi.fn() }),
}));
vi.mock('@/ai-assistant/anonymous/AnonymousThreadProvider', () => ({
  useAnonymousThreadContext: () => ({
    messages: anonymousMessages,
    isRunning: false,
  }),
}));
vi.mock('@/ai-assistant/logic/ThreadProvider', () => ({
  useThreadContext: () => ({
    threads: authenticatedThreads,
    currentThreadId: 't1',
    hasNewMessages,
    clearNotification: vi.fn(),
  }),
}));

let hasNewMessages = false;
let anonymousMessages: unknown[] = [];
let authenticatedThreads = new Map<string, unknown[]>();

// `@uirouter/react` is mocked globally (test/mocks/router.js); drive the current
// state through that shared mock rather than re-mocking the module.
const setState = (name: string) =>
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name },
    params: {},
  } as any);

import { LLMChatDrawerToggle } from './LLMChatDrawerToggle';

describe('LLMChatDrawerToggle', () => {
  beforeEach(() => {
    setState('public.offerings');
    hasNewMessages = false;
    anonymousMessages = [];
    authenticatedThreads = new Map([['t1', []]]);
    vi.mocked(useUser).mockReturnValue({ uuid: 'u1' } as any);
    vi.mocked(isAssistantEnabled).mockReturnValue(true);
    vi.mocked(isAnonymousVisitor).mockReturnValue(false);
  });

  it('renders nothing when the assistant is not enabled', () => {
    vi.mocked(isAssistantEnabled).mockReturnValue(false);

    render(<LLMChatDrawerToggle />);

    expect(screen.queryByTestId('llm-chat-drawer-toggle')).toBeNull();
  });

  it('stays out of the way on the login screen', () => {
    setState('login');

    render(<LLMChatDrawerToggle />);

    expect(screen.queryByTestId('llm-chat-drawer-toggle')).toBeNull();
  });

  it('spells itself out for a visitor, who may not know it is there', () => {
    vi.mocked(useUser).mockReturnValue(undefined);
    vi.mocked(isAnonymousVisitor).mockReturnValue(true);

    render(<LLMChatDrawerToggle />);

    expect(screen.getByTestId('llm-chat-drawer-toggle').textContent).toContain(
      'Ask the AI assistant',
    );
  });

  it('stays an icon with a hover label for a signed-in user', () => {
    render(<LLMChatDrawerToggle />);

    const toggle = screen.getByTestId('llm-chat-drawer-toggle');
    expect(toggle.dataset.state).toBe('closed');
    expect(toggle.textContent).toBe('');
    expect(toggle.getAttribute('aria-label')).toBe('Ask the AI assistant');
  });

  it('marks a parked conversation quietly, and a new reply loudly', () => {
    authenticatedThreads = new Map([['t1', [{ role: 'user' }]]]);

    const { rerender } = render(<LLMChatDrawerToggle />);

    const quiet = screen.getByTestId('llm-chat-drawer-toggle');
    expect(quiet.dataset.state).toBe('minimized');
    expect(quiet.getAttribute('aria-label')).toBe('Continue conversation');

    hasNewMessages = true;
    rerender(<LLMChatDrawerToggle />);

    expect(screen.getByTestId('llm-chat-drawer-toggle').dataset.state).toBe(
      'unread',
    );
  });
});
