import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { $state } from '@waldur/core/services';
import * as actions from '@waldur/marketplace/offerings/store/actions';

import { mergeProps } from '../create/OfferingCreateContainer';
import { updateOffering, FORM_ID } from '../store/constants';
import {
  getStep,
  isOfferingManagementDisabled,
  isLoading,
  isLoaded,
  isErred,
} from '../store/selectors';
import { OfferingStep } from '../types';

import { OfferingUpdateDialog } from './OfferingUpdateDialog';
import { getInitialValues } from './utils';

const mapStateToProps = state => ({
  step: getStep(state),
  disabled: isOfferingManagementDisabled(state),
  initialValues: getInitialValues(state),
  loading: isLoading(state),
  loaded: isLoaded(state),
  erred: isErred(state),
});

const mapDispatchToProps = dispatch => ({
  updateOffering: data =>
    updateOffering(
      {
        ...data,
        offeringUuid: $state.params.offering_uuid,
      },
      dispatch,
    ),
  loadOffering: offeringUuid =>
    dispatch(actions.loadOfferingStart(offeringUuid)),
  setStep: (step: OfferingStep) => dispatch(actions.setStep(step)),
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
