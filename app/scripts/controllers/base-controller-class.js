(function(){
  angular.module('ncsaas')
    .service('baseControllerClass', ['$rootScope', baseControllerClass]);

  function baseControllerClass($rootScope) {
    var ControllerClass = Class.extend({
      _signals: {},

      init: function() {
        this.registerEventHandlers();
      },
      setSignalHandler: function(signalName, handlerFunction) {
        this._signals[signalName] = handlerFunction;
      },
      registerEventHandlers: function() {
        for (var eventName in this._signals) {
          $rootScope.$on(eventName, this._signals[eventName]);
          delete this._signals[eventName];
        }
      }
    });

    return ControllerClass;
  }
})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerListClass', [
      'baseControllerClass', 'ENV', '$rootScope', 'currentStateService', 'ncUtilsFlash', 'ncUtils', baseControllerListClass
    ]);

  function baseControllerListClass(baseControllerClass, ENV, $rootScope, currentStateService, ncUtilsFlash, ncUtils) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this.setSignalHandler('eventName', this.eventFunction);
     */
    var ControllerListClass = baseControllerClass.extend({
      list: {},
      service: null, // required in init
      searchInput: '',
      searchFieldName: 'name', // required in init
      controllerScope: null, // required in init
      showgroup: false, // for showing group buttons and checkboxes in list view
      // checkboxes
      selectedInstances: [],
      uniqueModelKeyName: 'uuid',
      // filters
      searchFilters: [], // should contains array of objects {name: 'name', title: 'Title', value: 'value'}
      chosenFilters: [],
      cacheTime: ENV.defaultListCacheTime,
      controlPanelShow: true,
      blockUIElement: null,

      init: function() {
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
        ncUtils.deregisterEvent('generalSearchChanged');
        this.setSignalHandler('generalSearchChanged', this.generalSearchChanged.bind(this));
        this.service.page = 1;
        this.service.cacheTime = this.cacheTime;
        this._super();
        this.listPromise = this.getList();
        this.blockListElement();
        // reset after state change
        this.selectedInstances = [];
        this.controlPanelShow = ENV.listControlPanelShow;
        ncUtils.updateIntercom();
      },
      getList: function(filter) {
        // It should return promise
        var vm = this;
        filter = filter || {};
        vm.service.cacheTime = vm.cacheTime;
        return vm.service.getList(filter).then(function(response) {
          vm.list = response;
          vm.afterGetList();
        });
      },
      blockListElement: function() {
        if (this.blockUIElement) {
          ncUtils.blockElement(this.blockUIElement, this.listPromise);
        }
      },
      afterGetList: function() {},
      generalSearchChanged: function(event, text) {
        this.controllerScope.searchInput = text;
        this.controllerScope.search();
      },
      search: function() {
        var vm = this;
        var filter = {};
        filter[vm.searchFieldName] = vm.searchInput;
        this.currentPage = this.service.page = 1;
        this.getList(filter);
      },
      remove: function(model) {
        var vm = this.controllerScope;
        var confirmDelete = confirm('Confirm deletion?');
        if (confirmDelete) {
          vm.removeInstance(model).then(function() {
            vm.afterInstanceRemove(model);
          }, vm.handleActionException.bind(vm));
        }
      },
      removeInstance: function(model) {
        // Shall return promise
        return model.$delete();
      },
      handleActionException: function(response) {
        if (response.status === 409) {
          var message = response.data.detail || response.data.status;
          ncUtilsFlash.error(message);
        }
      },
      changeAllSelectedInstances: function() {
        if (this.selectedInstances.length) {
          this.selectedInstances = [];
        } else {
          for (var i = 0; i < this.list.length; i++) {
            this.selectedInstances.push(this.list[i][this.uniqueModelKeyName]);
          }
        }
      },
      changeInstanceSelection: function(instance) {
        var index = this.selectedInstances.indexOf(instance[this.uniqueModelKeyName]);
        if (index !== -1) {
          this.selectedInstances.splice(index, 1);
        } else {
          this.selectedInstances.push(instance[this.uniqueModelKeyName]);
        }
      },
      isInstanceSelected: function(instance) {
        return this.selectedInstances.indexOf(instance[this.uniqueModelKeyName]) !== -1;
      },
      currentCustomerUpdatedHandler: function() {
        var vm = this.controllerScope;
        vm.service.page = 1;
        vm.getList();
      },
      afterInstanceRemove: function(instance) {
        this.service.clearAllCacheForCurrentEndpoint();
        $rootScope.$broadcast('refreshCounts');
        var index = this.list.indexOf(instance);
        if (index !== -1) {
          this.list.splice(index, 1);
        }

        index = this.selectedInstances.indexOf(instance[this.uniqueModelKeyName]);
        if (index !== -1) {
          this.selectedInstances.splice(index, 1);
        }

        if (this.list.length === 0 && this.currentPage > 1) {
          this.controllerScope.service.page = this.controllerScope.currentPage = this.currentPage - 1;
          this.controllerScope.getList();
        }

        currentStateService.reloadCurrentCustomer(function() {
          $rootScope.$broadcast('checkQuotas:refresh');
          $rootScope.$broadcast('customerBalance:refresh');
        });

      }
    });

    return ControllerListClass;
  }

})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerAddClass', [
      '$rootScope', '$state', 'baseControllerClass', 'currentStateService', 'ncUtilsFlash', baseControllerAddClass]);

  function baseControllerAddClass($rootScope, $state, baseControllerClass, currentStateService, ncUtilsFlash) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this._signals
     */
    var ControllerAddClass = baseControllerClass.extend({
      service: null, // required in init
      instance: null,
      listState: null, // required in init
      errors: {},
      controllerScope: null, // required in init
      detailsState: null,
      redirectToDetailsPage: false,
      successMessage: 'Saving of {vm_name} was successful.',

      init: function() {
        this.instance = this.service.$create();
        this.activate();
        this._super();
      },
      save: function() {
        var vm = this;
        vm.beforeSave();
        vm.saveInstance().then(function() {
          vm.afterSave();
          ncUtilsFlash.success(vm.getSuccessMessage());
          vm.service.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshCounts');
          vm.successRedirect();
        }, function(response) {
          vm.errors = response.data;
          vm.onError(response);
        });
      },
      cancel: function() {
        var vm = this;
        $state.go(vm.listState);
      },
      beforeSave: function() {},
      saveInstance: function() {
        return this.instance.$save();
      },
      afterSave: function() {
        currentStateService.reloadCurrentCustomer(function() {
          $rootScope.$broadcast('checkQuotas:refresh');
          $rootScope.$broadcast('customerBalance:refresh');
        });
      },
      activate: function() {},
      successRedirect: function() {
        if (this.redirectToDetailsPage) {
          $state.go(this.detailsState, {uuid: this.instance.uuid});
        } else {
          $state.go(this.listState);
        }
      },
      getSuccessMessage: function() {
        return this.successMessage.replace('{vm_name}', this.instance.name);
      },
      onError: function(errorObject) {}
    });

    return ControllerAddClass;
  }

})();

