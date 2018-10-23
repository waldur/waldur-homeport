import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { getOfferingTypes, showOfferingOptions, getProviderType } from '@waldur/marketplace/common/registry';
import { findProvider } from '@waldur/providers/registry';

import { getType } from '../store/selectors';
import { ManagementStep } from './ManagementStep';

const mapStateToProps = state => {
  const props: any = {
    offeringTypes: getOfferingTypes(),
  };
  const type = getType(state);
  if (type) {
    props.showOptions = showOfferingOptions(type);
    const providerType = getProviderType(type);
    if (providerType) {
      const providerConfig = findProvider(providerType);
      props.serviceSettingsForm = providerConfig.component;
    }
  }
  return props;
};

const connector = compose(withTranslation, connect(mapStateToProps));

export const ManagementStepContainer = connector(ManagementStep);
