export default class NavigationUtilsService {
  // @ngInject
  constructor($state, $rootScope, $uibModal) {
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.$uibModal = $uibModal;
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

  selectWorkspace() {
    let dialog = this.$uibModal.open({
      component: 'selectWorkspaceDialog',
      size: 'lg',
    });
    dialog.result.catch(() => {
      this.$rootScope.$emit('selectWorkspaceDialog.dismissed');
    });
  }
}
