export let $uibModal = null;
export let $uibModalStack = null;

// @ngInject
export default function injectServices($injector) {
  $uibModal = $injector.get('$uibModal');
  $uibModalStack = $injector.get('$uibModalStack');
}
