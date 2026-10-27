import { FC, useMemo } from 'react';

import { AlertItem } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { translate } from '@/i18n';
import { getArchivedCallNotice, getCallStatus } from '@/proposals/utils';

import { CallProposalsButton } from '../CallProposalsButton';
import { Call } from '../types';

import { CallDetailsHeaderBody } from './CallDetailsHeaderBody';
import { PublicCallApplyButton } from './PublicCallApplyButton';
import { usePublicCallApply } from './usePublicCallApply';

interface PublicCallDetailsHeroProps {
  call: Call;
}

export const PublicCallDetailsHero: FC<PublicCallDetailsHeroProps> = ({
  call,
}) => {
  const status = useMemo(() => getCallStatus(call), [call]);
  // Shares the Apply button's eligibility query, so no second request.
  const { hidden, ineligible } = usePublicCallApply(call);

  return (
    <PublicDashboardHero
      logo={undefined}
      logoAlt={call.name}
      logoCircle
      cardBordered
      title={
        <>
          <div className="flex flex-wrap gap-1.5 items-center">
            <h3 className="mb-0 leading-none">{call.name}</h3>
            <StateIndicator
              variant={status.color}
              label={status.label}
              tone="outline"
              shape="pill"
            />
          </div>
          <p className="text-quaternary text-xs mb-0">{call.customer_name}</p>
        </>
      }
      quickBody={
        // An archived call keeps its rounds for the record; their dates
        // would read as an open call, so the applicant is told it is closed.
        call.state === 'archived' ? (
          <p className="text-danger">{getArchivedCallNotice()}</p>
        ) : (
          call.rounds.length > 0 && <CallDetailsHeaderBody call={call} />
        )
      }
      quickActions={
        <div className="flex flex-col flex-wrap gap-1.5">
          <PublicCallApplyButton call={call} size="lg" />
          <CallProposalsButton call={call} />
        </div>
      }
      quickFooter={
        // Said out loud, not only in the disabled button's tooltip: an
        // applicant who cannot apply should not have to hover to learn why.
        !hidden &&
        ineligible && (
          <AlertItem
            type="floating"
            variant="warning"
            title={translate('You are not eligible to apply to this call.')}
            body={translate(
              'Your account does not satisfy the applicant eligibility requirements of this call.',
            )}
          />
        )
      }
      quickFooterClassName="justify-center"
    />
  );
};
