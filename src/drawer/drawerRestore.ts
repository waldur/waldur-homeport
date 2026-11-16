import {
  readSessionPreference,
  writeSessionPreference,
} from '@/core/sessionPreference';

import { DRAWER_SHELL_CLASS, DrawerShellClass } from './shellClasses';

/**
 * Which chat drawer is open, so that a reload of the tab opens it again
 * (RestoreOpenDrawer): the chats only, whose state lives outside them (their
 * tab and room, the Matrix client). A form drawer is not reopened -- what was
 * typed into it is gone.
 */
const STORAGE_KEY = 'waldur/open-drawer';

const RESTORABLE: DrawerShellClass[] = [
  DRAWER_SHELL_CLASS.support,
  DRAWER_SHELL_CLASS.ai,
];

/** Called as a drawer opens (its shell class) or closes (undefined). */
export const rememberOpenDrawer = (shellClass: string | undefined) =>
  writeSessionPreference(
    STORAGE_KEY,
    shellClass && RESTORABLE.includes(shellClass as DrawerShellClass)
      ? shellClass
      : null,
  );

export const readOpenDrawer = (): DrawerShellClass | undefined => {
  const shellClass = readSessionPreference<string>(STORAGE_KEY);
  return RESTORABLE.includes(shellClass as DrawerShellClass)
    ? (shellClass as DrawerShellClass)
    : undefined;
};
