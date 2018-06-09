import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, InjectedFormProps } from 'redux-form';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';

import * as constants from './constants';
import { CustomerCreatePrompt } from './CustomerCreatePrompt';
import { getOwnerCanRegisterProvider, getOwnerCanRegisterExpert } from './selectors';
import * as utils from './utils';

interface PureCustomerCreatePromptContainerProps extends TranslateProps, InjectedFormProps {
  canRegisterProvider: boolean;
  canRegisterExpert: boolean;
  closeModal(): void;
  onSubmit(data: { [key: string]: string }): void;
}

export const PureCustomerCreatePromptContainer = (props: PureCustomerCreatePromptContainerProps) => (<CustomerCreatePrompt {...props} />);

const mapStateToProps = state => ({
  canRegisterProvider: getOwnerCanRegisterProvider(state),
  canRegisterExpert: getOwnerCanRegisterExpert(state),
});

const mapDispatchToProps = dispatch => ({
  closeModal: (): void => dispatch(closeModalDialog),
  onSubmit: data => utils.validate(data).then(values => {
    dispatch(closeModalDialog());
    dispatch(openModalDialog('customer-create-dialog', {
      resolve: {
        role: values[constants.FIELD_NAMES.role],
      },
    }));
  }),
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

export const CustomerCreatePromptContainer = enhance(PureCustomerCreatePromptContainer);

export default connectAngularComponent(CustomerCreatePromptContainer, ['resolve']);
