import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';
import { COMMON_OPTIONS } from '@/support/marketplace';

import { REMOTE_OFFERING_TYPE } from './constants';

const RemoteOfferingSecretOptions = lazyComponent(() =>
  import('./RemoteOfferingSecretOptions').then((module) => ({
    default: module.RemoteOfferingSecretOptions,
  })),
);

export const RemoteOffering: OfferingConfiguration = {
  type: REMOTE_OFFERING_TYPE,
  get label() {
    return translate('Remote offering');
  },
  ...COMMON_OPTIONS,
  showBackendId: true,
  provisioningConfigForm: RemoteOfferingSecretOptions,
};
