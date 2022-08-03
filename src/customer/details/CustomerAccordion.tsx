import React from 'react';

import './CustomerAccordion.css';

export const CustomerAccordion: React.FC<{
  title: React.ReactNode;
  subtitle: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <>
      <div className="settings-header">
        <div className="settings-title">{title}</div>
        <p className="settings-subtitle">{subtitle}</p>
      </div>
      {children}
    </>
  );
};
