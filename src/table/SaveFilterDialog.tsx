import { useCallback } from 'react';
import { reduxForm } from 'redux-form';

import { required } from '@/core/validators';
import { StringField, SubmitButton } from '@/form';
import { FormContainer } from '@/form/FormContainer';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showSuccess } from '@/store/notify';

interface SaveFilterDialogProps {
  resolve: {
    saveFilter(name, update: boolean): void;
  };
}

export const SaveFilterDialog = reduxForm<{ name }, SaveFilterDialogProps>({
  form: 'tableSaveFilterForm',
})((props) => {
  const isEdit = Boolean(props.initialValues);

  const callback = useCallback(
    (formData: { name }, dispatch) => {
      props.resolve.saveFilter(formData.name, isEdit);
      if (!isEdit) {
        dispatch(showSuccess(translate('Filter saved')));
      } else {
        dispatch(showSuccess(translate('Filter updated successfully')));
      }
      dispatch(closeModalDialog());
    },
    [props.resolve.saveFilter],
  );

  return (
    <form onSubmit={props.handleSubmit(callback)}>
      <ModalDialog
        title={isEdit ? translate('Update filter') : translate('Save filter')}
        subtitle={translate('Filters can be saved and reused on any pages')}
        footer={
          <>
            <CloseDialogButton className="flex-equal" />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Update') : translate('Save')}
              className="btn btn-primary flex-equal"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <StringField
            name="name"
            label={translate('Filter name')}
            placeholder={translate('e.g. New filter')}
            required={true}
            validate={required}
            spaceless
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
