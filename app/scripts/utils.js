'use strict';

(function() {

  angular.module('ncsaas')
    .factory('ncUtilsFlash', ['Flash', '$rootScope', ncUtilsFlash]);

  function ncUtilsFlash(Flash, $rootScope) {
    var dismiss = Flash.dismiss;
    Flash.dismiss = function() {
      // for hasFlash variable change emit for ng-show directive in flash block
      $rootScope.hasFlash = !$rootScope.hasFlash;
      dismiss();
    };
    return {
      success: function(message) {
        this.flashMessage('success', message);
      },
      error: function(message) {
        this.flashMessage('danger', message);
      },
      info: function(message) {
        this.flashMessage('info', message);
      },
      warning: function(message) {
        this.flashMessage('warning', message);
      },
      flashMessage: function(type, message) {
        if (message) {
          Flash.create(type, message);
        }
      }
    };
  }

  angular.module('ncsaas')
    .factory('ncUtils', ['$rootScope', 'blockUI', ncUtils]);

  function ncUtils($rootScope, blockUI) {
    return {
      deregisterEvent: function(eventName) {
        $rootScope.$$listeners[eventName] = [];
      },
      updateIntercom: function() {
        window.Intercom('update');
      },
      blockElement: function(element, promise) {
        var block = blockUI.instances.get(element);
        block.start();
        promise.finally(function() {
          block.stop();
        });
      }
    }
  }
})();
