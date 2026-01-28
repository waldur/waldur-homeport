import { FC, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';

import { ProvisioningByStateChart } from './ProvisioningByStateChart';
import { ProvisioningByTypeTable } from './ProvisioningByTypeTable';
import { ProvisioningFilter } from './ProvisioningFilter';
import { ProvisioningSuccessRateCard } from './ProvisioningSuccessRateCard';
import { ProvisioningSummaryCards } from './ProvisioningSummaryCards';
import { ProvisioningTrendChart } from './ProvisioningTrendChart';
import { computeSummary, useProvisioningStats } from './useProvisioningStats';

export const ProvisioningStatsPage: FC = () => {
  useTitle(translate('Provisioning statistics'));
  useReportBreadcrumbs({
    category: 'operations',
    currentReport: 'provisioning-stats',
  });

  const [days, setDays] = useState(30);
  const { data, isLoading, error, refetch } = useProvisioningStats({ days });

  const summary = useMemo(() => {
    if (!data) return null;
    return computeSummary(data);
  }, [data]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  if (!data || !summary) {
    return (
      <NoResult
        title={translate('No provisioning data found')}
        message={translate(
          'There is no provisioning statistics data to display.',
        )}
      />
    );
  }

  return (
    <>
      <ProvisioningFilter days={days} onDaysChange={setDays} />

      <Row className="g-6 mb-6">
        <Col xs={12} lg={4}>
          <ProvisioningSuccessRateCard successRate={summary.successRate} />
        </Col>
        <Col xs={12} lg={8}>
          <ProvisioningSummaryCards summary={summary} />
        </Col>
      </Row>

      <Row className="g-6 mb-6">
        <Col xs={12} lg={6}>
          <ProvisioningByStateChart byState={data.by_state || {}} />
        </Col>
        <Col xs={12} lg={6}>
          <ProvisioningTrendChart daily={data.daily || []} />
        </Col>
      </Row>

      <ProvisioningByTypeTable byType={data.by_type || {}} />
    </>
  );
};
