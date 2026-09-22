import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { DRAWER_SHELL_CLASS } from '@/drawer/shellClasses';
import { translate } from '@/i18n';

import { SupportDrawerToolbar } from './SupportDrawerToolbar';

const SupportDrawer = lazyComponent(() =>
  import('./SupportDrawer').then((m) => ({ default: m.SupportDrawer })),
);

interface OpenSupportDrawerOptions {
  defaultRoomUuid?: string;
  matrixRoomAlias?: string | null;
  title?: string;
}

type OpenDrawer = ReturnType<typeof useDrawer>['openDrawer'];

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
  openDrawer(SupportDrawer, {
    title: options.title ?? translate('Support'),
    toolbar: SupportDrawerToolbar,
    width: '800px',
    shellClass: DRAWER_SHELL_CLASS.support,
    defaultRoomUuid: options.defaultRoomUuid,
    matrixRoomAlias: options.matrixRoomAlias ?? undefined,
  });
};
