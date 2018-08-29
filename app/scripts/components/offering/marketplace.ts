import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OfferingConfigurationForm } from '@waldur/offering/OfferingConfigurationForm';

registerOfferingType({
  type: 'Support.OfferingTemplate',
  component: OfferingConfigurationForm,
});
