import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { VMwareVirtualMachineForm } from './VMwareVirtualMachineForm';

const serializer = ({template, cluster, datastore, ...rest}) => ({
  template: template && template.url,
  cluster: cluster && cluster.url,
  datastore: datastore && datastore.url,
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
