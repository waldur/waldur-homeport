import React from 'react';

export const MenuAccordion: React.FC<{
  title: React.ReactNode;
  itemId?: string;
}> = (props) => (
  <div
    className="menu-item menu-accordion"
    data-kt-menu-trigger="click"
    data-kt-menu-permanent="true"
    id={props.itemId}
  >
    <span className="menu-link">
      <span className="menu-title">{props.title}</span>
      <span className="menu-arrow"></span>
    </span>
    <div className="menu-sub menu-sub-accordion">{props.children}</div>
  </div>
);