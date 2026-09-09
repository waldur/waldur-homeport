import { FC } from 'react';

import { LLMChatDrawerToggle } from '@/navigation/header/LLMChatDrawerToggle';
import { ThemeSwitcherButton } from '@/theme/ThemeSwitcher';

/**
 * Right-hand pair of the sign-in strip. Grouped so the strip still has two ends
 * under `justify-content: space-between` — a third loose child would push the
 * language picker into the middle of the screen.
 */
export const AuthHeaderControls: FC = () => (
  <div className="d-flex align-items-center gap-2">
    <LLMChatDrawerToggle />
    <ThemeSwitcherButton />
  </div>
);
