import { CalendarBlankIcon, CheckIcon, XIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProtectedRound } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { Link } from '@waldur/core/Link';
import { PublicDashboardHero } from '@waldur/dashboard/hero/PublicDashboardHero';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import { PublicCallApplyButton } from '../details/PublicCallApplyButton';
import { Call } from '../types';
import { getRoundStatus } from '../utils';

import { RoundPageHeaderBody } from './RoundPageHeaderBody';

interface RoundPageHeroProps {
  round: ProtectedRound;
  call: Call;
}

export const RoundPageHero: FC<RoundPageHeroProps> = ({ round, call }) => {
  const customer = useSelector(getCustomer);
  const status = useMemo(() => getRoundStatus(round), [round]);
  return (
    <div className="container-fluid my-5">
      <PublicDashboardHero
        hideQuickSection
        logo={customer?.image}
        logoAlt={round.uuid}
        logoCircle
        cardBordered
        title={
          <>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h3 className="mb-0 me-2">{round.name}</h3>
              <Badge
                variant={status.color}
                outline
                pill
                size="sm"
                leftIcon={
                  status.value === 'scheduled' ? (
                    <CalendarBlankIcon weight="bold" />
                  ) : status.value === 'ended' ? (
                    <XIcon weight="bold" />
                  ) : (
                    <CheckIcon weight="bold" />
                  )
                }
              >
                {status.label}
              </Badge>
            </div>
            <p className="mb-0 text-muted">
              {translate('Part of {name}', { name: call.name })}
            </p>
          </>
        }
        actions={
          <>
            <PublicCallApplyButton call={call} round={round} />
            <Link
              state="protected-call.main"
              params={{ call_uuid: call.uuid }}
              label={translate('See call')}
              className="btn btn-secondary"
            />
          </>
        }
      >
        <RoundPageHeaderBody round={round} />
      </PublicDashboardHero>
    </div>
  );
};
