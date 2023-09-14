import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OfferingConfigurationFormProps } from '@waldur/marketplace/types';

import { VOLUME_TYPE } from '../constants';

import { CheckoutSummary } from './deploy/CheckoutSummary';
import { deployOfferingSteps } from './deploy/steps';

const OpenstackVolumeDetails = lazyComponent(
  () => import('@waldur/openstack/openstack-volume/OpenstackVolumeDetails'),
  'OpenstackVolumeDetails',
);
const OpenstackVolumeCreateForm = lazyComponent<OfferingConfigurationFormProps>(
  () => import('./OpenstackVolumeCreateForm'),
  'OpenstackVolumeCreateForm',
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
  component: OpenstackVolumeCreateForm, // We can remove this line later. formSteps replaced
  detailsComponent: OpenstackVolumeDetails,
  checkoutSummaryComponent: CheckoutSummary,
  serializer,
  disableOfferingCreation: true,
  allowToUpdateService: true,
});
