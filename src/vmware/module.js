import './marketplace';
import './provider';
import vmwareDisksService from './vmware-disks-service';
import vmwareVirtualMachineDisks from './vmware-virtual-machine-disks';
import { VMwareVirtualMachineSummary } from './VMwareVirtualMachineSummary';
import * as ResourceSummary from '@waldur/resource/summary/registry';

import { actionsConfig } from './actions';

export default module => {
  ResourceSummary.register('VMware.VirtualMachine', VMwareVirtualMachineSummary);
  module.config(tabsConfig);
  module.config(actionsConfig);
  module.service('vmwareDisksService', vmwareDisksService);
  module.component('vmwareVirtualMachineDisks', vmwareVirtualMachineDisks);
};

// @ngInject
function tabsConfig(ResourceTabsConfigurationProvider, DEFAULT_RESOURCE_TABS) {
  ResourceTabsConfigurationProvider.register('VMware.VirtualMachine', {
    order: [
      'disks',
      ...DEFAULT_RESOURCE_TABS.order,
    ],
    options: angular.merge({}, DEFAULT_RESOURCE_TABS.options, {
      disks: {
        heading: gettext('Disks'),
        component: 'vmwareVirtualMachineDisks'
      },
    })
  });
}
