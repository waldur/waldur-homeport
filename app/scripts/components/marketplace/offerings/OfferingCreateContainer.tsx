import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { reset } from 'redux-form';

import { format } from '@waldur/core/ErrorMessageFormatter';
import { $state } from '@waldur/core/services';
import { withTranslation, translate } from '@waldur/i18n';
import * as api from '@waldur/marketplace/common/api';
import { connectAngularComponent } from '@waldur/store/connect';
import { showSuccess, showError } from '@waldur/store/coreSaga';
import { getCustomer } from '@waldur/workspace/selectors';

import { OfferingCreateDialog } from './OfferingCreateDialog';
import { setStep } from './store/actions';
import { getStep } from './store/selectors';

const FORM_ID = 'marketplaceOfferingCreate';

const OfferingCreateController = props => (
  <OfferingCreateDialog
    loadCategories={() => api.getCategories().then(options => ({ options }))}
    createOffering={request => {
      const params = {
        ...request,
        category: request.category.url,
        customer: props.customer.url,
        attributes: JSON.stringify(request.attributes),
      };
      return api.createOffering(params).then(() => {
        props.dispatch(reset(FORM_ID));
        props.dispatch(setStep('Describe'));
        props.dispatch(showSuccess(translate('Offering has been created')));
        $state.go('marketplace-vendor-offerings');
      }).catch(response => {
        const errorMessage = `${translate('Unable to create offering.')} ${format(response)}`;
        props.dispatch(showError(errorMessage));
      });
    }}
    gotoOfferingList={() => $state.go('marketplace-vendor-offerings')}
    {...props}
  />
);

const selector = formValueSelector(FORM_ID);

const mapStateToProps = state => ({
  customer: getCustomer(state),
  category: selector(state, 'category'),
  step: getStep(state),
});

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
