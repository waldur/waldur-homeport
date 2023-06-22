import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import * as actions from '@waldur/marketplace/offerings/store/actions';
import { router } from '@waldur/router';
import { RootState } from '@waldur/store/reducers';

import { updateOffering, FORM_ID } from '../store/constants';
import {
  getStep,
  isOfferingManagementDisabled,
  getReadOnlyFields,
  isLoading,
  isLoaded,
  isErred,
} from '../store/selectors';
import { OfferingStep, STEPS } from '../types';

import { OfferingUpdateDialog } from './OfferingUpdateDialog';
import { getInitialValues } from './utils';

export const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  goBack() {
    if (stateProps.step === STEPS[0]) {
      router.stateService.go('marketplace-vendor-offerings');
    } else {
      dispatchProps.setStep(STEPS[STEPS.indexOf(stateProps.step) - 1]);
    }
  },
  goNext() {
    dispatchProps.setStep(STEPS[STEPS.indexOf(stateProps.step) + 1]);
  },
  isLastStep: stateProps.step === STEPS[STEPS.length - 1],
});

const mapStateToProps = (state: RootState) => ({
  step: getStep(state),
  disabled: isOfferingManagementDisabled(state),
  readOnlyFields: getReadOnlyFields(state),
  initialValues: getInitialValues(state),
  loading: isLoading(state),
  loaded: isLoaded(state),
  erred: isErred(state),
});

const mapDispatchToProps = (dispatch) => ({
  updateOffering: (data) =>
    updateOffering(
      {
        ...data,
        offeringUuid: router.globals.params.offering_uuid,
      },
      dispatch,
    ),
  loadOffering: (offeringUuid) =>
    dispatch(actions.loadOfferingStart(offeringUuid)),
  setStep: (step: OfferingStep) => dispatch(actions.setStep(step)),
  setIsUpdatingOffering: (state: boolean) =>
    dispatch(actions.isUpdatingOffering(state)),
});

const connector = connect(mapStateToProps, mapDispatchToProps, mergeProps);

const enhance = compose(
  connector,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
);

export const OfferingUpdateContainer = enhance(OfferingUpdateDialog);
