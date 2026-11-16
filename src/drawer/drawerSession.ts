import { resetChatDrawerPreferences } from '@/chat/chatDrawerPreferences';
import { resetSupportDrawerPreferences } from '@/support/supportDrawerPreferences';

import { DrawerService } from './actions';
import { rememberOpenDrawer } from './drawerRestore';

/**
 * On signing out: close the drawer, docked or not, and forget what a reload
 * would restore -- the open chat drawer, its tab and rooms belong to the
 * account that is leaving, not to whoever signs in next in this tab.
 */
export const forgetDrawerSession = () => {
  DrawerService.close();
  rememberOpenDrawer(undefined);
  resetChatDrawerPreferences();
  resetSupportDrawerPreferences();
};
