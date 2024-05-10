import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Col } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { translate } from '@waldur/i18n';
import { getAllPublicCalls } from '@waldur/proposals/api';

import { CallCard } from './CallCard';

export const CallsForProposalsList: FC = () => {
  const {
    data: calls,
    isLoading,
    error,
    refetch,
  } = useQuery(['CallsForProposals'], () => getAllPublicCalls(true), {
    staleTime: 3 * 60 * 1000,
  });
  return (
    <div>
      {isLoading ? (
        <p className="text-center">{translate('Loading')}</p>
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : calls.length === 0 ? (
        <p className="text-center">
          {translate('There are no calls for proposals at the moment.')}
        </p>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-6">
            <h1 className="mb-0">{translate('Open calls')}</h1>
            <Link
              state="calls-for-proposals-all-calls"
              label={translate('View all')}
            />
          </div>
          <div className="row d-flex flex-wrap">
            {calls.map((call) => (
              <Col key={call.uuid} lg={6} xl={4} className="mb-3">
                <CallCard call={call} />
              </Col>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
