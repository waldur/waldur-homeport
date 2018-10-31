import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, change } from 'redux-form';

import { $state } from '@waldur/core/services';
import { connectAngularComponent } from '@waldur/store/connect';

import { loadDataStart, setStep } from '../store/actions';
import { FORM_ID, createOffering } from '../store/constants';
import { getStep, isLoading, isLoaded, isOfferingManagementDisabled, isErred } from '../store/selectors';
import { OfferingStep, STEPS } from '../types';
import { OfferingCreateDialog } from './OfferingCreateDialog';

import { offeringCreateFormSelector } from './selectors';

const mapStateToProps = state => ({
  step: getStep(state),
  loading: isLoading(state),
  loaded: isLoaded(state),
  erred: isErred(state),
  disabled: isOfferingManagementDisabled(state),
  thumbnail: offeringCreateFormSelector(state, 'thumbnail'),
});

const mapDispatchToProps = dispatch => ({
  createOffering: data => createOffering(data, dispatch),
  loadData: () => dispatch(loadDataStart()),
  setStep: (step: OfferingStep) => dispatch(setStep(step)),
  removeThumbnail: () => dispatch(change(FORM_ID, 'thumbnail', '')),
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  goBack() {
    if (stateProps.step === STEPS[0]) {
      $state.go('marketplace-vendor-offerings');
    } else {
      dispatchProps.setStep(STEPS[STEPS.indexOf(stateProps.step) - 1]);
    }
  },
  goNext() {
    dispatchProps.setStep(STEPS[STEPS.indexOf(stateProps.step) + 1]);
  },
  isLastStep: stateProps.step === STEPS[STEPS.length - 1],
});

const connector = connect(mapStateToProps, mapDispatchToProps, mergeProps);

const enhance = compose(
  connector,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
    destroyOnUnmount: false,
  }),
);

const OfferingCreateContainer = enhance(OfferingCreateDialog);

export default connectAngularComponent(OfferingCreateContainer);
