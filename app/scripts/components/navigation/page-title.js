// TODO: Convert directive to service
// @ngInject
export default function pageTitle($rootScope, $timeout, ENV) {
  return {
    link: function(scope, element) {
      const listener = function(event, toState) {
        let title = ENV.modePageTitle;
        if (toState.data && toState.data.pageTitle) {
          title = ENV.shortPageTitle + ' | ' + toState.data.pageTitle;
        }
        $timeout(function() {
          element.text(title);
        });
      };
      $rootScope.$on('$stateChangeSuccess', listener);
    }
  };
}
