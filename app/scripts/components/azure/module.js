import azureVirtualMachineConfig from './azure-virtual-machine-config';
import azureVirtualMachineSummary from './azure-virtual-machine-summary';

export default module => {
  module.component('azureVirtualMachineSummary', azureVirtualMachineSummary);
  module.config(fieldsConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('Azure.VirtualMachine', azureVirtualMachineConfig);
}
