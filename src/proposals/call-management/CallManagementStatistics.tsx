import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { StatisticsCard } from '@waldur/core/StatisticsCard';
import { translate } from '@waldur/i18n';
import {
  getCallStateOptions,
  getProposalStateOptions,
} from '@waldur/proposals/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { getCallManagementStatistics } from '../api';

export const FlatStatistics = ({ count, title }) => {
  return (
    <Col className="text-md-center mb-4">
      <strong className="d-block fs-2">{count}</strong>
      <strong className="health-title">{title}</strong>
    </Col>
  );
};

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

const getProposalState = (states: string[]) => ({
  state: 'call-management.proposal-list',
  params: {
    state: JSON.stringify(
      states.map((state) =>
        getProposalStateOptions().find((op) => op.value === state),
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
              title={translate('Accepted proposals')}
              value={data.accepted_proposals}
              to={getProposalState(['accepted'])}
            />
          </Col>
          <Col md={6} lg={4}>
            <StatisticsCard
              title={translate('Pending proposals')}
              value={data.pending_proposals}
              to={getProposalState(['in_review', 'in_revision', 'submitted'])}
            />
          </Col>
          <Col>
            <Card className="mb-6">
              <Card.Body>
                <div className="d-flex justify-content-start justify-content-lg-between flex-wrap">
                  <FlatStatistics
                    title={translate('Pending review')}
                    count={data.pending_review}
                  />
                  <FlatStatistics
                    title={translate('Active rounds')}
                    count={data.active_rounds}
                  />
                  <FlatStatistics
                    title={translate('Round closing soon')}
                    count={data.rounds_closing_in_one_week}
                  />
                  <FlatStatistics
                    title={translate('Calls closing soon')}
                    count={data.calls_closing_in_one_week}
                  />
                  <FlatStatistics
                    title={translate('Pending offering requests')}
                    count={data.offering_requests_pending}
                  />
                </div>
              </Card.Body>
            </Card>
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
