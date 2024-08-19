import { ArrowsClockwise } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface LoadingErredProps {
  loadData: () => void;
  message?: string;
  className?: string;
}

export const LoadingErred: FunctionComponent<LoadingErredProps> = ({
  loadData,
  message,
  className,
}) => (
  <div className={`text-center ${className ?? ''}`}>
    <h3>{message || translate('Unable to load data.')}</h3>
    <Button onClick={loadData}>
      <span className="svg-icon svg-icon-2">
        <ArrowsClockwise />
      </span>{' '}
      {translate('Reload')}
    </Button>
  </div>
);
