import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { translate } from '@waldur/i18n';
import { getCallStatus } from '@waldur/proposals/utils';
import { router } from '@waldur/router';

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
          <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
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
      quickBody={
        call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />
      }
      quickActions={
        <div className="d-flex flex-column flex-wrap gap-2">
          <PublicCallApplyButton call={call} />
          <Button
            onClick={() =>
              router.stateService.go('proposals-call-proposals', {
                call: JSON.stringify(call),
              })
            }
            variant="light"
          >
            {translate('My Proposals')}
          </Button>
        </div>
      }
      quickFooterClassName="justify-content-center"
    />
  );
};
