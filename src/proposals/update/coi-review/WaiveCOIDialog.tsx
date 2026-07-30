import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { ConflictOfInterest, conflictsOfInterestWaive } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SubmitButton, TextGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Field } from '@/resource/summary';

interface WaiveCOIDialogProps {
  resolve: {
    coi: ConflictOfInterest;
    fetch: () => void;
  };
}

export const WaiveCOIDialog: FC<WaiveCOIDialogProps> = ({ resolve }) => {
  const waivedMutation = useManagedMutation<
    any,
    any,
    { management_plan: string; review_notes: string }
  >({
    mutationFn: (formData) =>
      conflictsOfInterestWaive({
        path: { uuid: resolve.coi.uuid },
        body: {
          status: 'waived',
          management_plan: formData.management_plan,
          review_notes: formData.review_notes,
        },
      }),
    successMessage: translate('Conflict of interest waived.'),
    errorMessage: translate('Failed to waive conflict.'),
    refetch: resolve.fetch,
  });

  const initialValues = useMemo(
    () => ({
      management_plan: '',
      review_notes: '',
    }),
    [],
  );

  return (
    <Form
      onSubmit={waivedMutation.mutate}
      initialValues={initialValues}
      render={({ handleSubmit, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Waive conflict of interest')}
            bodyClassName="pt-0"
            footer={
              <>
                <CloseDialogButton disabled={waivedMutation.isPending} />
                <SubmitButton
                  submitting={waivedMutation.isPending}
                  disabled={invalid}
                  label={translate('Waive conflict')}
                />
              </>
            }
          >
            <p className="text-muted mb-4">
              {translate(
                'Waiving allows the reviewer to continue despite the conflict. A management plan is required to document how the conflict will be managed.',
              )}
            </p>

            <div className="mb-4">
              <Field
                label={translate('Reviewer')}
                value={resolve.coi.reviewer_name}
              />
              <Field
                label={translate('Proposal')}
                value={resolve.coi.proposal_name}
              />
              <Field
                label={translate('Conflict type')}
                value={resolve.coi.coi_type_display}
              />
            </div>

            <TextGroup
              name="management_plan"
              label={translate('Management plan')}
              placeholder={translate(
                'Describe how this conflict of interest will be managed...',
              )}
              description={translate(
                'Document the measures that will be taken to ensure fair and unbiased review.',
              )}
              rows={4}
              required={true}
              validate={required}
            />

            <TextGroup
              name="review_notes"
              label={translate('Review notes (optional)')}
              placeholder={translate('Additional notes...')}
              rows={2}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
