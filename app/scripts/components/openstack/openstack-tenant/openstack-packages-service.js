// @ngInject
export default function openstackPackagesService(baseServiceClass, ENV, $http) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/openstack-packages/';
    },
    extend: function(package_uuid, template_uuid) {
      var url = `${ENV.apiEndpoint}api/openstack-packages/extend/`;
      return $http.post(url, {
        package: `${ENV.apiEndpoint}api/openstack-packages/${package_uuid}/`,
        template: `${ENV.apiEndpoint}api/package-templates/${template_uuid}/`
      });
    }
  });
  return new ServiceClass();
}
