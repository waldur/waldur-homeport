import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

interface LoadingErredProps {
  loadData: () => void;
  message?: string;
}

export const LoadingErred: FunctionComponent<LoadingErredProps> = ({
  loadData,
  message,
}) => (
  <div className="text-center">
    <h3>{message || translate('Unable to load data.')}</h3>
    <Button onClick={loadData}>
      <i className="fa fa-refresh" /> {translate('Reload')}
    </Button>
  </div>
);
