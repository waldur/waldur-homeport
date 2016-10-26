'use strict';

(function() {

  angular.module('ncsaas').controller(
    'AddProjectMemberDialogController', AddProjectMemberDialogController);

  AddProjectMemberDialogController.$inject = [
    'projectPermissionsService',
    'usersService',
    'blockUI',
    '$q',
    '$scope',
    'ENV'
  ];

  function AddProjectMemberDialogController(
    projectPermissionsService,
    usersService,
    blockUI,
    $q,
    $scope,
    ENV) {
    $scope.roles = ENV.roles;
    $scope.saveUser = saveUser;
    $scope.addText = 'Add';
    $scope.addTitle = 'Add';
    $scope.projectModel = {
      role: null
    };
    $scope.possibleRoles = [
      { name: $scope.roles.admin, value: 'admin' },
      { name: $scope.roles.manager, value: 'manager' }
    ];
    $scope.errors = {};
    $scope.canSubmit = canSubmit;

    function loadData() {
      $scope.projectModel.role = $scope.possibleRoles[0].value;

      if ($scope.editUser) {
        $scope.addText = 'Save';
        $scope.addTitle = 'Edit';
        $scope.projectModel.user = $scope.editUser;
        $scope.projectModel.role = $scope.editUser.role;
        return $q.resolve();
      } else {
        return usersService.getAll().then(function(users) {
          $scope.users = users.filter(function(user) {
            return $scope.addedUsers.indexOf(user.uuid) === -1;
          });
        });
      }
    }

    $scope.loading = true;
    loadData().finally(function() {
      $scope.loading = false;
    });

    function saveUser() {
      $scope.errors = {};
      var block = blockUI.instances.get('add-team-member-dialog');
      block.start({delay: 0});

      return saveProjectPermissions()
        .then(function() {
          block.stop();
          $scope.$close();
        }, function(error) {
          block.stop();
          $scope.errors = error.data;
        });
    }

    function canSubmit() {
      return ((!$scope.editUser && !$scope.projectModel.user) ||
        ($scope.editUser && $scope.editUser.role === $scope.projectModel.role));
    }

    function saveProjectPermissions() {
      if ($scope.editUser && $scope.editUser.role !== $scope.projectModel.role) {
        return projectPermissionsService.deletePermission($scope.editUser.permission).then(function() {
          return createPermission($scope.projectModel.role);
        });
      } else if (!$scope.editUser) {
        return createPermission($scope.projectModel.role);
      }
    }

    function createPermission(role) {
      var instance = projectPermissionsService.$create();
      instance.user = $scope.projectModel.user.url;
      instance.project = $scope.currentProject.url;
      instance.role = role;
      return instance.$save();
    }
  }
})();
