import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { INSTANCE_TYPE, SHARED_INSTANCE_TYPE } from '../constants';

import { instanceSerializer } from './serializers';

const OpenstackInstanceDetails = lazyComponent(
  () => import('./OpenstackInstanceDetails'),
  'OpenstackInstanceDetails',
);
const OpenstackInstanceOrder = lazyComponent(
  () => import('./OpenstackInstanceOrder'),
  'OpenstackInstanceOrder',
);
const CheckoutSummary = lazyComponent(
  () => import('./deploy/CheckoutSummary'),
  'CheckoutSummary',
);

registerOfferingType({
  type: INSTANCE_TYPE,
  get label() {
    return translate('OpenStack instance');
  },
  orderFormComponent: OpenstackInstanceOrder,
  detailsComponent: OpenstackInstanceDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer: instanceSerializer,
  disableOfferingCreation: true,
  allowToUpdateService: true,
});

registerOfferingType({
  type: SHARED_INSTANCE_TYPE,
  get label() {
    return translate('OpenStack shared instance');
  },
  orderFormComponent: OpenstackInstanceOrder,
  detailsComponent: OpenstackInstanceDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer: instanceSerializer,
  allowToUpdateService: true,
  providerType: 'OpenStackTenant',
});
