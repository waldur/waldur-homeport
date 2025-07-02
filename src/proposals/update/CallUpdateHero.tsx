import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { getCallStatus } from '@waldur/proposals/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { CallDetailsHeaderBody } from '../details/CallDetailsHeaderBody';
import { Call } from '../types';

import { CallActions } from './CallActions';

interface CallUpdateHeroProps {
  call: Call;
  refetch?(): void;
}

export const CallUpdateHero: FC<CallUpdateHeroProps> = ({ call, refetch }) => {
  const customer = useSelector(getCustomer);
  const status = useMemo(() => getCallStatus(call), [call]);
  return (
    <PublicDashboardHero
      logo={customer?.image}
      logoAlt={call.name}
      logoCircle
      cardBordered
      title={
        <>
          <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
            <h3>{call.name}</h3>
            <StateIndicator
              variant={status.color}
              label={status.label}
              outline
              pill
            />
          </div>
          <p className="text-muted">{call.customer_name}</p>
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
