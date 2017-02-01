import template from './add-team-member.html';

export default function addTeamMember() {
  return {
    restrict: 'E',
    template: template,
    controller: AddTeamMemberDialogController
  };
}

// @ngInject
function AddTeamMemberDialogController(
  customerPermissionsService,
  projectPermissionsService,
  blockUI,
  $q,
  $scope,
  ENV,
  ncUtils,
  $filter) {
  $scope.roles = ENV.roles;
  $scope.saveUser = saveUser;
  $scope.addText = 'Save';
  $scope.addTitle = 'Edit';
  $scope.helpText = $filter('translate')('You cannot change your own role');
  $scope.userModel = {
    expiration_time: null
  };

  $scope.select = {
    name: 'role',
    list: [
      { value: 'admin', display_name: ENV.roles.admin },
      { value: 'manager', display_name: ENV.roles.manager },
    ]
  };
  $scope.datetime = {
    name: 'expiration_time',
    options: {
      format: 'dd.MM.yyyy',
      altInputFormats: ['M!/d!/yyyy'],
      dateOptions: {
        minDate: moment().add(1, 'days').toDate(),
        startingDay: 1
      }
    }
  };
  $scope.projects = [];
  $scope.validateSubmit = validateSubmit;

  init();

  function init() {
    $scope.userModel.user = $scope.editUser;
    $scope.userModel.role = $scope.editUser.role;
    $scope.userModel.expiration_time = $scope.editUser.expiration_time;

    $scope.projects = $scope.currentCustomer.projects.map(function(project) {
      $scope.editUser.projects.some(function(permissionProject) {
        project.role = null;
        project.permission = null;
        if (permissionProject.uuid === project.uuid) {
          project.role = permissionProject.role;
          project.permission = permissionProject.permission;
          project.expiration_time = permissionProject.expiration_time;
        }
        return permissionProject.uuid === project.uuid;
      });
      return project;
    });
    $scope.emptyProjectList = !$scope.projects.length;
    $scope.canChangeRole = $scope.currentUser.is_staff || $scope.editUser.uuid !== $scope.currentUser.uuid;
  }

  function saveUser() {
    $scope.errors = [];
    var block = blockUI.instances.get('add-team-member-dialog');
    block.start({delay: 0});

    return $q.all([
      saveCustomerPermission(),
      saveProjectPermissions()
    ]).then(function() {
      block.stop();
      $scope.$close();
    }, function(error) {
      block.stop();
      $scope.errors = ncUtils.responseErrorFormatter(error);
    });
  }

  function validateSubmit() {
    return true;
  }

  function saveCustomerPermission() {
    var permission = customerPermissionsService.$create();
    permission.customer = $scope.currentCustomer.url;
    permission.user = $scope.userModel.user.url;
    permission.role = $scope.userModel.role === 'owner' ? 'owner' : null;
    permission.expiration_time = $scope.userModel.role === 'owner' ? $scope.userModel.expiration_time : null;

    if ($scope.editUser) {
      if ($scope.userModel.role !== $scope.editUser.role ||
        $scope.userModel.expiration_time !== $scope.editUser.expiration_time) {
        if (!$scope.userModel.role) {
          return customerPermissionsService.deletePermission($scope.editUser.permission);
        } else {
          permission.user = $scope.editUser.url;
          return permission.$save();
        }
      }
    } else if ($scope.userModel.role) {
      return permission.$save();
    }
  }

  function saveProjectPermissions() {
    var originalPermissions = {};
    var originalRoles = {};
    if ($scope.editUser) {
      angular.forEach($scope.editUser.projects, function(project) {
        originalPermissions[project.uuid] = project.permission;
      });

      angular.forEach($scope.editUser.projects, function(project) {
        originalRoles[project.uuid] = project.role;
      });
    }

    var newRoles = {};
    var newProjects = {};
    angular.forEach($scope.projects, function(project) {
      if (project.role) {
        newRoles[project.uuid] = project.role;
        newProjects[project.uuid] = {
          url: project.url,
          expiration_time: project.expiration_time
        };
      }
    });

    var createdProjects = [];
    angular.forEach(newRoles, function(role, project) {
      if (!originalPermissions[project] || (originalRoles[project] !== role)) {
        createdProjects.push(project);
      }
    });

    var creationPromises = createdProjects.map(function(project) {
      var instance = projectPermissionsService.$create();
      instance.user = $scope.userModel.user.url || $scope.editUser.url;
      instance.project = newProjects[project].url;
      instance.expiration_time = newProjects[project].expiration_time;
      instance.role = newRoles[project];
      return instance.$save();
    });

    var deletedPermissions = [];
    angular.forEach(originalRoles, function(role, project) {
      if (!newRoles[project] || (newRoles[project] !== role)) {
        deletedPermissions.push(originalPermissions[project]);
      }
    });

    var removalPromises = deletedPermissions.map(function(permission) {
      return projectPermissionsService.deletePermission(permission);
    });

    return $q.all(creationPromises.concat(removalPromises));
  }
}
