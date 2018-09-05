import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';

import { $state } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { getOfferingTypes, showOfferingOptions } from '@waldur/marketplace/common/registry';
import { connectAngularComponent } from '@waldur/store/connect';
import { getCustomer } from '@waldur/workspace/selectors';

import { FORM_ID } from './constants';
import { OfferingCreateDialog } from './OfferingCreateDialog';
import { setStep } from './store/actions';
import { getStep } from './store/selectors';
import { createOffering } from './utils';

const OfferingCreateController = props => (
  <OfferingCreateDialog
    loadCategories={() => api.getCategories().then(options => ({ options }))}
    createOffering={request => createOffering(props, request)}
    gotoOfferingList={() => $state.go('marketplace-vendor-offerings')}
    offeringTypes={getOfferingTypes()}
    {...props}
  />
);

const selector = formValueSelector(FORM_ID);

const mapStateToProps = state => {
  const result: any = {
    customer: getCustomer(state),
    category: selector(state, 'category'),
    step: getStep(state),
  };
  const type = selector(state, 'type');
  if (type) {
    result.showOptions = showOfferingOptions(type.value);
  }
  return result;
};

const connector = connect(mapStateToProps, { setStep });

const enhance = compose(
  connector,
  withTranslation,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
    destroyOnUnmount: false,
  }),
);

const OfferingCreateContainer = enhance(OfferingCreateController);

export default connectAngularComponent(OfferingCreateContainer);
