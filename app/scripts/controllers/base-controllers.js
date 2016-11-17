'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('MainController', [
      '$scope',
      '$q',
      '$rootScope',
      '$state',
      'authService',
      'currentStateService',
      'customersService',
      'usersService',
      'baseControllerClass',
      '$window',
      'ENV',
      'projectsService',
      'ncUtils',
      MainController]);

  function MainController(
    $scope,
    $q,
    $rootScope,
    $state,
    authService,
    currentStateService,
    customersService,
    usersService,
    baseControllerClass,
    $window,
    ENV,
    projectsService,
    ncUtils) {
    var ctrl = this;
    var Controller = baseControllerClass.extend({
      customers: [],
      hasMore: false,
      currentUser: {},
      currentCustomer: {},
      projects: [],
      currentProject: {},

      init: function() {
        $scope.$on('$stateChangeSuccess', this.stateChangeSuccessHandler);
        $scope.$on('adjustCurrentCustomer', function(event, customer) {
          ctrl.setCurrentCustomer(customer);
        });
        $scope.$on('adjustCurrentProject', function(event, project) {
          ctrl.setCurrentProject(project);
        });
        $scope.$on('refreshProjectList', this.refreshProjectListHandler);
        $scope.$on('refreshCustomerList', this.refreshCustomerListHandler);

        this._super();
        this.modeName = ENV.modeName;
        $rootScope.buildId = ENV.buildId;
        $rootScope.logout = this.logout;
        this.isAuthenticated = authService.isAuthenticated;
      },

      setCurrentCustomer: function(customer) {
        customersService.$get(customer.uuid).then(function() {
          ctrl.currentCustomer = customer;
          currentStateService.setCustomer(customer);
          $rootScope.$broadcast('currentCustomerUpdated');
          currentStateService.getProject().then(function(project) {
            if (project.customer_uuid !== customer.uuid) {
              ctrl.setFirstOrLastSelectedProject();
            }
          });
        }, function(error) {
          var index = ctrl.customers.indexOf(customer);
          index > -1 && ctrl.customers.splice(index, 1);
          customersService.getTopMenuList().then(function(response) {
            ctrl.customers = response;
            ctrl.hasMore = customersService.pages > 1;
          });
          if (error.status === 404) {
            alert('Sorry "' + customer.name + '" organization was deleted in another session. ' +
              'Please try to select another organization.');
          } else {
            alert('Sorry, there is some network problem going on. Please, try to refresh the page');
          }
        });
      },

      setCurrentProject: function(project) {
        currentStateService.setProject(project);
        currentStateService.handleSelectedProjects(ctrl.currentCustomer.uuid, project);
        ctrl.currentProject = project;
        $rootScope.$broadcast('currentProjectUpdated');
        customersService.$get(project.customer_uuid).then(function(customer) {
          ctrl.setCurrentCustomer(customer);
        });
      },

      setFirstOrLastSelectedProject: function() {
        var deferred = $q.defer();

        var projectUuid = currentStateService.handleSelectedProjects(ctrl.currentCustomer.uuid);
        if (projectUuid) {
          projectsService.$get(projectUuid).then(function(project){
            if (project.customer_uuid == ctrl.currentCustomer.uuid) {
              currentStateService.setProject(project);
              $rootScope.$broadcast('currentProjectUpdated');
              ctrl.currentProject = project;
            }
            deferred.resolve();
          }, function() {
            currentStateService.removeLastSelectedProject(projectUuid);
            getFirst();
          });
        } else {
          getFirst();
        }
        function getFirst() {
          projectsService.getFirst().then(function(firstProject) {
            currentStateService.setProject(firstProject);
            $rootScope.$broadcast('currentProjectUpdated');
            ctrl.currentProject = firstProject;
            deferred.resolve();
          });
        }
        return deferred.promise;
      },

      refreshProjectListHandler: function(event, params) {
        var projectUuids,
          currentProjectKey,
          model;
        if (params) {
          model = params.model;
          projectUuids = ctrl.projects.map(function(obj) {
            return obj.uuid;
          });
          currentProjectKey = projectUuids.indexOf(model.uuid);
          if (params.update) {
            if (currentProjectKey + 1) {
              ctrl.projects[currentProjectKey] = model;
            }
            if (model.uuid == ctrl.currentProject.uuid) {
              ctrl.currentProject = model;
              ctrl.setCurrentProject(model);
            }
          }
          if (params.new) {
            if (!ctrl.currentProject || !ctrl.currentProject.uuid || params.current) {
              ctrl.setCurrentProject(model);
            }
          }
          if (params.remove) {
            if (currentProjectKey + 1) {
              ctrl.projects.splice(currentProjectKey, 1);
            }
            if (model && model.uuid == ctrl.currentProject.uuid) {
              currentStateService.removeLastSelectedProject(model.uuid);
              ctrl.setFirstOrLastSelectedProject();
            }
          }
          projectsService.cacheReset = true;
        } else {
          ctrl.setFirstOrLastSelectedProject();
          return ctrl.getProjectList(true);
        }
      },

      getProjectList: function(cacheReset) {
        projectsService.cacheTime = ENV.topMenuProjectsCacheTime;
        projectsService.cacheReset = cacheReset;

        var promise = projectsService.getList().then(function(response) {
          if (response.length < 1
            && $state.current.name != 'project-create') {
            ctrl.currentProject = null;
            ctrl.setCurrentProject(null);
            if ($state.current.name != 'errorPage.notFound') {
              ncUtilsFlash.info('You have no projects! Please add one.');
            }
          }
          ctrl.projects = response;
          return response;
        });

        ncUtils.blockElement('project-menu', promise);
        return promise;
      },

      getCustomerList: function(cacheReset) {
        customersService.cacheTime = ENV.topMenuCustomerCacheTime;
        customersService.cacheReset = cacheReset;
 
        var promise = customersService.getList().then(function(response) {
          ctrl.customers = response;
          ctrl.hasMore = customersService.pages > 1;
          return response;
        });

        ncUtils.blockElement('customer-menu', promise);
        return promise;
      },

      refreshCustomerListHandler: function(event, params) {
        var customerUuids,
          currentCustomerKey,
          model;
        if (params) {
          model = params.model;
          customerUuids = ctrl.customers.map(function(obj) {
            return obj.uuid;
          });
          currentCustomerKey = customerUuids.indexOf(model.uuid);
          if (params.update) {
            if (currentCustomerKey + 1) {
              ctrl.customers[currentCustomerKey] = model;
            }
            if (model.uuid == ctrl.currentCustomer.uuid) {
              ctrl.currentCustomer = model;
              ctrl.setCurrentCustomer(model);
            }
          }
          if (params.new) {
            if (ctrl.customers.indexOf(model) == -1) {
              ctrl.customers.push(model);
            }
            if (!ctrl.currentCustomer || params.current) {
              ctrl.setCurrentCustomer(model);
            }
          }
          if (params.remove) {
            if (currentCustomerKey + 1) {
              ctrl.customers.splice(currentCustomerKey, 1);
            }
            if (model && model.uuid == ctrl.currentCustomer.uuid) {
              ctrl.setFirstCustomer();
            }
          }
        } else {
          ctrl.setFirstCustomer();
          ctrl.getCustomerList(true);
        }
      },

      setFirstCustomer: function() {
        customersService.getPersonalOrFirstCustomer().then(function(firstCustomer) {
          ctrl.setCurrentCustomer(firstCustomer);
        });
      },

      logout: function() {
        authService.signout();
        currentStateService.isCustomerDefined = false;
        currentStateService.setHasCustomer(undefined);
        currentStateService.setStaffOwnerManager(undefined);
        $rootScope.$broadcast('abortRequests');
        $state.go('login');
      },

      stateChangeSuccessHandler: function(event, toState, toParams, fromState, fromParams) {
        ctrl.selectInitialCustomer();
        ctrl.checkQuotas(toState.name);
      },

      selectInitialCustomer: function() {
        // if user is authenticated - he should have selected customer
        if (authService.isAuthenticated() && !currentStateService.isCustomerDefined) {
          var deferred = $q.defer(),
            projectDeferred = $q.defer();
          usersService.getCurrentUser().then(function(user) {
            ctrl.bootIntercom();
            if ($window.localStorage[ENV.currentCustomerUuidStorageKey]) {
              customersService.$get($window.localStorage[ENV.currentCustomerUuidStorageKey]).then(function(customer) {
                deferred.resolve(customer);
                ctrl.getProject(projectDeferred);
              }, setPersonalOrFirstCustomer);
            } else {
              setPersonalOrFirstCustomer();
            }

            function setPersonalOrFirstCustomer() {
              customersService.getPersonalOrFirstCustomer(user.username).then(function(customer) {
                deferred.resolve(customer);
                ctrl.getProject(projectDeferred);
              });
            }
          });
          currentStateService.setCustomer(deferred.promise);
          currentStateService.setProject(projectDeferred.promise);
          $rootScope.$broadcast('currentProjectUpdated');
        }
      },

      getProject: function(projectDeferred) {
        if ($window.localStorage[ENV.currentProjectUuidStorageKey]) {
          projectsService.$get($window.localStorage[ENV.currentProjectUuidStorageKey]).then(function(response) {
            currentStateService.getCustomer().then(function(customer) {
              if (response.customer_uuid == customer.uuid) {
                projectDeferred.resolve(response);
              } else {
                ctrl.getFirstProject(projectDeferred);
              }
            });
          }, ctrl.getFirstProject);
        } else {
          ctrl.getFirstProject(projectDeferred);
        }
      },

      getFirstProject: function(projectDeferred) {
        var projectUuid = currentStateService.handleSelectedProjects($window.localStorage[ENV.currentCustomerUuidStorageKey]);
        if (projectUuid) {
          projectsService.$get(projectUuid).then(function(project) {
            projectDeferred.resolve(project);
          }, function() {
            currentStateService.removeLastSelectedProject(projectUuid);
          });
        } else {
          projectsService.getFirst().then(function(response) {
            projectDeferred.resolve(response);
          });
        }
      },

      bootIntercom: function(user) {
        // XXX: Temporarily disable Intercom
        return;
        var date = new Date(user.date_joined).getTime();
        window.Intercom('boot', {
          app_id: ENV.IntercomAppId,
          name: user.full_name,
          email: user.email,
          created_at: date
        });
      },

      checkQuotas: function(stateName) {
        if (ENV.entityCreateLink[stateName] && currentStateService.isCustomerDefined) {
          currentStateService.isQuotaExceeded(ENV.entityCreateLink[stateName]).then(function(response) {
            if (response) {
              $state.go('errorPage.limitQuota');
            }
          });
        }
      }
    });

    ctrl.__proto__ = new Controller();
  }

  angular.module('ncsaas')
    .service('BaseErrorController', ['$rootScope', '$state', 'baseControllerClass', BaseErrorController]);

  function BaseErrorController($rootScope, $state, baseControllerClass) {
    var Controller = baseControllerClass.extend({
      init: function() {
        var state = $rootScope.prevPreviousState;
        this.href = (state && state.name !== 'errorPage.notFound' && state.name !== 'errorPage.limitQuota')
          ? $state.href(state.name, $rootScope.prevPreviousParams)
          : $state.href('dashboard.index');
      }
    });
    return Controller;
  }

  angular.module('ncsaas')
    .controller('Error403Controller', [
      'BaseErrorController', 'currentStateService', Error403Controller]);

  function Error403Controller(BaseErrorController, currentStateService) {
    var controllerScope = this;
    var Controller = BaseErrorController.extend({
      init: function() {
        var vm = this;
        currentStateService.getCustomer().then(function(response) {
          vm.customer = response;
        });
        this._super();
      }
    });

    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
    .controller('Error404Controller', ['BaseErrorController', Error404Controller]);
  
  function Error404Controller(BaseErrorController) {
    var controllerScope = this;
    var Controller = BaseErrorController.extend({
      init: function() {
        this._super();
      }
    });
    controllerScope.__proto__ = new Controller();
  }

  angular.module('ncsaas')
    .controller('BaseController', ['baseControllerClass', '$auth', BaseController]);

  function BaseController(baseControllerClass, $auth) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({
      init: function() {
        this.isAuthenticated = $auth.isAuthenticated();
      }
    });
    controllerScope.__proto__ = new Controller();
  }

})();
