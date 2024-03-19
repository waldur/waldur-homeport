import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getIssueStatuses } from '@waldur/issues/list/IssuesFilter';
import { CallCountCard } from '@waldur/proposals/call-management/CallCountCard';

import { getServiceProviderStatistics } from '../api';

export const StatisticsCards = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['support-statistics'],
    getServiceProviderStatistics,
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
            <CallCountCard
              title={translate('Open issues')}
              value={data.open_issues_count}
              to={{
                state: 'support.list',
                params: {
                  status: JSON.stringify([
                    getIssueStatuses().find(
                      (op) => op.value === 'Waiting for support',
                    ),
                    getIssueStatuses().find((op) => op.value === 'Open'),
                  ]),
                },
              }}
            />
          </Col>
          <Col md={6} lg={4}>
            <CallCountCard
              title={translate('Closed issues (this month)')}
              value={data.closed_this_month_count}
              to={{
                state: 'support.list',
                params: {
                  status: JSON.stringify([
                    getIssueStatuses().find((op) => op.value === 'Resolved'),
                    getIssueStatuses().find((op) => op.value === 'Closed'),
                  ]),
                },
              }}
            />
          </Col>
          <Col md={6} lg={4}>
            <CallCountCard
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
