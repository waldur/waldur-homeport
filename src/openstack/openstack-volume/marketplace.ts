import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OpenstackVolumeCheckoutSummary } from '@waldur/openstack/openstack-volume/OpenstackVolumeCheckoutSummary';

import { OpenstackVolumeCreateForm } from './OpenstackVolumeCreateForm';

const serializer = attrs => ({
  ...attrs,
  size: attrs.size,
});

registerOfferingType({
  type: 'OpenStackTenant.Volume',
  get label() {
    return translate('OpenStack volume');
  },
  component: OpenstackVolumeCreateForm,
  checkoutSummaryComponent: OpenstackVolumeCheckoutSummary,
  serializer,
  disableOfferingCreation: true,
});
