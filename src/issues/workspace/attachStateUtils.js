import { IssueNavigationService } from '@waldur/issues/workspace/IssueNavigationService';

// @ngInject
export function attachStateUtils($rootScope) {
  $rootScope.$on(
    '$stateChangeSuccess',
    function (event, toState, toParams, fromState, fromParams) {
      IssueNavigationService.setPrevState(fromState, fromParams);
    },
  );
}
