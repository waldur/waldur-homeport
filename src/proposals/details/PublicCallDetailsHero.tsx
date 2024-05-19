import { FC, useMemo } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
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
    <PublicDashboardHero2
      logo={undefined}
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
          <PublicCallApplyButton call={call} />
        </div>
      }
      quickFooterClassName="justify-content-center"
    >
      {call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />}
    </PublicDashboardHero2>
  );
};
