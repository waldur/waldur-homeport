import React from 'react';

export const MenuSection: React.FC<{ title: React.ReactNode }> = (props) => (
  <div className="menu-item">
    <div className="menu-content pt-8 pb-2">
      <span className="menu-section text-muted text-uppercase fs-8 ls-1">
        {props.title}
      </span>
    </div>
  </div>
);
