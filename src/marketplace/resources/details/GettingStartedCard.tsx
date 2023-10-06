import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { GettingStartedMessage } from './GettingStartedMessage';

export const GettingStartedCard = ({ resource, offering }) =>
  offering.getting_started ? (
    <Card className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Getting started')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <GettingStartedMessage resource={resource} offering={offering} />
      </Card.Body>
    </Card>
  ) : null;
