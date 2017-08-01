import registerSidebarExtension from './sidebar';
import registerTableExtension from './user-organizations';
import registerAppstoreCategory from './appstore-category';
import workspaceSelector from './workspace-selector.html';
import customerWorkspace from './customer-workspace.html';

function registerExtensionPoint(extensionPointService) {
  extensionPointService.register('organization-selector', workspaceSelector);
  extensionPointService.register('customer-workspace-header', customerWorkspace);
}

export default module => {
  module.run(registerSidebarExtension);
  module.run(registerExtensionPoint);
  module.run(registerTableExtension);
  module.run(registerAppstoreCategory);
};
