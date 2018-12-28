// @ngInject
export default function registerExtensionPoint(extensionPointService) {
  extensionPointService.register('appstore-selector-dialog', '<request-service-button></request-service-button>');
}
