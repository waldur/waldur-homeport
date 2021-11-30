import { FC } from 'react';

import './SidebarNav.scss';

export const SidebarNav: FC = ({ children }) => (
  <div style={{ display: 'table' }}>{children}</div>
);
export const SidebarRow: FC<{
  iconClass: string;
  title: string;
  description: string;
  onClick();
}> = ({ iconClass, title, description, onClick }) => (
  <div className="SidebarRow" onClick={onClick}>
    <div className="SidebarRowIcon">
      <i className={iconClass}></i>
    </div>
    <div className="SidebarRowTitle">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    <div
      style={{
        display: 'table-cell',
        padding: 15,
      }}
    >
      <i className="fa fa-arrow-right"></i>
    </div>
  </div>
);
