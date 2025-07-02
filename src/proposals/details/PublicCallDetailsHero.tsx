import { FC, useMemo } from 'react';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { getCallStatus } from '@waldur/proposals/utils';

import { CallProposalsButton } from '../CallProposalsButton';
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
      quickBody={
        call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />
      }
      quickActions={
        <div className="d-flex flex-column flex-wrap gap-2">
          <PublicCallApplyButton call={call} />
          <CallProposalsButton call={call} />
        </div>
      }
      quickFooterClassName="justify-content-center"
    />
  );
};
