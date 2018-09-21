import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { getOfferingTypes, showOfferingOptions } from '@waldur/marketplace/common/registry';

import { OfferingConfigureStep } from './OfferingConfigureStep';
import { getCategory, getCategories, getType } from './store/selectors';

const mapStateToProps = state => {
  const props: any = {
    category: getCategory(state),
    offeringTypes: getOfferingTypes(),
    categories: getCategories(state),
  };
  const type = getType(state);
  if (type) {
    props.showOptions = showOfferingOptions(type);
  }
  return props;
};

const connector = compose(withTranslation, connect(mapStateToProps));

export const OfferingConfigurationContainer = connector(OfferingConfigureStep);
