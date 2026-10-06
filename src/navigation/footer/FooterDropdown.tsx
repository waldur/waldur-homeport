import { CaretUpIcon } from '@phosphor-icons/react';
import React from 'react';

import { Menu } from 'waldur-ui';

import { FOOTER_LINK_CLASSNAME } from '@/navigation/footer/MenuItem';

interface FooterDropdownProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A direct `<li>` child of FooterLinks.tsx's `<ul>`. Menu.Content's
 * `asChild` composes a `<ul>` for its content, so its rows
 * (FooterDropdownItems.tsx) are `<li>`s too.
 *
 * Each FooterDropdown is its own independent Radix Root — there is no
 * shared parent menu to nest a Sub under; FooterLinks.tsx's own
 * "this is a Metronic menu group" marker on its wrapping `<ul>` only
 * ever coordinated Metronic's *global* click-outside/hover handling
 * across these independent instances, which Radix does per-instance on
 * its own, so that attribute is dropped there rather than carried
 * forward unused.
 *
 * Hover-to-open at `lg`+ is waldur-ui Menu's `openOnHover="desktop"`.
 */

export const FooterDropdown: React.FC<FooterDropdownProps> = ({
  title,
  children,
}) => {
  return (
    <li data-testid="footer-dropdown">
      <Menu openOnHover="desktop">
        <Menu.Trigger asChild>
          {/* A <button>, not a <span>: the trigger has to be reachable by
              keyboard (WCAG 2.1.1). */}
          <button type="button" className={FOOTER_LINK_CLASSNAME}>
            {title}
            <CaretUpIcon
              size={16.9}
              weight="bold"
              className="ms-[8px] shrink-0"
            />
          </button>
        </Menu.Trigger>
        <Menu.Content
          asChild
          side="top"
          align="end"
          className="p-[6.5px] min-w-200px"
          // Metronic's base row padding with the footer's `px-3`.
          density="compact"
        >
          <ul>{children}</ul>
        </Menu.Content>
      </Menu>
    </li>
  );
};
