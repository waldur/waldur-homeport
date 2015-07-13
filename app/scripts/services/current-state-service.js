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

    vm.getProject = getProject;
    vm.setProject = setProject;

    // private variables:
    var customer = null,
      project = null;

    function getCustomer() {
      return customer;
    }

    function getProject() {
      return project;
    }

    function setCustomer(newCustomer) {
      vm.isCustomerDefined = true;
      customer = $q.when(newCustomer);
    }

    function setProject(newProject) {
      project = $q.when(newProject);
    }

    // XXX: getActiveItem and getBodyClass methods have to be moved to apps.js for code consistency.
    // (We decided, that all URL-depended code have to defined near URLs definition)

    // Active menuItem
    var urlList = {
      appstore: ['appstore.store'],
      dashboard: ['dashboard.eventlog'],
      resources: ['resources.list', 'resources.create'],
      projects: ['projects.list', 'projects.details', 'projects.update', 'projects.create', 'projects.add-users'],
      services: ['services.list', 'services.create', 'services.details'],
      users: ['users.list', 'users.details'],
      support: ['support.list', 'support.create']
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
      'organizations.details',
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
