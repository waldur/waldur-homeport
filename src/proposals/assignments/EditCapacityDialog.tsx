import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  CallReviewerPool,
  callReviewerPoolsPartialUpdate,
} from 'waldur-js-client';

import { SubmitButton, NumberGroup } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Field } from '@/resource/summary';

interface EditCapacityDialogProps {
  resolve: {
    poolMember: CallReviewerPool;
    refetch: () => void;
  };
}

interface FormValues {
  max_assignments: number;
}

export const EditCapacityDialog: FC<EditCapacityDialogProps> = ({
  resolve,
}) => {
  const { poolMember, refetch } = resolve;

  const handleSubmitMutation = useManagedMutation<any, any, FormValues>({
    mutationFn: (values) =>
      callReviewerPoolsPartialUpdate({
        path: { uuid: poolMember.uuid },
        body: { max_assignments: values.max_assignments },
      }),
    successMessage: translate('Reviewer capacity updated successfully.'),
    errorMessage: translate('Failed to update capacity.'),
    refetch,
  });

  return (
    <Form<FormValues>
      onSubmit={(values) => handleSubmitMutation.mutateAsync(values)}
      initialValues={{ max_assignments: poolMember.max_assignments }}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit reviewer capacity')}
            footer={
              <>
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
                <CloseDialogButton />
              </>
            }
          >
            <div className="size-lg">
              <Field
                label={translate('Name')}
                value={poolMember.reviewer_name}
              />
              <Field
                label={translate('Email')}
                value={poolMember.reviewer_email}
              />
              <Field
                label={translate('Current assignments')}
                value={String(poolMember.current_assignments)}
              />

              <NumberGroup
                name="max_assignments"
                min={1}
                max={50}
                label={translate('Maximum assignments')}
                description={translate(
                  'The maximum number of proposals that can be assigned to this reviewer.',
                )}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
