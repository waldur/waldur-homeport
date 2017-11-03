// @ngInject
export default function tabCounterService($q) {
  this.connect = connect;

  function connect(customOptions) {
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
    let options = angular.extend(defaultOptions, customOptions);
    updateCounters(options);
    options.$scope.$on('refreshCounts', () => {
      updateCounters(options);
    });
  }

  function updateCounters(options) {
    function updateTab(response, tab) {
      let key = tab.countFieldKey;
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
