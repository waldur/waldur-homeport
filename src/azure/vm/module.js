import azureVirtualMachineConfig from './azure-virtual-machine-config';
import './marketplace';
import { AzureVirtualMachineSummary } from './AzureVirtualMachineSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

export default module => {
  ResourceSummary.register('Azure.VirtualMachine', AzureVirtualMachineSummary);
  module.config(fieldsConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('Azure.VirtualMachine', azureVirtualMachineConfig);
}
