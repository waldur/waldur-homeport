import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { serializer } from '@waldur/support/serializer';

const OfferingConfigurationDetails = lazyComponent(
  () => import('@waldur/support/OfferingConfigurationDetails'),
  'OfferingConfigurationDetails',
);
const OfferingConfigurationForm = lazyComponent(
  () => import('@waldur/support/OfferingConfigurationForm'),
  'OfferingConfigurationForm',
);
const ScriptsForm = lazyComponent(() => import('./ScriptsForm'), 'ScriptsForm');

registerOfferingType({
  type: 'Marketplace.Script',
  get label() {
    return translate('Custom scripts');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  secretOptionsForm: ScriptsForm,
  serializer,
  showOptions: true,
  showComponents: true,
  allowToUpdateService: true,
});
