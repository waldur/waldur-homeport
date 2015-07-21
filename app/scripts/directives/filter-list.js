'use strict';

(function() {

  angular.module('ncsaas')
    .directive('filterList', ['ENV', '$state', filterList]);

  function filterList() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/filter-list.html',
      replace: true,
      scope: {
        filterController: '='
      },
      link: function ($scope) {
        var controller = $scope.filterController;
        $scope.toggleFilter = toggleFilter;
        $scope.isFilterChosen = isFilterChosen;
        selectAll();
        controller.chosenFilters = [];

        function toggleFilter(filter) {
          if (!isFilterChosen(filter)) {
            controller.chosenFilters.push(filter);
          } else {
            var index = controller.chosenFilters.indexOf(filter);
            controller.chosenFilters.splice(index, 1);
          }

          var values = getFilterValues(filter);
          if (values.length > 0) {
            controller.service.defaultFilter[filter.name] = values;
          } else {
            if (controller.selectAll){
              selectAll();
            } else {
              delete controller.service.defaultFilter[filter.name];
            }
          }

          controller.currentPage = 1;
          controller.service.page = 1;
          controller.getList();
        }

        function selectAll() {
          for (var i = 0; i < controller.searchFilters.length; i++) {
            var filter = controller.searchFilters[i];
            controller.service.defaultFilter[filter.name] = [];
          };
          for (var i = 0; i < controller.searchFilters.length; i++) {
            var filter = controller.searchFilters[i];
            controller.service.defaultFilter[filter.name].push(filter.value);
          };
        }

        function isFilterChosen(filter) {
          return controller.chosenFilters.indexOf(filter) !== -1;
        }

        function getFilterValues(filter) {
          var values = [];
          for (var i = 0; i < controller.chosenFilters.length; i++) {
            if (filter.name === controller.chosenFilters[i].name) {
              values.push(controller.chosenFilters[i].value);
            }
          }
          return values;
        }
      }
    };
  }

})();
