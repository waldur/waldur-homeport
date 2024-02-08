import { FC } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProposalCall } from '../types';

import { ActionsDropdown } from './ActionsDropdown';
import { CallUpdateHeaderBody } from './CallUpdateHeaderBody';
import { ProposalCallQuotas } from './ProposalCallQuotas';

const heroBg = require('@waldur/proposals/proposal-calls.png');

interface CallUpdateHeroProps {
  call: ProposalCall;
  refetch?(): void;
}

export const CallUpdateHero: FC<CallUpdateHeroProps> = ({ call, refetch }) => {
  const customer = useSelector(getCustomer);
  return (
    <PublicDashboardHero
      logo={customer?.image}
      logoAlt={call.customer_name}
      logoBottomLabel={translate('Call')}
      logoBottomClass="bg-secondary"
      logoTopLabel={call.state}
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
          <ActionsDropdown call={call} refetch={refetch} />
          <Button variant="primary" className="w-50">
            {translate('Submit changes')}
          </Button>
        </div>
      }
      quickBody={<ProposalCallQuotas call={call} />}
      quickFooterClassName="justify-content-center"
    >
      <CallUpdateHeaderBody call={call} />
    </PublicDashboardHero>
  );
};
