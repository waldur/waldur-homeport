// @ngInject
export default function projectsService($q, $http, baseServiceClass) {
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
    updateProject: function(project_url, fields) {
      return $http.patch(project_url, fields);
    },
    updateCertifications: function(project_url, certifications) {
      return $http.post(project_url + 'update_certifications/', { certifications });
    },
  });
  return new ServiceClass();
}
