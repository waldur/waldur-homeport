import { setChatDrawerPreference } from '@/chat/chatDrawerPreferences';
import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
import { translate } from '@/i18n';

import { setSupportTab } from './supportDrawerPreferences';
import { SupportDrawerToolbar } from './SupportDrawerToolbar';

const SupportDrawer = lazyComponent(() =>
  import('./SupportDrawer').then((m) => ({ default: m.SupportDrawer })),
);

interface OpenSupportDrawerOptions {
  defaultRoomUuid?: string;
  matrixRoomAlias?: string | null;
  title?: string;
  /** Team chat's room list, rather than the last tab and room. */
  roomList?: boolean;
}

type OpenDrawer = ReturnType<typeof useDrawer>['openDrawer'];

// A new value on every request, so it also reaches a drawer already open,
// even one that already showed this room.
let roomListRequests = 0;
let roomRequests = 0;

/**
 * Single entry point for opening the support drawer. The shell class and
 * toolbar go in with the open, not from the panel's lifecycle, otherwise the
 * slide-in runs before the styles are in place. The class gives the rounded
 * full-height card and hides the page overlay, while keeping the drawer header
 * (title + toolbar) visible.
 */
export const openSupportDrawer = (
  openDrawer: OpenDrawer,
  options: OpenSupportDrawerOptions = {},
) => {
  if (options.roomList) {
    setSupportTab('chat');
    setChatDrawerPreference('matrixCompactView', 'list');
    roomListRequests += 1;
  }
  const asksForRoom = Boolean(
    options.defaultRoomUuid || options.matrixRoomAlias,
  );
  if (asksForRoom) roomRequests += 1;
  openDrawer(SupportDrawer, {
    title: options.title ?? translate('Support'),
    toolbar: SupportDrawerToolbar,
    width: '800px',
    shellClass: DRAWER_SHELL_CLASS.support,
    defaultRoomUuid: options.defaultRoomUuid,
    matrixRoomAlias: options.matrixRoomAlias ?? undefined,
    roomListRequest: options.roomList ? roomListRequests : undefined,
    roomRequest: asksForRoom ? roomRequests : undefined,
  });
};
