import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

import { VMWARE_VM } from './constants';
import { deployOfferingSteps } from './deploy/steps';

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

registerOfferingType({
  type: VMWARE_VM,
  get label() {
    return translate('vSphere Virtual Machine');
  },
  formSteps: deployOfferingSteps,
  providerType: 'VMware',
  serializer,
  limitSerializer,
  limitParser,
  allowToUpdateService: true,
});
