import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { RobotAccountList } from './RobotAccountList';

export const RobotAccountCard = ({ resource }) => (
  <Card className="mb-7">
    <Card.Header>
      <Card.Title>
        <h3 className="mb-5">{translate('Robot accounts')}</h3>
      </Card.Title>
    </Card.Header>
    <Card.Body>
      <RobotAccountList resource={resource} />
    </Card.Body>
  </Card>
);
