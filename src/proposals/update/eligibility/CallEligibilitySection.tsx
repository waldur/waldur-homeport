import { FC } from 'react';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { HelpIcon, PropertyCard, PropertyList } from 'waldur-ui';

import { EligibilityRestrictionFormItems } from '@/core/restrictions';
import { EditFieldProvider } from '@/form/editFields';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

interface CallEligibilitySectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

/** The backend checks these fields as two groups: email patterns, affiliations
 * and identity sources are one OR group, while each configured AAI field is a
 * further requirement on top of it (validate_user_restrictions). Said plainly
 * here because the wrong reading -- every field an independent allow-list --
 * produces a call nobody can apply to. */
const getEligibilityTooltip = () =>
  translate(
    'Restricts who may submit a proposal. Email patterns, user affiliations and identity sources form a single group: an applicant matching any one value in it passes. Nationalities and organization types are each checked on top of that, and every assurance level listed is required. A field left empty is not checked, and only attributes this deployment collects are listed. An applicant is checked when a proposal is created.',
  );

export const CallEligibilitySection: FC<CallEligibilitySectionProps> = ({
  call,
  refetch,
  isReadOnly,
}) => {
  const { mutateAsync: updateCall } = useManagedMutation({
    mutationFn: (formData: Record<string, any>) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body: formData,
      }),
    successMessage: translate('Applicant eligibility has been updated.'),
    errorMessage: translate('Unable to update applicant eligibility.'),
    onSuccess: () => refetch(),
    closeModal: false,
  });

  return (
    <PropertyCard
      bordered
      title={
        <>
          {translate('Applicant eligibility')}{' '}
          <HelpIcon
            label={getEligibilityTooltip()}
            size={20}
            className="mx-1.5"
          />
        </>
      }
      className="mb-4"
    >
      <p className="text-quaternary pt-4 mb-0">
        {translate(
          'Drafts started before a rule was added are not re-checked, and the rules do not limit who may join the project once the proposal is granted.',
        )}
      </p>
      <EditFieldProvider
        scope={call}
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
