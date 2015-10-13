'use strict';

(function() {
  angular.module('ncsaas')
    .controller('UserListController', [
      'baseControllerListClass',
      'usersService',
      'projectPermissionsService',
      '$rootScope',
      'ENTITYLISTFIELDTYPES',
      UserListController
    ]);

  function UserListController(baseControllerListClass, usersService, projectPermissionsService, $rootScope, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var UserController = baseControllerListClass.extend({
      userProjects: {},
      expandableProjectsKey: 'projects',

      init:function() {
        this.service = usersService;
        this.controllerScope = controllerScope;
        this._super();
        this.searchFieldName = 'full_name';
        this.searchFilters = [
          {
            name: 'potential',
            title: 'Colleagues',
            value: true
          }
        ];
        this.actionButtonsListItems = [
          {
            title: 'User action placeholder',
            clickFunction: function(user) {}
          }
        ];
        this.expandableOptions = [
          {
            isList: true,
            sectionTitle: 'Connected projects',
            articleBlockText: 'Manage users through',
            entitiesLinkRef: 'projects.list',
            entitiesLinkText: 'project details',
            addItemBlock: true,
            headBlock: 'heading',
            listKey: 'userProjects',
            modelId: 'username',
            minipaginationData:
            {
              pageChange: 'getProjectsForUser',
              pageEntityName: this.expandableProjectsKey
            },
            list: [
              {
                entityDetailsLink: 'projects.details({uuid: element.project_uuid})',
                entityDetailsLinkText: 'project_name',
                type: 'link'
              }
            ]
          }
        ];
        this.entityOptions = {
          entityData: {
            title: 'Users',
            noDataText: 'No users yet.',
            hideActionButtons: true,
            expandable: true
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.avatarPictureField,
              className: 'avatar',
              avatarSrc: 'email',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Name',
              propertyName: 'full_name',
              type: ENTITYLISTFIELDTYPES.name,
              link: 'users.details({uuid: entity.uuid})',
              className: 'name',
              showForMobile: ENTITYLISTFIELDTYPES.showForMobile
            },
            {
              name: 'Email',
              propertyName: 'email',
              type: ENTITYLISTFIELDTYPES.noType
            },
            {
              name: 'Username',
              propertyName: 'username',
              type: ENTITYLISTFIELDTYPES.noType
            }
          ]
        };
      },
      showMore: function(user) {
        if (!this.userProjects[user.username]) {
          this.getProjectsForUser(user.username);
        }
      },
      getProjectsForUser: function(username, page) {
        var vm = controllerScope;
        var filter = {
          username:username
        };
        vm.userProjects[username] = {data:null};
        page = page || 1;
        projectPermissionsService.page = page;
        projectPermissionsService.pageSize = 5;
        vm.userProjects[username].page = page;
        projectPermissionsService.filterByCustomer = false;
        projectPermissionsService.getList(filter).then(function(response) {
          vm.userProjects[username].data = response;
          vm.userProjects[username].pages = projectPermissionsService.pages;
          $rootScope.$broadcast('mini-pagination:getNumberList', vm.userProjects[username].pages,
            page, vm.getProjectsForUser.bind(vm), vm.expandableProjectsKey, username);
        });
      }
    });

    controllerScope.__proto__ = new UserController();
  }

  angular.module('ncsaas')
    .service('baseUserDetailUpdateController', [
      'baseControllerDetailUpdateClass',
      'usersService',
      'authService',
      '$translate',
      'LANGUAGE',
      baseUserDetailUpdateController
    ]);

  // need for profile page
  function baseUserDetailUpdateController(
    baseControllerDetailUpdateClass, usersService, authService, $translate, LANGUAGE) {
    var ControllerClass = baseControllerDetailUpdateClass.extend({
      activeTab: 'keys',
      currentUser: null,

      init: function() {
        this.service = usersService;
        this.getCurrentUser();
        this._super();
        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.selectedLanguage = $translate.use();
      },
      getCurrentUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
        });
      },
      deleteAccount: function() {
        if (confirm('Are you sure you want to delete account?')) {
          this.model.$delete(
            authService.signout,
            function(errors) {
              alert(errors.data.detail);
            }
          );
        }
      },
      changeLanguage: function() {
        $translate.use(this.selectedLanguage);
      }
    });

    return ControllerClass;
  }

  angular.module('ncsaas')
    .controller('UserDetailUpdateController', [
      'baseUserDetailUpdateController',
      UserDetailUpdateController
    ]);

  function UserDetailUpdateController(baseUserDetailUpdateController) {
    var controllerScope = this;
    var Controller = baseUserDetailUpdateController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'organizations.details';
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('UserEventTabController', [
      '$stateParams',
      'usersService',
      'baseEventListController',
      'ENTITYLISTFIELDTYPES',
      UserEventTabController
    ]);

  function UserEventTabController($stateParams, usersService, baseEventListController, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var EventController = baseEventListController.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this._super();
        this.entityOptions = {
          entityData: {
            noDataText: 'No events yet.',
            hideActionButtons: true,
            hideTableHead: true
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'message',
              showForMobile: true,
              className: 'event-message'
            },
            {
              type: ENTITYLISTFIELDTYPES.date,
              propertyName: '@timestamp'
            }
          ]
        };
      },
      getList: function(filter) {
        var vm = this,
          fn = this._super.bind(this);
        if ($stateParams.uuid) {
          return usersService.$get($stateParams.uuid).then(function (response) {
            vm.user = response;
            vm.service.defaultFilter.scope = vm.user.url;
            fn(filter);
          });
        } else {
          return usersService.getCurrentUser().then(function(response) {
            vm.user = response;
            vm.service.defaultFilter.scope = vm.user.url;
            fn(filter);
          });
        }
      }
    });

    controllerScope.__proto__ = new EventController();
  }

})();

