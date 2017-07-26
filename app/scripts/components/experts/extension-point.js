import template from './expert-indicator.html';

export default function registerExtensionPoint(extensionPointService) {
  extensionPointService.register('organization-selector', template);
}
