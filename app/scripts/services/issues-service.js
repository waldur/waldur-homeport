'use strict';


(function () {
  angular.module('ncsaas')
    .service('issuesService', ['$q', 'baseServiceClass', issuesService]);

  function issuesService($q, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init: function() {
        this._super();
        this.endpoint = '/issues/';
      }
    });
    return new ServiceClass();
  }
})();
