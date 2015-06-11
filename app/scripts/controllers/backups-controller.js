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
        this.actionButtonsListItems = [];
      }
    });

    controllerScope.__proto__ = new Controller();

  }
})();