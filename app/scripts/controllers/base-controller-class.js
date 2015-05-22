(function(){
  angular.module('ncsaas')
    .service('baseControllerClass', ['$rootScope', baseControllerClass]);

  function baseControllerClass($rootScope) {
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
      masterChecked:false,
      isSelected: {},

      init:function() {
        this.setSignalHandler('currentCustomerUpdated', this.currentCustomerUpdatedHandler.bind(this));
        this._super();
        this.getList();
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
      currentCustomerUpdatedHandler: function() {
        var vm = this.controllerScope;
        vm.service.page = 1;
        vm.getList();
      },
      // checkboxes
      masterChange: function() {
        this.master = !this.masterChecked;
        this.masterChecked = !this.masterChecked;
        if (!this.masterChecked) {
          this.isSelected = {};
        } else {
          this.checkAll();
        }
      },
      isSelectedChange: function() {
        this.masterChecked = this.checkForSelected();
      },
      checkForSelected: function() {
        for (var uuid in this.isSelected) {
          if (this.isSelected[uuid]) {
            return true;
          }
        }
        return false;
      },
      checkAll: function() {
        for (var i = 0; this.list.length > i; i++) {
          this.isSelected[this.list[i].uuid] = true;
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