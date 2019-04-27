// @ngInject
export default function registerImportTableAction($rootScope,
                                                  WorkspaceService,
                                                  TableExtensionService,
                                                  features,
                                                  ImportUtils,
                                                  importSnapshotsService) {
  if (features.isVisible('import')) {
    $rootScope.$on('WORKSPACE_CHANGED', () => {
      let workspace = WorkspaceService.getWorkspace();
      if (workspace.workspace !== 'project') {
        return;
      }

      let callback = () => {
        ImportUtils.openImportDialog(
          '<import-snapshots-list provider="provider"></import-snapshots-list>',
          importSnapshotsService,
          'storages',
          'refreshSnapshotsList',
        );
      };
      let action = ImportUtils.getImportAction(workspace.customer, workspace.project, gettext('Import snapshot'), callback, true);
      TableExtensionService.registerTableActions('openstack-snapshots-list', [action]);
    });
  }
}
