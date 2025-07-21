import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

import { OFFERING_TYPE_CUSTOM_SCRIPTS } from './constants';

export const ScriptOffering: OfferingConfiguration = {
  ...COMMON_OPTIONS,
  type: OFFERING_TYPE_CUSTOM_SCRIPTS,
  get label() {
    return translate('Custom scripts');
  },
};
