import template from './filter-list.html';

export default function filterList() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      filterController: '='
    },
    link: function ($scope) {
      var controller = $scope.filterController;
      $scope.toggleFilter = toggleFilter;
      $scope.isFilterChosen = isFilterChosen;

      if (controller.defaultFilter) {
        toggleFilter(controller.defaultFilter);
      }

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
          delete controller.service.defaultFilter[filter.name];
        }

        controller.currentPage = 1;
        controller.service.page = 1;
        var searchFilter = {};
        searchFilter[controller.searchFieldName] = controller.searchInput;
        controller.getList(searchFilter);
      }

      function isFilterChosen(filter) {
        return controller.chosenFilters.indexOf(filter.value) !== -1;
      }
    }
  };
}
