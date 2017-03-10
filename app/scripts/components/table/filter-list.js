import template from './filter-list.html';

export default function filterList() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      searchFilters: '=',
      onSelect: '&'
    },
    link: function ($scope) {
      $scope.$watch('searchFilters', function() {
        $scope.onSelect();
      }, true);
    }
  };
}
