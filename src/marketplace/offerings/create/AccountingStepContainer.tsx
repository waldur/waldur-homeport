import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import {
  showComponentsList,
  showOfferingLimits,
} from '@waldur/marketplace/common/registry';
import { RootState } from '@waldur/store/reducers';

import {
  removeOfferingComponent,
  removeOfferingQuotas,
} from '../store/actions';
import {
  getType,
  getOfferingComponents,
  getOffering,
} from '../store/selectors';

import { AccountingStep } from './AccountingStep';

const mapStateToProps = (state: RootState) => {
  const type = getType(state);
  const showComponents = type && showComponentsList(type);
  const showLimits = type && showOfferingLimits(type);
  const builtinComponents = type && getOfferingComponents(state, type);
  const isUpdatingOffering = getOffering(state).isUpdatingOffering;
  return {
    showComponents,
    type,
    builtinComponents,
    showLimits,
    isUpdatingOffering,
  };
};

const mapStateToDispatch = {
  removeOfferingComponent,
  removeOfferingQuotas,
};

const connector = compose(
  connect(mapStateToProps, mapStateToDispatch),
  withTranslation,
);

export const AccountingStepContainer = connector(AccountingStep);
