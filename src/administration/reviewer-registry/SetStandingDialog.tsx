import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  ReviewerRegistry,
  reviewerRegistrySetStanding,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { RadioGroup, SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getStandingLabel } from '@/reviewer/ReviewerStandingBadge';

interface FormValues {
  standing: string;
  reason?: string;
}

/**
 * Staff set a reviewer's standing. A suspended or blocked reviewer takes on no
 * new review work; nothing they hold is deleted.
 */
export const SetStandingDialog: FC<{
  resolve: { reviewer: ReviewerRegistry; refetch(): void };
}> = ({ resolve: { reviewer, refetch } }) => {
  const save = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      reviewerRegistrySetStanding({
        path: { uuid: reviewer.uuid },
        body: {
          standing: values.standing as any,
          reason: values.standing === 'active' ? '' : values.reason || '',
        },
      }),
    successMessage: translate('The standing has been saved.'),
    errorMessage: translate('Unable to save the standing.'),
    refetch,
  });
  return (
    <Form<FormValues>
      initialValues={{
        standing: reviewer.standing,
        reason: reviewer.standing_reason,
      }}
      onSubmit={(values) => save.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Set standing of {name}', {
              name: reviewer.user_full_name,
            })}
            subtitle={translate(
              'A suspended or blocked reviewer is no longer invited or offered reviews and cannot accept pending ones. Work already accepted stays.',
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Save')}
                />
              </>
            }
          >
            <RadioGroup
              name="standing"
              label={translate('Standing')}
              choices={['active', 'suspended', 'blocked'].map((value) => ({
                value,
                label: getStandingLabel(value),
              }))}
              validate={required}
              required
            />
            {values.standing !== 'active' && (
              <TextGroup
                name="reason"
                label={translate('Reason')}
                description={translate(
                  'Recorded with the change and in the event log; not shown to the reviewer.',
                )}
                validate={required}
                required
                spaceless
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
