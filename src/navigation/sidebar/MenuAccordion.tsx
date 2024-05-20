import React, { PropsWithChildren, ReactNode } from 'react';

interface MenuAccordionProps {
  title: React.ReactNode;
  itemId?: string;
  icon?: ReactNode;
}

export const MenuAccordion: React.FC<PropsWithChildren<MenuAccordionProps>> = (
  props,
) => (
  <div
    className="menu-item menu-accordion"
    data-kt-menu-trigger="click"
    data-kt-menu-permanent="true"
    id={props.itemId}
  >
    <span className="menu-link">
      {props.icon && (
        <span className="menu-icon">
          <span className="svg-icon svg-icon-2">{props.icon}</span>
        </span>
      )}
      <span className="menu-title">{props.title}</span>
      <span className="menu-arrow" />
    </span>
    <div className="menu-sub menu-sub-accordion">{props.children}</div>
  </div>
);