(function() {
  angular.module('ncsaas')
    .service('baseControllerDetailUpdateClass', ['$state', 'baseControllerClass', '$stateParams', '$rootScope', baseControllerDetailUpdateClass]);

  function baseControllerDetailUpdateClass($state, baseControllerClass, $stateParams, $rootScope) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this._signals
     */
    var ControllerDetailUpdateClass = baseControllerClass.extend({
      service: null, // required in init
      detailsState: null, // required in init
      listState: null, // required in init for details page
      activeTab: null,
      model: null,

      init: function() {
        this._super();
        this.activate();
        this.activeTab = $stateParams.tab ? $stateParams.tab : this.activeTab;
      },
      update: function() {
        var vm = this;
        vm.beforeUpdate();
        vm.model.$update(success, error);
        function success() {
          vm.service.clearAllCacheForCurrentEndpoint();
          $rootScope.$broadcast('refreshCounts');
          vm.afterUpdate();
          vm.successRedirect();
        }
        function error(response) {
          vm.errors = response.data;
        }
      },
      activate: function() {
        var vm = this;
        vm.getModel().then(function(response) {
          vm.model = response;
          vm.afterActivate();
        }, function() {
          $state.go('errorPage.notFound');
        });
      },
      getModel: function() {
        return this.service.$get($stateParams.uuid);
      },
      remove: function() {
        var vm = this;
        if (confirm('Confirm deletion?')) {
          vm.model.$delete(
            function() {
              vm.service.clearAllCacheForCurrentEndpoint();
              $rootScope.$broadcast('refreshCounts');
              $state.go(vm.listState);
            },
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      },
      successRedirect: function() {
        if (this.detailsState) {
          $state.go(this.detailsState, {uuid: this.model.uuid});
        }
      },
      beforeUpdate: function() {},
      afterUpdate: function() {},
      afterActivate: function() {}
    });

    return ControllerDetailUpdateClass;
  }
})();