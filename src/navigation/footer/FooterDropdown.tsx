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
          // menu-gray-600/menu-state-bg-gray, the same pairing
          // UserDropdown.tsx/LanguageSelectorDropdown.tsx use, were missing
          // here entirely -- so a row backed by a real <a> (DocsLink,
          // LegalPrivacyMenu's Privacy policy/Terms of service) fell through
          // to Bootstrap's own `a { color: var(--waldur-brand-700) }` (green)
          // while a row backed by a plain RadixDropdownMenu.Item or <button>
          // (IssuesLink, Cookie settings, the email/phone copy rows)
          // inherited the ambient dark text color instead -- two different
          // colors in the same menu depending on which element a row
          // happened to be built from, reported live. Also restores the
          // [data-highlighted] hover background this app's other Metronic
          // menus already get from menu-state-bg-gray.
          className="p-2 min-w-200px menu-gray-600 menu-state-bg-gray"
          {...hoverHandlers}
        >
          <ul>{children}</ul>
        </NavMenuContent>
      </NavMenu>
    </li>
  );
};
