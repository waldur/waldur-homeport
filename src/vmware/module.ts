import { lazyComponent } from '@waldur/core/lazyComponent';
import './marketplace';
import './provider';
import './tabs';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { registerResourceTypeLabel } from '@waldur/resource/utils';

import './actions';

const VMwareDiskSummary = lazyComponent(
  () => import('./VMwareDiskSummary'),
  'VMwareDiskSummary',
);
const VMwarePortSummary = lazyComponent(
  () => import('./VMwarePortSummary'),
  'VMwarePortSummary',
);
const VMwareVirtualMachineSummary = lazyComponent(
  () => import('./VMwareVirtualMachineSummary'),
  'VMwareVirtualMachineSummary',
);

registerResourceTypeLabel('VMware.VirtualMachine', 'vSphere Virtual Machine');
registerResourceTypeLabel('VMware.Disk', 'VM Disk');
registerResourceTypeLabel('VMware.Port', 'VM Network Adapter');

ResourceSummary.register('VMware.VirtualMachine', VMwareVirtualMachineSummary);
ResourceSummary.register('VMware.Disk', VMwareDiskSummary);
ResourceSummary.register('VMware.Port', VMwarePortSummary);
