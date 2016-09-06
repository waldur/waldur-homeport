'use strict';

(function() {
  angular.module('ncsaas')
    .service('tabCounterService', tabCounterService);

  tabCounterService.$inject = ['$interval', '$q', 'ENV'];

  function tabCounterService($interval, $q, ENV) {
    this.connect = connect;
    this.cancel = $interval.cancel;

    function connect(options) {
      // Options should contain following keys:
      // $scope, tabs, getCounters, getCountersError
      var defaultOptions = {
        getCounters: function() {
          // It should return promise
          return $q.reject();
        },
        getCountersError: function() {
          // It may redirect or display message
        },
        tabs: []
      }
      var options = angular.extend(defaultOptions, options);
      if (options.timer) {
        $interval.cancel(options.timer);
      }
      updateCounters(options);
      var timer = $interval(
        updateCounters.bind(null, options),
        ENV.countersTimerInterval * 1000
      );
      options.$scope.$on('$destroy', function() {
        $interval.cancel(timer);
      });
      options.$scope.$on('refreshCounts', function() {
        updateCounters(options);
      });
      return timer;
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
