'use strict';


(function () {
  angular.module('ncsaas')
    .service('projectsService', ['$q', 'baseServiceClass', 'ENV', projectsService]);

  function projectsService($q, baseServiceClass, ENV) {
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
      }
    });
    return new ServiceClass();
  }
})();