(function() {
  angular.module('ncsaas')
    .controller('UserProjectTabController', [
      '$stateParams',
      'usersService',
      'baseControllerListClass',
      'projectPermissionsService',
      UserProjectTabController
    ]);

  function UserProjectTabController($stateParams, usersService, baseControllerListClass, projectPermissionsService) {
    var controllerScope = this;
    var ProjectController = baseControllerListClass.extend({
      user: null,

      init: function() {
        this.controllerScope = controllerScope;
        this.service = projectPermissionsService;
        this._super();
        this.getUser();
      },
      getList: function(filter) {
        if (this.user) {
          this.service.defaultFilter.username = this.user.username;
          return this._super(filter);
        }
      },
      getUser: function() {
        var vm = this;
        if ($stateParams.uuid) {
          usersService.$get($stateParams.uuid).then(function (response) {
            vm.user = response;
            vm.getList();
          });
        } else {
          usersService.getCurrentUser().then(function(response) {
            vm.user = response;
            vm.getList();
          });
        }
      }
    });

    controllerScope.__proto__ = new ProjectController();
  }
})();

(function() {
  angular.module('ncsaas')
    .controller('UserKeyTabController', [
      '$stateParams',
      'keysService',
      'baseControllerListClass',
      'usersService',
      'ENTITYLISTFIELDTYPES',
      UserKeyTabController
    ]);

  function UserKeyTabController($stateParams, keysService, baseControllerListClass, usersService, ENTITYLISTFIELDTYPES) {
    var controllerScope = this;
    var Controller = baseControllerListClass.extend({
      user: {},

      init: function() {
        this.controllerScope = controllerScope;
        this.blockUIElement = 'tab-content';
        this.service = keysService;
        if ($stateParams.uuid) {
          this.user.uuid = $stateParams.uuid;
        }
        this._super();

        this.entityOptions = {
          entityData: {
            noDataText: 'No keys yet',
            createLink: 'keys.create',
            createLinkText: 'Add SSH Key'
          },
          list: [
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'name',
              name: 'Title',
              showForMobile: true
            },
            {
              type: ENTITYLISTFIELDTYPES.noType,
              propertyName: 'fingerprint',
              name: 'Fingerprint',
              className: 'fingerprint'
            },
            {
              type: ENTITYLISTFIELDTYPES.date,
              propertyName: '',
              name: 'Added',
              className: 'added'
            }
          ]
        };
        this.actionButtonsListItems = [
          {
            title: 'Remove',
            clickFunction: this.remove.bind(controllerScope)
          }
        ];
      },
      getList: function(filter) {
        var vm = this,
          fn = this._super.bind(this);
        if (this.user.uuid) {
          vm.service.defaultFilter.user_uuid = vm.user.uuid;
          return fn(filter);
        } else {
          return usersService.getCurrentUser().then(function(response) {
            vm.user = response;
            vm.service.defaultFilter.user_uuid = vm.user.uuid;
            return fn(filter);
          });
        }
      }
    });

    controllerScope.__proto__ = new Controller();
  }

})();