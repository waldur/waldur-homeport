import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getIssueStatuses } from '@waldur/issues/list/IssuesFilter';

import { getServiceProviderStatistics } from '../api';

export const StatisticsCards = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['support-statistics'],
    getServiceProviderStatistics,
    {
      staleTime: 5 * 60 * 1000,
    },
  );

  const statisticsData = useMemo(() => {
    const counts: Partial<typeof data> = data || {};
    return [
      {
        title: translate('Open issues'),
        count: counts.open_issues_count,
        to: {
          state: 'support.list',
          params: {
            status: JSON.stringify([
              getIssueStatuses().find(
                (op) => op.value === 'Waiting for support',
              ),
              getIssueStatuses().find((op) => op.value === 'Open'),
            ]),
          },
        },
      },
      {
        title: translate('Closed issues (this month)'),
        count: counts.closed_this_month_count,
        to: {
          state: 'support.list',
          params: {
            status: JSON.stringify([
              getIssueStatuses().find((op) => op.value === 'Resolved'),
              getIssueStatuses().find((op) => op.value === 'Closed'),
            ]),
          },
        },
      },
      {
        title: translate('Recent broadcasts (this month)'),
        count: counts.recent_broadcasts_count,
        to: { state: 'support.broadcast' },
      },
    ];
  }, [data]);

  return (
    <Row>
      {error && (
        <LoadingErred
          message={translate('Unable to load statistics data')}
          loadData={refetch}
          className="mb-4"
        />
      )}
      {statisticsData.map((item) => (
        <Col key={item.title} md={6} lg={4}>
          <Card className="mb-6">
            <Card.Body className="d-flex d-md-block justify-content-between align-items-center">
              <div className="buttons text-end order-2">
                <Link
                  state={item.to.state}
                  params={item.to.params}
                  className="btn btn-light"
                >
                  {translate('View all')}
                </Link>
              </div>
              <div className="mb-4 order-1">
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <strong className={'d-block display-4 text-success'}>
                    {item.count}
                  </strong>
                )}
                <strong className="d-block mb-2">{item.title}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
