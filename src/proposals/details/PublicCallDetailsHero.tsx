import { FC, useMemo } from 'react';

import { AlertItem } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';
import { PublicDashboardHero } from '@/dashboard/hero/PublicDashboardHero';
import { translate } from '@/i18n';
import { getCallStatus } from '@/proposals/utils';

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
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <h3 className="mb-0 lh-1">{call.name}</h3>
            <StateIndicator
              variant={status.color}
              label={status.label}
              tone="outline"
              shape="pill"
            />
          </div>
          <p className="text-muted fs-7 mb-0">{call.customer_name}</p>
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
      quickFooterClassName="justify-content-center"
    />
  );
};
