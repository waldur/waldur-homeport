// @ngInject
export default function registerImportVPCTableAction($rootScope,
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
          '<import-virtual-clouds-list provider="provider"></import-virtual-clouds-list>',
          importResourcesService,
          'private_clouds',
          'PrivateCloudImported',
        );
      };
      let action = ImportUtils.getImportAction(workspace.customer, workspace.project, gettext('Import private cloud'), callback);
      TableExtensionService.registerTableActions('resource-private-clouds-list', [action]);
    });
  }
}
