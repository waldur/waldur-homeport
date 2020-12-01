import React from 'react';
import { Button } from 'react-bootstrap';
import { useBoolean } from 'react-use';

import { translate } from '@waldur/i18n';

import './CustomerAccordion.css';

export const CustomerAccordion: React.FC<{
  title: React.ReactNode;
  subtitle: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  const [expanded, toggle] = useBoolean(false);

  return (
    <div className="settings">
      <div className="settings-header" onClick={toggle}>
        <div className="settings-title">{title}</div>
        <Button>
          {expanded ? translate('Collapse') : translate('Expand')}
        </Button>
        <p className="settings-subtitle">{subtitle}</p>
      </div>
      {expanded && children}
    </div>
  );
};
