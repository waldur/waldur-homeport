import { FC, useEffect, useRef } from 'react';

import { openUnifiedChatDrawer } from '@/chat/openUnifiedChatDrawer';
import { openSupportDrawer } from '@/support/openSupportDrawer';
import { useUser } from '@/workspace/hooks';

import { useDrawer } from './actions';
import { readOpenDrawer } from './drawerRestore';
import { DRAWER_SHELL_CLASS } from './shellClasses';

/**
 * Opens again, once the user is known, the chat drawer that was open when
 * the tab reloaded -- on the tab and room it showed, which its preferences
 * keep, docked or floating as the user chose.
 */
export const RestoreOpenDrawer: FC = () => {
  const user = useUser();
  const { openDrawer, isOpen } = useDrawer();
  const doneRef = useRef(false);
  useEffect(() => {
    if (doneRef.current || !user) return;
    doneRef.current = true;
    if (isOpen) return;
    const shellClass = readOpenDrawer();
    if (shellClass === DRAWER_SHELL_CLASS.support) {
      openSupportDrawer(openDrawer);
    } else if (shellClass === DRAWER_SHELL_CLASS.ai) {
      openUnifiedChatDrawer(openDrawer);
    }
  }, [user, isOpen, openDrawer]);
  return null;
};
