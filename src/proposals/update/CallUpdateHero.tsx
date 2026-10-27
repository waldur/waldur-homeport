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
          <div className="flex flex-wrap gap-1.5 items-center">
            <h3 className="mb-0 leading-none">{call.name}</h3>
            <StateIndicator
              variant={status.color}
              label={status.label}
              tone="outline"
              shape="pill"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-tertiary">
              {translate('Part of:')}
            </span>
            <span className="text-xs text-brand">{call.customer_name}</span>
          </div>
          <div className="flex flex-wrap gap-2.5 mt-1">
            {call.start_date && (
              <span className="text-xs">
                <span className="font-medium">{translate('Start date:')}</span>{' '}
                <span className="text-tertiary">
                  {formatDate(call.start_date)}
                </span>
              </span>
            )}
            {call.end_date && (
              <span className="text-xs">
                <span className="font-medium">{translate('End date:')}</span>{' '}
                <span className="text-tertiary">
                  {formatDate(call.end_date)}
                </span>
              </span>
            )}
            {typeof proposalsCount === 'number' && (
              <span className="text-xs">
                <span className="font-medium">{translate('Proposals:')}</span>{' '}
                <span className="text-tertiary">{proposalsCount}</span>
              </span>
            )}
          </div>
        </>
      }
      quickActions={
        <div className="flex flex-col flex-wrap gap-1.5">
          <CallActions call={call} refetch={refetch} />
        </div>
      }
      quickBody={
        call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />
      }
      quickFooterClassName="justify-center"
    />
  );
};
