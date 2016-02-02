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
        if (promise.finally) {
          // Prevent blocking if promise is invalid
          var block = blockUI.instances.get(element);
          block.start();
          return promise.finally(function() {
            block.stop();
          });
        }
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
      },
      getPrettyQuotaName: function(name) {
        return name.replace(/nc_|_count/g, '').replace(/_/g, ' ');
      },
      getQuotaUsage: function(quotas) {
        var usage = {};
        for (var i = 0; i < quotas.length; i++) {
          var quota = quotas[i];
          usage[quota.name] = Math.max(0, quota.usage);
        }
        return usage;
      },
      getQueryString: function() {
        // Example input: http://example.com/#/approve/?foo=123&bar=456
        // Example output: foo=123&bar=456

        var hash = document.location.hash;
        var parts = hash.split("?");
        if (parts.length > 1) {
          return parts[1];
        }
        return "";
      },
      parseQueryString: function(qs) {
        // Example input: foo=123&bar=456
        // Example output: {foo: "123", bar: "456"}

        return qs.split("&").reduce(function(result, part){
          var tokens = part.split("=");
          if (tokens.length > 1) {
            var key = tokens[0];
            var value = tokens[1];
            result[key] = value;
          }
          return result;
        }, {});
      },
      startsWith: function(string, target) {
        return string.indexOf(target) === 0;
      },
      endsWith: function(string, target) {
        return string.indexOf(target) === (string.length - target.length);
      },
      mergeLists: function(list1, list2) {
        list1 = list1 || [];
        list2 = list2 || [];
        var itemByUuid = {},
          deletedItemUuids = [],
          newListUiids = list2.map(function(item) {
            return item.uuid;
          });
        for (var i = 0; i < list1.length; i++) {
          var item = list1[i];
          if (newListUiids.indexOf(item.uuid) === -1) {
            deletedItemUuids.push(item.uuid);
            continue;
          }
          itemByUuid[item.uuid] = item;
        }
        for (var j = 0; j < deletedItemUuids.length; j++) {
          for (var index = 0; index < list1.length; index++) {
            if (list1[index].id === deletedItemUuids[j]) {
              list1.splice(index, 1);
              break;
            }
          }
        }
        for (var i = 0; i < list2.length; i++) {
          var item2 = list2[i];
          var item1 = itemByUuid[item2.uuid];
          if (!item1) {
            list1.push(item2);
            continue;
          }
          for (var key in item2) {
            item2.hasOwnProperty(key) && (item1[key] = item2[key]);
          }
        }
      }
    }
  }
})();
