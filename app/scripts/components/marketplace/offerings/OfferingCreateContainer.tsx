import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';

import { withTranslation, translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';
import { showSuccess } from '@waldur/store/coreSaga';
import { getCustomer } from '@waldur/workspace/selectors';

import * as api from './api';
import { OfferingCreateDialog } from './OfferingCreateDialog';

const OfferingCreateController = props => (
  <OfferingCreateDialog
    languageChoices={[
      {label: 'English', value: 'en'},
      {label: 'Estonian', value: 'et'},
    ]}
    loadCategories={() => api.loadCategories().then(options => ({ options }))}
    createOffering={request => {
      const {
        name,
        description,
        thumbnail,
        category,
        preferred_language,
        native_name,
        native_description,
        ...attributes } = request;
      const params = {
        name,
        description,
        thumbnail,
        preferred_language: preferred_language ? preferred_language.value : undefined,
        native_name,
        native_description,
        category: category.url,
        customer: props.customer.url,
        attributes,
      };
      return api.createOffering(params).then(() => {
        props.dispatch(closeModalDialog());
        props.dispatch(showSuccess(translate('Offering has been created')));
      });
    }}
    {...props}
  />
);

const selector = formValueSelector('marketplaceOfferingCreate');

const mapStateToProps = state => {
  return {
    customer: getCustomer(state),
    category: selector(state, 'category'),
    preferred_language: selector(state, 'preferred_language'),
  };
};

const connector = connect(mapStateToProps);

const enhance = compose(
  connector,
  withTranslation,
  reduxForm({form: 'marketplaceOfferingCreate'}),
);

const OfferingCreateContainer = enhance(OfferingCreateController);

export default connectAngularComponent(OfferingCreateContainer);
