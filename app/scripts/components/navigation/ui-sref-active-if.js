// @ngInject
export default function uiSrefActiveIf($state) {
  // See also: https://github.com/angular-ui/ui-router/issues/1431
  // TODO: Migrate to angular-ui-router 1.x branch and drop this custom directive
  return {
    restrict: 'A',
    link: function($scope, $element, $attrs) {
      let state = $attrs.uiSrefActiveIf;

      function update() {
        if ($state.includes(state) || $state.is(state)) {
          $element.addClass('active');
        } else {
          $element.removeClass('active');
        }
      }

      $scope.$on('$stateChangeSuccess', update);
      update();
    }
  };
}
