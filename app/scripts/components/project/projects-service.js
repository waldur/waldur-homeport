// @ngInject
export default function projectsService($q, $http, baseServiceClass, currentStateService, ENV) {
  var ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/projects/';
    },
    getFirst: function() {
      var deferred = $q.defer();
      var savePageSize = this.pageSize;
      this.pageSize = 1;
      /*jshint camelcase: false */
      this.getList().then(function(projects) {
        deferred.resolve(projects[0]);
      });
      this.pageSize = savePageSize;

      return deferred.promise;
    },
    getCounters: function(defaultQuery) {
      var query = angular.extend({operation: 'counters'}, defaultQuery);
      return this.getFactory(false).get(query).$promise;
    },
    setThreshold: function(project_url, value) {
      return $http.post(ENV.apiEndpoint + 'api/price-estimates/threshold/', {
        threshold: value,
        scope: project_url
      }).then(() => {
        currentStateService.getProject().then(project => {
          project.price_estimate.threshold = value;
        });
      });
    },
    setLimit: function(project_url, value) {
      return $http.post(ENV.apiEndpoint + 'api/price-estimates/limit/', {
        limit: value,
        scope: project_url
      }).then(() => {
        currentStateService.getProject().then(project => {
          project.price_estimate.limit = value;
        });
      });
    },
    updateProject: function(project_url, fields) {
      return $http.patch(project_url, fields);
    },
    updateCertifications: function(project_url, certifications) {
      return $http.post(project_url + 'update_certifications/', { certifications });
    },
  });
  return new ServiceClass();
}
