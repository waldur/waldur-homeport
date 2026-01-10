import { FC, useCallback } from 'react';
import { Form, Field } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  CallReviewerPool,
  callReviewerPoolsPartialUpdate,
} from 'waldur-js-client';

import { NumberField, SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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
  const dispatch = useDispatch();
  const { poolMember, refetch } = resolve;

  const handleSubmit = useCallback(
    async (values: FormValues) => {
      try {
        await callReviewerPoolsPartialUpdate({
          path: { uuid: poolMember.uuid },
          body: { max_assignments: values.max_assignments },
        });
        dispatch(
          showSuccess(translate('Reviewer capacity updated successfully.')),
        );
        refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(
          showErrorResponse(error, translate('Failed to update capacity.')),
        );
      }
    },
    [poolMember.uuid, refetch, dispatch],
  );

  return (
    <Form<FormValues>
      onSubmit={handleSubmit}
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
