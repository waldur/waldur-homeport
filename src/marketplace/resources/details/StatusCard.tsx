import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { StatusPage } from './StatusPage';

export const StatusCard = () => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return showExperimentalUiComponents ? (
    <Card className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3 className="mb-5">{translate('Status page')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <StatusPage />
      </Card.Body>
    </Card>
  ) : null;
};
