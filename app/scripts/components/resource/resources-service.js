// @ngInject
export default function resourcesService(baseServiceClass, ENV, $http, servicesService, $q) {
  var ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/resources/';
    },

    $get: function(resource_type, uuid, url) {
      var $get = this._super.bind(this);
      if (url) {
        return $get(null, url);
      }
      return this.getUrlByType(resource_type).then(function(url) {
        return $get(uuid, url);
      });
    },

    getUrlByType: function(resource_type) {
      var parts = resource_type.split('.');
      var service_type = parts[0];
      var type = parts[1];
      return servicesService.getServicesList().then(function(services) {
        return services[service_type].resources[type];
      });
    },

    countByType: function(params) {
      var vm = this;
      var url = ENV.apiEndpoint + 'api' + '/resources/count/';
      var cacheKey = url + JSON.stringify(params) + 'x-result-count';
      var cache = this.getCache(cacheKey);
      if (cache && cache.time > new Date().getTime()) {
        return $q.when(cache.data);
      } else {
        return $http.get(url, {params: params}).then(function(response) {
          vm.setCache(ENV.countsCacheTime, response.data, cacheKey, '/resources/');
          return response.data;
        });
      }
    },
  });
  return new ServiceClass();
}
