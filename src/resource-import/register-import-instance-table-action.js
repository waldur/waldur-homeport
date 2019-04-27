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
          '<import-virtual-machines-list provider="provider"></import-virtual-machines-list>',
          importResourcesService,
          'vms',
          'refreshVirtualMachinesList',
        );
      };
      let action = ImportUtils.getImportAction(workspace.customer, workspace.project, gettext('Import virtual machine'), callback, true);
      TableExtensionService.registerTableActions('resource-vms-list', [action]);
    });
  }
}
