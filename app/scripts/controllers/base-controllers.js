'use strict';
// This file contains controllers of base pages attributes: header, footer, body, common menu and so on

(function() {
  angular.module('ncsaas')
    .controller('HeaderController', [
      '$rootScope', '$state', 'currentStateService', 'customersService',
      'usersService', 'ENV', 'baseControllerClass', '$translate', 'LANGUAGE', 'projectsService', '$q', 'blockUI',
      HeaderController]);

  function HeaderController(
    $rootScope, $state, currentStateService, customersService, usersService,
    ENV, baseControllerClass, $translate, LANGUAGE, projectsService, $q, blockUI) {
    var controllerScope = this;
    var HeaderControllerClass = baseControllerClass.extend({
      customers: [],
      currentUser: {},
      currentCustomer: {},
      projects: [],
      currentProject: {},
      showImport: ENV.showImport,
      menuState: {
        addSomethingMenu: false,
        customerMenu: false,
        profileMenu: false,
        LangMenu: false
      },
      checkQuotas: {
        projects: 'project',
        resources: 'resource'
      },

      init: function() {
        this.activate();
        this.menuItemActive = currentStateService.getActiveItem($state.current.name);
        this.setSignalHandler('adjustCurrentCustomer', this.adjustCurrentCustomer.bind(controllerScope));
        this.setSignalHandler('adjustCurrentProject', this.adjustCurrentProject.bind(controllerScope));
        this.setSignalHandler('refreshProjectList', this.refreshProjectListHandler.bind(controllerScope));
        this.setSignalHandler('refreshCustomerList', this.refreshCustomerListHandler.bind(controllerScope));
        this._super();
      },
      activate: function() {
        var vm = this;
        // XXX: for top menu customers viewing
        customersService.pageSize = ENV.topMenuCustomersCount;
        customersService.cacheTime = ENV.topMenuCustomersCacheTime;
        customersService.getList().then(function(response) {
          vm.customers = response;
        });
        // reset pageSize
        customersService.pageSize = ENV.pageSize;

        vm.getProjectList();

        // initiate current user
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
        });

        // initiate current customer
        currentStateService.getCustomer().then(function(customer) {
          vm.currentCustomer = customer;
        });

        currentStateService.getProject().then(function(project) {
          vm.currentProject = project;
        });

        $rootScope.closeMenu = vm.closeMenu;

        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.currentLanguage = this.findLanguageByCode($translate.use());
      },

      changeLanguage: function(language) {
        this.currentLanguage = language;
        $translate.use(this.currentLanguage.code);
      },

      findLanguageByCode: function(code) {
        for (var i=0; i<LANGUAGE.CHOICES.length; i++) {
          if (LANGUAGE.CHOICES[i].code == code) {
            return LANGUAGE.CHOICES[i];
          }
        }
      },

      closeMenu: function() {
        var vm = controllerScope;
        for (var property in vm.menuState) {
          if (vm.menuState.hasOwnProperty(property)) {
            vm.menuState[property] = false;
          }
        }
        $rootScope.$broadcast('clicked-out');
      },
      adjustCurrentCustomer: function(event, customer) {
        this.setCurrentCustomer(customer, true);
      },
      adjustCurrentProject: function(event, project) {
        this.setCurrentProject(project, true);
      },
      setCurrentCustomer: function(customer, skipRedirect) {
        var vm = this;
        currentStateService.setCustomer(customer);
        vm.currentCustomer = customer;
        $rootScope.$broadcast('currentCustomerUpdated');
        vm.setFirstOrLastSelectedProject().then(function() {
          if (!skipRedirect) {
            $state.go('organizations.details', {uuid: vm.currentCustomer.uuid});
          }
        });
      },
      setCurrentProject: function(project, skipRedirect) {
        var vm = this;
        currentStateService.setProject(project);
        currentStateService.handleSelectedProjects(vm.currentCustomer.uuid, project);
        vm.currentProject = project;
        $rootScope.$broadcast('currentProjectUpdated');
        if (!skipRedirect && project) {
          $state.go('projects.details', {uuid: project.uuid});
        }
      },
      menuToggle: function(active, event) {
        var vm = this;
        for (var property in vm.menuState) {
          if (vm.menuState.hasOwnProperty(property)) {
            if (property !== active) {
              vm.menuState[property] = false;
            }
          }
        }
        event.stopPropagation();
        vm.menuState[active] = !vm.menuState[active];
      },
      mobileMenu: function() {
        this.showMobileMenu = !this.showMobileMenu;
      },
      setFirstOrLastSelectedProject: function() {
        var vm = this,
          deferred = $q.defer();

        var projectUuid = currentStateService.handleSelectedProjects(vm.currentCustomer.uuid);
        if (projectUuid) {
          projectsService.$get(projectUuid).then(function(project){
            if (project.customer_uuid == vm.currentCustomer.uuid) {
              currentStateService.setProject(project);
              controllerScope.currentProject = project;
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
            vm.currentProject = firstProject;
            deferred.resolve();
          });
        }
        return deferred.promise;
      },
      refreshProjectListHandler: function(event, params) {
        var vm = this,
          projectUuids,
          currentProjectKey,
          model;
        if (params) {
          model = params.model;
          projectUuids = vm.projects.map(function(obj) {
            return obj.uuid;
          });
          currentProjectKey = projectUuids.indexOf(model.uuid);
          if (params.update) {
            if (currentProjectKey + 1) {
              vm.projects[currentProjectKey] = model;
            }
            if (model.uuid == vm.currentProject.uuid) {
              vm.currentProject = model;
              vm.setCurrentProject(model);
            }
          }
          if (params.new) {
            if (!vm.currentProject || !vm.currentProject.uuid || params.current) {
              vm.setCurrentProject(model);
            }
          }
          if (params.remove) {
            if (currentProjectKey + 1) {
              vm.projects.splice(currentProjectKey, 1);
            }
            if (model && model.uuid == vm.currentProject.uuid) {
              currentStateService.removeLastSelectedProject(model.uuid);
              vm.setFirstOrLastSelectedProject();
            }
          }
          projectsService.cacheReset = true;
        } else {
          vm.setFirstOrLastSelectedProject();
          return vm.getProjectList(true);
        }
      },
      refreshCustomerListHandler: function(event, params) {
        var vm = this,
          customerUuids,
          currentCustomerKey,
          model;
        if (params) {
          model = params.model;
          customerUuids = vm.customers.map(function(obj) {
            return obj.uuid;
          });
          currentCustomerKey = customerUuids.indexOf(model.uuid);
          if (params.update) {
            if (currentCustomerKey + 1) {
              vm.customers[currentCustomerKey] = model;
            }
            if (model.uuid == vm.currentCustomer.uuid) {
              vm.currentCustomer = model;
              vm.setCurrentCustomer(model);
            }
          }
          if (params.new) {
            if (vm.customers.indexOf(model) == -1) {
              vm.customers.push(model);
            }
            if (!vm.currentCustomer || params.current) {
              vm.setCurrentCustomer(model);
            }
          }
          if (params.remove) {
            if (currentCustomerKey + 1) {
              vm.customers.splice(currentCustomerKey, 1);
            }
            if (model && model.uuid == vm.currentCustomer.uuid) {
              vm.setFirstCustomer();
            }
          }
        } else {
          vm.setFirstCustomer();
          vm.getCustomerList(true);
        }

      },
      setFirstCustomer: function() {
        var vm = this;
        customersService.getPersonalOrFirstCustomer().then(function(firstCustomer) {
          vm.setCurrentCustomer(firstCustomer);
        });
      },
      getProjectList: function(cacheReset) {
        var vm = this,
          deferred = $q.defer();
        projectsService.cacheTime = ENV.topMenuProjectsCacheTime;
        projectsService.cacheReset = cacheReset;
        var projectMenu = blockUI.instances.get('project-menu');
        projectMenu.start();
        projectsService.getList().then(function(response) {
          if (response.length < 1
            && $state.current.name != 'projects.create') {
            vm.currentProject = null;
            vm.setCurrentProject(null);
            if ($state.current.name != 'errorPage.notFound') {
              vm.infoFlash('You have no projects! Please add one.');
            }
          }
          vm.projects = response;
          projectMenu.stop();
          deferred.resolve(response);
        });

        return deferred.promise;
      },
      getCustomerList: function(cacheReset) {
        var vm = this,
          deferred = $q.defer();
        customersService.cacheTime = ENV.topMenuCustomerCacheTime;
        customersService.cacheReset = cacheReset;
        var customerMenu = blockUI.instances.get('customer-menu');
        customerMenu.start();
        customersService.getList().then(function(response) {
          vm.customers = response;
          customerMenu.stop();
          deferred.resolve(response);
        });

        return deferred.promise;
      },
      goToCurrentOrganization: function() {
        $state.go('organizations.details', {uuid: this.currentCustomer.uuid});
      },
      goToCurrentProject: function() {
        if (this.currentProject) {
          $state.go('projects.details', {uuid: this.currentProject.uuid});
        }
      }
    });

    controllerScope.__proto__ = new HeaderControllerClass();
  }

  angular.module('ncsaas')
    .controller('MainController', [
      '$q', '$rootScope', '$state', 'authService', 'currentStateService', 'customersService', 'usersService',
      'baseControllerClass', '$window', 'ENV', 'projectsService', MainController]);

  function MainController(
    $q, $rootScope, $state, authService, currentStateService, customersService, usersService, baseControllerClass,
    $window, ENV, projectsService) {
    var controllerScope = this;
    var Controller = baseControllerClass.extend({

      init: function() {
        this.setSignalHandler('$stateChangeSuccess', this.stateChangeSuccessHandler.bind(controllerScope));
        this._super();
        $rootScope.buildId = ENV.buildId;
        $rootScope.logout = this.logout;
        this.isAuthenticated = authService.isAuthenticated;
      },
      logout: function() {
        authService.signout();
        currentStateService.isCustomerDefined = false;
        $state.go('home.login');
      },
      stateChangeSuccessHandler: function(event, toState, toParams, fromState, fromParams) {
        $rootScope.prevPreviousState = $rootScope.previousState;
        $rootScope.prevPreviousParams = $rootScope.previousParams;
        $rootScope.previousState = fromState;
        $rootScope.previousParams= fromParams;
        this.deregisterEvent('adjustCurrentCustomer');
        this.deregisterEvent('adjustCurrentProject');
        this.deregisterEvent('currentCustomerUpdated'); // clear currentCustomerUpdated event handlers
        this.deregisterEvent('refreshProjectList'); // clear refreshProjectList event handlers
        this.deregisterEvent('currentProjectUpdated'); // clear currentProjectUpdated event handlers
        this.deregisterEvent('refreshCounts'); // clear refreshCounts event handlers
        $rootScope.bodyClass = currentStateService.getBodyClass(toState.name);
        // if user is authenticated - he should have selected customer
        if (authService.isAuthenticated() && !currentStateService.isCustomerDefined) {
          var deferred = $q.defer(),
            projectDeferred = $q.defer();
          usersService.getCurrentUser().then(function(user) {
            var date  = new Date(user.date_joined).getTime();
            window.Intercom('boot', {
              app_id: ENV.IntercomAppId,
              name: user.full_name,
              email: user.email,
              created_at: date
            });
            if($window.localStorage[ENV.currentCustomerUuidStorageKey]) {
              customersService.$get($window.localStorage[ENV.currentCustomerUuidStorageKey]).then(function(customer) {
                deferred.resolve(customer);
                getProject()
              }, setPersonalOrFirstCustomer);
            } else {
              setPersonalOrFirstCustomer();
            }

            function setPersonalOrFirstCustomer() {
              customersService.getPersonalOrFirstCustomer(user.username).then(function(customer) {
                deferred.resolve(customer);
                getProject()
              });
            }
          });
          currentStateService.setCustomer(deferred.promise);
          currentStateService.setProject(projectDeferred.promise);
        }

        if (ENV.entityCreateLink[toState.name]) {
          currentStateService.isQuotaExceeded(ENV.entityCreateLink[toState.name]).then(function(response) {
            if (response) {
              $state.go('errorPage.limitQuota');
            }
          });
        }

        function getProject() {
          if ($window.localStorage[ENV.currentProjectUuidStorageKey]) {
            projectsService.$get($window.localStorage[ENV.currentProjectUuidStorageKey]).then(function(response) {
              currentStateService.getCustomer().then(function(customer) {
                if (response.customer_uuid == customer.uuid) {
                  projectDeferred.resolve(response);
                } else {
                  getFirstProject();
                }
              });
            }, getFirstProject);
          } else {
            getFirstProject();
          }
          function getFirstProject() {
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
          }
        }
      }
    });

    controllerScope.__proto__ = new Controller();
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

})();
