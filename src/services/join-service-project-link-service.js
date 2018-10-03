// @ngInject
export default function joinServiceProjectLinkService(baseServiceClass, joinService) {
  let ServiceClass = baseServiceClass.extend({
    addLink: function(service_type, service_uuid, project_url) {
      let vm = this;
      return joinService.$get(service_type, service_uuid).then(function(service) {
        return joinService.getServiceProjectLinkUrlByType(service_type).then(function(url) {
          let instance = vm.$create(url);
          instance.project = project_url;
          instance.service = service.url;
          return instance.$save();
        });
      });
    },
    getServiceProjectLinks: function(customer_uuid, service_type, service_uuid) {
      return joinService.getServiceProjectLinkUrlByType(service_type).then(function(url) {
        return joinService.getAll({
          customer_uuid: customer_uuid,
          service_uuid: service_uuid
        }, url);
      });
    },
    clearAllCacheForCurrentEndpoint: function() {
      joinService.clearAllCacheForCurrentEndpoint();
    }
  });
  return new ServiceClass();
}
