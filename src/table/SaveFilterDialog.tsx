import { useCallback } from 'react';
import { Form } from 'react-final-form';

import { required } from '@/core/validators';
import { SubmitButton, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

interface SaveFilterDialogProps {
  resolve: {
    saveFilter(name: string, update: boolean): void;
  };
  initialValues?: { name: string };
}

export const SaveFilterDialog = (props: SaveFilterDialogProps) => {
  const { showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const isEdit = Boolean(props.initialValues);

  const callback = useCallback(
    (formData: { name: string }) => {
      props.resolve.saveFilter(formData.name, isEdit);
      if (!isEdit) {
        showSuccess(translate('Filter saved'));
      } else {
        showSuccess(translate('Filter updated successfully'));
      }
      closeDialog();
    },
    [props.resolve, showSuccess, closeDialog, isEdit],
  );

  return (
    <Form
      onSubmit={callback}
      initialValues={props.initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Update filter') : translate('Save filter')
            }
            subtitle={translate('Filters can be saved and reused on any pages')}
            footer={
              <>
                <CloseDialogButton className="flex-equal" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={isEdit ? translate('Update') : translate('Save')}
                  className="btn btn-primary flex-equal"
                />
              </>
            }
          >
            <div className="size-sm">
              <StringGroup
                name="name"
                label={translate('Filter name')}
                placeholder={translate('e.g. New filter')}
                required={true}
                validate={required}
                spaceless
                disabled={submitting}
              />
            </div>
          </ModalDialog>
        </form>
      )}
    />
  );
};
