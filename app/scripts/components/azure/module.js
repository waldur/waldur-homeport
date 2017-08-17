import azureVirtualMachineConfig from './azure-virtual-machine-config';
import azureVirtualMachineSummary from './azure-virtual-machine-summary';
import sshDetails from './ssh-details';
import rdpDetails from './rdp-details';

export default module => {
  module.component('rdpDetails', rdpDetails);
  module.component('sshDetails', sshDetails);
  module.component('azureVirtualMachineSummary', azureVirtualMachineSummary);
  module.config(fieldsConfig);
};

// @ngInject
function fieldsConfig(AppstoreFieldConfigurationProvider) {
  AppstoreFieldConfigurationProvider.register('Azure.VirtualMachine', azureVirtualMachineConfig);
}
