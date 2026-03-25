import { FC, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { useTitle } from '@waldur/navigation/title';
import { ExportData } from '@waldur/table/exporters/types';

import { useReportBreadcrumbs } from '../ReportsBreadcrumbs';
import { ChartCard } from '../users/charts/ChartCard';

import { ProvisioningByStateChart } from './ProvisioningByStateChart';
import { ProvisioningByTypeTable } from './ProvisioningByTypeTable';
import { ProvisioningFilter } from './ProvisioningFilter';
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

  const getByStateExportData = useMemo(
    () => (): ExportData => ({
      fields: [translate('State'), translate('Count')],
      data: Object.entries(data?.by_state || {}).map(([state, count]) => [
        state,
        count,
      ]),
    }),
    [data?.by_state],
  );

  const getTrendExportData = useMemo(
    () => (): ExportData => ({
      fields: [
        translate('Date'),
        translate('Total'),
        translate('Done'),
        translate('Erred'),
        translate('Success rate (%)'),
      ],
      data: (data?.daily || []).map((day) => {
        const done = day.by_state?.done || 0;
        const erred = day.by_state?.erred || 0;
        const completed = done + erred;
        const successRate =
          completed > 0 ? Math.round((done / completed) * 100) : 100;
        return [day.date, day.total, done, erred, successRate];
      }),
    }),
    [data?.daily],
  );

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
        noAction
      />
    );
  }

  const hasByStateData = Object.keys(data.by_state || {}).length > 0;
  const hasTrendData = (data.daily || []).length > 0;

  return (
    <>
      <div className="table-standalone-header d-flex justify-content-between gap-4 mb-6">
        <h1 className="mb-0 fs-1x">{translate('Provisioning statistics')}</h1>
        <div className="d-none d-sm-flex gap-4">
          <ProvisioningFilter days={days} onDaysChange={setDays} />
        </div>
      </div>

      <ProvisioningSummaryCards summary={summary} />

      <Row className="g-6 mb-6">
        <Col xs={12} lg={6}>
          <ChartCard
            title={translate('Orders by state')}
            getExportData={getByStateExportData}
            isEmpty={!hasByStateData}
          >
            {(ref) => (
              <ProvisioningByStateChart
                ref={ref}
                byState={data.by_state || {}}
              />
            )}
          </ChartCard>
        </Col>
        <Col xs={12} lg={6}>
          <ChartCard
            title={translate('Success rate trend')}
            getExportData={getTrendExportData}
            isEmpty={!hasTrendData}
          >
            {(ref) => (
              <ProvisioningTrendChart ref={ref} daily={data.daily || []} />
            )}
          </ChartCard>
        </Col>
      </Row>

      <ProvisioningByTypeTable byType={data.by_type || {}} />
    </>
  );
};
