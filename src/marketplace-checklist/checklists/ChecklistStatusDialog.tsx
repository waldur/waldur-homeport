import { FC } from 'react';
import { Field, Form } from 'react-final-form';

import { required } from '@/core/validators';
import { SelectField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useModal } from '@/modal/hooks';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/hooks';

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
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();

  // FIX THIS: not available atm
  const onSubmit = async (formData) => {
    try {
      await Promise.resolve({
        path: { uuid: checklistUuid },
        body: { status: formData.status },
        data: 'test',
      }).then((response) => response.data);

      refetch();
      showSuccess(translate('Checklist status has been updated.'));
      closeDialog();
    } catch (e) {
      showErrorResponse(e, translate('Unable to update checklist status.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change status')}
            closeButton
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
