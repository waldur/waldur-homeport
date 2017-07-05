// @ngInject
export default function backButton(NavigationUtilsService) {
  return {
    restrict: 'A',
    replace: true,
    link: function(scope, element) {
      element.bind('click', function() {
        NavigationUtilsService.goBack();
      });
    }
  };
}
