import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { countRobotAccounts } from '@waldur/marketplace/common/api';

import { RobotAccountList } from './RobotAccountList';

export const RobotAccountCard = ({ resource }) => {
  const result = useAsync(() => countRobotAccounts({ resource: resource.url }));
  if (!result.value) {
    return null;
  }
  return (
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
};
