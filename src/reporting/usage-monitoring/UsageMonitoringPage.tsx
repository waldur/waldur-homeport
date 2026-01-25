import { FC, useState } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { MissingUsageTable } from './MissingUsageTable';
import { UsageMonitoringFilter } from './UsageMonitoringFilter';
import { getCurrentBillingPeriod } from './utils';

export const UsageMonitoringPage: FC = () => {
  useTitle(translate('Usage monitoring'));
  useReportBreadcrumbs({
    category: 'resources',
    currentReport: 'usage-monitoring',
  });

  const [billingPeriod, setBillingPeriod] = useState(getCurrentBillingPeriod());

  return (
    <>
      <Card className="mb-6">
        <Card.Header>
          <Card.Title>{translate('Filters')}</Card.Title>
        </Card.Header>
        <Card.Body>
          <UsageMonitoringFilter
            billingPeriod={billingPeriod}
            onBillingPeriodChange={setBillingPeriod}
          />
        </Card.Body>
      </Card>

      <MissingUsageTable billingPeriod={billingPeriod} />
    </>
  );
};
