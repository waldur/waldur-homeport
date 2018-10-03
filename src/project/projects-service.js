// @ngInject
export default function projectsService($q, $http, baseServiceClass) {
  let ServiceClass = baseServiceClass.extend({
    init: function() {
      this._super();
      this.endpoint = '/projects/';
    },
    getFirst: function() {
      let deferred = $q.defer();
      let savePageSize = this.pageSize;
      this.pageSize = 1;
      /*jshint camelcase: false */
      this.getList().then(function(projects) {
        deferred.resolve(projects[0]);
      });
      this.pageSize = savePageSize;

      return deferred.promise;
    },
    getCounters: function(defaultQuery) {
      let query = angular.extend({operation: 'counters'}, defaultQuery);
      return this.getFactory(false).get(query).$promise;
    },
    updateCertifications: function(project_url, certifications) {
      return $http.post(project_url + 'update_certifications/', { certifications });
    },
  });
  return new ServiceClass();
}
