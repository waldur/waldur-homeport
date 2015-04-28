'use strict';

(function() {
  angular.module('ncsaas')
    .service('currentStateService', ['$q', currentStateService]);

  /**
   * This service contains values of objects, that affect current displayed data.
   * Notice: CurrentStateService can not make any backend calls. It stores only selected on user-side objects.
   */
  function currentStateService($q) {
    /*jshint validthis: true */
    var vm = this;
    vm.getCustomer = getCustomer;
    vm.setCustomer = setCustomer;
    vm.isCustomerDefined = false;

    vm.getActiveItem = getActiveItem;
    vm.getBodyClass = getBodyClass;

    // private variables:
    var customer = null;

    function getCustomer() {
      return customer;
    }

    function setCustomer(newCustomer) {
      vm.isCustomerDefined = true;
      customer = $q.when(newCustomer);
    }

    // XXX: getActiveItem and getBodyClass methods have to be moved to apps.js for code consistency.
    // (We decided, that all URL-depended code have to defined near URLs definition)

    // Active menuItem
    var urlList = {
      dashboard: ['dashboard'],
      resources: ['resources.list', 'resources.add'],
      projects: ['projects.list', 'projects.details', 'projects.update', 'projects.create'],
      services: ['services.list', 'services.create', 'services.details'],
      users: ['users.list', 'users.details']
    };

    function getActiveItem(stateName) {
      var activeState;
      for (var prop in urlList) {
        if (urlList.hasOwnProperty(prop)) {
          if (urlList[prop].indexOf(stateName) !== -1) {
            activeState = prop;
          }
        }
      }
      return activeState;
    }

    // Body class
    var stateWithProfile = [
      'profile',
      'profile-edit',
      'projects.details',
      'projects.update',
      'customers.details',
      'customers.edit',
      'customer-plans',
      'users.details',
      'home',
      'login',
    ];

    function getBodyClass(name) {
      var bodyClass;

      if (stateWithProfile.indexOf(name) > -1) {
        if (name === 'login' || name === 'home') {
          bodyClass = 'app-body site-body';
          return bodyClass;
        } else {
          bodyClass = 'app-body obj-view';
          return bodyClass;
        }
      } else {
        bodyClass = 'app-body';
        return bodyClass;
      }
    }

  }

})();
