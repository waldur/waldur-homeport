import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { OfferingConfiguration } from '@/marketplace/common/types';

import { VMWARE_VM } from './constants';

const VMwareCredentialsSection = lazyComponent(() =>
  import('./VMwareCredentialsSection').then((module) => ({
    default: module.VMwareCredentialsSection,
  })),
);
const VmwareOrderForm = lazyComponent(() =>
  import('./deploy/VmwareOrderForm').then((module) => ({
    default: module.VmwareOrderForm,
  })),
);

const serializer = ({
  template,
  cluster,
  datastore,
  folder,
  networks,
  ...rest
}) => ({
  template: template && template.url,
  cluster: cluster && cluster.url,
  datastore: datastore && datastore.url,
  folder: folder && folder.url,
  networks: networks && networks.map(({ url }) => ({ url })),
  ...rest,
});

const limitSerializer = (limits) =>
  limits && {
    cpu: limits.cpu,
    ram: limits.ram && limits.ram * 1024,
    disk: limits.disk && limits.disk * 1024,
  };

const limitParser = (limits) =>
  limits && {
    cpu: limits.cpu,
    ram: limits.ram && limits.ram / 1024,
    disk: limits.disk && limits.disk / 1024,
  };

export const vmWareOffering: OfferingConfiguration = {
  type: VMWARE_VM,
  get label() {
    return translate('vSphere Virtual Machine');
  },
  orderFormComponent: VmwareOrderForm,
  credentialsSection: VMwareCredentialsSection,
  serializer,
  limitSerializer,
  limitParser,
};
