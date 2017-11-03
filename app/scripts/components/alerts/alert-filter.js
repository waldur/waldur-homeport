import template from './alert-filter.html';

export default function alertFilter() {
  return {
    restrict: 'A',
    scope: {
      filterController: '='
    },
    template: template,
    controller: AlertFilterController
  };
}

// @ngInject
function AlertFilterController($scope) {
  $scope.openedOnly = true;

  function updateDefaultFilter() {
    let defaultFilter = $scope.filterController.service.defaultFilter;
    if ($scope.openedOnly) {
      defaultFilter.opened = true;
    } else {
      delete defaultFilter['opened'];
    }
    if ($scope.closedOnly) {
      defaultFilter.closed = true;
    } else {
      delete defaultFilter['closed'];
    }
    $scope.filterController.getList();
  }

  $scope.$watch('openedOnly', function() {
    updateDefaultFilter();
  });
}
