import * as PopoverPrimitive from '@radix-ui/react-popover';
import { ComponentPropsWithoutRef, forwardRef, ReactNode } from 'react';

import { cn } from '../cn';

import { menuSurface } from './MenuContent';
import { MenuLook, MenuLookProvider, MenuRowOptions } from './menuContext';
import { menuRowDataAttributes, useMenuItemClassName } from './MenuItem';

/**
 * The menu surface on a Radix Popover, for panels of menu-styled rows that
 * also hold form controls (table filters, the role picker): a DropdownMenu's roving focus and typeahead would steal
 * keystrokes from a focused input. Not height-capped, so a select has room
 * for its option list.
 *
 * `forceMount` keeps the panel mounted (and hidden) while closed;
 * `container` picks where it is portaled.
 */
const MenuPopoverRoot = ({
  modal = false,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>) => (
  <PopoverPrimitive.Root modal={modal} {...props} />
);

const MenuPopoverContent = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> &
    MenuRowOptions & {
      /** The look of the rows inside. A nav popover holds filter and
       * picker rows, so its rows default to the base density in the strong
       * tone. A panel with no menu rows is a plain Popover instead. */
      look?: MenuLook;
      container?: HTMLElement;
      children?: ReactNode;
    }
>(
  (
    {
      look = 'nav',
      density = look === 'nav' ? 'base' : undefined,
      tone = look === 'nav' ? 'strong' : undefined,
      container,
      forceMount,
      className,
      sideOffset = 2,
      ...props
    },
    ref,
  ) => (
    <MenuLookProvider look={look} kind="popover">
      <PopoverPrimitive.Portal forceMount={forceMount} container={container}>
        <PopoverPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          forceMount={forceMount}
          {...menuRowDataAttributes({ density, tone })}
          data-testid={
            props['data-testid'] ??
            (look === 'actions' ? 'actions-menu' : undefined)
          }
          className={cn(
            'group/menu',
            menuSurface({ look, container: 'popover' }),
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Portal>
    </MenuLookProvider>
  ),
);
MenuPopoverContent.displayName = 'MenuPopover.Content';

/**
 * A plain button row in a MenuPopover panel. Popovers have no roving
 * focus, so rows are real buttons rather than Radix menu items. It doesn't
 * close the panel on its own: some rows open a flyout of their own.
 */
const MenuPopoverItem = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'>
>(({ className, type = 'button', ...props }, ref) => {
  const rowClassName = useMenuItemClassName();
  return (
    <button
      ref={ref}
      type={type}
      className={cn(rowClassName, 'w-full text-start', className)}
      {...props}
    />
  );
});
MenuPopoverItem.displayName = 'MenuPopover.Item';

export const MenuPopover = Object.assign(MenuPopoverRoot, {
  Trigger: PopoverPrimitive.Trigger,
  Anchor: PopoverPrimitive.Anchor,
  Close: PopoverPrimitive.Close,
  Content: MenuPopoverContent,
  Item: MenuPopoverItem,
});
