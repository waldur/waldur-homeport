import { FC } from 'react';

import { LLMChatDrawerToggle } from '@/navigation/header/LLMChatDrawerToggle';
import { ThemeSwitcherButton } from '@/theme/ThemeSwitcher';

/**
 * Right-hand pair of the sign-in strip. Grouped so the strip still has two ends
 * under `justify-content: space-between` — a third loose child would push the
 * language picker into the middle of the screen.
 *
 * `data-slot="auth-header-controls"` also tells the AI drawer it is on a page without the
 * app header (see the sign-in offsets in DrawerRoot.tsx).
 */
export const AuthHeaderControls: FC = () => (
  <div data-slot="auth-header-controls" className="flex items-center gap-1.5">
    <LLMChatDrawerToggle />
    <ThemeSwitcherButton />
  </div>
);
