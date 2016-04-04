'use strict';

(function() {

  angular.module('ncsaas')
    .directive('filterList', ['ENV', '$state', filterList]);

  function filterList() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/filter-list.html',
      scope: {
        filterController: '='
      },
      link: function ($scope) {
        var controller = $scope.filterController;
        $scope.toggleFilter = toggleFilter;
        $scope.isFilterChosen = isFilterChosen;

        if (controller.selectAll) {
          selectAll();
        }

        controller.chosenFilters = [];

        function toggleFilter(filter) {
          controller.hasCustomFilters = true;
          if (!isFilterChosen(filter)) {
            controller.chosenFilters.push(filter.value);
          } else {
            var index = controller.chosenFilters.indexOf(filter.value);
            controller.chosenFilters.splice(index, 1);
            if (!controller.chosenFilters.length) {
              controller.hasCustomFilters = true;
            }
          }

          var values = controller.chosenFilters;
          if (values.length > 0) {
            controller.service.defaultFilter[filter.name] = values;
          } else {
            if (controller.selectAll) {
              selectAll();
            } else {
              delete controller.service.defaultFilter[filter.name];
            }
          }

          controller.currentPage = 1;
          controller.service.page = 1;
          var searchFilter = {};
          searchFilter[controller.searchFieldName] = controller.searchInput;
          controller.getList(searchFilter);
        }

        function selectAll() {
          for (var i = 0; i < controller.searchFilters.length; i++) {
            var filter = controller.searchFilters[i];
            controller.service.defaultFilter[filter.name] = [];
          }
          for (var i = 0; i < controller.searchFilters.length; i++) {
            var filter = controller.searchFilters[i];
            controller.service.defaultFilter[filter.name].push(filter.value);
          }
        }

        function isFilterChosen(filter) {
          return controller.chosenFilters.indexOf(filter.value) !== -1;
        }
      }
    };
  }

})();
