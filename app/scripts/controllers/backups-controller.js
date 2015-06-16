'use strict';

(function() {
  angular.module('ncsaas')
    .controller('BackupListController', [
      'backupsService',
      'baseControllerListClass',
      '$state',
      BackupListController
    ]);

  function BackupListController(backupsService, baseControllerListClass, $state) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init:function() {
        this.service = backupsService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'description';
        this.actionButtonsListItems = [
          {
            title: 'Restore',
            clickFunction: this.restoreBackup.bind(this.controllerScope)
          },
          {
            title: 'Remove',
            clickFunction: this.deleteBackup.bind(this.controllerScope)
          }
        ];
      },
      deleteBackup:function(backup) {
        var vm = this;
        vm.service.deleteBackup(backup.uuid).then(
          vm.getList, vm.handleActionException);
      },
      restoreBackup:function(backup) {
        $state.go('backups.restore', {uuid: backup.uuid});
      }
    });

    controllerScope.__proto__ = new Controller();

  }
})();

(function() {
  angular.module('ncsaas')
    .controller('BackupAddController', [
      'backupsService',
      'baseControllerAddClass',
      'resourcesService',
      BackupAddController
    ]);

  function BackupAddController(backupsService, baseControllerAddClass, resourcesService) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      sourcesListForAutoComplete: [],

      init: function() {
        this.service = backupsService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'backups.list';
        this.getResources();
      },
      getResources: function(name) {
        var vm = this,
          filter = name ? {name: name} : {};
        resourcesService.getList(filter).then(function(response) {
          vm.sourcesListForAutoComplete = response;
        });
      },
      sourceSearchInputChanged: function(searchText) {
        controllerScope.getResources(searchText);
      },
      selectedSourceCallback: function(selected) {
        if (selected) {
          controllerScope.instance.backup_source = selected.originalObject.url;
        }
      },
      getSuccessMessage: function() {
        return this.successMessage.replace('{vm_name}', this.instance.description);
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('RestoreBackupController', [
      'backupsService',
      'baseControllerAddClass',
      'flavorsService',
      '$stateParams',
      RestoreBackupController
    ]);

  function RestoreBackupController(backupsService, baseControllerAddClass, flavorsService, $stateParams) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      flavorsListForAutoComplete: [],
      flavor: null,
      resourceName: null,
      backup: null,

      init: function() {
        this.service = backupsService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'backups.list';
        this.getFlavors();
        this.successMessage = 'Restoring of {vm_name} was successful.'
      },
      activate: function () {
        var vm = this;
        backupsService.$get($stateParams.uuid).then(function(response) {
          vm.backup = response;
        });
      },
      getFlavors: function(name) {
        var vm = this,
          filter = name ? {name: name} : {};
        flavorsService.getList(filter).then(function(response) {
          vm.flavorsListForAutoComplete = response;
        });
      },
      flavorSearchInputChanged: function(searchText) {
        controllerScope.getFlavors(searchText);
      },
      selectedFlavorCallback: function(selected) {
        if (selected) {
          controllerScope.flavor = selected.originalObject.url;
        }
      },
      save: function() {
        var vm = this,
          inputs = {};
        if (vm.flavor) {
          inputs.flavor = vm.flavor;
        } else {
          vm.errors.flavor = ['This field is required.'];
          return;
        }
        if (vm.resourceName) {
          inputs.name = vm.resourceName;
        }
        vm.service.restoreBackup($stateParams.uuid, inputs).then(success, error);
        function success() {
          vm.afterSave();
          vm.successFlash(vm.getSuccessMessage());
          vm.successRedirect();
        }
        function error(response) {
          vm.errors = response.data;
        }
      }

    });

    controllerScope.__proto__ = new Controller();
  }
})();