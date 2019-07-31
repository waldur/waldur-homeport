// @ngInject
export default function breadcrumbsConfig(ResourceBreadcrumbsService) {
  ResourceBreadcrumbsService.register('VMware.Disk', resource => {
    return [
      {
        label: resource.vm_name,
        state: 'resources.details',
        params: {
          uuid: resource.vm_uuid,
          resource_type: 'VMware.VirtualMachine'
        }
      },
      {
        label: gettext('Disks'),
        state: 'resources.details',
        params: {
          uuid: resource.vm_uuid,
          resource_type: 'VMware.VirtualMachine',
          tab: 'disks',
        }
      },
    ];
  });

  ResourceBreadcrumbsService.register('VMware.Port', resource => {
    return [
      {
        label: resource.vm_name,
        state: 'resources.details',
        params: {
          uuid: resource.vm_uuid,
          resource_type: 'VMware.VirtualMachine'
        }
      },
      {
        label: gettext('Network adapters'),
        state: 'resources.details',
        params: {
          uuid: resource.vm_uuid,
          resource_type: 'VMware.VirtualMachine',
          tab: 'ports',
        }
      },
    ];
  });
}
