import resourceImportDialog from './resource-import-dialog';
import importVirtualMachinesList from './import-virtual-machines-list';
import importVirtualCloudsList from './import-virtual-clouds-list';
import importVolumesList from './import-volumes-list';
import registerImportInstanceTableAction from './register-import-instance-table-action';
import registerImportVPCTableAction from './register-import-vpc-table-action';
import registerImportVolumeTableAction from './register-import-volume-table-action';
import ImportUtils from './utils';
import importResourcesService from './import-resources-service';
import ImportResourcesEndpointRegistry from './import-resources-endpoint-registry';

export default module => {
  module.component('resourceImportDialog', resourceImportDialog);
  module.component('importVirtualMachinesList', importVirtualMachinesList);
  module.component('importVirtualCloudsList', importVirtualCloudsList);
  module.component('importVolumesList', importVolumesList);
  module.run(registerImportInstanceTableAction);
  module.run(registerImportVPCTableAction);
  module.run(registerImportVolumeTableAction);
  module.service('ImportUtils', ImportUtils);
  module.service('importResourcesService', importResourcesService);
  module.service('ImportResourcesEndpointRegistry', ImportResourcesEndpointRegistry);
};
