import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { Call, Round } from '../types';
import { getRoundStatus } from '../utils';

import { RoundPageHeaderBody } from './RoundPageHeaderBody';
import { RoundQuotas } from './RoundQuotas';

const heroBg = require('@waldur/proposals/proposal-calls.png');

interface RoundPageHeroProps {
  round: Round;
  call: Call;
}

export const RoundPageHero: FC<RoundPageHeroProps> = ({ round, call }) => {
  const customer = useSelector(getCustomer);
  const status = useMemo(() => getRoundStatus(round), [round]);
  return (
    <PublicDashboardHero
      logo={customer?.image}
      logoAlt={round.uuid}
      logoBottomLabel={translate('Round')}
      logoBottomClass="bg-secondary"
      logoTopLabel={status.label}
      logoTopClass={'bg-' + status.color}
      backgroundImage={heroBg}
      asHero
      title={
        <>
          <h3>{round.name}</h3>
          <Link
            state="call-management.call-update"
            params={{ call_uuid: call.uuid }}
            label={translate('Part of {name}', { name: call.name })}
            className="text-link"
          />
        </>
      }
      quickActions={
        <Link
          state="call-management.call-update"
          params={{ call_uuid: call.uuid }}
          label={translate('See call')}
          className="btn btn-light w-50"
        />
      }
      quickBody={<RoundQuotas round={round} />}
      quickFooterClassName="justify-content-center"
    >
      <RoundPageHeaderBody round={round} />
    </PublicDashboardHero>
  );
};
