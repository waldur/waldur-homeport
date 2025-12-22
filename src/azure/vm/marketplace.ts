import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

import { AZURE_VM_TYPE } from '../constants';

const AzureCredentialsForm = lazyComponent(() =>
  import('../common/AzureCredentialsForm').then((module) => ({
    default: module.AzureCredentialsForm,
  })),
);

const AzureDetailsComponent = lazyComponent(() =>
  import('../common/AzureDetailsComponent').then((module) => ({
    default: module.AzureDetailsComponent,
  })),
);
const AzureVirtualMachineForm = lazyComponent(() =>
  import('./AzureVirtualMachineForm').then((module) => ({
    default: module.AzureVirtualMachineForm,
  })),
);

const serializer = ({ name, location, image, size, ssh_public_key }) => ({
  name,
  location: location ? location.url : undefined,
  size: size ? size.url : undefined,
  image: image ? image.url : undefined,
  ssh_public_key: ssh_public_key ? ssh_public_key.url : undefined,
});

export const AzureVirtualMachineOffering: OfferingConfiguration = {
  type: AZURE_VM_TYPE,
  get label() {
    return translate('Azure Virtual Machine');
  },
  orderFormComponent: AzureVirtualMachineForm,
  detailsComponent: AzureDetailsComponent,
  serializer,
  credentialsForm: AzureCredentialsForm,
};
