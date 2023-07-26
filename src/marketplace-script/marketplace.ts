import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

import { OFFERING_TYPE_CUSTOM_SCRIPTS } from './constants';

registerOfferingType({
  ...COMMON_OPTIONS,
  type: OFFERING_TYPE_CUSTOM_SCRIPTS,
  get label() {
    return translate('Custom scripts');
  },
  allowToUpdateService: true,
});
