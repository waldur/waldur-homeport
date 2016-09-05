'use strict';

(function() {
  angular.module('ncsaas')
    .directive('selectWorkspaceToggle', selectWorkspaceToggle);

  function selectWorkspaceToggle() {
    return {
      restrict: 'E',
      templateUrl: 'views/directives/select-workspace-toggle.html',
      controller: 'SelectWorkspaceToggleController',
      controllerAs: 'SelectWorkspaceToggleController',
      bindToController: true
    }
  }

  angular.module('ncsaas')
    .controller('SelectWorkspaceToggleController', SelectWorkspaceToggleController);

  SelectWorkspaceToggleController.$inject = ['$uibModal', '$scope', 'currentStateService'];

  function SelectWorkspaceToggleController($uibModal, $scope, currentStateService) {
    var ctrl = this;
    this.selectWorkspace = selectWorkspace;
    activate();

    function activate() {
      $scope.$on('currentProjectUpdated', function() {
        refreshProject();
      });
      $scope.$on('currentCustomerUpdated', function() {
        refreshCustomer();
      });
      refreshProject();
      refreshCustomer();
    }

    function refreshProject() {
      currentStateService.getProject().then(function(project) {
        ctrl.project = project;
      });
    }

    function refreshCustomer() {
      currentStateService.getCustomer().then(function(customer) {
        ctrl.customer = customer;
      });
    }

    function selectWorkspace() {
      $uibModal.open({
        templateUrl: 'views/directives/select-workspace-dialog.html',
        controller: 'SelectWorkspaceDialogController',
        controllerAs: 'Ctrl',
        bindToController: true,
        size: 'lg'
      });
    }
  }
})();
