import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { cn } from '../cn';

import { useMenuItemClassName } from './MenuItem';

/** A row for picking one value from a Menu.RadioGroup. Radix gives it
 * role="menuitemradio" and aria-checked; it has no check mark, so style the
 * checked row with data-[state=checked] where needed. */
export const MenuRadioItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, ...props }, ref) => {
  const rowClassName = useMenuItemClassName();
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      className={cn(rowClassName, className)}
      {...props}
    />
  );
});
MenuRadioItem.displayName = 'Menu.RadioItem';
