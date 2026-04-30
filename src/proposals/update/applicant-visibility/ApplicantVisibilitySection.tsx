import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  CallApplicantVisibilityConfigRequest,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { UserAttributeVisibilityTable } from '@/marketplace/user-attributes/UserAttributeVisibilityTable';
import { Call } from '@/proposals/types';
import { showErrorResponse, showSuccess } from '@/store/notify';

interface ApplicantVisibilitySectionProps {
  call: Call;
  refetch: () => void;
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
> = ({ call, refetch }) => {
  const dispatch = useDispatch();
  const config = call.applicant_visibility_config;
  const isDefault = Boolean(config?.is_default);

  const update = useCallback(
    async (formData: Partial<CallApplicantVisibilityConfigRequest>) => {
      try {
        await proposalProtectedCallsPartialUpdate({
          path: { uuid: call.uuid },
          body: { applicant_visibility_config: formData },
        });
        refetch();
        dispatch(
          showSuccess(
            translate('Applicant visibility setting has been updated.'),
          ),
        );
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to update setting.')));
        throw e;
      }
    },
    [call.uuid, refetch, dispatch],
  );

  return (
    <UserAttributeVisibilityTable
      title={TITLE}
      config={config as Record<string, boolean | undefined> | undefined}
      update={update}
      editGate="always"
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
