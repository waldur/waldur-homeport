'use strict';


(function () {
  angular.module('ncsaas')
    .service('projectsService', ['$q', 'baseServiceClass', projectsService]);

  function projectsService($q, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/projects/';
      },
      getFirst: function() {
        var deferred = $q.defer();
        this.pageSize = 1;
        /*jshint camelcase: false */
        this.getList().then(function(projects) {
          if (projects.length > 0) {
            deferred.resolve(projects[0]);
          }
        });
        this.pageSize = null;

        return deferred.promise;
      }
    });
    return new ServiceClass();
  }
})();
