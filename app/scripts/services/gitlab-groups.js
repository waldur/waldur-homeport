'use strict';

(function () {
  angular.module('ncsaas')
    .service('gitlabGroupsService', ['baseServiceClass', gitlabGroupsService]);

  function gitlabGroupsService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init: function () {
        this._super();
        this.endpoint = '/gitlab-groups/';
      }
    });
    return new ServiceClass();
  }

})();
