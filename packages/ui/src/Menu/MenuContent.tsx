import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva } from 'class-variance-authority';
import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  useContext,
} from 'react';

import { cn } from '../cn';

import { compose, HoverContext } from './hoverContext';
import { MenuLook, MenuLookProvider, MenuRowOptions } from './menuContext';
import { menuRowDataAttributes } from './MenuItem';

// A menu scrolls inside the space Radix measures between its trigger and
// the viewport edge, instead of running off-screen.
export const MENU_PANEL_SCROLL_CLASSNAME =
  'max-h-(--radix-dropdown-menu-content-available-height) overflow-x-hidden overflow-y-auto';

// Metronic's dropdown entrance (fade in while sliding 0.75rem toward the
// trigger, 0.3s ease), as keyframes in waldur-design-tokens/animations.css.
// Only a panel that opens upwards (data-side="top") slides down; every
// other side, including a sideways submenu, slides up, as Metronic's did.
// Keyframes rather than a transition because Radix holds animations back
// until the panel is positioned; see the comment on those keyframes.
const MENU_PANEL_MOTION_CLASSNAME =
  'animate-[waldur-menu-enter-up_0.3s_ease] data-[side=top]:animate-[waldur-menu-enter-down_0.3s_ease] motion-reduce:animate-none';

export type SurfaceLook = 'nav' | 'actions';
export type SurfaceContainer = 'menu' | 'popover';

// The surfaces reset margin and padding (an `asChild` <ul> has the
// browser's) with arbitrary values, not `m-0`/`p-0`: Bootstrap defines
// `.m-0`/`.p-0` with !important, which would override a caller's Tailwind
// `py-*` or `my-*` wherever Bootstrap is loaded (the main app, Storybook).

// No border, the page body's background, an 8px radius and z-index 105.
// Like Metronic, it sets no text colour; only rows are gray-600.
const navSurface = cva(
  `z-nav-menu m-[0px] flex list-none flex-col p-[0px] rounded-lg shadow-[var(--dropdown-shadow)] bg-[var(--menu-bg)] ${MENU_PANEL_MOTION_CLASSNAME}`,
  {
    variants: {
      container: {
        // A DropdownMenu panel scrolls inside the space Radix measures.
        menu: MENU_PANEL_SCROLL_CLASSNAME,
        // A Popover panel holding form controls: not height-capped (a
        // filter's select needs room for its own option list), and hidden
        // while closed for the table filter panels that stay mounted.
        popover: 'data-[state=closed]:hidden',
      },
    },
    defaultVariants: { container: 'menu' },
  },
);

// 6.5px vertical padding, 13px text, a 130px minimum width and z-index
// 1100, and no entrance motion, as Bootstrap's. Scrolling is left to the
// panel (Menu.Content adds it; ActionsMenu's popover adds its own).
const ACTIONS_SURFACE_CLASSNAME =
  'z-dropdown-menu m-[0px] block min-w-[130px] list-none rounded-lg bg-[var(--menu-bg)] py-[6.5px] text-start text-[13px] shadow-[var(--dropdown-shadow)]';

/** A menu or popover panel in the given look. `container` only shapes the
 * nav look. */
export const menuSurface = ({
  look = 'nav',
  container = 'menu',
}: { look?: SurfaceLook; container?: SurfaceContainer } = {}) => {
  if (look === 'actions') return ACTIONS_SURFACE_CLASSNAME;
  return navSurface({ container });
};

export type MenuContentProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Content
> &
  MenuRowOptions & {
    /** `nav` (default) or `actions`. Rows and submenus inside inherit it. */
    look?: MenuLook;
    /** Where to portal the panel; document.body by default. */
    container?: HTMLElement;
  };

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
  (
    {
      look = 'nav',
      density,
      tone,
      container,
      className,
      sideOffset = 2,
      onMouseEnter,
      onMouseLeave,
      onPointerDownOutside,
      ...props
    },
    ref,
  ) => {
    const hover = useContext(HoverContext)?.content;
    return (
      <MenuLookProvider look={look} kind="menu">
        <DropdownMenuPrimitive.Portal container={container}>
          <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            {...menuRowDataAttributes({ density, tone })}
            data-testid={
              props['data-testid'] ??
              (look === 'actions' ? 'actions-menu' : undefined)
            }
            className={cn(
              'group/menu',
              menuSurface({ look }),
              // The nav surface already scrolls; the actions one leaves it
              // to the container type, and this is a DropdownMenu.
              look === 'actions' && MENU_PANEL_SCROLL_CLASSNAME,
              className,
            )}
            onMouseEnter={compose<MouseEvent<HTMLDivElement>>(
              onMouseEnter,
              hover?.onMouseEnter,
            )}
            onMouseLeave={compose<MouseEvent<HTMLDivElement>>(
              onMouseLeave,
              hover?.onMouseLeave,
            )}
            onPointerDownOutside={compose(
              onPointerDownOutside,
              hover?.onPointerDownOutside,
            )}
            {...props}
          />
        </DropdownMenuPrimitive.Portal>
      </MenuLookProvider>
    );
  },
);
MenuContent.displayName = 'Menu.Content';
