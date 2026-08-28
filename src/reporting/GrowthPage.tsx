import { TrendUpIcon } from '@phosphor-icons/react';
import { DateTime } from 'luxon';
import { FC, useContext } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
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
import { useGrowthPeriodCounts } from './useGrowthPeriodCounts';
import { useGrowthStatistics } from './useGrowthStatistics';

export const GrowthPage: FC = () => {
  const { data, isLoading, error, refetch } = useGrowthStatistics();
  const months = useContext(ReportingPeriodContext);
  const { data: added, isError: addedErred } = useGrowthPeriodCounts(months);
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

  // The headline stays the running total so it keeps agreeing with the right
  // edge of the cumulative charts below; the period narrows this footer, not
  // the figure above it. Badge + muted caption is the shape StatsCard footers
  // already take in `PacingIndicator`, and the one `StatCard.trend` ports to.
  const addedInPeriod = (count?: number) => {
    if (!months) return undefined;
    // Without this, a failed counts request renders as an absent badge — which
    // reads as "nothing was added", not as "we could not ask".
    if (addedErred)
      return (
        <span className="text-muted fs-7">
          {translate('Growth data unavailable')}
        </span>
      );
    if (!added || count === undefined) return undefined;
    const grew = count > 0;
    return (
      <>
        {/* A flat period is `default` + `outline`, the design system's neutral
            badge. `secondary` + `light` is the one combination to avoid here:
            badgeColors.css reproduces Metronic's bug where its text and
            background are the same colour, so "+0" renders as an empty pill. */}
        <Badge
          variant={grew ? 'success' : 'default'}
          size="sm"
          leftIcon={grew ? <TrendUpIcon weight="bold" /> : undefined}
          pill
          outline={!grew}
          light={grew}
        >
          {`+${count}`}
        </Badge>
        {/* Captioned with the window the counts came from, not the live
            toggle: the two differ while the next period is still loading. */}
        <span className="text-muted fs-7">
          {translate('in the last {months} months', { months: added.months })}
        </span>
      </>
    );
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
            footer: addedInPeriod(added?.providers),
          },
          {
            label: translate('Offerings'),
            value: data?.offeringsCount || 0,
            footer: addedInPeriod(added?.offerings),
          },
          {
            label: translate('Active users'),
            value: data?.activeUsersCount || 0,
            footer: addedInPeriod(added?.users),
          },
          {
            label: translate('Active projects'),
            value: data?.projectsCount || 0,
            footer: addedInPeriod(added?.projects),
          },
          {
            label: translate('Active resources'),
            value: data?.resourcesCount || 0,
            footer: addedInPeriod(added?.resources),
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
