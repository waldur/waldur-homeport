'use strict';

(function() {
  
  angular.module('ncsaas')
    .controller('BaseController', ['baseControllerClass', '$auth', BaseController]);

  function BaseController(baseControllerClass, $auth) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this.isAuthenticated = $auth.isAuthenticated();
      }
    });
    controllerScope.__proto__ = new Controller();
  }

})();
