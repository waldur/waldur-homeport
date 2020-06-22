import { gettext } from '@waldur/i18n';
import { ResourceBreadcrumbsRegistry } from '@waldur/resource/breadcrumbs/ResourceBreadcrumbsRegistry';

ResourceBreadcrumbsRegistry.register('VMware.Disk', (resource) => {
  return [
    {
      label: resource.vm_name,
      state: 'resource-details',
      params: {
        uuid: resource.vm_uuid,
        resource_type: 'VMware.VirtualMachine',
      },
    },
    {
      label: gettext('Disks'),
      state: 'resource-details',
      params: {
        uuid: resource.vm_uuid,
        resource_type: 'VMware.VirtualMachine',
        tab: 'disks',
      },
    },
  ];
});

ResourceBreadcrumbsRegistry.register('VMware.Port', (resource) => {
  return [
    {
      label: resource.vm_name,
      state: 'resource-details',
      params: {
        uuid: resource.vm_uuid,
        resource_type: 'VMware.VirtualMachine',
      },
    },
    {
      label: gettext('Network adapters'),
      state: 'resource-details',
      params: {
        uuid: resource.vm_uuid,
        resource_type: 'VMware.VirtualMachine',
        tab: 'ports',
      },
    },
  ];
});
