(function(){

  angular.module('ncsaas')
    .service('baseControllerListClass', ['$rootScope', baseControllerListClass]);

  function baseControllerListClass($rootScope) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     */
    var ControllerListClass = Class.extend({
      list: {},
      service: null, // required in init
      pages: null,
      searchInput: '',
      searchFieldName: '', // required in init
      controllerScope: null,

      init:function() {
        this.eventsHandler();
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
      eventsHandler: function() {
        var vm = this.controllerScope;
        $rootScope.$on('currentCustomerUpdated', function() {
          vm.service.page = 1;
          vm.getList();
        });
      }
    });

    return ControllerListClass;
  }

})();

(function(){

  angular.module('ncsaas')
    .service('baseControllerAddClass', ['$state', baseControllerAddClass]);

  function baseControllerAddClass($state) {
    /**
     * Use controllerScope.__proto__ = new Controller() in needed controller
     * use this.controllerScope for changes in event handler
     */
    var ControllerAddClass = Class.extend({
      service: null, // required in init
      instance: null,
      listState: null, // required in init
      errors: {},

      init:function() {
        this.instance = this.service.$create();
        this.activate();
        this.eventsHandler();
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
      eventsHandler: function() {}
    });

    return ControllerAddClass;
  }

})();