// @ngInject
export default function registerImportTableAction($rootScope,
                                                  WorkspaceService,
                                                  TableExtensionService,
                                                  features,
                                                  ImportUtils,
                                                  importVolumesService) {
  if (features.isVisible('import')) {
    $rootScope.$on('WORKSPACE_CHANGED', () => {
      let workspace = WorkspaceService.getWorkspace();
      if (workspace.workspace !== 'project') {
        return;
      }

      let callback = () => {
        ImportUtils.openImportDialog(
          '<import-volumes-list provider="provider"/>',
          importVolumesService,
          'storages',
          'refreshVolumesList',
        );
      };
      let action = ImportUtils.getImportAction(workspace.customer, workspace.project, gettext('Import volume'), callback);
      TableExtensionService.registerTableActions('openstack-volumes-list', [action]);
    });
  }
}
