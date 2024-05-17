import { FC, useMemo } from 'react';

import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import heroBg from '@waldur/proposals/proposal-calls.png';
import { getCallStatus } from '@waldur/proposals/utils';

import { Call } from '../types';

import { CallDetailsHeaderBody } from './CallDetailsHeaderBody';
import { PublicCallApplyButton } from './PublicCallApplyButton';

interface PublicCallDetailsHeroProps {
  call: Call;
}

export const PublicCallDetailsHero: FC<PublicCallDetailsHeroProps> = ({
  call,
}) => {
  const status = useMemo(() => getCallStatus(call), [call]);

  return (
    <PublicDashboardHero
      logo={undefined}
      logoAlt={call.name}
      logoBottomLabel={translate('Call')}
      logoBottomClass="bg-secondary"
      logoTopLabel={call.state}
      logoTopClass={'bg-' + status.color}
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
          <PublicCallApplyButton call={call} />
        </div>
      }
      quickFooterClassName="justify-content-center"
    >
      {call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />}
    </PublicDashboardHero>
  );
};
