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
    <div className="menu-link px-3">
      <span className="menu-title">{title}</span>
      <span className="menu-arrow rotate-active-90" />
    </div>
    {/* A <ul> (not <div>) so the nested MenuItem <li>s are valid list
        children; Metronic styles the submenu by class, not tag. */}
    <ul className="menu-sub menu-sub-dropdown p-2 min-w-200px">{children}</ul>
  </li>
);
