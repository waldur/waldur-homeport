import { lazyComponent } from '@waldur/core/lazyComponent';
import './marketplace';
import './provider';
import './tabs';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { registerResourceTypeLabel } from '@waldur/resource/utils';

import './breadcrumbs';
import './actions';

const VMwareDiskSummary = lazyComponent(
  () =>
    import(/* webpackChunkName: "VMwareDiskSummary" */ './VMwareDiskSummary'),
  'VMwareDiskSummary',
);
const VMwarePortSummary = lazyComponent(
  () =>
    import(/* webpackChunkName: "VMwarePortSummary" */ './VMwarePortSummary'),
  'VMwarePortSummary',
);
const VMwareVirtualMachineSummary = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "VMwareVirtualMachineSummary" */ './VMwareVirtualMachineSummary'
    ),
  'VMwareVirtualMachineSummary',
);

registerResourceTypeLabel('VMware.VirtualMachine', 'vSphere Virtual Machine');
registerResourceTypeLabel('VMware.Disk', 'VM Disk');
registerResourceTypeLabel('VMware.Port', 'VM Network Adapter');

ResourceSummary.register('VMware.VirtualMachine', VMwareVirtualMachineSummary);
ResourceSummary.register('VMware.Disk', VMwareDiskSummary);
ResourceSummary.register('VMware.Port', VMwarePortSummary);
