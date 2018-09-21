import { connect } from 'react-redux';
import { isInvalid, isSubmitting } from 'redux-form';

import { $state } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';

import { ActionButtons } from './ActionButtons';
import { setStep } from './store/actions';
import { FORM_ID } from './store/constants';
import { getStep } from './store/selectors';
import { OfferingStep } from './types';

const mapStateToProps = state => ({
  step: getStep(state),
  invalid: isInvalid(FORM_ID)(state),
  submitting: isSubmitting(FORM_ID)(state),
});

const mapDispatchToProps = dispatch => ({
  setStep: (step: OfferingStep) => dispatch(setStep(step)),
  gotoOfferingList: () => $state.go('marketplace-vendor-offerings'),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

export const ActionButtonsContainer = connector(withTranslation((ActionButtons)));
