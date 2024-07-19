import { useCallback } from 'react';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { StringField, SubmitButton } from '@waldur/form';
import { FormContainer } from '@waldur/form/FormContainer';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showSuccess } from '@waldur/store/notify';

interface SaveFilterDialogProps {
  resolve: {
    saveFilter(name): void;
  };
}

export const SaveFilterDialog = reduxForm<{ name }, SaveFilterDialogProps>({
  form: 'tableSaveFilterForm',
})((props) => {
  const callback = useCallback(
    (formData: { name }, dispatch) => {
      props.resolve.saveFilter(formData.name);
      dispatch(showSuccess(translate('Filter saved')));
      dispatch(closeModalDialog());
    },
    [props.resolve.saveFilter],
  );
  return (
    <form onSubmit={props.handleSubmit(callback)}>
      <ModalDialog
        title={translate('Save filter')}
        subtitle={translate('Filters can be saved and reused on any pages')}
        headerClassName="border-0 pb-0"
        footerClassName="border-0 pt-0 gap-2"
        footer={
          <>
            <CloseDialogButton
              variant="outline-default"
              className="btn-outline flex-grow-1"
            />
            <SubmitButton
              disabled={props.invalid || !props.dirty}
              submitting={props.submitting}
              label={translate('Save')}
              className="btn btn-primary flex-grow-1"
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
          <StringField
            name="name"
            label={translate('Filter name')}
            placeholder={translate('e.g.') + ' ' + translate('New filter')}
            required={true}
            validate={required}
            spaceless
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
