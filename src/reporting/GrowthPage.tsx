import { DateTime } from 'luxon';
import { FC, useContext } from 'react';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SummaryWidget } from '@/core/SummaryWidget';
import { translate } from '@/i18n';

import { ActiveUsersByProviderChart } from './growth/ActiveUsersByProviderChart';
import { ProjectsOverTimeChart } from './growth/ProjectsOverTimeChart';
import { ResourcesOverTimeChart } from './growth/ResourcesOverTimeChart';
import { TopOfferingsTable } from './growth/TopOfferingsTable';
import { TopProvidersTable } from './growth/TopProvidersTable';
import { UsersOverTimeChart } from './growth/UsersOverTimeChart';
import { ReportingPeriodContext } from './ReportingLayout';
import { useGrowthStatistics } from './useGrowthStatistics';

export const GrowthPage: FC = () => {
  const { data, isLoading, error, refetch } = useGrowthStatistics();
  const months = useContext(ReportingPeriodContext);
  const from = DateTime.now().minus({ months: months - 1 });
  const cutoff = months ? from.toFormat('yyyy-MM') : '';
  // Buckets are 'yyyy-MM'; the users endpoint emits 'unknown' for accounts
  // without a join date, which no period should include.
  const dated = (items, key) =>
    (items || []).filter((i) => /^\d{4}-\d{2}$/.test(i[key]));
  const slice = (items, key) =>
    dated(items, key).filter((i) => i[key] >= cutoff);
  // Cumulative charts build a running total, so the months dropped from the
  // head are folded into the first visible bucket instead of restarting at 0.
  const sliceTotal = (items, key) => {
    const rows = dated(items, key);
    const cut = rows.findIndex((i) => i[key] >= cutoff);
    if (cut === -1) return [];
    if (cut === 0) return rows;
    const carried = rows.slice(0, cut).reduce((sum, i) => sum + i.count, 0);
    return [
      { ...rows[cut], count: rows[cut].count + carried },
      ...rows.slice(cut + 1),
    ];
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <LoadingErred loadData={refetch} />;

  return (
    <>
      <SummaryWidget
        stats={[
          {
            label: translate('Service providers'),
            value: data?.providersCount || 0,
          },
          { label: translate('Offerings'), value: data?.offeringsCount || 0 },
          {
            label: translate('Active users'),
            value: data?.activeUsersCount || 0,
          },
          {
            label: translate('Active projects'),
            value: data?.projectsCount || 0,
          },
          {
            label: translate('Active resources'),
            value: data?.resourcesCount || 0,
          },
        ]}
      />

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <UsersOverTimeChart data={sliceTotal(data?.userTrends, 'month')} />
        </Col>
        <Col lg={6}>
          <ProjectsOverTimeChart
            data={sliceTotal(data?.projectTrends, 'month')}
          />
        </Col>
      </Row>

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <ResourcesOverTimeChart
            data={slice(data?.resourceTrends, 'period')}
          />
        </Col>
        <Col lg={6}>
          <ActiveUsersByProviderChart data={data?.activeUsers} />
        </Col>
      </Row>

      <Row className="g-5 mb-5">
        <Col lg={6}>
          <TopProvidersTable data={data?.topProviders} />
        </Col>
        <Col lg={6}>
          <TopOfferingsTable data={data?.topOfferings} />
        </Col>
      </Row>
    </>
  );
};
