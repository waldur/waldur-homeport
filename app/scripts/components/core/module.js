import attachTracking from './tracking';
import submitButton from './submit-button';

export default module => {
  module.run(attachTracking);
  module.directive('submitButton', submitButton);
  module.run(redirectToState);
};

// @ngInject
function redirectToState($rootScope, $state) {
  $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
    if (error && error.redirectTo) {
      $state.go(error.redirectTo);
    } else {
      $state.go('errorPage.notFound');
    }
  });
}
