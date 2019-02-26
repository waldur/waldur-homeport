// @ngInject
export default function resourcesService(baseServiceClass, ENV, $http, servicesService, $q) {
  let ServiceClass = baseServiceClass.extend({
    init:function() {
      this._super();
      this.endpoint = '/resources/';
    },

    $get: function(resource_type, uuid, url) {
      let $get = this._super.bind(this);
      if (url) {
        return $get(null, url);
      }
      return this.getUrlByType(resource_type).then(function(url) {
        return $get(uuid, url);
      });
    },

    getUrlByType: function(resource_type) {
      if (resource_type === 'JIRA.Issue') {
        return $q.when(`${ENV.apiEndpoint}api/jira-issues/`);
      }
      if (resource_type === 'Support.Offering') {
        return $q.when(`${ENV.apiEndpoint}api/support-offerings/`);
      }
      let parts = resource_type.split('.');
      let service_type = parts[0];
      let type = parts[1];
      return servicesService.getServicesList().then(function(services) {
        return services[service_type].resources[type];
      });
    },

    countByType: function(params) {
      let vm = this;
      let url = ENV.apiEndpoint + 'api' + '/resources/count/';
      let cacheKey = url + JSON.stringify(params) + 'x-result-count';
      let cache = this.getCache(cacheKey);
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
