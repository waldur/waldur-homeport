import template from './provider-settings.html';

export default function providerSettings() {
  return {
    restrict: 'E',
    scope: {
      service: '=provider'
    },
    controller: ProviderSettingsController,
    template: template
  };
}

// @ngInject
function ProviderSettingsController(
  $scope,
  $q,
  $rootScope,
  usersService,
  servicesService,
  currentStateService,
  customersService,
  ncUtils,
  ncUtilsFlash,
  ncServiceUtils,
  joinService,
  ENV) {
  angular.extend($scope, {
    init: function() {
      var vm = this;
      vm.loading = true;
      vm.loadService($scope.service).finally(function() {
        vm.loading = false;
      });
      vm.defaultErrorMessage = ENV.defaultErrorMessage;
    },
    loadService: function(service) {
      var vm = this;
      return currentStateService.getCustomer().then(customer => {
        vm.customer = customer;
      }).then(() => {
        return usersService.getCurrentUser().then(user => {
          vm.user = user;
          service.nameEditable = customersService.checkCustomerUser(vm.customer, vm.user);
        });
      }).then(() => {
        service.editable = vm.user.is_staff || !service.shared;
        if (!service.editable) {
          service.values = {name: service.name};
        }
        if (service.values) {
          return;
        }

        return joinService.getOptions(service.service_type).then(function(options) {
          service.options = options;
          service.fields = vm.getFields(options);

          return servicesService.$get(null, service.settings).then(function(settings) {
            service.values = settings.toJSON();
            service.values.name = service.name;
            angular.forEach(service.fields, function(field) {
              if (angular.isUndefined(service.values[field.name])) {
                service.values[field.name] = '';
              }
            });
          });
        });
      });
    },
    getFields: function(options) {
      var fields = [];
      var blacklist = ['name', 'customer', 'settings', 'available_for_all', 'scope', 'project'];
      var secretFields = ['password', 'token'];
      for (var name in options) {
        var option = options[name];
        if (!option.read_only && blacklist.indexOf(name) === -1) {
          option.name = name;
          option.secret = secretFields.indexOf(name) !== -1;
          fields.push(option);
        }
      }
      return fields;
    },
    getFilename: ncUtils.getFilename,
    isDisabled: function() {
      var service = $scope.service;
      for (var index in service.fields) {
        var name = service.fields[index].name;
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
      for (var index in service.fields) {
        var name = service.fields[index].name;
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
    updateServiceName: function(name) {
      return joinService.$update(null, $scope.service.url, {name: name}).then(function() {
        $scope.service.name = name;
        ncUtilsFlash.success(gettext('Provider name has been updated'));
        $rootScope.$broadcast('refreshProviderList');
      }).catch(function() {
        ncUtilsFlash.success(gettext('Unable to update provider name'));
      });
    },
    updateSettings: function() {
      var service = $scope.service;
      var url = service.settings;
      var data = this.getData(service);
      var promises = [];
      if (service.nameEditable && service.revision.name !== service.values.name) {
        promises.push(this.updateServiceName(service.values.name));
      }
      if (service.editable) {
        promises.push(joinService.update(url, data));
      }
      return $q.all(promises).then(
        this.onSaveSuccess.bind(this, service),
        this.onSaveError.bind(this, service)
      );
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
        ncUtilsFlash.error(gettext('Unable to save provider.') + ' ' + message);
      }
    },
    hasChanged: function() {
      var model = $scope.service;
      if (!model.values) {
        return false;
      }

      if (!model.revision) {
        this.saveRevision(model);
        return false;
      }

      return !angular.equals(model.revision, model.values);
    },
    saveRevision: function(model) {
      if (model.values) {
        model.revision = angular.copy(model.values);
      }
    }
  });
  $scope.init();
}
