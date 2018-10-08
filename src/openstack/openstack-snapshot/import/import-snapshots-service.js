// @ngInject
export default function importVolumesService(baseServiceClass, $q, $http, WorkspaceService, ENV) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstacktenant-snapshots/importable_resources/';
    },
    importResources(provider, resources) {
      let promises = [];
      angular.forEach(resources, resource => {
        let promise = this.importResource(provider, resource);
        promises.push(promise);
      });
      return $q.all(promises);
    },
    importResource(provider, resource) {
      let endpoint = `${ENV.apiEndpoint}api/openstacktenant-snapshots/import_resource/`;
      return $http.post(endpoint, {
        service_project_link: provider.service_project_link_url,
        backend_id: resource.backend_id,
      });
    },
  });
  return new ServiceClass();
}
