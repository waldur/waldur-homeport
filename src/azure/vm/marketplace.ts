import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { AzureVirtualMachineDetails } from './AzureVirtualMachineDetails';
import { AzureVirtualMachineForm } from './AzureVirtualMachineForm';

registerOfferingType({
  type: 'Azure.VirtualMachine',
  get label() {
    return translate('Azure Virtual Machine');
  },
  component: AzureVirtualMachineForm,
  detailsComponent: AzureVirtualMachineDetails,
  providerType: 'Azure',
});
