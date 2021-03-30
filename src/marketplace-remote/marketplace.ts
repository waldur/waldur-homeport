import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { COMMON_OPTIONS } from '@waldur/support/marketplace';

registerOfferingType({
  type: 'Waldur.RemoteOffering',
  get label() {
    return translate('Remote offering');
  },
  ...COMMON_OPTIONS,
});
