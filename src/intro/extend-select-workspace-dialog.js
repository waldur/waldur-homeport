// @ngInject
export default function registerExtensionPoint(extensionPointService) {
  extensionPointService.register('select-workspace-header-action', '<intro-button visible-if="\'intro\'"></intro-button>');
}
