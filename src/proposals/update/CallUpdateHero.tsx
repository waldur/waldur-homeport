import { FC, useMemo } from 'react';

import { StateIndicator } from '@/core/StateIndicator';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
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
  return (
    <PublicDashboardHero
      logo={customer?.image}
      logoAlt={call.name}
      logoCircle
      cardBordered
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
          <p className="text-muted fs-7 mb-0">{call.customer_name}</p>
        </>
      }
      quickActions={
        <div className="d-flex flex-column flex-wrap gap-2">
          <CallActions call={call} refetch={refetch} />
        </div>
      }
      quickBody={
        call.state !== 'archived' &&
        call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />
      }
      quickFooterClassName="justify-content-center"
    />
  );
};
