import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { StatisticsCard } from '@waldur/core/StatisticsCard';
import { translate } from '@waldur/i18n';
import { getCallStateOptions } from '@waldur/proposals/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { getCallManagementStatistics } from '../api';

const getCallState = (states: string[]) => ({
  state: 'call-management.call-list',
  params: {
    state: JSON.stringify(
      states.map((state) =>
        getCallStateOptions().find((op) => op.value === state),
      ),
    ),
  },
});

export const CallManagementStatistics = () => {
  const customer = useSelector(getCustomer);
  const { data, isLoading, error, refetch } = useQuery(
    ['call-management-statistics', customer.call_managing_organization_uuid],
    () => getCallManagementStatistics(customer.call_managing_organization_uuid),
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
              title={translate('Open calls')}
              value={data.open_calls}
              to={getCallState(['active'])}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Active rounds')}
              value={data.active_rounds}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Accepted proposals')}
              value={data.accepted_proposals}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Pending proposals')}
              value={data.pending_proposals}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Pending review')}
              value={data.pending_review}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Round closing soon')}
              value={data.rounds_closing_in_one_week}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Calls closing soon')}
              value={data.calls_closing_in_one_week}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Pending offering requests')}
              value={data.offering_requests_pending}
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
