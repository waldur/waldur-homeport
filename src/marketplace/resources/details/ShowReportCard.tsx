import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { translate } from '@/i18n';

import { ShowReportComponent } from '../report/ShowReportComponent';

export const ShowReportCard = ({ resource }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as="div">{translate('Report')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ShowReportComponent report={resource.report} />
      </CardContent>
    </Card>
  );
};
