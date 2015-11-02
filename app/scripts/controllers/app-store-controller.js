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
      'premiumSupportPlansService',
      'premiumSupportContractsService',
      'resourcesService',
      'ncUtilsFlash',
      'projectsService',
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
    premiumSupportPlansService,
    premiumSupportContractsService,
    resourcesService,
    ncUtilsFlash,
    projectsService) {
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
      enablePurchaseCostDisplay: ENV.enablePurchaseCostDisplay,
      VmProviderSettingsUuid: ENV.VmProviderSettingsUuid,
      gitLabProviderSettingsUuid: ENV.gitLabProviderSettingsUuid,

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
      categoryServices: {},

      configureStepNumber: 4,
      selectedPackageName: null,
      agreementShow: false,
      chooseResourceTypeStepNumber: 3,

      // cart
      total: 0,
      defaultPriceListItems: [],
      priceItems: [],

      fields: [],
      limitChoices: 10,

      init:function() {
        this.service = resourcesService;
        this.controllerScope = controllerScope;
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
        this.selectedService = null;
        this.fields = [];
        this.resetPriceItems();

        var services = this.categoryServices[this.selectedCategory.name];
        if (ENV.VmProviderSettingsUuid && this.isVirtualMachinesSelected()) {
          for (var i = 0; i < services.length; i++) {
            if (services[i].settings_uuid == ENV.VmProviderSettingsUuid) {
              this.setService(services[i]);
              this.configureStepNumber = 2;
              this.secondStep = false;
              break;
            }
          }
        } else if (ENV.gitLabProviderSettingsUuid && this.isApplicationSelected()) {
          for (var i = 0; i < services.length; i++) {
            if (services[i].settings_uuid == ENV.gitLabProviderSettingsUuid) {
              this.setService(services[i]);
              this.chooseResourceTypeStepNumber = 2;
              this.configureStepNumber = 3;
              this.secondStep = false;
              break;
            }
          }
        } else if (services && services.length == 1) {
          this.setService(services[0]);
        }
      },
      isVirtualMachinesSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.VirtualMachines].name;
      },
      isApplicationSelected: function() {
        return this.selectedCategory.name == ENV.appStoreCategories[ENV.Applications].name;
      },
      isSupportSelected: function() {
        return this.selectedCategory.name == 'SUPPORT';
      },
      setService: function(service) {
        if (!service.enabled) {
          return;
        }
        this.resetPriceItems();
        this.selectedService = service;
        this.serviceType = this.selectedService.type;
        this.serviceMetadata = this.servicesMetadata[this.serviceType];
        this.fields = [];
        this.selectedResourceType = null;

        if (this.serviceMetadata) {
          var types = Object.keys(this.serviceMetadata.resources);
          if (types.length === 1) {
            this.setResourceType(types[0]);
            this.resourceTypesBlock = false;
            this.configureStepNumber = 3;
          } else {
            this.resourceTypesBlock = true;
            this.configureStepNumber = 4;
          }
        }
      },
      setResourceType: function(type) {
        var vm = this;
        vm.selectedResourceType = type;
        vm.selectedResourceTypeName = type.split(/(?=[A-Z])/).join(" ");
        vm.fields = [];
        var resourceUrl = vm.serviceMetadata.resources[vm.selectedResourceType];
        if (resourceUrl) {
          vm.instance = servicesService.$create(resourceUrl);
          vm.instance.service_project_link = vm.selectedService.service_project_link_url;
          var myBlockUI = blockUI.instances.get('resource-properties');
          myBlockUI.start();
          servicesService.getOption(resourceUrl).then(function(response) {
            var formOptions = response.actions.POST;
            vm.allFormOptions = formOptions;
            vm.getValidChoices().then(function(validChoices) {
              vm.setFields(formOptions, validChoices);
              myBlockUI.stop();
            });
          });
        }
      },
      getValidChoices: function() {
        var vm = this;
        var promises = [];
        var validChoices = {};
        angular.forEach(vm.serviceMetadata.properties, function(url, property) {
          var query = {
            settings_uuid: vm.selectedService.settings_uuid,
            project: vm.currentProject.uuid // for security groups
          };
          servicesService.pageSize = 1000;
          var promise = servicesService.getList(query, url).then(function(response) {
            validChoices[property.toLowerCase()] = vm.formatChoices(response);
          });
          promises.push(promise);
        });
        return $q.all(promises).then(function() {
          return validChoices;
        });
      },
      formatChoices: function(items) {
        return items.map(function(item) {
          return {
            value: item.url,
            display_name: item.name,
            item: item
          }
        });
      },
      setFields: function(formOptions, validChoices) {
        this.fields = [];
        for (var name in formOptions) {
          var options = formOptions[name];
          if (options.read_only || name == this.UNIQUE_FIELDS.service_project_link) {
            continue;
          }

          var type = options.type;
          if (type == 'field') {
            type = 'choice';
          }

          var choices = validChoices[name] || options.choices;
          if (name === 'image') {
            for (var i = 0; i < choices.length; i++) {
             choices[i].display_name = choices[i].item.distribution
               ? choices[i].item.distribution + " " + choices[i].display_name
               : choices[i].display_name;
            }
          }
          if (name == 'security_groups') {
            choices = validChoices.securitygroup;
          }

          if (name == 'user_data') {
            type = 'text';
          }

          if (name == 'size' || name == 'flavor') {
            type = 'size';
          }

          var icons = {
            size: 'gear',
            flavor: 'gear',
            ssh_public_key: 'key',
            security_groups: 'lock',
            group: 'group'
          };
          var icon = icons[name] || 'cloud';
          var label = options.label;
          var required = options.required;
          var visibleFields = [
            'ssh_public_key',
            'group',
            'security_groups'
          ];
          var visible = required || visibleFields.indexOf(name) != -1;
          var help_text = options.help_text;
          var min, max, units;

          if (name == 'system_volume_size') {
            min = 0;
            max = 320;
            units = 'GB';
            help_text = null;
          }

          if (name == 'data_volume_size') {
            min = 1;
            max = 320;
            units = 'GB';
            visible = true;
            required = true;
            help_text = null;
          }

          this.fields.push({
            name: name,
            label: label,
            type: type,
            help_text: help_text,
            required: required,
            choices: choices,
            visible: visible,
            icon: icon,
            min: min,
            max: max,
            units: units
          });
        }
        var order = [
          'name', 'image', 'region', 'size', 'flavor', 'system_volume_size', 'data_volume_size',
          'security_groups', 'ssh_public_key', 'description', 'user_data'
        ];
        this.fields.sort(function(a, b) {
          return order.indexOf(a.name) - order.indexOf(b.name);
        });
        this.sortFlavors();
        this.attachIconsToImages();
      },
      attachIconsToImages: function() {
        var field = this.findFieldByName('image');
        if (!field) {
          return;
        }
        for (var i = 0; i < field.choices.length; i++) {
          var choice = field.choices[i];
          if (choice.display_name.indexOf('Visual Studio') != -1) {
            choice.icon = 'visual-studio';
          }
          else if (choice.display_name.indexOf('CentOS') != -1) {
            choice.icon = 'centos';
          }
          else if (choice.display_name.indexOf('Windows') != -1) {
            choice.icon = 'windows';
          }
          else if (choice.display_name.indexOf('Ubuntu') != -1) {
            choice.icon = 'ubuntu';
          }
        }
      },
      serviceClass: function(service) {
        return {
          state: this.selectedService === service,
          disabled: !service.enabled,
          provider: this.selectedCategory.type === 'provider'
        };
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
        if (name == 'security_groups') {
          if (this.instance[name] === undefined) {
            this.instance[name] = [];
          }
          if (this.instance[name].indexOf(choice.value) === -1) {
            this.instance[name].push(choice.value);
          } else {
            this.instance[name].splice(this.instance[name].indexOf(choice.value), 1);
          }
        } else {
          this.instance[name] = choice.value;
          this.instance[name + '_item'] = choice.item;
        }
        if (name == 'image') {
          this.updateFlavors();
        }
        if (name == 'flavor') {
          this.setSize();
        }
        if (ENV.nonChargeableAppStoreOptions.indexOf(name) !== -1) {
          return;
        }
        if (vm.defaultPriceListItems.length) {
          vm.setPriceItem(name, choice);
        } else {
          defaultPriceListItemsService.getList().then(function(response) {
            vm.defaultPriceListItems = response;
            vm.setPriceItem(name, choice);
          });
        }
      },
      setSize: function() {
        var field = this.findFieldByName('system_volume_size');
        if (!field) {
          return;
        }
        var disk_gb = Math.round(this.instance.flavor_item.disk / 1024);
        field.min = disk_gb;
        this.instance.system_volume_size = disk_gb;
        this.instance.system_volume_size_raw = disk_gb;
      },
      updateFlavors: function() {
        var field = this.findFieldByName('flavor');
        if (!field) {
          return;
        }
        var image = this.instance.image_item;
        if (!image) {
          return false;
        }
        for (var i = 0; i < field.choices.length; i++) {
          var choice = field.choices[i];
          choice.disabled = image.min_ram > choice.item.ram || image.min_disk > choice.item.disk;
        }

        var flavor = this.instance.flavor;
        var choice = this.getChoiceByValue(field.choices, flavor);
        if (choice && choice.disabled) {
          this.instance.flavor = null;
          this.deletePriceItem('flavor');
        }

        this.sortFlavors();
      },
      sortFlavors: function() {
        var field = this.findFieldByName('flavor');
        if (!field) {
          return;
        }

        field.choices.sort(function(a, b) {
          if (a.disabled < b.disabled) return -1;
          if (a.disabled > b.disabled) return 1;

          if (a.item.cores > b.item.cores) return 1;
          if (a.item.cores < b.item.cores) return -1;

          if (a.item.ram > b.item.ram) return 1;
          if (a.item.ram < b.item.ram) return -1;

          if (a.item.disk > b.item.disk) return 1;
          if (a.item.disk < b.item.disk) return -1;
          return 0;
        });
      },
      findFieldByName: function(name) {
        for (var i = 0; i < this.fields.length; i++) {
          var field = this.fields[i];
          if (field.name == name) {
            return field;
          }
        }
      },
      getChoiceByValue: function(choices, value) {
        for (var i = 0; i < choices.length; i++) {
          var choice = choices[i];
          if (choice.value == value) {
            return choice;
          }
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
          for (var j = 0; j < categories.length; j++) {
            var category = categories[j];
            vm.categoryServices[category.name] = [];
            for (var i = 0; i < vm.currentProject.services.length; i++) {
              var service = vm.currentProject.services[i];
              service.enabled = vm.isSafeState(service.state);
              if (category.services && (category.services.indexOf(service.type) + 1)) {
                vm.categoryServices[category.name].push(service);
              }
            }
            if (vm.categoryServices[category.name].length > 0) {
              vm.categories.push(category);
              vm.renderStore = true;
            }
            vm.categoryServices[category.name].sort(function(a, b) {
              return a.enabled < b.enabled;
            });
          }
          vm.addSupportCategory();
          myBlockUI.stop();
        });
      },
      isSafeState: function(state) {
        return state !== 'Erred';
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
                icon: 'wrench',
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
        return contract.$save().then(function(response) {
          premiumSupportContractsService.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshProjectList');
          $state.go('resources.list', {tab: 'premiumSupport'});
          return true;
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
      getTooltip: function() {
        if (!this.instance) {
          return "Instance is not configured";
        }
        var fields = [];
        for (var name in this.allFormOptions) {
          var options = this.allFormOptions[name];
          if (options.required && !this.instance[name]) {
            fields.push(options.label);
          }
        }
        if (fields.length > 0) {
          return "Please specify " + fields.join(", ").toLowerCase();
        }
      },
      saveInstance: function() {
        var resourceUrl = this.serviceMetadata.resources[this.selectedResourceType];
        var instance = servicesService.$create(resourceUrl);
        instance.service_project_link = this.selectedService.service_project_link_url;

        for (var name in this.allFormOptions) {
          instance[name] = this.instance[name];
        }

        if (this.instance.system_volume_size) {
          instance.system_volume_size = this.instance.system_volume_size * 1024;
        }
        if (this.instance.data_volume_size) {
          instance.data_volume_size = this.instance.data_volume_size * 1024;
        }
        if (this.instance.security_groups) {
          instance.security_groups = [];
          for (var i = 0; i < this.instance.security_groups.length; i++) {
            instance.security_groups.push({url: this.instance.security_groups[i]});
          }
        }
        return instance.$save();
      },
      afterSave: function() {
        this._super();
        projectsService.clearAllCacheForCurrentEndpoint();
      },
      onError: function() {
        var message = '';
        if (angular.isObject(this.errors)) {
          for (var name in this.errors) {
            if (this.allFormOptions[name]) {
              message += this.allFormOptions[name].label + ': ' + this.errors[name] + '<br/>';
            } else {
              message += name + ': ' + this.errors[name] + '<br/>';
            }
          }
        } else {
          message = 'Server error occurred';
        }
        ncUtilsFlash.error(message);
      },
      successRedirect: function() {
        var tab = this.getDestinationTab();
        $state.go('resources.list', {tab: tab});
      },
      getDestinationTab: function() {
        if (this.isVirtualMachinesSelected()) {
          return ENV.resourcesTypes.vms;
        } else if (this.isApplicationSelected()) {
          return ENV.resourcesTypes.applications;
        } else if (this.isSupportSelected()) {
          return 'premiumSupport';
        }
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
