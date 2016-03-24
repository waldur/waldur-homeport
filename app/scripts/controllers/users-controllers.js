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
      '$stateParams',
      'eventsService',
      baseUserDetailUpdateController
    ]);

  // need for profile page
  function baseUserDetailUpdateController(
    baseControllerDetailUpdateClass, usersService, authService, $translate, LANGUAGE, $stateParams, eventsService) {
    var ControllerClass = baseControllerDetailUpdateClass.extend({
      activeTab: 'keys',
      currentUser: null,

      init: function() {
        this.service = usersService;
        this._super();
        this.LANGUAGE_CHOICES = LANGUAGE.CHOICES;
        this.selectedLanguage = $translate.use();
        this.detailsViewOptions = {
          title: 'Profile',
          hasGravatar: true,
          joinedDate: 'date_joined',
          aboutFields: [
            {
              fieldKey: 'full_name',
              className: 'name',
              emptyText: 'Add name'
            },
            {
              fieldKey: 'email',
              isEditable: true,
              className: 'details',
              emptyText: 'Add email'
            }
          ],
          tabs: [
            {
              title: 'Events',
              key: 'eventlog',
              viewName: 'tabEventlog',
              count: -1,
            },
            {
              title: 'SSH Keys',
              key: 'keys',
              viewName: 'tabKeys',
              count: 0,
              countFieldKey: 'keys'
            }
          ]
        };
      },
      getCurrentUser: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.currentUser = response;
          if (vm.currentUser.uuid === vm.model.uuid) {
            vm.canEdit = true;
            vm.detailsViewOptions.tabs.push({
              title: 'Notifications',
              key: 'notifications',
              viewName: 'tabNotifications',
              count: 0,
              countFieldKey: 'hooks'
            });
            vm.detailsViewOptions.tabs.push({
              title: 'Password',
              key: 'password',
              viewName: 'tabPassword',
              count: -1,
              hideSearch: true
            });
            vm.detailsViewOptions.activeTab = vm.getActiveTab();
          }
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
      },
      afterActivate: function() {
        this.getCurrentUser();
        this.setCounters();
      },
      getCounters: function() {
        return usersService.getCounters(eventsService.defaultFilter);
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
    .controller('DetailUpdateProfileController', [
      'baseUserDetailUpdateController',
      'usersService',
      'ENV',
      '$stateParams',
      '$rootScope',
      DetailUpdateProfileController
    ]);

  function DetailUpdateProfileController(
    baseUserDetailUpdateController,
    usersService,
    ENV,
    $stateParams,
    $rootScope) {
    var controllerScope = this;
    var Controller = baseUserDetailUpdateController.extend({
      init:function() {
        this.controllerScope = controllerScope;
        this._super();
        this.detailsState = 'profile.details';
        this.showImport = ENV.showImport;
      },
      activate: function() {
        var vm = this;
        usersService.getCurrentUser().then(function(response) {
          vm.model = response;
          vm.afterActivate();
        });
      },
      search: function() {
        $rootScope.$broadcast('generalSearchChanged', this.searchInput);
      }
    });

    controllerScope.__proto__ = new Controller();
  }
})();
