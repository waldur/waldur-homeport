import React from 'react';

interface FooterDropdownProps {
  title: string;
  children: React.ReactNode;
}

export const FooterDropdown: React.FC<FooterDropdownProps> = ({
  title,
  children,
}) => (
  <li
    className="menu-item"
    data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
    data-kt-menu-placement="top-end"
    data-testid="footer-dropdown"
  >
    {/* A <button>, not a <div>: the trigger has to be reachable by keyboard
        (WCAG 2.1.1). Metronic drives open/close from data-kt-menu-trigger on
        the <li>, so the element type is free. */}
    <button type="button" className="menu-link px-3">
      <span className="menu-title">{title}</span>
      <span className="menu-arrow rotate-active-90" />
    </button>
    {/* A <ul> (not <div>) so the nested MenuItem <li>s are valid list
        children; Metronic styles the submenu by class, not tag. */}
    <ul className="menu-sub menu-sub-dropdown p-2 min-w-200px">{children}</ul>
  </li>
);
