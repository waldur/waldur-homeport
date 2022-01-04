import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

import { REMOTE_OFFERING_TYPE } from './constants';

const RemoteOfferingSecretOptions = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "RemoteOfferingSecretOptions" */ './RemoteOfferingSecretOptions'
    ),
  'RemoteOfferingSecretOptions',
);

registerOfferingType({
  type: REMOTE_OFFERING_TYPE,
  get label() {
    return translate('Remote offering');
  },
  ...COMMON_OPTIONS,
  showOptions: false,
  showBackendId: true,
  secretOptionsForm: RemoteOfferingSecretOptions,
});
