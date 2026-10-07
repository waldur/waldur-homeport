import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

import { SwitchVisual } from '../Check';
import { cn } from '../cn';

import { useMenuItemClassName } from './MenuItem';

/**
 * A row that turns a setting on or off (the dark theme): Radix gives it
 * role="menuitemcheckbox" and aria-checked, and it shows a switch, as the
 * app's settings toggles do. Choosing it keeps the menu open, so the change
 * can be seen, unless `onSelect` says otherwise.
 *
 * `indicator` replaces the switch; `null` shows none.
 */
export const MenuCheckboxItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem> & {
    checked: boolean;
    indicator?: ReactNode;
  }
>(
  (
    {
      className,
      checked,
      indicator = <SwitchVisual checked={checked} />,
      children,
      onSelect = (event) => event.preventDefault(),
      ...props
    },
    ref,
  ) => {
    const rowClassName = useMenuItemClassName();
    return (
      <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        checked={checked}
        onSelect={onSelect}
        className={cn(rowClassName, 'gap-[7.15px]', className)}
        {...props}
      >
        {indicator}
        {children}
      </DropdownMenuPrimitive.CheckboxItem>
    );
  },
);
MenuCheckboxItem.displayName = 'Menu.CheckboxItem';
