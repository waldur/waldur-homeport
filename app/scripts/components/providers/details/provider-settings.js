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
  customersService,
  ncUtils,
  ncUtilsFlash,
  ncServiceUtils,
  joinService,
  ENV) {
  angular.extend($scope, {
    init: function() {
      this.loading = true;
      this.loadData($scope.service).finally(() => this.loading = false);
      this.defaultErrorMessage = ENV.defaultErrorMessage;
    },
    loadData: function(service) {
      return this.loadSettings(service)
        .then(settings => this.checkPermissions(settings))
        .then(editable => service.editable = editable)
        .then(() => joinService.getOptions(service.service_type))
        .then(options => {
          options = angular.extend({
            name: {
              type: 'string',
              required: true,
              read_only: false,
              label: gettext('Name'),
              max_length: 150
            },
          }, options);
          service.options = options;
          service.fields = this.getFields(options);
        });
    },
    loadSettings: function(service) {
      return servicesService.$get(null, service.settings).then(settings => {
        service.values = settings.toJSON();
        angular.forEach(service.fields, field => {
          if (angular.isUndefined(service.values[field.name])) {
            service.values[field.name] = '';
          }
        });
        return settings;
      });
    },
    checkPermissions: function(settings) {
      // User can update settings only if he is an owner of their customer or a staff
      return usersService.getCurrentUser().then(user => {
        if (!settings.customer) {
          return user.is_staff;
        } else {
          return customersService.$get(null, settings.customer).then(customer => {
            return customersService.checkCustomerUser(customer, user);
          });
        }
      });
    },
    getFields: function(options) {
      var fields = [];
      var blacklist = ['customer', 'settings', 'available_for_all', 'scope', 'project'];
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
        if (option && option.required && !value && angular.isUndefined(option.default_value)) {
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
    updateSettings: function() {
      var service = $scope.service;
      var url = service.settings;
      var data = this.getData(service);
      var promises = [];
      if (service.editable) {
        promises.push(joinService.update(url, data));
      }
      return $q.all(promises).then(
        this.onSaveSuccess.bind(this, service),
        this.onSaveError.bind(this, service)
      );
    },
    onSaveSuccess: function(service) {
      ncUtilsFlash.success(gettext('Provider has been updated'));
      $rootScope.$broadcast('refreshProviderList');

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
