import { act, render, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { openSupportDrawer } from '@/support/openSupportDrawer';
import { useUser } from '@/workspace/hooks';

import { useDrawer } from './actions';
import { DrawerProvider } from './DrawerContext';
import { readOpenDrawer } from './drawerRestore';
import { forgetDrawerSession } from './drawerSession';
import { RestoreOpenDrawer } from './RestoreOpenDrawer';
import { DRAWER_SHELL_CLASS } from './shellClasses';

vi.mock('@/support/openSupportDrawer', () => ({ openSupportDrawer: vi.fn() }));
vi.mock('@/chat/openUnifiedChatDrawer', () => ({
  openUnifiedChatDrawer: vi.fn(),
}));

const Body = () => null;

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('the open chat drawer across a reload', () => {
  it('is remembered while a chat drawer is open, and forgotten as it closes', () => {
    const { result } = renderHook(() => useDrawer(), {
      wrapper: DrawerProvider,
    });

    act(() =>
      result.current.openDrawer(Body, {
        shellClass: DRAWER_SHELL_CLASS.support,
      }),
    );
    expect(readOpenDrawer()).toBe(DRAWER_SHELL_CLASS.support);

    act(() => result.current.closeDrawer());
    expect(readOpenDrawer()).toBeUndefined();
  });

  it('is not remembered for a form drawer, which cannot be restored', () => {
    const { result } = renderHook(() => useDrawer(), {
      wrapper: DrawerProvider,
    });
    act(() =>
      result.current.openDrawer(Body, {
        shellClass: DRAWER_SHELL_CLASS.support,
      }),
    );
    act(() => result.current.openDrawer(Body, { title: 'Edit' }));

    expect(readOpenDrawer()).toBeUndefined();
  });

  it("survives the first page's navigation closing a drawer that is not open", () => {
    sessionStorage.setItem(
      'waldur/open-drawer',
      JSON.stringify(DRAWER_SHELL_CLASS.support),
    );
    const { result } = renderHook(() => useDrawer(), {
      wrapper: DrawerProvider,
    });

    act(() => result.current.closeDrawer());

    expect(readOpenDrawer()).toBe(DRAWER_SHELL_CLASS.support);
  });

  it('opens again once the user is known', () => {
    sessionStorage.setItem(
      'waldur/open-drawer',
      JSON.stringify(DRAWER_SHELL_CLASS.support),
    );
    vi.mocked(useUser).mockReturnValue(undefined as any);
    const { rerender } = render(
      <DrawerProvider>
        <RestoreOpenDrawer />
      </DrawerProvider>,
    );
    expect(openSupportDrawer).not.toHaveBeenCalled();

    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    rerender(
      <DrawerProvider>
        <RestoreOpenDrawer />
      </DrawerProvider>,
    );
    expect(openSupportDrawer).toHaveBeenCalledTimes(1);
    expect(openUnifiedChatDrawer).not.toHaveBeenCalled();
  });

  it('opens nothing when no chat drawer was open', () => {
    vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
    render(
      <DrawerProvider>
        <RestoreOpenDrawer />
      </DrawerProvider>,
    );
    expect(openSupportDrawer).not.toHaveBeenCalled();
    expect(openUnifiedChatDrawer).not.toHaveBeenCalled();
  });

  it('is forgotten, with the chat tab and rooms, on signing out', () => {
    sessionStorage.setItem(
      'waldur/open-drawer',
      JSON.stringify(DRAWER_SHELL_CLASS.support),
    );
    sessionStorage.setItem(
      'waldur/support-drawer-tab',
      JSON.stringify('discussions'),
    );
    sessionStorage.setItem(
      'waldur/chat-drawer-preferences',
      JSON.stringify({ lastDiscussionRoomUuid: 'room-1' }),
    );

    forgetDrawerSession();

    expect(readOpenDrawer()).toBeUndefined();
    expect(sessionStorage.getItem('waldur/support-drawer-tab')).toBeNull();
    expect(sessionStorage.getItem('waldur/chat-drawer-preferences')).toBeNull();
  });
});
