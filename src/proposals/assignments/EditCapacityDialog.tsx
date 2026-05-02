import { FC } from 'react';
import { Form, Field } from 'react-final-form';
import {
  CallReviewerPool,
  callReviewerPoolsPartialUpdate,
} from 'waldur-js-client';

import { NumberField, SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
            closeButton
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
            <FormContainer submitting={submitting} className="size-lg">
              <div className="mb-4">
                <strong>{poolMember.reviewer_name}</strong>
                <div className="text-muted">{poolMember.reviewer_email}</div>
              </div>

              <FormGroup label={translate('Current assignments')}>
                <div className="form-control-plaintext">
                  {poolMember.current_assignments}
                </div>
              </FormGroup>

              <FormGroup
                label={translate('Maximum assignments')}
                description={translate(
                  'The maximum number of proposals that can be assigned to this reviewer.',
                )}
              >
                <Field
                  name="max_assignments"
                  component={NumberField as any}
                  min={1}
                  max={50}
                />
              </FormGroup>
            </FormContainer>
          </ModalDialog>
        </form>
      )}
    />
  );
};
