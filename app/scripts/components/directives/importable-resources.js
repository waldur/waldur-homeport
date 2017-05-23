// @ngInject
export default function importableResources() {
  return {
    restrict: 'E',
    templateUrl: 'views/directives/importable-resources.html',
    scope: {
      noResources: '=empty',
      currentProject: '=project',
      selectedService: '=service',
      resources: '=',
      toggleResource: '=toggle',
    },
    link: function(scope) {
      scope.selectAll = false;
      scope.toggleSelectAll = function() {
        scope.selectAll = !scope.selectAll;
        angular.forEach(scope.resources, function(resource) {
          scope.toggleResource(resource, scope.selectAll);
        });
      };
    }
  };
}
