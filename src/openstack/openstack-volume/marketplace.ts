import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

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
  // @ts-ignore
  detailsComponent: OpenstackVolumeDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer,
  disableOfferingCreation: true,
  allowToUpdateService: true,
};
