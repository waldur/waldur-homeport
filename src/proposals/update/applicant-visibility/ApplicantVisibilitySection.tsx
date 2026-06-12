import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Alert } from 'react-bootstrap';
import {
  CallApplicantVisibilityConfigRequest,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { UserAttributeVisibilityTable } from '@/marketplace/user-attributes/UserAttributeVisibilityTable';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';

interface ApplicantVisibilitySectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

const TITLE = (
  <>
    {translate('Applicant data visibility')}{' '}
    <Tip
      id="applicant-visibility-tip"
      label={translate(
        'Control which applicant fields are visible to reviewers during evaluation. When no custom configuration exists, the global default is applied.',
      )}
      className="mx-2 text-muted"
    >
      <QuestionIcon size={20} weight="fill" />
    </Tip>
  </>
);

export const ApplicantVisibilitySection: FC<
  ApplicantVisibilitySectionProps
> = ({ call, refetch, isReadOnly }) => {
  const config = call.applicant_visibility_config;
  const isDefault = Boolean(config?.is_default);

  const { mutateAsync: update } = useManagedMutation<
    any,
    any,
    Partial<CallApplicantVisibilityConfigRequest>
  >({
    mutationFn: (formData) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: call.uuid },
        body: { applicant_visibility_config: formData },
      }),
    refetch,
    successMessage: translate('Applicant visibility setting has been updated.'),
    errorMessage: translate('Unable to update setting.'),
  });

  return (
    <UserAttributeVisibilityTable
      title={TITLE}
      config={config as any}
      update={update}
      editGate="always"
      disabled={isReadOnly}
      className="card-bordered mb-5"
      emptyHint={
        isDefault ? (
          <Alert variant="info" className="mb-3">
            {translate(
              'Using global defaults. Saving any field will create a custom configuration for this call.',
            )}
          </Alert>
        ) : null
      }
    />
  );
};
