import './marketplace';
import './provider';
import './tabs';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { registerResourceTypeLabel } from '@waldur/resource/utils';

import { actionsConfig } from './actions';
import breadcrumbsConfig from './breadcrumbs';
import { VMwareDiskSummary } from './VMwareDiskSummary';
import { VMwarePortSummary } from './VMwarePortSummary';
import { VMwareVirtualMachineSummary } from './VMwareVirtualMachineSummary';

registerResourceTypeLabel('VMware.VirtualMachine', 'vSphere Virtual Machine');
registerResourceTypeLabel('VMware.Disk', 'VM Disk');
registerResourceTypeLabel('VMware.Port', 'VM Network Adapter');

export default module => {
  ResourceSummary.register(
    'VMware.VirtualMachine',
    VMwareVirtualMachineSummary,
  );
  ResourceSummary.register('VMware.Disk', VMwareDiskSummary);
  ResourceSummary.register('VMware.Port', VMwarePortSummary);
  module.config(actionsConfig);
  module.run(breadcrumbsConfig);
};
