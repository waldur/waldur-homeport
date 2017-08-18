// @ngInject
export default function importVirtualMachinesService(
  baseServiceClass,
  $q,
  $http,
  WorkspaceService,
  ENV,
  ImportVirtualMachineEndpointRegistry) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
    },
    setEndpoint(provider) {
      this.baseEndpoint = ImportVirtualMachineEndpointRegistry.getEndpoint(provider.type);
      this.endpoint = `/${this.baseEndpoint}/importable_resources/`;
    },
    importResources: function(provider, resources) {
      let promises = [];
      angular.forEach(resources, resource => {
        let promise = this.importResource(provider, resource);
        promises.push(promise);
      });
      return $q.all(promises);
    },
    importResource: function(provider, resource) {
      let endpoint = `${ENV.apiEndpoint}api/${this.baseEndpoint}/import_resource/`;
      return $http.post(endpoint, {
        service_project_link: provider.service_project_link_url,
        backend_id: resource.backend_id,
      });
    },
    getSupported: function(providers) {
      let supportedProviders = [];
      angular.forEach(providers, provider => {
        if(ImportVirtualMachineEndpointRegistry.isRegistered(provider.type)) {
          supportedProviders.push(provider);
        }
      });

      return supportedProviders;
    }
  });
  return new ServiceClass();
}
