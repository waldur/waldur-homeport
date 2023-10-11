import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues, reduxForm } from 'redux-form';

import { CreateUserAgreementsForm } from '@waldur/administration/CreateUserAgreementsForm';
import { UserAgreementsFormData } from '@waldur/administration/UserAgreementsForm';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

export const UserAgreementCreateDialog = connect((state: RootState) => ({
  formValues: getFormValues('UserAgreementCreateForm')(state),
}))(
  reduxForm<
    UserAgreementsFormData,
    { resolve: { refetch }; formValues: UserAgreementsFormData }
  >({
    form: 'UserAgreementCreateForm',
  })(({ submitting, handleSubmit, resolve, formValues }) => {
    return (
      <form>
        <Modal.Header closeButton className="without-border">
          <h2 className="fw-bolder">{translate('Create a user agreements')}</h2>
        </Modal.Header>
        <CreateUserAgreementsForm
          submitting={submitting}
          formValues={formValues}
          handleSubmit={handleSubmit}
          refetch={resolve.refetch}
        />
      </form>
    );
  }),
);
