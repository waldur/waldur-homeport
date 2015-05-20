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
          $state.go(vm.listState);
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