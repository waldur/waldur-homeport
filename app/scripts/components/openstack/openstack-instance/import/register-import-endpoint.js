// @ngInject
export default function registerImportEndpoint(ImportVirtualMachineEndpointRegistry) {
  ImportVirtualMachineEndpointRegistry.registerEndpoint('OpenStackTenant', 'openstacktenant-instances');
}
