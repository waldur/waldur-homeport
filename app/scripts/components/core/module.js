import attachTracking from './tracking';
import submitButton from './submit-button';
import quotasTable from './quotas-table';


export default module => {
  module.run(attachTracking);
  module.directive('submitButton', submitButton);
  module.run(redirectToState);
  module.component('quotasTable', quotasTable);
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
