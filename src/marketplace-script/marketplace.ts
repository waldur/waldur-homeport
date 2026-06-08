import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';
import { COMMON_OPTIONS } from '@/support/marketplace';

import { OFFERING_TYPE_CUSTOM_SCRIPTS } from './constants';

const ScriptIntegrationSummary = lazyComponent(() =>
  import('@/marketplace/offerings/update/integration/ScriptIntegrationSummary').then(
    (module) => ({
      default: module.ScriptIntegrationSummary,
    }),
  ),
);

export const ScriptOffering: OfferingConfiguration = {
  ...COMMON_OPTIONS,
  type: OFFERING_TYPE_CUSTOM_SCRIPTS,
  get label() {
    return translate('Custom scripts');
  },
  provisioningConfigSection: ScriptIntegrationSummary,
};
