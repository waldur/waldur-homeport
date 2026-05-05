import { FC } from 'react';
import { Field, Form } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface ChecklistStatusDialogProps {
  resolve: {
    checklistUuid?: string;
    refetch: () => void;
  };
  initialValues?: { status };
}

export const ChecklistStatusDialog: FC<ChecklistStatusDialogProps> = ({
  resolve: { checklistUuid, refetch },
  initialValues,
}) => {
  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      Promise.resolve({
        path: { uuid: checklistUuid },
        body: { status: formData.status },
        data: 'test',
      }).then((response) => response.data),
    successMessage: translate('Checklist status has been updated.'),
    errorMessage: translate('Unable to update checklist status.'),
    refetch,
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change status')}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={translate('Save')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <Field
              name="status"
              component={SelectField as any}
              options={[
                { label: 'Test', value: 'test' },
                { label: 'Test 2', value: 'test2' },
              ]}
              validate={required}
              simpleValue
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
