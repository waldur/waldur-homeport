import { createContext, ReactNode, useContext, useMemo } from 'react';

export type MenuLook = 'nav' | 'actions';

/**
 * What a row sits in, which decides what Menu.Item renders: a Radix menu
 * item (`menu`), a `role="menuitem"` button that closes its Radix Popover
 * (`popover`), or a plain button with no Radix ancestor at all (`plain`,
 * e.g. a list of actions in a dialog, which is no menu). A Radix item throws outside a menu.
 */
export type MenuKind = 'menu' | 'popover' | 'plain';

/**
 * Row options a nav panel sets for the rows inside it. The panel renders
 * them as data-density / data-tone, and rows style themselves from those
 * with group variants (see MenuItem.tsx), so plain CSS carries them.
 */
export interface MenuRowOptions {
  density?: 'default' | 'compact' | 'base';
  tone?: 'default' | 'strong';
}

interface MenuLookContextValue {
  look: MenuLook;
  kind: MenuKind;
}

/**
 * The look and kind of the menu panel a row sits in. Radix portals every
 * panel and submenu, so a submenu's rows can't learn their look from CSS;
 * React context reaches them, and it tells a row which element to render.
 */
const MenuLookContext = createContext<MenuLookContextValue>({
  look: 'nav',
  kind: 'plain',
});

/**
 * Sets the look and kind for the rows inside. Nested providers (a submenu
 * inside a panel) keep the outer values unless they override them.
 */
export const MenuLookProvider = ({
  look,
  kind,
  children,
}: {
  look?: MenuLook;
  kind?: MenuKind;
  children: ReactNode;
}) => {
  const outer = useContext(MenuLookContext);
  const value = useMemo(
    () => ({ look: look ?? outer.look, kind: kind ?? outer.kind }),
    [look, kind, outer],
  );
  return (
    <MenuLookContext.Provider value={value}>
      {children}
    </MenuLookContext.Provider>
  );
};

export const useMenuLook = () => useContext(MenuLookContext).look;

export const useMenuKind = () => useContext(MenuLookContext).kind;
