import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import heroBg from '@waldur/proposals/proposal-calls.png';
import { formatCallState, getCallStatus } from '@waldur/proposals/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { Call } from '../types';

import { CallActions } from './CallActions';
import { CallUpdateHeaderBody } from './CallUpdateHeaderBody';
import { ProposalCallQuotas } from './ProposalCallQuotas';

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
      logoBottomLabel={translate('Call')}
      logoBottomClass="bg-secondary"
      logoTopLabel={formatCallState(call.state)}
      logoTopClass={'bg-' + status.color}
      backgroundImage={heroBg}
      asHero
      title={
        <>
          <h3>{call.name}</h3>
          <Link state="#" className="text-link">
            {call.customer_name}
          </Link>
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
        <CallUpdateHeaderBody call={call} />
      )}
    </PublicDashboardHero>
  );
};
