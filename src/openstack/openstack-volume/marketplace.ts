import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { VOLUME_TYPE } from '../constants';

const CheckoutSummary = lazyComponent(() =>
  import('../openstack-instance/deploy/CheckoutSummary').then((module) => ({
    default: module.CheckoutSummary,
  })),
);
const OpenstackVolumeDetails = lazyComponent(() =>
  import('./OpenstackVolumeDetails').then((module) => ({
    default: module.OpenstackVolumeDetails,
  })),
);
const OpenstackVolumeOrder = lazyComponent(() =>
  import('./deploy/OpenstackVolumeOrder').then((module) => ({
    default: module.OpenstackVolumeOrder,
  })),
);

const serializer = (attrs) => ({
  ...attrs,
  type: attrs.type && attrs.type.value,
});

export const OpenStackVolumeOffering: OfferingConfiguration = {
  type: VOLUME_TYPE,
  get label() {
    return translate('OpenStack volume');
  },
  orderFormComponent: OpenstackVolumeOrder,
  detailsComponent: OpenstackVolumeDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer,
  disableOfferingCreation: true,
};
