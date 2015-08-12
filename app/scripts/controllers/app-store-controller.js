(function() {
  angular.module('ncsaas')
    .controller('AppStoreController', [
      'baseControllerAddClass', 'servicesService', 'currentStateService', 'ENV', 'defaultPriceListItemsService', 'blockUI',
      AppStoreController]);

  function AppStoreController(baseControllerAddClass, servicesService, currentStateService, ENV,
                              defaultPriceListItemsService, blockUI) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      UNIQUE_FIELDS: {
        service_project_link: 'service_project_link',
        ssh_public_key: 'ssh_public_key',
        configuration: 'configuration'
      },
      FIELD_TYPES: {
        string: 'string',
        field: 'field',
        integer: 'integer'
      },

      secondStep: false,
      thirdStep: false,
      resourceTypesBlock: false,

      activeTab: null,
      successMessage: 'Purchase of {vm_name} was successful.',
      formOptions: {},
      allFormOptions: {},
      selectedService: {},
      selectedServiceName: null,
      selectedCategory: {},
      selectedResourceType: null,
      currentCustomer: {},
      currentProject: {},
      compare: [],
      providers: [],
      services: {},

      configureStepNumber: 4,
      selectedPackageName: null,
      agreementShow: false,

      // cart
      total: 0,
      defaultPriceListItems: [],
      priceItems: [],

      init:function() {
        this.service = servicesService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentProjectUpdated', this.setCurrentProject.bind(controllerScope));
        this._super();
        this.listState = 'resources.list';
        this.categories = ENV.appStoreCategories;
      },
      activate:function() {
        var vm = this;
        servicesService.getServicesList().then(function(response) {
          vm.servicesList = response;
        });
        currentStateService.getCustomer().then(function(response) {
          vm.currentCustomer = response;
        });
        vm.setCurrentProject();
      },
      setCategory: function(category) {
        this.selectedCategory = category;
        this.secondStep = true;
        this.selectedService = {};
        this.selectedServiceName = null;
        this.resourceTypesBlock = false;
        this.thirdStep = false;
        for (var i = 0; i < this.currentProject.services.length; i++) {
          var service = this.currentProject.services[i];
          if (service.state != 'Erred'
            && (this.selectedCategory.services.indexOf(service.type) + 1)
            && !(this.providers.indexOf(service.type) + 1)
          ) {
            this.providers.push(service.type);
            this.services[service.type] = service;
          }
        }
      },
      setService:function(service) {
        this.selectedService = this.servicesList[service];
        this.selectedServiceName = service;
        this.resourceTypesBlock = true;
        this.thirdStep = false;
        this.formOptions = {};
        if (this.selectedService) {
          var types = Object.keys(this.selectedService.resources);
          if (types.length === 1) {
            this.setResourceType(types[0]);
            this.resourceTypesBlock = false;
            this.configureStepNumber = 3;
          } else {
            this.configureStepNumber = 4;
          }
        }
      },
      setResourceType: function(type) {
        var vm = this;
        vm.selectedResourceType = type;
        vm.thirdStep = true;
        vm.formOptions = {};
        if (vm.selectedService.resources[vm.selectedResourceType]) {
          vm.instance = servicesService.$create(vm.selectedService.resources[vm.selectedResourceType]);
          servicesService.getOption(vm.selectedService.resources[vm.selectedResourceType]).then(function(response) {
            vm.setFormOptions(response.actions.POST);
            vm.setServiceProjectLink(response.actions.POST);
          });
        }
      },
      setServiceProjectLink: function(formOptions) {
        var links = formOptions[this.UNIQUE_FIELDS.service_project_link].choices;
        var linkName = this.services[this.selectedServiceName].name + ' | ' + this.currentProject.name;
        var link = '';
        for (var i = 0; i < links.length; i++) {
          if (links[i].display_name == linkName) {
            link = links[i].value;
            break;
          }
        }
        this.instance[this.UNIQUE_FIELDS.service_project_link] = link;
      },
      setFormOptions: function(formOptions) {
        this.allFormOptions = formOptions;
        this.activeTab = null;
        for (var name in formOptions) {
          if (!formOptions[name].read_only && name != this.UNIQUE_FIELDS.service_project_link) {
            this.formOptions[formOptions[name].type] = this.formOptions[formOptions[name].type] || {};
            if (name == this.UNIQUE_FIELDS[name]) {
              this.formOptions[name] = formOptions[name];
            } else {
              if (!this.activeTab && formOptions[name].type == this.FIELD_TYPES.field) {
                this.activeTab = name;
              }
              this.formOptions[formOptions[name].type][name] = formOptions[name];
            }
          }
        }
      },
      doChoice: function(name, choice) {
        var vm = this;
        this.instance[name] = choice.value;
        if (vm.defaultPriceListItems.length) {
          vm.setPriceItem(name, choice);
        } else {
          defaultPriceListItemsService.getList().then(function(response) {
            vm.defaultPriceListItems = response;
            vm.setPriceItem(name, choice);
          });
        }
      },
      setPriceItem: function(name, choice) {
        var itemTypes,
          index,
          price = 0,
          item;

        itemTypes = this.priceItems.map(function(item) {
          return item.type;
        });
        index = itemTypes.indexOf(name);
        if (index + 1) {
          this.priceItems.splice(index, 1);
        }
        for (var i = 0; i < this.defaultPriceListItems.length; i++) {
          var priceItem = this.defaultPriceListItems[i];
          if (priceItem.item_type == name
            && ((choice.display_name.indexOf(priceItem.key) > -1)
            || (priceItem.resource_content_type.indexOf(this.selectedResourceType.toLowerCase()) > -1))
          ) {
            price = priceItem.value;
            break;
          }
        }
        item = {
          type: name,
          name: choice.display_name,
          price: price
        };
        this.priceItems.push(item);
        this.countTotal();
      },
      countTotal: function() {
        this.total = 0;
        for (var i = 0; i < this.priceItems.length; i++) {
          this.total += this.priceItems[i].price * 1;
        }
      },
      setCurrentProject: function() {
        var vm = this;
        var myBlockUI = blockUI.instances.get('store-content');
        myBlockUI.start();
        currentStateService.getProject().then(function(response) {
          vm.currentProject = response;
          myBlockUI.stop();
        });
      },
      canSave: function() {
        for (var name in this.allFormOptions) {
          if (this.allFormOptions[name].required && !this.instance[name]) {
            return false;
          }
        }
        return true;
      },
      onError: function() {
        var message = '';
        for (var name in this.errors) {
          if (this.allFormOptions[name]) {
            message += this.allFormOptions[name].label + ': ' + this.errors[name] + '<br/>';
          } else {
            message += name+ ': ' + this.errors[name] + '<br/>';
          }
        }
        this.errorFlash(message);
      },
      setCompare: function(categoryName) {
        var index = this.compare.indexOf(categoryName);
        if (index + 1) {
          this.compare.splice(index, 1);
        } else {
          this.compare.push(categoryName);
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
