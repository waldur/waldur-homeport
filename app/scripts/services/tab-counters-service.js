'use strict';

(function() {
  angular.module('ncsaas')
    .service('tabCounterService', tabCounterService);

  tabCounterService.$inject = ['$q', 'ENV'];

  function tabCounterService($q) {
    this.connect = connect;

    function connect(options) {
      // Options should contain following keys:
      // $scope, tabs, getCounters, getCountersError
      let defaultOptions = {
        getCounters: function() {
          // It should return promise
          return $q.reject();
        },
        getCountersError: function() {
          // It may redirect or display message
        },
        tabs: []
      };
      var options = angular.extend(defaultOptions, options);
      updateCounters(options);
      options.$scope.$on('refreshCounts', () => {
        updateCounters(options);
      });
    }

    function updateCounters(options) {
      function updateTab(response, tab) {
        var key = tab.countFieldKey;
        if (key) {
          tab.count = response[key];
        }
      }
      options.getCounters().then(function(response) {
        angular.forEach(options.tabs, function(tab) {
          updateTab(response, tab);
          if (tab.children) {
            angular.forEach(tab.children, function(child) {
              updateTab(response, child);
            });
          }
        });
      }, options.getCountersError);
    }
  }
})();
