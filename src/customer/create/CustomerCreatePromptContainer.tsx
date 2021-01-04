import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, SubmissionError } from 'redux-form';

import { translate, withTranslation } from '@waldur/i18n';
import { renderServiceProvider } from '@waldur/marketplace/service-providers/selectors';
import { closeModalDialog } from '@waldur/modal/actions';
import { RootState } from '@waldur/store/reducers';

import { customerCreateDialog } from './actions';
import * as constants from './constants';
import { CustomerCreatePrompt } from './CustomerCreatePrompt';

const mapStateToProps = (state: RootState) => ({
  renderServiceProvider: renderServiceProvider(state),
});

const mapDispatchToProps = (dispatch) => ({
  closeModal: (): void => dispatch(closeModalDialog()),
  onSubmit: (data) => {
    if (!data[constants.FIELD_NAMES.role]) {
      throw new SubmissionError({
        _error: translate('Сhoose the role please'),
      });
    }

    dispatch(
      customerCreateDialog({
        role: data[constants.FIELD_NAMES.role],
      }),
    );
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
