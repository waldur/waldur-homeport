/**
 * This service contains values of objects, that affect current displayed data.
 * Notice: CurrentStateService can not make any backend calls. It stores only selected on user-side objects.
 */
// @ngInject
export default function currentStateService($q, ENV, ncUtils, $rootScope) {
  let vm = this;
  vm.getCustomer = getCustomer;
  vm.setCustomer = setCustomer;
  vm.reloadCurrentCustomer = reloadCurrentCustomer;
  vm.isCustomerDefined = false;

  vm.getProject = getProject;
  vm.setProject = setProject;
  vm.getCustomerUuid = getCustomerUuid;
  vm.getProjectUuid = getProjectUuid;
  vm.isQuotaExceeded = isQuotaExceeded;

  vm.getHasCustomer = getHasCustomer;
  vm.setHasCustomer = setHasCustomer;

  vm.getOwnerOrStaff = getOwnerOrStaff;
  vm.setOwnerOrStaff = setOwnerOrStaff;

  // private variables:
  let customer = null;
  let project = null;
  let hasCustomer = undefined;
  let ownerOrStaff = undefined;

  $rootScope.$on('logoutStart', function() {
    vm.setCustomer(null);
    vm.setProject(null);
    vm.isCustomerDefined = false;
    vm.setHasCustomer(undefined);
    vm.setOwnerOrStaff(undefined);
  });

  function setProject(newProject) {
    project = newProject;
    $rootScope.$broadcast('setCurrentProject', { project });
  }

  function getProject() {
    // TODO: Remove promise wrapper
    return $q.when(project);
  }

  function getProjectUuid() {
    return project && project.uuid;
  }

  function setCustomer(newCustomer) {
    customer = newCustomer;
    $rootScope.$broadcast('setCurrentCustomer', { customer });
  }

  function getCustomer() {
    // TODO: Remove promise wrapper
    return $q.when(customer);
  }

  function getCustomerUuid() {
    return customer && customer.uuid;
  }

  function getHasCustomer() {
    return hasCustomer;
  }

  function setHasCustomer(value) {
    hasCustomer = value;
    $rootScope.$broadcast('hasCustomer', value);
  }

  function getOwnerOrStaff() {
    return ownerOrStaff;
  }

  function setOwnerOrStaff(value) {
    ownerOrStaff = value;
    $rootScope.$broadcast('ownerOrStaff', value);
  }

  function isQuotaExceeded(entity) {
    return vm.getCustomer().then(function(response) {
      response.quotas = response.quotas || [];
      return ncUtils.isCustomerQuotaReached(response, entity);
    });
  }

  // eslint-disable-next-line no-unused-vars
  function reloadCurrentCustomer(callback) {
    // TODO: Remove calls to this method
  }
}
