import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { $state } from '@waldur/core/services';
import * as actions from '@waldur/marketplace/offerings/store/actions';
import { connectAngularComponent } from '@waldur/store/connect';

import { updateOffering, OFFERING_UPDATE_FORM } from '../store/constants';
import { getStep, isOfferingManagementDisabled, isLoading, isLoaded, isErred } from '../store/selectors';
import { getOffering } from '../store/selectors';
import { OfferingUpdateDialog } from './OfferingUpdateDialog';

const mapStateToProps = state => ({
  step: getStep(state),
  disabled: isOfferingManagementDisabled(state),
  initialValues: {
    name: getOffering(state).offering.name,
    description: getOffering(state).offering.description,
    native_name: getOffering(state).offering.native_name,
    native_description: getOffering(state).offering.native_description,
    thumbnail: getOffering(state).offering.thumbnail,
  },
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
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: OFFERING_UPDATE_FORM,
    enableReinitialize: true,
  }),
);

const OfferingUpdateContainer = enhance(OfferingUpdateDialog);

export default connectAngularComponent(OfferingUpdateContainer);
