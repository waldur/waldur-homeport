(function() {
  angular.module('ncsaas')
    .controller('AppStoreController', [
      'baseControllerAddClass',
      'servicesService',
      'currentStateService',
      'ENV',
      'defaultPriceListItemsService',
      'blockUI',
      '$q',
      '$state',
      '$stateParams',
      '$rootScope',
      'keysService',
      'usersService',
      'premiumSupportPlansService',
      'premiumSupportContractsService',
      'resourcesService',
      AppStoreController]);

  function AppStoreController(
    baseControllerAddClass,
    servicesService,
    currentStateService,
    ENV,
    defaultPriceListItemsService,
    blockUI,
    $q,
    $state,
    $stateParams,
    $rootScope,
    keysService,
    usersService,
    premiumSupportPlansService,
    premiumSupportContractsService,
    resourcesService) {
    var controllerScope = this;
    var Controller = baseControllerAddClass.extend({
      UNIQUE_FIELDS: {
        service_project_link: 'service_project_link',
      },
      FIELD_TYPES: {
        string: 'string',
        field: 'field',
        integer: 'integer'
      },

      currency: ENV.currency,

      secondStep: false,
      resourceTypesBlock: false,

      successMessage: 'Purchase of {vm_name} was successful.',
      formOptions: {},
      allFormOptions: {},
      selectedService: {},
      serviceType: null,
      selectedCategory: {},
      selectedResourceType: null,
      currentCustomer: {},
      currentProject: {},
      compare: [],
      providers: [],
      services: {},
      renderStore: false,
      loadingProviders: true,
      categoryServiceTypes: {},

      configureStepNumber: 5,
      selectedPackageName: null,
      agreementShow: false,

      // cart
      total: 0,
      defaultPriceListItems: [],
      priceItems: [],

      fields: [],
      limitChoices: 9,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
        this.setSignalHandler('currentProjectUpdated', this.setCurrentProject.bind(controllerScope));
        this._super();
      },
      activate:function() {
        var vm = this;
        servicesService.getServicesList().then(function(response) {
          vm.servicesMetadata = response;
          vm.setCurrentProject();
        });
        currentStateService.getCustomer().then(function(response) {
          vm.currentCustomer = response;
        });
      },
      setCategory: function(category) {
        if (category === this.selectedCategory) {
          return;
        }
        this.selectedCategory = category;
        this.secondStep = true;
        this.serviceMetadata = {};
        this.serviceType = null;
        this.selectedPackage = {};
        this.agreementShow = false;
        this.resourceTypesBlock = false;
        this.selectedResourceType = null;
        this.serviceTypes = this.categoryServiceTypes[this.selectedCategory.name];
        this.resetPriceItems();
      },
      setServiceType:function(serviceType) {
        this.serviceMetadata = this.servicesMetadata[serviceType];
        this.serviceType = serviceType;
        this.resourceTypesBlock = false;
        this.fields = [];
        if (this.services[serviceType].length == 1) {
          this.setService(this.services[serviceType][0]);
        }
      },
      setService: function(service) {
        this.selectedService = service;
        if (this.serviceMetadata) {
          var types = Object.keys(this.serviceMetadata.resources);
          if (types.length === 1) {
            this.setResourceType(types[0]);
            this.resourceTypesBlock = false;
            this.configureStepNumber = 4;
          } else {
            this.resourceTypesBlock = true;
            this.configureStepNumber = 5;
          }
        }
      },
      setResourceType: function(type) {
        var vm = this;
        vm.selectedResourceType = type;
        vm.fields = [];
        var resourceUrl = vm.serviceMetadata.resources[vm.selectedResourceType];
        if (resourceUrl) {
          vm.instance = servicesService.$create(resourceUrl);
          vm.instance.service_project_link = this.selectedService.service_project_link_url;
          servicesService.getOption(resourceUrl).then(function(response) {
            var formOptions = response.actions.POST
            vm.allFormOptions = formOptions;
            if (vm.serviceType == 'OpenStack') {
              vm.setOpenStackFields()
            } else {
              vm.setFields(formOptions);
            }
          });
        }
      },
      setOpenStackFields: function() {
        var vm = this;

        function formatChoices(items) {
          return items.map(function(item) {
            return {
              value: item.url,
              display_name: item.name
            }
          });
        }
        var query = {settings_uuid: vm.selectedService.settings_uuid};
        var imagesUrl = vm.serviceMetadata.properties.Image;
        var flavorsUrl = vm.serviceMetadata.properties.Flavor;

        var promises = [
          servicesService.getList(query, imagesUrl).then(formatChoices),
          servicesService.getList(query, flavorsUrl).then(formatChoices),
          usersService.getCurrentUser().then(function(user) {
            return keysService.getList({user_uuid: user.uuid}).then(formatChoices)
          })
        ];
        $q.all(promises).then(function(properties) {
          vm.fields.push({
            name: 'name',
            label: 'Name',
            type: 'string',
            required: true
          })
          vm.fields.push({
            name: 'description',
            label: 'Description',
            type: 'string',
            required: false
          })
          vm.fields.push({
            name: 'flavor',
            label: 'Size',
            type: 'choice',
            required: true,
            choices: properties[1]
          })
          vm.fields.push({
            name: 'image',
            label: 'Image',
            type: 'choice',
            required: true,
            choices: properties[0]
          })
          vm.fields.push({
            name: 'ssh_public_key',
            label: 'Key',
            type: 'choice',
            required: false,
            choices: properties[2]
          })
        })
      },
      setFields: function(formOptions) {
        var vm = this;

        for (var name in formOptions) {
          if (formOptions[name].read_only || name == this.UNIQUE_FIELDS.service_project_link) {
            continue;
          }

          var type = formOptions[name].type;
          if (type == 'field') {
            type = 'choice';
          }

          var required = formOptions[name].required;
          var choices = formOptions[name].choices;

          this.fields.push({
            name: name,
            label: formOptions[name].label,
            type: type,
            help_text: formOptions[name].help_text,
            required: required,
            choices: choices
          });
        }
      },
      toggleChoicesLimit: function(field) {
        if (field.limit == this.limitChoices) {
          field.limit = field.choices.length;
        } else {
          field.limit = this.limitChoices;
        }
      },
      isListLong: function(field) {
        return field.choices.length > this.limitChoices;
      },
      isListExpanded: function(field) {
        return field.limit == field.choices.length;
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
        this.deletePriceItem(name);
        var display_name = choice.display_name;
        var price = this.findPrice(name, display_name);
        this.pushPriceItem(name, display_name, price);
      },
      findPrice: function(name, display_name) {
        for (var i = 0; i < this.defaultPriceListItems.length; i++) {
          var priceItem = this.defaultPriceListItems[i];
          if (priceItem.item_type == name
            && ((display_name.indexOf(priceItem.key) > -1)
            || (priceItem.resource_content_type.indexOf(this.selectedResourceType.toLowerCase()) > -1))
          ) {
            return priceItem.value;
          }
        }
      },
      pushPriceItem: function(type, name, price) {
        this.priceItems.push({
          type: type,
          name: name,
          price: price
        });
        this.countTotal();
      },
      deletePriceItem: function(name) {
        var itemTypes = this.priceItems.map(function(item) {
          return item.type;
        });

        var index = itemTypes.indexOf(name);
        if (index + 1) {
          this.priceItems.splice(index, 1);
        }
      },
      resetPriceItems: function() {
        this.priceItems = [];
        this.total = 0;
      },
      countTotal: function() {
        this.total = 0;
        for (var i = 0; i < this.priceItems.length; i++) {
          this.total += this.priceItems[i].price * 1;
        }
      },
      setCurrentProject: function() {
        var vm = this;
        var categories = ENV.appStoreCategories;
        vm.categories = [];
        vm.selectedCategory = null;
        vm.secondStep = false;
        vm.serviceMetadata = {};
        vm.serviceType = null;
        vm.resourceTypesBlock = false;
        vm.fields = [];
        vm.priceItems = [];
        vm.selectedResourceType = null;
        vm.instance = null;
        vm.renderStore = false;
        vm.countTotal();
        vm.loadingProviders = true;
        var myBlockUI = blockUI.instances.get('store-content');
        myBlockUI.start();
        currentStateService.getProject().then(function(response) {
          vm.currentProject = response;
          vm.services = {};
          for (var j = 0; j < categories.length; j++) {
            var category = categories[j];
            vm.categoryServiceTypes[category.name] = [];
            for (var i = 0; i < vm.currentProject.services.length; i++) {
              var service = vm.currentProject.services[i];
              if (service.state != 'Erred'
                && category.services
                && (category.services.indexOf(service.type) + 1)
              ) {
                if (!(vm.categoryServiceTypes[category.name].indexOf(service.type) + 1)) {
                  vm.categoryServiceTypes[category.name].push(service.type);
                }
                if (!vm.services[service.type]) {
                  vm.services[service.type] = [];
                }
                vm.services[service.type].push(service);
              }
            }
            if (vm.categoryServiceTypes[category.name].length > 0) {
              vm.categories.push(category);
              vm.renderStore = true;
            }
          }
          vm.addSupportCategory();
          myBlockUI.stop();
        });
      },
      addSupportCategory: function() {
        var vm = this;
        if (ENV.featuresVisible || ENV.toBeFeatures.indexOf('premiumSupport') == -1) {
          premiumSupportPlansService.getList().then(function(response) {
            vm.loadingProviders = false;
            if (response.length != 0) {
              vm.renderStore = true;
              var category = {
                type: 'package',
                name: 'SUPPORT',
                packages: response
              };
              vm.categories.push(category);
              if ($stateParams.category == 'support') {
                vm.setCategory(category);
              }
            }
          });
        } else {
          vm.loadingProviders = false;
        }
      },
      selectSupportPackage: function(supportPackage) {
        this.agreementShow = true;
        this.selectedPackage = supportPackage;
        this.serviceType = 'Total';

        var type = 'Support plan';
        var display_name = supportPackage.name;

        this.deletePriceItem(type);
        this.pushPriceItem(type, display_name, supportPackage.base_rate);
      },
      signContract: function() {
        var contract = premiumSupportContractsService.$create();
        contract.project = this.currentProject.url;
        contract.plan = this.selectedPackage.url;
        var vm = this;
        contract.$save().then(function(response) {
          premiumSupportContractsService.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshProjectList');
          $state.go('resources.list', {tab: 'premiumSupport'});
        }, function(response) {
          vm.errors = response.data;
          vm.onError();
        });
      },
      canSave: function() {
        if (!this.instance) {
          return false;
        }
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
      successRedirect: function() {
        $state.go('resources.list', {tab: 'VMs'});
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
