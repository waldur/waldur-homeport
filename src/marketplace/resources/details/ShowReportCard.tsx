import { Card } from 'react-bootstrap';

import { translate } from '@/i18n';

import { ShowReportComponent } from '../report/ShowReportComponent';

export const ShowReportCard = ({ resource }) => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{translate('Report')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <ShowReportComponent report={resource.report} />
      </Card.Body>
    </Card>
  );
};
