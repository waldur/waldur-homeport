import template from './appstore-offering.html';

export default function appstoreOffering() {
  return {
    restrict: 'E',
    template: template,
    controller: AppStoreOfferingController,
    controllerAs: 'OfferingController',
    scope: {},
    bindToController: true
  };
}

function AppStoreOfferingController(
  $stateParams, $state, issuesService, AppStoreUtilsService, ncUtilsFlash, ISSUE_IDS) {
  var vm = this;
  activate();
  vm.save = save;

  function activate() {
    vm.offering = AppStoreUtilsService.findOffering($stateParams.category);
    if (!vm.offering) {
      $state.go('errorPage.notFound');
    }
  }

  function save() {
    return issuesService.createIssue({
      summary: 'Please create a turnkey solution: ' + vm.offering.label,
      description: vm.details,
      type: ISSUE_IDS.SERVICE_REQUEST,
      is_reported_manually: true
    }).then(function() {
      $state.go('support.list');
    }, function(response) {
      vm.errors = response.data;
      ncUtilsFlash.error('Unable to create request for a turnkey solution.');
    });
  }
}
