(function(){

  angular.module('ncsaas')
    .service('baseControllerListClass', ['$rootScope', baseControllerListClass]);

  function baseControllerListClass($rootScope) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this._signals
     */
    var ControllerListClass = Class.extend({
      list: {},
      service: null, // required in init
      pages: null,
      searchInput: '',
      searchFieldName: '', // required in init
      controllerScope: null, // required in init
      _signals: {},

      init:function() {
        this.setSignals();
        this.registerEventHandlers();
        this.getList();
      },
      getList:function(filter) {
        var vm = this;
        filter = filter || {};
        vm.service.getList(filter).then(function(response) {
          vm.pages = vm.service.pages;
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
      setSignals: function() {
        var vm = this.controllerScope;
        this._signals.currentCustomerUpdated = function() {
          vm.service.page = 1;
          vm.getList();
        };
        return vm;
      },
      registerEventHandlers: function() {
        for (var eventName in this._signals) {
          $rootScope.$on(eventName, this._signals[eventName]);
        }
      }
    });

    return ControllerListClass;
  }

})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerAddClass', ['$state', '$rootScope', baseControllerAddClass]);

  function baseControllerAddClass($state, $rootScope) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     * sеt events in this._signals
     */
    var ControllerAddClass = Class.extend({
      service: null, // required in init
      instance: null,
      listState: null, // required in init
      errors: {},
      _signals: {},
      controllerScope: null, // required in init

      init:function() {
        this.instance = this.service.$create();
        this.activate();
        this.setSignals();
        this.registerEventHandlers();
      },
      save:function() {
        var vm = this;
        vm.instance.$save(success, error);
        function success() {
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
      activate: function() {},
      setSignals: function() {
        return this.controllerScope;
      },
      registerEventHandlers: function() {
        for (var eventName in this._signals) {
          $rootScope.$on(eventName, this._signals[eventName]);
        }
      }
    });

    return ControllerAddClass;
  }

})();