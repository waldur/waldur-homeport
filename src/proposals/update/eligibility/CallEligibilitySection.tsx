import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { proposalProtectedCallsPartialUpdate } from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import { AlertItem } from '@/core/AlertItem';
import { EligibilityRestrictionFormItems } from '@/core/restrictions';
import { EditFieldProvider } from '@/form/editFields';
import FormTable from '@/form/FormTable';
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
    'Restricts who may submit a proposal. Email patterns, user affiliations and identity sources form a single group: an applicant matching any one value in it passes. Nationalities and organization types are each checked on top of that, and every assurance level listed is required. A field left empty is not checked, and only attributes this deployment collects are listed.',
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
    <FormTable.Card
      title={
        <>
          {translate('Applicant eligibility')}{' '}
          <Tooltip label={getEligibilityTooltip()}>
            <QuestionIcon size={20} weight="fill" className="mx-2 text-muted" />
          </Tooltip>
        </>
      }
      className="card-bordered mb-5"
    >
      <AlertItem
        variant="info"
        className="mb-5"
        title={translate('Checked when a proposal is created')}
        body={translate(
          'Drafts started before a restriction was added are not re-checked, and eligibility does not limit who may join the project once the proposal is granted. Values are matched exactly against what the identity provider sends: a scoped affiliation arrives looking like faculty@university.example.',
        )}
      />
      <EditFieldProvider
        scope={call}
        callback={updateCall}
        readOnlyReason={isReadOnly ? getCallReadOnlyReason(call) : undefined}
      >
        <FormTable>
          <EligibilityRestrictionFormItems disabled={isReadOnly} />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
