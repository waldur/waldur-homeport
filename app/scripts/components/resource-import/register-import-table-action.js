// @ngInject
export default function registerImportTableAction($rootScope,
                                                  WorkspaceService,
                                                  TableExtensionService,
                                                  features,
                                                  ImportUtils,
                                                  importVirtualMachinesService) {
  if (features.isVisible('import')) {
    $rootScope.$on('WORKSPACE_CHANGED', () => {
      let workspace = WorkspaceService.getWorkspace();
      if (workspace.workspace !== 'project') {
        return;
      }

      let callback = () => {
        ImportUtils.openImportDialog(
          '<import-virtual-machines-list provider="provider"/>',
          importVirtualMachinesService,
          'vms',
          'refreshVirtualMachinesList',
        );
      };
      let action = ImportUtils.getImportAction(workspace.customer, workspace.project, gettext('Import virtual machine'), callback);
      TableExtensionService.registerTableActions('resource-vms-list', [action]);
    });
  }
}
