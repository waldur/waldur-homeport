// @ngInject
export default function registerImportEndpoint(ImportResourcesEndpointRegistry, ENV) {
  ImportResourcesEndpointRegistry.registerEndpoint(ENV.resourcesTypes.private_clouds, 'OpenStack', 'openstack-tenants');
}
