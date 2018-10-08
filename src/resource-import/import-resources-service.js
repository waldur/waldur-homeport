// @ngInject
export default function importResourcesService(
  baseServiceClass,
  $q,
  $http,
  WorkspaceService,
  ENV,
  ImportResourcesEndpointRegistry) {
  let ServiceClass = baseServiceClass.extend({
    setEndpoint(category, provider) {
      this.baseEndpoint = ImportResourcesEndpointRegistry.getEndpoint(category, provider.type);
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
    getSupported: function(category, providers) {
      let supportedProviders = [];
      angular.forEach(providers, provider => {
        if(ImportResourcesEndpointRegistry.isRegistered(category, provider.type)) {
          supportedProviders.push(provider);
        }
      });

      return supportedProviders;
    }
  });
  return new ServiceClass();
}
