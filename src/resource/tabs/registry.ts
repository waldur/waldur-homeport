import { isFeatureVisible } from '@waldur/features/connect';
import { OpenStackInstanceTabConfiguration } from '@waldur/openstack/openstack-instance/tabs';
import { OpenStackTenantTabConfiguration } from '@waldur/openstack/openstack-tenant/tabs';
import { OpenStackVolumeTabConfiguration } from '@waldur/openstack/openstack-volume/tabs';
import { RancherClusterTabConfiguration } from '@waldur/rancher/cluster/tabs';
import { VMwareVirtualMachineTabConfiguration } from '@waldur/vmware/tabs';

import { ResourceParentTab, ResourceTabsConfiguration } from './types';

const tabs: Record<string, ResourceParentTab[]> = {};

const register = (conf: ResourceTabsConfiguration) => {
  tabs[conf.type] = conf.tabs;
};

export const getTabs = (resource_type: string): ResourceParentTab[] =>
  (tabs[resource_type] || [])
    .filter((tab) => isFeatureVisible(tab.feature))
    .map((tab) => ({
      ...tab,
      children: tab.children?.filter((child) =>
        isFeatureVisible(child.feature),
      ),
    }));

register(OpenStackInstanceTabConfiguration);
register(OpenStackTenantTabConfiguration);
register(OpenStackVolumeTabConfiguration);
register(RancherClusterTabConfiguration);
register(VMwareVirtualMachineTabConfiguration);
