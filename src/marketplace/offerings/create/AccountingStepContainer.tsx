import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { showComponentsList } from '@waldur/marketplace/common/registry';

import { getType } from '../store/selectors';
import { AccountingStep } from './AccountingStep';

const mapStateToProps = state => {
  const type = getType(state);
  const showComponents = type && showComponentsList(type);
  return {showComponents, type};
};

const connector = compose(withTranslation, connect(mapStateToProps));

export const AccountingStepContainer = connector(AccountingStep);
