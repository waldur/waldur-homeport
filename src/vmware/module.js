import './marketplace';
import './provider';
import vmwareDisksService from './vmware-disks-service';
import vmwarePortsService from './vmware-ports-service';
import vmwareVirtualMachineDisks from './vmware-virtual-machine-disks';
import vmwareVirtualMachinePorts from './vmware-virtual-machine-ports';
import { VMwareVirtualMachineSummary } from './VMwareVirtualMachineSummary';
import { VMwareDiskSummary } from './VMwareDiskSummary';
import { VMwarePortSummary } from './VMwarePortSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { registerResourceTypeLabel } from '@waldur/resource/utils';

import { actionsConfig } from './actions';
import breadcrumbsConfig from './breadcrumbs';
import { tabsConfig } from './tabs';

registerResourceTypeLabel('VMware.VirtualMachine', 'vSphere Virtual Machine');
registerResourceTypeLabel('VMware.Disk', 'VM Disk');
registerResourceTypeLabel('VMware.Port', 'VM Network Adapter');

export default module => {
  ResourceSummary.register('VMware.VirtualMachine', VMwareVirtualMachineSummary);
  ResourceSummary.register('VMware.Disk', VMwareDiskSummary);
  ResourceSummary.register('VMware.Port', VMwarePortSummary);
  module.config(tabsConfig);
  module.config(actionsConfig);
  module.run(breadcrumbsConfig);
  module.service('vmwareDisksService', vmwareDisksService);
  module.service('vmwarePortsService', vmwarePortsService);
  module.component('vmwareVirtualMachineDisks', vmwareVirtualMachineDisks);
  module.component('vmwareVirtualMachinePorts', vmwareVirtualMachinePorts);
};
