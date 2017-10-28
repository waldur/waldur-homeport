// @ngInject
export default function openstackPackagesService(baseServiceClass, ENV, $http) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-packages/';
    },
    change: function(package_uuid, template_uuid) {
      const url = `${ENV.apiEndpoint}api/openstack-packages/change/`;
      return $http.post(url, {
        package: `${ENV.apiEndpoint}api/openstack-packages/${package_uuid}/`,
        template: `${ENV.apiEndpoint}api/package-templates/${template_uuid}/`
      });
    }
  });
  return new ServiceClass();
}
