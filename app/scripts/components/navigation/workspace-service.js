export default class WorkspaceService {
  constructor($rootScope) {
    this.$rootScope = $rootScope;
  }

  setWorkspace(options) {
    this.options = options;
    this.$rootScope.$broadcast('WORKSPACE_CHANGED');
  }

  getWorkspace() {
    return this.options;
  }
}
