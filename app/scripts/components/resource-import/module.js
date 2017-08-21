import ImportUtils from './utils';
import resourceImportDialog from './resource-import-dialog';
import registerImportTableAction from './register-import-table-action';
import importVirtualMachinesList from './import-virtual-machines-list';
import importVirtualMachinesService from './import-virtual-machines-service';
import ImportVirtualMachineEndpointRegistry from './import-virtual-machine-endpoint-registry';

export default module => {
  module.component('resourceImportDialog', resourceImportDialog);
  module.component('importVirtualMachinesList', importVirtualMachinesList);
  module.run(registerImportTableAction);
  module.service('ImportUtils', ImportUtils);
  module.service('importVirtualMachinesService', importVirtualMachinesService);
  module.service('ImportVirtualMachineEndpointRegistry', ImportVirtualMachineEndpointRegistry);
};
