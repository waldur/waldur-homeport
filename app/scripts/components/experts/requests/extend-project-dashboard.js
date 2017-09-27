export default function registerExtensionPoint(extensionPointService, features) {
  if (features.isVisible('experts')) {
    extensionPointService.register('project-dashboard-button', '<expert-request-button/>');
  }
}
