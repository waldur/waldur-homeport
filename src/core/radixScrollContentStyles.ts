import { CSSProperties } from 'react';

/**
 * Radix flips/shifts tall panels but does not shrink them, so long menus run
 * off-screen unless the Content node scrolls. Radix sets these CSS variables to
 * the space between the trigger and the viewport edge — see ActionsDropdown,
 * NavMenu, and packages/ui DropdownMenu.
 */
export const radixDropdownMenuScrollContentStyle: CSSProperties = {
  maxHeight: 'var(--radix-dropdown-menu-content-available-height)',
  overflowY: 'auto',
};

export const radixPopoverScrollContentStyle: CSSProperties = {
  maxHeight: 'var(--radix-popover-content-available-height)',
  overflowY: 'auto',
};
