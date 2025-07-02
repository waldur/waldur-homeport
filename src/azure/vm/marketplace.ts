import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { OfferingConfiguration } from '@waldur/marketplace/common/types';

const AzureCredentials = lazyComponent(() =>
  import('../common/AzureCredentials').then((module) => ({
    default: module.AzureCredentials,
  })),
);
const AzureVirtualMachineForm = lazyComponent(() =>
  import('./AzureVirtualMachineForm').then((module) => ({
    default: module.AzureVirtualMachineForm,
  })),
);

const serializer = ({ name, location, image, size }) => ({
  name,
  location: location ? location.url : undefined,
  size: size ? size.url : undefined,
  image: image ? image.url : undefined,
});

export const AzureVirtualMachineOffering: OfferingConfiguration = {
  type: 'Azure.VirtualMachine',
  get label() {
    return translate('Azure Virtual Machine');
  },
  orderFormComponent: AzureVirtualMachineForm,
  detailsComponent: AzureCredentials,
  providerType: 'Azure',
  serializer,
  allowToUpdateService: true,
};
