import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

import { REMOTE_OFFERING_TYPE } from './constants';

registerOfferingType({
  type: REMOTE_OFFERING_TYPE,
  get label() {
    return translate('Remote offering');
  },
  providerType: 'Remote',
  ...COMMON_OPTIONS,
  showBackendId: true,
  allowToUpdateService: true,
});
