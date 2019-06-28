import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { VMwareVirtualMachineForm } from './VMwareVirtualMachineForm';

const serializer = ({template, ...rest}) => ({
  template: template.url,
  ...rest,
});

registerOfferingType({
  type: 'VMware.VirtualMachine',
  get label() {
    return translate('VMware Virtual Machine');
  },
  component: VMwareVirtualMachineForm,
  providerType: 'VMware',
  serializer,
});
