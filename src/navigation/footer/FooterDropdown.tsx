import React from 'react';

import {
  NavMenu,
  NavMenuContent,
  NavMenuTrigger,
  useHoverMenu,
} from '@/navigation/NavMenu';

interface FooterDropdownProps {
  title: string;
  children: React.ReactNode;
}

/**
 * On Radix's DropdownMenu, not NavMenuItem/NavMenuContent's usual
 * `<div>`/`.menu-item` shape — this is a direct `<li>` child of
 * FooterLinks.tsx's `<ul>`, and NavMenuContent's own `asChild` composes a
 * `<ul>` for its content the same way, so the nested MenuItem `<li>`s
 * stay valid list children (Metronic styles the submenu by class, not
 * tag, so the tag swap costs nothing visually).
 *
 * Each FooterDropdown is its own independent Radix Root — there is no
 * shared parent menu to nest a Sub under; FooterLinks.tsx's own
 * "this is a Metronic menu group" marker on its wrapping `<ul>` only
 * ever coordinated Metronic's *global* click-outside/hover handling
 * across these independent instances, which Radix does per-instance on
 * its own, so that attribute is dropped there rather than carried
 * forward unused.
 *
 * Hover-to-open at `lg`+ is `useHoverMenu` (@/navigation/NavMenu) — see
 * that hook's own comment for why a top-level trigger needs this by hand.
 */
export const FooterDropdown: React.FC<FooterDropdownProps> = ({
  title,
  children,
}) => {
  const { open, setOpen, hoverHandlers } = useHoverMenu();

  return (
    <li className="menu-item" data-testid="footer-dropdown">
      <NavMenu open={open} onOpenChange={setOpen} modal={false}>
        <NavMenuTrigger asChild>
          {/* A <button>, not a <span>: the trigger has to be reachable by
              keyboard (WCAG 2.1.1). */}
          <button type="button" className="menu-link px-3" {...hoverHandlers}>
            <span className="menu-title">{title}</span>
            <span className="menu-arrow rotate-active-90" />
          </button>
        </NavMenuTrigger>
        <NavMenuContent
          asChild
          placement="top-end"
          className="p-2 min-w-200px"
          {...hoverHandlers}
        >
          <ul>{children}</ul>
        </NavMenuContent>
      </NavMenu>
    </li>
  );
};
