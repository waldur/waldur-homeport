import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { post } from '@waldur/core/api';
import { FormContainer, SelectField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

export const UserAgreementCreateDialog = connect((state: RootState) => ({
  formValues: getFormValues('UserAgreementCreateForm')(state),
}))(
  reduxForm<any, { resolve: { refetch }; formValues: any }>({
    form: 'UserAgreementCreateForm',
  })(({ submitting, handleSubmit, resolve }) => {
    const dispatch = useDispatch();
    const callback = async (formValues) => {
      try {
        await post('/user-agreements/', {
          agreement_type: formValues.agreement_type.value,
          content: formValues.content,
        });

        dispatch(showSuccess(translate('User agreement has been created')));
        dispatch(closeModalDialog());
        await resolve.refetch();
      } catch (error) {
        dispatch(
          showErrorResponse(
            error,
            translate('Unable to create a user agreement.'),
          ),
        );
      }
    };

    return (
      <form onSubmit={handleSubmit(callback)}>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Create a user agreements')}</h2>
        </Modal.Header>
        <FormContainer submitting={submitting}>
          <SelectField
            name="agreement_type"
            label={translate('Agreement type')}
            required={true}
            options={[
              { label: translate('Privacy policy'), value: 'PP' },
              { label: translate('Terms of service'), value: 'TOS' },
            ]}
          />

          <TextField name="content" label={translate('Content')} />
          <div className="mb-5 text-end">
            <SubmitButton submitting={submitting} label={translate('Save')} />
          </div>
        </FormContainer>
      </form>
    );
  }),
);
