import { triggerTransition } from '@uirouter/redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import store from '@waldur/store/store';

export const getFlowCreateAction = () => {
  if (!isFeatureVisible('marketplace-flows')) {
    return;
  }
  return {
    title: translate('Create resource'),
    onClick() {
      store.dispatch(triggerTransition('marketplace-landing-user', {}));
    },
  };
};
