'use strict';

(function() {
  angular.module('ncsaas')
    .controller('BackupSchedulesAddController', [
      'backupSchedulesService',
      'baseControllerAddClass',
      'resourcesService',
      BackupSchedulesAddController
    ]);

  function BackupSchedulesAddController(backupSchedulesService, baseControllerAddClass, resourcesService) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      sourcesListForAutoComplete: [],

      init: function() {
        this.service = backupSchedulesService;
        this.controllerScope = controllerScope;
        this._super();
        this.listState = 'backups.list';
        this.getResources();
        this.instance.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
