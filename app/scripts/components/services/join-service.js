// @ngInject
export default function joinService(baseServiceClass, servicesService, $http, $q) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/services/';
    },

    setDefaultFilter: function() {
      this.defaultFilter = {o: 'name'};
    },

    create: function(url, options) {
      return this.createOrUpdate('POST', url, options);
    },

    update: function(url, options) {
      return this.createOrUpdate('PATCH', url, options);
    },

    createOrUpdate: function(method, url, options) {
      let fd = new FormData();
      for(let name in options) {
        fd.append(name, options[name]);
      }
      return $http({
        method: method,
        url: url,
        data: fd,
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      }).then(function(response) {
        return response.data;
      }, function(response) {
        return $q.reject(response);
      });
    },

    $get: function(service_type, uuid) {
      let get = this._super.bind(this);
      return this.getUrlByType(service_type).then(function(url) {
        return get(uuid, url);
      });
    },

    getOptions: function(service_type) {
      return this.getUrlByType(service_type).then(function(url) {
        return servicesService.getOption(url).then(function(response) {
          return response.actions.POST;
        });
      });
    },

    getServiceProjectLinkUrlByType: function(service_type) {
      return servicesService.getServicesList().then(function(services) {
        return services[service_type].service_project_link_url;
      });
    },

    getUrlByType: function(service_type) {
      return servicesService.getServicesList().then(function(services) {
        return services[service_type].url;
      });
    }
  });
  return new ServiceClass();
}
