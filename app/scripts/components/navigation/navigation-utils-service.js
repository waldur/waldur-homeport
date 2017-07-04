export default class NavigationUtilsService {
  // @ngInject
  constructor($state, $rootScope) {
    this.$state = $state;
    this.$rootScope = $rootScope;
  }

  goBack() {
    const state = this.$rootScope.prevPreviousState;
    const params = this.$rootScope.prevPreviousParams;
    if (state && state.name && state.name !== 'errorPage.notFound' && state.name !== 'errorPage.limitQuota') {
      this.$state.go(state.name, params);
    } else {
      this.$state.go('profile.details');
    }
  }
}
