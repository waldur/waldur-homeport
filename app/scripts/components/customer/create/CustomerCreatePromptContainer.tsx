import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, SubmissionError } from 'redux-form';

import { translate, withTranslation } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';

import * as constants from './constants';
import { CustomerCreatePrompt } from './CustomerCreatePrompt';
import { getOwnerCanRegisterProvider, getOwnerCanRegisterExpert } from './selectors';

const mapStateToProps = state => ({
  canRegisterProvider: getOwnerCanRegisterProvider(state),
  canRegisterExpert: getOwnerCanRegisterExpert(state),
});

const mapDispatchToProps = dispatch => ({
  closeModal: (): void => dispatch(closeModalDialog()),
  onSubmit: data => {
    if (!data[constants.FIELD_NAMES.role]) {
      throw new SubmissionError({
        _error: translate('Сhoose the role please'),
      });
    }

    dispatch(closeModalDialog());
    dispatch(openModalDialog('customer-create-dialog', {
      resolve: {
        role: data[constants.FIELD_NAMES.role],
      },
      size: 'lg',
    }));
  },
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: constants.CUSTOMER_CHOICE_ROLE_FORM,
    initialValues: {
      [constants.FIELD_NAMES.role]: constants.ROLES.customer,
    },
  }),
  withTranslation,
);

export const CustomerCreatePromptContainer = enhance(CustomerCreatePrompt);

export default connectAngularComponent(CustomerCreatePromptContainer, ['resolve']);
