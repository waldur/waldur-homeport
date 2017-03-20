'use strict';

(function() {
  angular.module('ncsaas')
    .service('currentStateService', ['$q', 'ENV', 'ncUtils', '$rootScope', currentStateService]);

  /**
   * This service contains values of objects, that affect current displayed data.
   * Notice: CurrentStateService can not make any backend calls. It stores only selected on user-side objects.
   */
  function currentStateService($q, ENV, ncUtils, $rootScope) {
    var vm = this;
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
    var customer = null;
    var project = null;
    var hasCustomer = undefined;
    var ownerOrStaff = undefined;

    $rootScope.$on('logoutStart', function() {
      vm.setCustomer(null);
      vm.setProject(null);
      vm.isCustomerDefined = false;
      vm.setHasCustomer(undefined);
      vm.setOwnerOrStaff(undefined);
    });

    function setProject(newProject) {
      project = newProject;
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

    function reloadCurrentCustomer(callback) {
      // TODO: Remove calls to this method
    }
  }
})();
