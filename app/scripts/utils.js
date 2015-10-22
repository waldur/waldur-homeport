'use strict';

(function() {

  angular.module('ncsaas')
    .factory('ncUtilsFlash', ['Flash', ncUtilsFlash]);

  function ncUtilsFlash(Flash) {
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
      },
      isFileOption: function(option) {
        return option.type == 'file upload';
      },
      isFileValue: function(value) {
        return value.toString() == '[object File]';
      },
      getFilename: function(value) {
        if (!value) {
          return '';
        }
        else if (value.length == 1) {
          return value[0].name;
        } else if (angular.isString(value)) {
          var parts = value.split('/');
          return parts[parts.length - 1];
        }
      }
    }
  }
})();
