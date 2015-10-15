'use strict';

(function() {

  angular.module('ncsaas')
    .factory('ncUtilsFlash', ['Flash', ncUtilsFlash]);

  function ncUtilsFlash(Flash) {
    return {
      successFlash: function(message) {
        this.flashMessage('success', message);
      },
      errorFlash: function(message) {
        this.flashMessage('danger', message);
      },
      infoFlash: function(message) {
        this.flashMessage('info', message);
      },
      warningFlash: function(message) {
        this.flashMessage('warning', message);
      },
      flashMessage: function(type, message) {
        Flash.create(type, message);
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
      emitEvent: function(eventName) {
        $rootScope.$broadcast(eventName)
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
