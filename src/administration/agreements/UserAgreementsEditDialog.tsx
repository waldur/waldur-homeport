import { Modal } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { patch } from '@waldur/core/api';
import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

interface UserAgreementsEditDialogOwnProps {
  resolve: {
    initialValues;
    refetch(): void;
  };
  formValues;
}

const agreementTypeLabelMap = {
  pp: translate('Privacy policy'),
  tos: translate('Terms of service'),
};

export const UserAgreementsEditDialog = connect(
  (state: RootState, ownProps: UserAgreementsEditDialogOwnProps) => ({
    formValues: getFormValues('UserAgreementsForm')(state),
    initialValues: ownProps.resolve.initialValues,
  }),
)(
  reduxForm<any, UserAgreementsEditDialogOwnProps>({
    form: 'UserAgreementsForm',
  })(({ submitting, handleSubmit, resolve, initialValues }) => {
    const dispatch = useDispatch();
    const callback = async (formValues) => {
      await patch(formValues.url, formValues);
      await resolve.refetch();
      dispatch(showSuccess(translate('User agreement was updated')));
      dispatch(closeModalDialog());
    };

    return (
      <form onSubmit={handleSubmit(callback)}>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Edit user agreement')}</h2>
        </Modal.Header>
        <FormContainer submitting={submitting}>
          <TextField
            label={
              agreementTypeLabelMap[initialValues.agreement_type.toLowerCase()]
            }
            name="content"
            style={{ height: '520px' }}
          />
          <div className="mb-5 text-end">
            <SubmitButton submitting={submitting} label={translate('Save')} />
          </div>
        </FormContainer>
      </form>
    );
  }),
);
