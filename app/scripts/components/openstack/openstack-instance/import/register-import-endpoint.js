// @ngInject
export default function registerImportEndpoint(ImportResourcesEndpointRegistry, ENV) {
  ImportResourcesEndpointRegistry.registerEndpoint(ENV.resourcesTypes.vms, 'OpenStackTenant', 'openstacktenant-instances');
}
