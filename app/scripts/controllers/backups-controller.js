'use strict';

(function() {
  angular.module('ncsaas')
    .controller('BackupListController', [
      'backupsService',
      'baseControllerListClass',
      BackupListController
    ]);

  function BackupListController(backupsService, baseControllerListClass) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      init:function() {
        this.service = backupsService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'name';
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
        var vm = this;
        vm.service.restoreBackup(backup.uuid).then(
          vm.getList, vm.handleActionException);
      }
    });

    controllerScope.__proto__ = new Controller();

  }
})();
