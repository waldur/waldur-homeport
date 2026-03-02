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
  >
    <div className="menu-link px-3">
      <span className="menu-title">{title}</span>
      <span className="menu-arrow rotate-active-90" />
    </div>
    <div className="menu-sub menu-sub-dropdown p-2 min-w-200px">{children}</div>
  </li>
);
