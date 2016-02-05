'use strict';

(function() {
  angular.module('ncsaas')
    .directive('serviceSettingsEditor', [serviceSettingsEditor]);

  function serviceSettingsEditor() {
    return {
      restrict: 'A',
      scope: {
        service: '='
      },
      replace: true,
      controller: 'ServiceSettingsEditorController',
      templateUrl: 'views/directives/service-settings-editor.html'
    };
  }
})();


(function() {
  angular.module('ncsaas')
    .controller('ServiceSettingsEditorController', [
      '$scope',
      'usersService',
      'servicesService',
      'ncUtils',
      'joinService',
      ServiceSettingsEditorController
    ]);

  function ServiceSettingsEditorController(
    $scope,
    usersService,
    servicesService,
    ncUtils,
    joinService) {
    angular.extend($scope, {
      init: function() {
        this.loadService($scope.service);
      },
      loadService: function(service) {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          service.editable = user.is_staff || !service.shared;
          if (!service.editable || service.values) {
            return;
          }

          return joinService.getOptions(service.service_type).then(function(options) {
            service.options = options;
            service.fields = vm.getFields(options);

            return servicesService.$get(null, service.settings).then(function(settings) {
              service.values = settings;
            });
          });
        });
      },
      updateSettings: function(service) {
        var url = service.settings;
        var data = this.getData(service);
        return joinService.update(url, data).then(
          this.onSaveSuccess.bind(this, service),
          this.onSaveError.bind(this, service)
        );
      },
      getFields: function(options) {
        var fields = [];
        var blacklist = ['name', 'customer', 'settings'];
        for (var name in options) {
          var option = options[name];
          if (!option.read_only && blacklist.indexOf(name) == -1) {
            option.name = name;
            fields.push(option);
          }
        }
        return fields;
      },
      getFilename: ncUtils.getFilename,
      isDisabled: function(service) {
        for (var name in service.values) {
          var option = service.options[name];
          var value = service.values[name];
          if (option && option.required && !value) {
            return true;
          }
        }
        return false;
      },
      getData: function(service) {
        var values = {};
        for (var name in service.values) {
          var option = service.options[name];
          if (!option || option.read_only) {
            continue;
          }
          var value = service.values[name];
          if (!value) {
            continue;
          }
          if (ncUtils.isFileOption(option)) {
            if (value.length != 1 || !ncUtils.isFileValue(value[0])) {
              continue;
            }
            value = value[0];
          }
          values[name] = value;
        }
        return values;
      },
      update: function(service) {
        var saveService = joinService.$update(null, service.url, service);
        return saveService.then(this.onSaveSuccess.bind(this), this.onSaveError.bind(this, service));
      },
      onSaveSuccess: function(service) {
        if (service) {
          this.saveRevision(service);
        }
      },
      onSaveError: function(service, response) {
        var message = '';
        for (var name in response.data) {
          message += (service.options[name] ? service.options[name].label : name) + ': ' + response.data[name];
        }
        if (message) {
          ncUtilsFlash.error('Unable to save provider. ' + message);
        }
      },
      hasChanged: function(model) {
        if (!model.values) {
          return false;
        }

        if (!model.revision) {
          this.saveRevision(model);
          return false;
        }

        return this.revisionsDiffer(model.revision, model.values.toJSON());
      },
      saveRevision: function(model) {
        if (model.values) {
          model.revision = model.values.toJSON();
        }
      },
      revisionsDiffer: function(revision1, revision2) {
        for (var name in revision1) {
          var val1 = revision1[name] ? revision1[name] : '';
          var val2 = revision2[name] ? revision2[name] : '';
          if (val1 != val2) {
            return true;
          }
        }
      }
    });
    $scope.init();
  }
})();
