import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import {
  UserAgreementsForm,
  UserAgreementsFormData,
} from '@waldur/administration/UserAgreementsForm';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

interface UserAgreementsEditDialogOwnProps {
  resolve: {
    initialValues: UserAgreementsFormData;
    refetch(): void;
  };
  formValues: UserAgreementsFormData;
}

export const UserAgreementsEditDialog = connect(
  (state: RootState, ownProps: UserAgreementsEditDialogOwnProps) => ({
    formValues: getFormValues('UserAgreementsForm')(state),
    initialValues: ownProps.resolve.initialValues,
  }),
)(
  reduxForm<UserAgreementsFormData, UserAgreementsEditDialogOwnProps>({
    form: 'UserAgreementsForm',
  })(({ submitting, formValues, handleSubmit, resolve, initialValues }) => {
    return (
      <form>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Edit user agreements')}</h2>
        </Modal.Header>
        <UserAgreementsForm
          submitting={submitting}
          formValues={formValues}
          handleSubmit={handleSubmit}
          initialValues={initialValues}
          refetch={resolve.refetch}
        />
      </form>
    );
  }),
);
