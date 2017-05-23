// @ngInject
export default function importResourceButton() {
  return {
    restrict: 'E',
    templateUrl: 'views/directives/import-resource-button.html',
    scope: {
      resource: '=',
      toggle: '=',
    }
  };
}
