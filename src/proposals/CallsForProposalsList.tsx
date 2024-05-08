import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

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
        <div className="col-8 offset-2 mt-20">
          <h1 className="mb-5">{translate('Open calls')}</h1>
          <Link
            state="calls-for-proposals-all-calls"
            label={translate('View all')}
          />
          <div className="row d-flex flex-wrap">
            {calls.map((call, index: number) => (
              <CallCard key={index} call={call} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
