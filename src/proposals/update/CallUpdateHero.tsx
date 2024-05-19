import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { getCallStatus } from '@waldur/proposals/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { CallDetailsHeaderBody } from '../details/CallDetailsHeaderBody';
import { Call } from '../types';

import { CallActions } from './CallActions';
import { ProposalCallQuotas } from './ProposalCallQuotas';

interface CallUpdateHeroProps {
  call: Call;
  refetch?(): void;
}

export const CallUpdateHero: FC<CallUpdateHeroProps> = ({ call, refetch }) => {
  const customer = useSelector(getCustomer);
  const status = useMemo(() => getCallStatus(call), [call]);
  return (
    <PublicDashboardHero2
      logo={customer?.image}
      logoAlt={call.name}
      title={
        <>
          <div className="d-flex flex-wrap gap-2 mb-2">
            <h3>{call.name}</h3>
            <StateIndicator
              variant={status.color}
              label={status.label}
              light
              pill
            />
          </div>
          <p className="text-muted">{call.customer_name}</p>
        </>
      }
      quickActions={
        <div className="d-flex gap-5 justify-content-between">
          <CallActions call={call} refetch={refetch} />
        </div>
      }
      quickBody={<ProposalCallQuotas call={call} />}
      quickFooterClassName="justify-content-center"
    >
      {call.state !== 'archived' && call.rounds.length > 0 && (
        <CallDetailsHeaderBody call={call} />
      )}
    </PublicDashboardHero2>
  );
};
