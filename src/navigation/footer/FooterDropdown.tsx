import { CaretUpIcon } from '@phosphor-icons/react';
import React from 'react';

import { MenuDisclosure } from 'waldur-ui';

import { FOOTER_LINK_CLASSNAME } from '@/navigation/footer/MenuItem';

interface FooterDropdownProps {
  title: string;
  children: React.ReactNode;
}

/**
 * A direct `<li>` child of FooterLinks.tsx's `<ul>`, holding a list of
 * links and commands (FooterDropdownItems.tsx `<li>`s) behind a button: a
 * disclosure, which the keyboard Tabs through, not an application menu.
 *
 * Hover-to-open at `lg`+ is MenuDisclosure's `openOnHover="desktop"`.
 */

export const FooterDropdown: React.FC<FooterDropdownProps> = ({
  title,
  children,
}) => {
  return (
    <li data-testid="footer-dropdown">
      <MenuDisclosure openOnHover="desktop">
        <MenuDisclosure.Trigger asChild>
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
        </MenuDisclosure.Trigger>
        <MenuDisclosure.Content
          data-testid="footer-dropdown-panel"
          side="top"
          align="end"
          className="p-[6.5px] min-w-[200px]"
          // Metronic's base row padding with the footer's `px-3`.
          density="compact"
        >
          <ul className="m-[0px] list-none p-[0px]">{children}</ul>
        </MenuDisclosure.Content>
      </MenuDisclosure>
    </li>
  );
};
