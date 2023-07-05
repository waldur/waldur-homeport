import { FC } from 'react';
import { Card } from 'react-bootstrap';

import { ReportingWidgets } from './ReportingWidgets';

export const ReportingDashboard: FC = () => {
  return (
    <Card>
      <Card.Body>
        <ReportingWidgets />
      </Card.Body>
    </Card>
  );
};
