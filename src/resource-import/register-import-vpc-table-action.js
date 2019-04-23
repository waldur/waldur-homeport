// @ngInject
export default function registerImportVPCTableAction(
  $rootScope,
  WorkspaceService,
  TableExtensionService,
  features,
  ImportUtils,
  importResourcesService,
  usersService) {
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
      usersService.getCurrentUser().then(user => {
        const action = ImportUtils.getImportAction(
          workspace.customer,
          workspace.project,
          gettext('Import private cloud'),
          callback,
          !user.is_staff,
        );
        TableExtensionService.registerTableActions('resource-private-clouds-list', [action]);
      });
    });
  }
}
