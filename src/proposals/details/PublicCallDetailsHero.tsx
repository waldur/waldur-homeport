import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';

import { CallStateField } from '../CallStateField';
import { Call } from '../types';
import { getSortedRoundsWithStatus } from '../utils';

import { CallDetailsHeaderBody } from './CallDetailsHeaderBody';
import { CallRoundsList } from './CallRoundsList';
import { CallShowAllRounds } from './CallShowAllRounds';

const heroBg = require('@waldur/proposals/proposal-calls.png');

interface PublicCallDetailsHeroProps {
  call: Call;
}

export const PublicCallDetailsHero: FC<PublicCallDetailsHeroProps> = ({
  call,
}) => {
  const activeRound =
    call.state == 'active' &&
    useMemo(() => {
      const items = getSortedRoundsWithStatus(call.rounds);
      const first = items[0];
      if (first && [0, 1].includes(first.state.code)) {
        return first;
      }
      return null;
    }, [call]);

  return (
    <PublicDashboardHero
      logo={undefined}
      logoAlt={call.customer_name}
      logoBottomLabel={translate('Call')}
      logoBottomClass="bg-secondary"
      logoTopLabel={<CallStateField call={call} roundless />}
      backgroundImage={heroBg}
      asHero
      title={
        <>
          <h3>{call.name}</h3>
          <Link state="#" className="text-gray-600 text-link">
            {call.customer_name}
          </Link>
        </>
      }
      quickActions={
        <div className="d-flex gap-5 justify-content-between">
          {activeRound ? (
            <Link
              state="public-calls.create-proposal"
              params={{ uuid: call.uuid, round_uuid: activeRound.uuid }}
              className="btn btn-primary"
            >
              {translate('Apply to round')}
            </Link>
          ) : (
            <Button variant="primary" disabled>
              {translate('Apply to round')}
            </Button>
          )}
        </div>
      }
      quickBody={<CallRoundsList call={call} max={3} filterCode={-1} />}
      quickFooter={<CallShowAllRounds call={call} />}
      quickFooterClassName="justify-content-center"
    >
      {call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />}
    </PublicDashboardHero>
  );
};
