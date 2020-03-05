import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import {
  showComponentsList,
  showOfferingLimits,
} from '@waldur/marketplace/common/registry';

import {
  removeOfferingComponent,
  removeOfferingQuotas,
} from '../store/actions';
import { getType, getComponents } from '../store/selectors';

import { AccountingStep } from './AccountingStep';

const mapStateToProps = state => {
  const type = getType(state);
  const showComponents = type && showComponentsList(type);
  const showLimits = type && showOfferingLimits(type);
  const builtinComponents = type && getComponents(state, type);
  return { showComponents, type, builtinComponents, showLimits };
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
