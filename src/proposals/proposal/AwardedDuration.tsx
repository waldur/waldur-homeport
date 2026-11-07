import { FC, useMemo } from 'react';
import { proposalProposalsSetAwardedDuration } from 'waldur-js-client';

import { PropertyItem, Select } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useCallAllowedDurations } from '@/proposals/callQueries';
import { formatPrepaidMonths } from '@/proposals/prepaidDuration';
import { Proposal } from '@/proposals/types';

import { useConfirmApplicantChange } from './actingForApplicant';

/**
 * The project length the award grants, for a call that lets the applicant
 * choose it from a list. The award starts with the applicant's choice; the
 * call manager may pick another listed length while the allocation decision
 * is open. Elsewhere it is read-only, beside the request where they differ.
 */
export const AwardedDuration: FC<{
  proposal: Pick<
    Proposal,
    | 'uuid'
    | 'state'
    | 'created_by_uuid'
    | 'call_uuid'
    | 'requested_duration_months'
    | 'awarded_duration_months'
  >;
  editable: boolean;
  refetch?: () => void;
}> = ({ proposal, editable, refetch }) => {
  const allowed = useCallAllowedDurations(proposal.call_uuid);
  const options = useMemo(
    () =>
      allowed.map((months) => ({
        value: months,
        label: formatPrepaidMonths(months),
      })),
    [allowed],
  );
  const { mutate, isPending } = useManagedMutation<any, any, number>({
    mutationFn: (months) =>
      proposalProposalsSetAwardedDuration({
        path: { uuid: proposal.uuid },
        body: { awarded_duration_months: months },
      }),
    successMessage: translate('The awarded duration has been updated.'),
    errorMessage: translate('Unable to update the awarded duration.'),
    refetch,
    closeModal: false,
  });

  const awarded = proposal.awarded_duration_months;
  const requested = proposal.requested_duration_months;
  const confirmChange = useConfirmApplicantChange(proposal);
  const change = async (months: number) => {
    if (months === awarded) return;
    const confirmed = await confirmChange(
      translate('Award {duration} instead of {current}.', {
        duration: formatPrepaidMonths(months),
        current: formatPrepaidMonths(awarded),
      }),
      { applicantTold: false, title: translate('Change the award') },
    );
    if (confirmed) mutate(months);
  };
  if (!awarded && !(editable && allowed.length)) {
    return null;
  }
  const differs = Boolean(awarded && requested && awarded !== requested);

  return (
    <PropertyItem
      variant="summary"
      label={translate('Awarded duration')}
      value={
        editable && allowed.length ? (
          <div style={{ maxWidth: 240 }}>
            <Select
              inputId="awarded_duration_months"
              aria-label={translate('Awarded duration')}
              options={options}
              value={options.find((option) => option.value === awarded)}
              onChange={(option: any) => option && change(option.value)}
              isClearable={false}
              isDisabled={isPending}
            />
          </div>
        ) : (
          <>
            {formatPrepaidMonths(awarded)}
            {differs && (
              <span className="text-quaternary ms-1.5 text-xs">
                {translate('Requested: {duration}', {
                  duration: formatPrepaidMonths(requested),
                })}
              </span>
            )}
          </>
        )
      }
    />
  );
};
