'use strict';

(function() {
  angular.module('ncsaas')
    .service('invitationService', invitationService);

  invitationService.$inject = ['baseServiceClass'];

  function invitationService(baseServiceClass) {
    /*jshint validthis: true */
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/user-invitations/';
      }
    });
    return new ServiceClass();
  }

})();
