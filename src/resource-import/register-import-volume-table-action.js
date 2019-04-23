// @ngInject
export default function registerImportInstanceTableAction($rootScope,
                                                          WorkspaceService,
                                                          TableExtensionService,
                                                          features,
                                                          ImportUtils,
                                                          importResourcesService) {
  if (features.isVisible('import')) {
    $rootScope.$on('WORKSPACE_CHANGED', () => {
      let workspace = WorkspaceService.getWorkspace();
      if (workspace.workspace !== 'project') {
        return;
      }

      let callback = () => {
        ImportUtils.openImportDialog(
          '<import-volumes-list provider="provider"></import-volumes-list>',
          importResourcesService,
          'volumes',
          'refreshVolumesList',
        );
      };
      let action = ImportUtils.getImportAction(workspace.customer, workspace.project, gettext('Import volume'), callback, true);
      TableExtensionService.registerTableActions('resource-volumes-list', [action]);
    });
  }
}
