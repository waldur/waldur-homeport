(function(){
  angular.module('ncsaas')
    .service('baseControllerClass', ['$rootScope', 'Flash', baseControllerClass]);

  function baseControllerClass($rootScope, Flash) {
    var ControllerClass = Class.extend({
      _signals: {},

      init:function() {
        this.registerEventHandlers();
      },
      setSignalHandler: function(signalName, handlerFunction) {
        this._signals[signalName] = handlerFunction;
      },
      registerEventHandlers: function() {
        for (var eventName in this._signals) {
          $rootScope.$on(eventName, this._signals[eventName]);
        }
      },
      successFlash: function(message) {
        this.flashMessage('success', message);
      },
      flashMessage: function(type, message) {
        Flash.create(type, message);
      }
    });

    return ControllerClass;
  }
})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerListClass', ['baseControllerClass', baseControllerListClass]);

  function baseControllerListClass(baseControllerClass) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this.setSignalHandler('eventName', this.eventFunction);
     */
    var ControllerListClass = baseControllerClass.extend({
      list: {},
      service: null, // required in init
      searchInput: '',
      searchFieldName: '', // required in init
      controllerScope: null, // required in init
      showgroup: false, // for showing group buttons and checkboxes in list view
      // checkboxes
      selectedInstances: [],
      uniqueModelKeyName: 'uuid',
      // filters
      searchFilters: [], // should contains array of objects {name: 'name', title: 'Title', value: 'value'}
      chosenFilters: [],

      init:function() {
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
        this._super();
        this.getList();
        // reset after state change
        this.selectedInstances = [];
      },
      getList:function(filter) {
        var vm = this;
        filter = filter || {};
        vm.service.getList(filter).then(function(response) {
          vm.list = response;
        });
      },
      search:function() {
        var vm = this;
        var filter = {};
        filter[vm.searchFieldName] = vm.searchInput;
        this.getList(filter);
      },
      remove:function(model) {
        var vm = this;
        var index = vm.list.indexOf(model);
        var confirmDelete = confirm('Confirm deletion?');
        if (confirmDelete) {
          model.$delete(function() {
            vm.afterInstanceRemove(model);
            vm.list.splice(index, 1);
          }, vm.handleActionException);
        } else {
          alert('Was not deleted.');
        }
      },
      handleActionException: function(response) {
        if (response.status === 409) {
          var message = response.data.status || response.data.detail;
          alert(message);
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
        var index = this.selectedInstances.indexOf(instance[this.uniqueModelKeyName]);
        if (index !== -1) {
          this.selectedInstances.splice(index, 1);
        }
      }
    });

    return ControllerListClass;
  }

})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerAddClass', ['$state', 'baseControllerClass', baseControllerAddClass]);

  function baseControllerAddClass($state, baseControllerClass) {
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

      init:function() {
        this.instance = this.service.$create();
        this.activate();
        this._super();
      },
      save:function() {
        var vm = this;
        vm.instance.$save(success, error);
        function success() {
          vm.afterSave();
          vm.successFlash(vm.successMessage.replace('{vm_name}', vm.instance.name));
          if (vm.redirectToDetailsPage) {
            $state.go(vm.detailsState, {uuid: vm.instance.uuid});
          } else {
            $state.go(vm.listState);
          }
        }
        function error(response) {
          vm.errors = response.data;
        }
      },
      cancel: function() {
        var vm = this;
        $state.go(vm.listState);
      },
      afterSave: function() {},
      activate: function() {}
    });

    return ControllerAddClass;
  }

})();

(function() {
  angular.module('ncsaas')
    .service('baseControllerDetailUpdateClass', ['$state', 'baseControllerClass', '$stateParams', baseControllerDetailUpdateClass]);

  function baseControllerDetailUpdateClass($state, baseControllerClass, $stateParams) {
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

      init:function() {
        this._super();
        this.activate();
      },
      update:function() {
        var vm = this;
        vm.model.$update(success, error);
        function success() {
          vm.afterUpdate();
          $state.go(vm.detailsState, {uuid: vm.model.uuid});
        }
        function error(response) {
          vm.errors = response.data;
        }
      },
      activate:function() {
        var vm = this;
        vm.service.$get($stateParams.uuid).then(function(response) {
          vm.model = response;
        });
      },
      remove:function() {
        var vm = this;
        if (confirm('Confirm deletion?')) {
          vm.model.$delete(
            function() {
              $state.go(vm.listState);
            },
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      },
      afterUpdate:function() {}
    });

    return ControllerDetailUpdateClass;
  }
})();