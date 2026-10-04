import { FC } from 'react';

import { LLMChatDrawerToggle } from '@/navigation/header/LLMChatDrawerToggle';
import { ThemeSwitcherButton } from '@/theme/ThemeSwitcher';

/**
 * Right-hand pair of the sign-in strip. Grouped so the strip still has two ends
 * under `justify-content: space-between` — a third loose child would push the
 * language picker into the middle of the screen.
 *
 * `auth-header-controls` also tells the AI drawer it is on a page without the
 * app header (see drawer/_shell.scss).
 */
export const AuthHeaderControls: FC = () => (
  <div className="auth-header-controls d-flex align-items-center gap-2">
    <LLMChatDrawerToggle />
    <ThemeSwitcherButton />
  </div>
);
