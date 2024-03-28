import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { VOLUME_TYPE } from '../constants';

const CheckoutSummary = lazyComponent(
  () => import('./deploy/CheckoutSummary'),
  'CheckoutSummary',
);
const OpenstackVolumeDetails = lazyComponent(
  () => import('./OpenstackVolumeDetails'),
  'OpenstackVolumeDetails',
);
const OpenstackVolumeOrder = lazyComponent(
  () => import('./deploy/OpenstackVolumeOrder'),
  'OpenstackVolumeOrder',
);

const serializer = (attrs) => ({
  ...attrs,
  type: attrs.type && attrs.type.value,
});

registerOfferingType({
  type: VOLUME_TYPE,
  get label() {
    return translate('OpenStack volume');
  },
  orderFormComponent: OpenstackVolumeOrder,
  detailsComponent: OpenstackVolumeDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer,
  disableOfferingCreation: true,
  allowToUpdateService: true,
});
