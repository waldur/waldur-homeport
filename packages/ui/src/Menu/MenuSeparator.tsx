import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva } from 'class-variance-authority';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { cn } from '../cn';

import { MenuLook, useMenuLook } from './menuContext';

/** A divider: Metronic's `.separator.my-2` (nav) or Bootstrap's
 * `.dropdown-divider` with zero margin (actions). */
export const menuSeparator = cva('', {
  variants: {
    look: {
      // A gray-200 rule with 6.5px above and below.
      nav: 'my-[6.5px] h-0 border-b border-[var(--surface-card-border)]',
      actions:
        'm-0 h-0 overflow-hidden border-t border-[var(--surface-card-border)]',
    },
  },
  defaultVariants: { look: 'actions' },
});

export type MenuSeparatorProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
> & {
  look?: MenuLook;
};

/** Radix marks it aria-hidden, so keyboard navigation skips it. */
export const MenuSeparator = forwardRef<HTMLDivElement, MenuSeparatorProps>(
  ({ className, look, ...props }, ref) => {
    const panelLook = useMenuLook();
    return (
      <DropdownMenuPrimitive.Separator
        ref={ref}
        className={cn(menuSeparator({ look: look ?? panelLook }), className)}
        {...props}
      />
    );
  },
);
MenuSeparator.displayName = 'Menu.Separator';
