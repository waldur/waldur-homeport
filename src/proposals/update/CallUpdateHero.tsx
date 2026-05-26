import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { proposalProposalsList } from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { formatDate } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { translate } from '@/i18n';
import { getCallStatus } from '@/proposals/utils';
import { useCustomer } from '@/workspace/hooks';

import { CallDetailsHeaderBody } from '../details/CallDetailsHeaderBody';
import { Call } from '../types';

import { CallActions } from './CallActions';

interface CallUpdateHeroProps {
  call: Call;
  refetch?(): void;
}

export const CallUpdateHero: FC<CallUpdateHeroProps> = ({ call, refetch }) => {
  const customer = useCustomer();
  const status = useMemo(() => getCallStatus(call), [call]);
  const isArchived = call.state === 'archived';

  const { data: proposalsCount } = useQuery({
    queryKey: ['callProposalsCount', call.uuid],
    queryFn: async () => {
      const response = await proposalProposalsList({
        query: { call_uuid: call.uuid, page: 1, page_size: 1 },
      });
      return fetchResultCount(response);
    },
  });

  return (
    <PublicDashboardHero
      logo={customer?.image}
      logoAlt={call.name}
      logoCircle
      cardBordered
      hideQuickSection={isArchived}
      title={
        <>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <h3 className="mb-0 lh-1">{call.name}</h3>
            <StateIndicator
              variant={status.color}
              label={status.label}
              outline
              pill
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="fs-7 text-gray-600">{translate('Part of:')}</span>
            <span className="fs-7 fw-medium text-primary">
              {call.customer_name}
            </span>
          </div>
          <div className="d-flex flex-wrap gap-3 mt-1">
            {call.start_date && (
              <span className="fs-7">
                <span className="fw-bold">{translate('Start date:')}</span>{' '}
                <span className="text-gray-600">
                  {formatDate(call.start_date)}
                </span>
              </span>
            )}
            {call.end_date && (
              <span className="fs-7">
                <span className="fw-bold">{translate('End date:')}</span>{' '}
                <span className="text-gray-600">
                  {formatDate(call.end_date)}
                </span>
              </span>
            )}
            {typeof proposalsCount === 'number' && (
              <span className="fs-7">
                <span className="fw-bold">{translate('Proposals:')}</span>{' '}
                <span className="text-gray-600">{proposalsCount}</span>
              </span>
            )}
          </div>
        </>
      }
      quickActions={
        <div className="d-flex flex-column flex-wrap gap-2">
          <CallActions call={call} refetch={refetch} />
        </div>
      }
      quickBody={
        call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />
      }
      quickFooterClassName="justify-content-center"
    />
  );
};
