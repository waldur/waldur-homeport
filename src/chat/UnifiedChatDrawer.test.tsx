import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { isAnonymousVisitor } from '@/ai-assistant/utils';
import { useUser } from '@/workspace/hooks';

// `@/workspace/hooks` is globally mocked (test/mocks/workspace.js); override the
// shared mock per-test instead of re-mocking the module (which the
// waldur-custom/no-redundant-vi-mock rule forbids). The drawer branches purely
// on isAnonymousVisitor(user), so that predicate is what each test drives.
vi.mock('@/ai-assistant/utils', () => ({
  isAnonymousVisitor: vi.fn(),
}));
vi.mock('@/matrix/utils', () => ({ isMatrixChatEnabled: () => false }));
vi.mock('@/ai-assistant/anonymous/AnonymousChatPanel', () => ({
  AnonymousChatPanel: () => <div data-testid="anon-panel" />,
}));
vi.mock('@/ai-assistant/components/LLMChatDrawer', () => ({
  LLMChatDrawer: () => <div data-testid="llm-drawer" />,
}));
vi.mock('@/ai-assistant/logic/ThreadProvider', () => ({
  useThreadContext: () => ({
    threadNotifications: new Map(),
    clearNotification: vi.fn(),
    currentThreadId: null,
  }),
}));

import { UnifiedChatDrawer } from './UnifiedChatDrawer';

describe('UnifiedChatDrawer', () => {
  it('renders the anonymous panel for a logged-out visitor in anonymous mode', () => {
    vi.mocked(useUser).mockReturnValue(undefined);
    vi.mocked(isAnonymousVisitor).mockReturnValue(true);

    render(<UnifiedChatDrawer />);

    expect(screen.getByTestId('anon-panel')).toBeTruthy();
    expect(screen.queryByTestId('llm-drawer')).toBeNull();
  });

  it('renders the full assistant — not the anonymous panel — for a logged-in user in anonymous mode', () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'u1' } as any);
    vi.mocked(isAnonymousVisitor).mockReturnValue(false);

    render(<UnifiedChatDrawer />);

    expect(screen.queryByTestId('anon-panel')).toBeNull();
    expect(screen.getByTestId('llm-drawer')).toBeTruthy();
  });

  // The drawer is an app-root singleton; logout clears the user in place
  // (AuthService.clearAuthCache) and re-renders rather than unmounting, so the
  // gate flips on a live mount. This pins the resulting behavior — the logged-in
  // view swaps to the visitor panel. (It can't assert the rules-of-hooks crash
  // the old single-component early-return caused: this vitest setup runs React
  // without the dev hook-count invariant, so that violation never threw here —
  // which is why it slipped past the suite. Safety is structural: the wrapper
  // swaps child components, so neither has a conditional hook list.)
  it('swaps to the visitor panel when the user is cleared in place (logout) with the drawer open', () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'u1' } as any);
    vi.mocked(isAnonymousVisitor).mockReturnValue(false);
    const { rerender } = render(<UnifiedChatDrawer />);
    expect(screen.getByTestId('llm-drawer')).toBeTruthy();

    vi.mocked(useUser).mockReturnValue(undefined);
    vi.mocked(isAnonymousVisitor).mockReturnValue(true);
    rerender(<UnifiedChatDrawer />);

    expect(screen.queryByTestId('llm-drawer')).toBeNull();
    expect(screen.getByTestId('anon-panel')).toBeTruthy();
  });
});
