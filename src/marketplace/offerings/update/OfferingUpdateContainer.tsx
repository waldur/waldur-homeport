import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { $state } from '@waldur/core/services';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { connectAngularComponent } from '@waldur/store/connect';

import { updateOffering, FORM_ID } from '../store/constants';
import { getStep, isOfferingManagementDisabled, isLoading, isLoaded, isErred } from '../store/selectors';
import { getOffering, getCategories } from '../store/selectors';
import { OfferingStep } from '../types';
import { OfferingUpdateDialog } from './OfferingUpdateDialog';

const getInitialValues = state => {
  const offering = getOffering(state).offering;
  const categories = getCategories(state);
  return {
    name: offering.name,
    description: offering.description,
    full_description: offering.full_description,
    native_name: offering.native_name,
    native_description: offering.native_description,
    terms_of_service: offering.terms_of_service,
    thumbnail: offering.thumbnail,
    category: categories.find(category => category.uuid === offering.category_uuid),
  };
};

const mapStateToProps = state => ({
  step: getStep(state),
  disabled: isOfferingManagementDisabled(state),
  initialValues: getInitialValues(state),
  loading: isLoading(state),
  loaded: isLoaded(state),
  erred: isErred(state),
  isLastStep: true,
});

const mapDispatchToProps = dispatch => ({
  updateOffering: data => updateOffering({
    ...data,
    offeringUuid: $state.params.offering_uuid,
  }, dispatch),
  goBack() {
    $state.go('marketplace-vendor-offerings');
  },
  loadOffering: offeringUuid => dispatch(actions.loadOfferingStart(offeringUuid)),
  setStep: (step: OfferingStep) => dispatch(actions.setStep(step)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
);

const OfferingUpdateContainer = enhance(OfferingUpdateDialog);

export default connectAngularComponent(OfferingUpdateContainer);
