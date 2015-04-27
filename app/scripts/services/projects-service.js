'use strict';


(function () {
  angular.module('ncsaas')
    .service('projectsService', ['$q', 'baseServiceClass', projectsService]);

  function projectsService($q, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/projects/';
      }
    });
    return new ServiceClass();
  }
})();
