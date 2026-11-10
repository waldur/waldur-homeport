import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getChatDrawerPreference,
  resetChatDrawerPreferences,
  setChatDrawerPreference,
} from '@/chat/chatDrawerPreferences';

import { openSupportDrawer } from './openSupportDrawer';
import {
  resetSupportDrawerPreferences,
  setSupportTab,
  useSupportTab,
} from './supportDrawerPreferences';

describe('openSupportDrawer', () => {
  beforeEach(() => {
    resetChatDrawerPreferences();
    resetSupportDrawerPreferences();
  });

  it('opens on the Team chat room list when asked to', () => {
    setSupportTab('helpdesk');
    setChatDrawerPreference('matrixCompactView', 'detail');
    const openDrawer = vi.fn();

    openSupportDrawer(openDrawer, { roomList: true });

    expect(openDrawer).toHaveBeenCalledTimes(1);
    expect(getChatDrawerPreference('matrixCompactView')).toBe('list');
    expect(renderHook(() => useSupportTab()).result.current).toBe('chat');
  });

  // The preferences reach only a drawer that opens now, not one already open.
  it('asks an open drawer for the room list on every call', () => {
    const openDrawer = vi.fn();

    openSupportDrawer(openDrawer, { roomList: true });
    openSupportDrawer(openDrawer, { roomList: true });
    openSupportDrawer(openDrawer);

    const requests = openDrawer.mock.calls.map(
      ([, props]) => props.roomListRequest,
    );
    expect(requests[0]).toEqual(expect.any(Number));
    expect(requests[1]).not.toBe(requests[0]);
    expect(requests[2]).toBeUndefined();
  });

  // A toast's "Open chat" for the room the drawer already opened once.
  it('asks an open drawer for the room on every call', () => {
    const openDrawer = vi.fn();

    openSupportDrawer(openDrawer, { defaultRoomUuid: 'room-1' });
    openSupportDrawer(openDrawer, { defaultRoomUuid: 'room-1' });
    openSupportDrawer(openDrawer);

    const requests = openDrawer.mock.calls.map(
      ([, props]) => props.roomRequest,
    );
    expect(requests[0]).toEqual(expect.any(Number));
    expect(requests[1]).not.toBe(requests[0]);
    expect(requests[2]).toBeUndefined();
  });

  it('keeps the last tab and view otherwise', () => {
    setSupportTab('helpdesk');
    setChatDrawerPreference('matrixCompactView', 'detail');

    openSupportDrawer(vi.fn());

    expect(getChatDrawerPreference('matrixCompactView')).toBe('detail');
    expect(renderHook(() => useSupportTab()).result.current).toBe('helpdesk');
  });
});
