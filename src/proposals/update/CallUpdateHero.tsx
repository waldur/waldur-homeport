import { FC, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PublicDashboardHero2 } from '@waldur/dashboard/hero/PublicDashboardHero2';
import { translate } from '@waldur/i18n';
import { getCallStatus } from '@waldur/proposals/utils';
import { router } from '@waldur/router';
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
    <PublicDashboardHero2
      logo={customer?.image}
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
      quickActions={
        <div className="d-flex flex-column flex-wrap gap-2">
          <CallActions call={call} refetch={refetch} />
          <Button
            onClick={() =>
              router.stateService.go('proposals-call-proposals', {
                call_uuid: call.uuid,
              })
            }
            variant="light"
          >
            {translate('My Proposals')}
          </Button>
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
