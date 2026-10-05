import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

import { cn } from '../cn';

import { MENU_PANEL_SCROLL_CLASSNAME, menuSurface } from './MenuContent';
import { MenuLookProvider, MenuRowOptions, useMenuLook } from './menuContext';
import { menuRowDataAttributes, useMenuItemClassName } from './MenuItem';

export const MenuSub = DropdownMenuPrimitive.Sub;

/** A row that opens a submenu, on hover or click. */
export const MenuSubTrigger = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger>
>(({ className, ...props }, ref) => {
  const rowClassName = useMenuItemClassName();
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(rowClassName, className)}
      {...props}
    />
  );
});
MenuSubTrigger.displayName = 'Menu.SubTrigger';

/** A submenu panel: the parent panel's look, with its row options on top
 * of the parent's. */
export const MenuSubContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent> &
    MenuRowOptions
>(({ className, density, tone, ...props }, ref) => {
  const look = useMenuLook();
  return (
    <MenuLookProvider kind="menu">
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.SubContent
          ref={ref}
          {...menuRowDataAttributes({ density, tone })}
          className={cn(
            'group/menu',
            menuSurface({ look }),
            look === 'actions' && MENU_PANEL_SCROLL_CLASSNAME,
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Portal>
    </MenuLookProvider>
  );
});
MenuSubContent.displayName = 'Menu.SubContent';
