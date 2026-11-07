import { FC } from 'react';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { AlertItem, HelpIcon, PropertyCard, PropertyList } from 'waldur-ui';

import { EligibilityRestrictionFormItems } from '@/core/restrictions';
import { EditFieldProvider } from '@/form/editFields';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

interface ReviewerEligibilitySectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

/**
 * Who may review for the call: the same kinds of rules as for applicants,
 * kept apart from them -- the people reviewing a call are rarely held to the
 * rules of those applying to it.
 */
export const ReviewerEligibilitySection: FC<
  ReviewerEligibilitySectionProps
> = ({ call, refetch, isReadOnly }) => {
  const { mutateAsync: updateCall } = useManagedMutation({
    mutationFn: (formData: Record<string, any>) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body: { reviewer_eligibility: formData } as any,
      }),
    successMessage: translate('Reviewer eligibility has been updated.'),
    errorMessage: translate('Unable to update reviewer eligibility.'),
    onSuccess: () => refetch(),
    closeModal: false,
  });

  return (
    <PropertyCard
      bordered
      title={
        <>
          {translate('Reviewer eligibility')}{' '}
          <HelpIcon
            label={translate(
              'Restricts who may review for the call, separately from who may apply. Read like applicant eligibility: email patterns, affiliations and identity sources form one group, and each configured AAI field is required on top. Empty fields are not checked.',
            )}
            size={20}
            className="mx-1.5"
          />
        </>
      }
      className="mb-4"
    >
      <AlertItem
        variant="info"
        className="mb-4"
        title={translate('Checked when a reviewer joins the call')}
        body={translate(
          'When a reviewer is invited to the pool, accepts an invitation, is suggested, or is given the call reviewer role. Reviewers already in the pool are not removed.',
        )}
      />
      <EditFieldProvider
        scope={call.reviewer_eligibility ?? {}}
        callback={updateCall}
        readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
      >
        <PropertyList>
          <EligibilityRestrictionFormItems disabled={isReadOnly} />
        </PropertyList>
      </EditFieldProvider>
    </PropertyCard>
  );
};
