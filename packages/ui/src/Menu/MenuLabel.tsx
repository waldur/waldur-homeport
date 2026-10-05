import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva } from 'class-variance-authority';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { cn } from '../cn';

import { MenuLook, useMenuLook } from './menuContext';

/** A section caption: Metronic's `.menu-section` (nav) or Bootstrap's
 * `.dropdown-header` (actions). */
export const menuLabel = cva('', {
  variants: {
    look: {
      // gray-500, 11px, weight 600, uppercase.
      nav: 'px-[16px] pt-[10px] pb-[6.5px] text-[11.05px] leading-[1.432] font-semibold uppercase text-[var(--menu-item-muted-text)]',
      // gray-600, 12px.
      actions:
        'm-0 block whitespace-nowrap px-[16px] py-[6.5px] text-[12.025px] text-[var(--menu-item-text)]',
    },
  },
  defaultVariants: { look: 'actions' },
});

export type MenuLabelProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Label
> & {
  look?: MenuLook;
};

export const MenuLabel = forwardRef<HTMLDivElement, MenuLabelProps>(
  ({ className, look, ...props }, ref) => {
    const panelLook = useMenuLook();
    return (
      <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn(menuLabel({ look: look ?? panelLook }), className)}
        {...props}
      />
    );
  },
);
MenuLabel.displayName = 'Menu.Label';
