import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { INSTANCE_TYPE } from '../constants';

import { instanceSerializer } from './serializers';

const OpenstackInstanceDetails = lazyComponent(() =>
  import('./OpenstackInstanceDetails').then((module) => ({
    default: module.OpenstackInstanceDetails,
  })),
);
const OpenstackInstanceOrder = lazyComponent(() =>
  import('./OpenstackInstanceOrder').then((module) => ({
    default: module.OpenstackInstanceOrder,
  })),
);
const CheckoutSummary = lazyComponent(() =>
  import('./deploy/CheckoutSummary').then((module) => ({
    default: module.CheckoutSummary,
  })),
);

export const OpenStackInstanceOffering: OfferingConfiguration = {
  type: INSTANCE_TYPE,
  get label() {
    return translate('OpenStack instance');
  },
  orderFormComponent: OpenstackInstanceOrder,
  detailsComponent: OpenstackInstanceDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer: instanceSerializer,
  disableOfferingCreation: true,
};
