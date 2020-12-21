import { StateUtilsService } from './StateUtilsService';

// @ngInject
export function attachStateUtils($rootScope) {
  $rootScope.$on(
    '$stateChangeSuccess',
    function (event, toState, toParams, fromState, fromParams) {
      StateUtilsService.setPrevState(fromState, fromParams);
    },
  );
}
