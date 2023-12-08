import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { VOLUME_TYPE } from '../constants';

import { CheckoutSummary } from './deploy/CheckoutSummary';
import { deployOfferingSteps } from './deploy/steps';

const OpenstackVolumeDetails = lazyComponent(
  () => import('@waldur/openstack/openstack-volume/OpenstackVolumeDetails'),
  'OpenstackVolumeDetails',
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
  formSteps: deployOfferingSteps,
  detailsComponent: OpenstackVolumeDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer,
  disableOfferingCreation: true,
  allowToUpdateService: true,
});
