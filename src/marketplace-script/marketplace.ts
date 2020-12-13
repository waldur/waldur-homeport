import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { serializer } from '@waldur/offering/serializer';

const OfferingConfigurationDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingConfigurationDetails" */ '@waldur/offering/OfferingConfigurationDetails'
    ),
  'OfferingConfigurationDetails',
);
const OfferingConfigurationForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingConfigurationForm" */ '@waldur/offering/OfferingConfigurationForm'
    ),
  'OfferingConfigurationForm',
);
const ScriptsForm = lazyComponent(
  () => import(/* webpackChunkName: "ScriptsForm" */ './ScriptsForm'),
  'ScriptsForm',
);

registerOfferingType({
  type: 'Marketplace.Script',
  get label() {
    return translate('Devops-friendly offering');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  secretOptionsForm: ScriptsForm,
  serializer,
  showOptions: true,
  showComponents: true,
});
