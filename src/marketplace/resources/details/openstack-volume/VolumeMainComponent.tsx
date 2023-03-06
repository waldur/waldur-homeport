import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { VolumeDetails } from './VolumeDetails';

export const VolumeMainComponent = ({ scope }) =>
  scope ? (
    <div className="mb-10">
      <Card>
        <Card.Header>
          <Card.Title>
            <h3>{translate('Components')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <VolumeDetails scope={scope} />
        </Card.Body>
      </Card>
    </div>
  ) : null;
