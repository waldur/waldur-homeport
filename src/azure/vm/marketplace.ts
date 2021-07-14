import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';

const AzureVirtualMachineDetails = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AzureVirtualMachineDetails" */ './AzureVirtualMachineDetails'
    ),
  'AzureVirtualMachineDetails',
);
const AzureVirtualMachineForm = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "AzureVirtualMachineForm" */ './AzureVirtualMachineForm'
    ),
  'AzureVirtualMachineForm',
);

const serializer = ({ name, location, image, size }) => ({
  name,
  location: location ? location.url : undefined,
  size: size ? size.url : undefined,
  image: image ? image.url : undefined,
});

registerOfferingType({
  type: 'Azure.VirtualMachine',
  get label() {
    return translate('Azure Virtual Machine');
  },
  component: AzureVirtualMachineForm,
  detailsComponent: AzureVirtualMachineDetails,
  providerType: 'Azure',
  serializer,
  allowToUpdateService: true,
});
