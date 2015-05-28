'use strict';

(function() {

  angular.module('ncsaas')
    .directive('filterList', ['ENV', '$state', pageSize]);

  function pageSize() {
    return {
      restrict: 'E',
      templateUrl: "views/directives/filter-list.html",
      replace: true,
      scope: {
        filterController: '='
      },
      link: function ($scope) {
        var controller = $scope.filterController;
        $scope.startFilter = startFilter;
        $scope.isFilterChosen = isFilterChosen;

        function startFilter(filter) {
          var values = [];
          if (!isFilterChosen(filter)) {
            controller.chosenFilters.push(filter);
            values = getFiltersWithSameName(filter);
            controller.service.defaultFilter[filter.name] = values.length > 0 ? values.join() : filter.value;
          } else {
            var index = controller.chosenFilters.indexOf(filter);
            controller.chosenFilters.splice(index, 1);
            values = getFiltersWithSameName(filter);
            if (values.length > 0) {
              controller.service.defaultFilter[filter.name] = values.join();
            } else {
              delete controller.service.defaultFilter[filter.name];
            }
          }
          controller.getList();
        }

        function isFilterChosen(filter) {
          return controller.chosenFilters.indexOf(filter) !== -1;
        }

        function getFiltersWithSameName(filter) {
          var sameFiltersValues = [];
          for (var i = 0; i < controller.chosenFilters.length; i++) {
            if (filter.name === controller.chosenFilters[i].name) {
              sameFiltersValues.push(controller.chosenFilters[i].value);
            }
          }
          return sameFiltersValues;
        }
      }
    };
  }

})();
