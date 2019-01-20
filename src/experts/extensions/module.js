import registerSidebarExtension from './sidebar';
import registerTableExtension from './table-extension';
import registerAppstoreCategory from './appstore-category';
import workspaceSelector from './workspace-selector.html';
import customerWorkspace from './customer-workspace.html';
import expertRequestCreateButton from './expert-request-create-button';

// @ngInject
function registerExtensionPoint(extensionPointService, features) {
  if (features.isVisible('experts')) {
    extensionPointService.register('project-dashboard-button', '<expert-request-create-button></expert-request-create-button>');
    extensionPointService.register('organization-dashboard-button', '<expert-request-create-button select-project=true ></expert-request-create-button>');
    extensionPointService.register('organization-selector', workspaceSelector);
    extensionPointService.register('organization-dashboard-button', customerWorkspace);
  }
}

export default module => {
  module.component('expertRequestCreateButton', expertRequestCreateButton);
  module.run(registerSidebarExtension);
  module.run(registerExtensionPoint);
  module.run(registerTableExtension);
  module.run(registerAppstoreCategory);
};
