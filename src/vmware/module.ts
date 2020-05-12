import './marketplace';
import './provider';
import './tabs';
import * as ResourceSummary from '@waldur/resource/summary/registry';
import { registerResourceTypeLabel } from '@waldur/resource/utils';

import './actions';
import './breadcrumbs';
import { VMwareDiskSummary } from './VMwareDiskSummary';
import { VMwarePortSummary } from './VMwarePortSummary';
import { VMwareVirtualMachineSummary } from './VMwareVirtualMachineSummary';

registerResourceTypeLabel('VMware.VirtualMachine', 'vSphere Virtual Machine');
registerResourceTypeLabel('VMware.Disk', 'VM Disk');
registerResourceTypeLabel('VMware.Port', 'VM Network Adapter');

ResourceSummary.register('VMware.VirtualMachine', VMwareVirtualMachineSummary);
ResourceSummary.register('VMware.Disk', VMwareDiskSummary);
ResourceSummary.register('VMware.Port', VMwarePortSummary);
