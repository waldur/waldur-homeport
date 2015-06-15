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
        this.searchFieldName = 'description';
        this.actionButtonsListItems = [];
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
