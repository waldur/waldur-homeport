import { FunctionComponent } from 'react';

import { QuickShortcutsMenu } from 'waldur-shell';
import { useSidebar } from 'waldur-ui';

import { useQuickShortcuts } from '@/navigation/useQuickShortcuts';

/**
 * The quick shortcuts menu where the sidebar is a drawer: its brand row,
 * which holds the menu on wider screens, is not rendered there (Sidebar.tsx).
 */
export const MobileQuickShortcuts: FunctionComponent = () => {
  const { isMobile } = useSidebar();
  const { apps, links } = useQuickShortcuts();
  if (!isMobile) return null;
  return (
    <QuickShortcutsMenu apps={apps} links={links}>
      {(trigger) => trigger}
    </QuickShortcutsMenu>
  );
};
