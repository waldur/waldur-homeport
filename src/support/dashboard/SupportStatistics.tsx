import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { StatisticsCard } from '@waldur/core/StatisticsCard';
import { translate } from '@waldur/i18n';
import { getIssueStatuses } from '@waldur/issues/list/IssuesFilter';

import { getSupportStatistics } from '../api';

const getIssueState = (states: string[]) => ({
  state: 'support.list',
  params: {
    status: JSON.stringify(
      states.map((state) =>
        getIssueStatuses().find((op) => op.value === state),
      ),
    ),
  },
});

export const SupportStatistics = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['support-statistics'],
    getSupportStatistics,
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  return (
    <Row>
      {error && (
        <LoadingErred
          message={translate('Unable to load statistics data')}
          loadData={refetch}
          className="mb-4"
        />
      )}
      {data && (
        <>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Open issues')}
              value={data.open_issues_count}
              to={getIssueState(['Waiting for support', 'Open'])}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Closed issues (this month)')}
              value={data.closed_this_month_count}
              to={getIssueState(['Resolved', 'Closed'])}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Recent broadcasts (this month)')}
              value={data.recent_broadcasts_count}
              to={{ state: 'support.broadcast' }}
            />
          </Col>
        </>
      )}
      {isLoading && (
        <Col md={6} lg={4}>
          <LoadingSpinner />
        </Col>
      )}
    </Row>
  );
};
