import React, { PropsWithChildren, ReactNode } from 'react';
import SVG from 'react-inlinesvg';

interface MenuAccordionProps {
  title: React.ReactNode;
  itemId?: string;
  iconPath?: string;
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
      {props.iconPath && (
        <span className="menu-icon">
          <span className="svg-icon svg-icon-2">
            <SVG src={props.iconPath} />
          </span>
        </span>
      )}
      {props.icon && (
        <span className="menu-icon">
          <span className="svg-icon svg-icon-2">{props.icon}</span>
        </span>
      )}
      <span className="menu-title">{props.title}</span>
      <span className="menu-arrow"></span>
    </span>
    <div className="menu-sub menu-sub-accordion">{props.children}</div>
  </div>
);
