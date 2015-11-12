(function() {
  angular.module('ncsaas')
    .controller('CustomerServiceTabController', [
      '$stateParams',
      'baseServiceListController',
      'joinService',
      'servicesService',
      'usersService',
      'ncUtils',
      'ncUtilsFlash',
      CustomerServiceTabController
    ]);

  function CustomerServiceTabController(
    $stateParams,
    baseServiceListController,
    joinService,
    servicesService,
    usersService,
    ncUtils,
    ncUtilsFlash) {
    var controllerScope = this;
    var Controller = baseServiceListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.service = joinService;
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.expandableOptions = [
          {
            isList: false,
            addItemBlock: false,
            viewType: 'details',
            title: 'Settings',
            fieldsToHide: [
              'dummy'
            ]
          }
        ];
        this.blockUIElement = 'tab-content';
        this._super();
        this.entityOptions.list[0].type = 'editable';
        this.entityOptions.entityData.expandable = true;
      },
      showMore: function(service) {
        var vm = this;
        usersService.getCurrentUser().then(function(user) {
          service.editable = user.is_staff || !service.shared;
          if (!service.editable || service.values) {
            return;
          }

          var promise = vm.service.getOptions(service.service_type).then(function(options) {
            service.options = options;
            service.fields = vm.getFields(options);

            return servicesService.$get(null, service.settings).then(function(settings) {
              service.values = settings;
            });
          });

          ncUtils.blockElement(service.uuid, promise);
        });
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
      afterGetList: function() {
        var vm = this;
        var service_type = $stateParams.providerType;
        var uuid = $stateParams.providerUuid;

        if (service_type && uuid) {
          var item = vm.findItem(service_type, uuid);
          if (item) {
            // Move found element to the start of the list for user's convenience
            vm.list.splice(vm.list.indexOf(item), 1);
            vm.list.unshift(item);
            vm.showMore(item);
            item.expandItemOpen = true;
          } else {
            this.service.$get(service_type, uuid).then(function(provider) {
              vm.list.unshift(provider);
              vm.showMore(provider);
              provider.expandItemOpen = true;
            });
          }
        }
      },
      findItem: function(service_type, uuid) {
        for (var i = 0; i < this.list.length; i++) {
          var item = this.list[i];
          if (item.uuid == uuid && item.service_type == service_type) {
            return item;
          }
        }
      },
      updateSettings: function(service) {
        var url = service.settings;
        var data = this.getData(service);
        return joinService.update(url, data).then(
          this.onSaveSuccess.bind(this, service),
          this.onSaveError.bind(this, service)
        );
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

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {

  angular.module('ncsaas')
    .controller('CustomerProjectTabController', [
      'BaseProjectListController', CustomerProjectTabController]);

  function CustomerProjectTabController(BaseProjectListController) {
    var controllerScope = this;
    var Controller = BaseProjectListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
        this.entityOptions.entityData.title = '';
        this.entityOptions.entityData.checkQuotas = 'project';
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();

(function() {
  angular.module('ncsaas')
    .service('BaseCustomerResourcesTabController', [
      '$stateParams',
      'baseResourceListController',
      'ENTITYLISTFIELDTYPES',
      BaseCustomerResourcesTabController]);

  function BaseCustomerResourcesTabController(
    $stateParams,
    baseResourceListController,
    ENTITYLISTFIELDTYPES
  ) {

    var controllerClass = baseResourceListController.extend({
      init:function() {
        this._super();
        this.service.defaultFilter.customer = $stateParams.uuid;
        this.entityOptions.list.push({
          name: 'Project',
          propertyName: 'project_name',
          link: 'projects.details({uuid: entity.project_uuid})',
          type: ENTITYLISTFIELDTYPES.name
        });
      }
    });
    return controllerClass;
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerResourcesTabController', [
      'BaseCustomerResourcesTabController', 'ENV',
      CustomerResourcesTabController
    ]);

  function CustomerResourcesTabController(BaseCustomerResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseCustomerResourcesTabController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.category = ENV.VirtualMachines;
        this._super();
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {

  angular.module('ncsaas')
    .controller('CustomerApplicationsTabController', [
      'BaseCustomerResourcesTabController', 'ENV',
      CustomerApplicationsTabController]);

  function CustomerApplicationsTabController(BaseCustomerResourcesTabController, ENV) {
    var controllerScope = this;
    var ResourceController = BaseCustomerResourcesTabController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this.category = ENV.Applications;
        this._super();

        this.entityOptions.entityData.noDataText = 'You have no applications yet';
        this.entityOptions.entityData.createLinkText = 'Create application';
        this.entityOptions.entityData.importLinkText = 'Import application';
      }
    });
    controllerScope.__proto__ = new ResourceController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerAlertsListController', [
      'BaseAlertsListController',
      'currentStateService',
      CustomerAlertsListController]);

  function CustomerAlertsListController(BaseAlertsListController, currentStateService) {
    var controllerScope = this;
    var controllerClass = BaseAlertsListController.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
      },
      getList: function(filter) {
        var vm = this;
        var fn = this._super.bind(vm);
        filter = filter || {};
        return currentStateService.getCustomer().then(function(customer) {
          vm.service.defaultFilter.aggregate = 'customer';
          vm.service.defaultFilter.uuid = customer.uuid;
          vm.service.defaultFilter.opened = true;
          return fn(filter);
        })
      }
    });

    controllerScope.__proto__ = new controllerClass();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('CustomerEventTabController', [
      'baseEventListController',
      'currentStateService',
      CustomerEventTabController
    ]);

  function CustomerEventTabController(baseEventListController, currentStateService) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({

      init: function() {
        this.controllerScope = controllerScope;
        this._super();
      },

      getList: function(filter) {
        var vm = this,
          fn = this._super.bind(vm);
        return currentStateService.getCustomer().then(function(customer) {
          vm.service.defaultFilter.scope = customer.url;
          return fn(filter);
        });
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();
(function() {
  angular.module('ncsaas')
      .controller('CustomerDeleteTabController', [
        'baseControllerClass',
        'customersService',
        'currentStateService',
        '$state',
        '$window',
        CustomerDeleteTabController
      ]);

  function CustomerDeleteTabController(
      baseControllerClass,
      customersService,
      currentStateService,
      $state,
      $window
  ) {
    var controllerScope = this;
    var DeleteController = baseControllerClass.extend({
      init: function() {
        this.controllerScope = controllerScope;
        this._super();
        var vm = this;
        currentStateService.getCustomer().then(function(customer) {
          vm.customer = customer;
        });
      },
      removeCustomer: function() {
        var confirmDelete = confirm('Confirm deletion?');
        if (confirmDelete) {
          this.customer.$delete().then(function(instance) {
            customersService.clearAllCacheForCurrentEndpoint();
            customersService.getPersonalOrFirstCustomer(instance.name).then(function(customer) {
              currentStateService.setCustomer(customer);
              $state.transitionTo('organizations.details', {uuid: customer.uuid}, {notify: false});
              $window.location.reload();
            });
          });
        }
      }
    });

    controllerScope.__proto__ = new DeleteController();
  }

})();
