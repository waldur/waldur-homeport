import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';

import { CallStateField } from '../CallStateField';
import { ProposalCall } from '../types';

import { CallDetailsHeaderBody } from './CallDetailsHeaderBody';
import { CallRoundsList } from './CallRoundsList';
import { CallShowAllRounds } from './CallShowAllRounds';

const heroBg = require('@waldur/proposals/proposal-calls.png');

interface PublicCallDetailsHeroProps {
  call: ProposalCall;
}

export const PublicCallDetailsHero: FC<PublicCallDetailsHeroProps> = ({
  call,
}) => {
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
          <Button variant="light">{translate('See offerings')}</Button>
          <Button variant="primary">{translate('Apply to round')}</Button>
        </div>
      }
      quickBody={<CallRoundsList call={call} max={3} />}
      quickFooter={<CallShowAllRounds call={call} />}
      quickFooterClassName="justify-content-center"
    >
      <CallDetailsHeaderBody call={call} />
    </PublicDashboardHero>
  );
};
