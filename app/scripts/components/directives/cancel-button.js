// @ngInject
export default function cancelButton($state, $window) {
  return {
    restrict: 'A',
    replace: true,
    link: function(scope, element) {
      element.bind('click', function() {
        if($window.history.length > 2) {
          $window.history.back();
        } else {
          $state.go('profile.details');
        }
      });
    }
  };
}
