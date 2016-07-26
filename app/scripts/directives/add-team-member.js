'use strict';

(function() {

    angular.module('ncsaas').controller(
        'AddTeamMemberDialogController', AddTeamMemberDialogController);

    AddTeamMemberDialogController.$inject = [
        'currentStateService',
        'customerPermissionsService',
        'projectPermissionsService',
        'projectsService',
        'usersService',
        '$q',
        '$scope',
    ];

    function AddTeamMemberDialogController(
        currentStateService,
        customerPermissionsService,
        projectPermissionsService,
        projectsService,
        usersService,
        $q,
        scope
    ) {
        scope.saveUser = saveUser;
        scope.cancel = cancel;
        scope.addText = 'Add';
        scope.addTitle = 'Add';
        scope.userModel = {};
        scope.errors = {};
        scope.projects = [];
        scope.currentUser = null;
        scope.currentCustomer = null;
        scope.refreshProjectChoices = refreshProjectChoices;
        scope.changeRoleHelpMessage = "You cannot change your own role";

        if (scope.editUser) {
            scope.addText = 'Save';
            scope.addTitle = 'Edit';
            scope.userModel.user = scope.editUser;
            scope.userModel.role = scope.editUser.role;
            scope.userModel.projects = scope.editUser.projects.map(parseProject);
            usersService.getCurrentUser().then(function(currentUser) {
                scope.canChangeRole = currentUser.is_staff || scope.editUser.uuid !== currentUser.uuid;
            });
        } else {
            scope.canChangeRole = true;
            usersService.getAll().then(function(users) {
                scope.users = users.filter(function(user) {
                    return scope.addedUsers.indexOf(user.uuid) === -1;
                });
            });
        }

        function parseProject(project) {
            return {
                uuid: project.uuid,
                name: project.name,
                url: project.url
            };
        }

        refreshProjectChoices();
        function refreshProjectChoices(search) {
            scope.projects = [];

            return projectsService.getList(search && {name: search}).then(
                function(projects) {
                    scope.projects = projects.map(parseProject);
                    scope.emptyProjectList = !search && !projects.length;
                }
            );
        }

        function cancel() {
            scope.closeThisDialog();
        }

        function saveUser() {
            scope.errors = {};

            if (!scope.userModel.user) {
                scope.errors.user = 'This field is required';
                return $q.reject(scope.errors);
            }

            return $q.all([
                saveCustomerPermission(),
                saveProjectPermissions()
            ]).then(function() {
                scope.closeThisDialog();
            });
        }

        function saveCustomerPermission() {
            return currentStateService.getCustomer().then(function(currentCustomer) {
                var permission = customerPermissionsService.$create();
                permission.customer = currentCustomer.url;
                permission.user = scope.userModel.user.url;
                permission.role = scope.userModel.role === 'Owner' ? 'owner' : null;

                if (scope.editUser) {
                    if (scope.userModel.role !== scope.editUser.role) {
                        if (scope.userModel.role !== 'Owner') {
                            return customerPermissionsService.deletePermission(scope.editUser.permission);
                        } else {
                            permission.user = scope.editUser.url;
                            return permission.$save();
                        }
                    }
                } else if (scope.userModel.role === 'Owner') {
                    return permission.$save();
                }
            });
        }

        function saveProjectPermissions() {
            if (scope.editUser) {
                var existingProjects = (scope.editUser.projects || []).reduce(function(obj, project) {
                    obj[project.uuid] = project.permission;
                    return obj;
                }, {});
            } else {
                var existingProjects = {};
            }

            var currentProjects = scope.userModel.projects.reduce(function(obj, project) {
                obj[project.uuid] = true;
                return obj;
            }, {});

            var deletedPermissions = [];
            angular.forEach(existingProjects, function(permission, project_uuid) {
                if (!currentProjects[project_uuid]) {
                    deletedPermissions.push(permission);
                }
            });
            var removalPromises = deletedPermissions.map(function(permission) {
                return projectPermissionsService.deletePermission(permission);
            })

            var addedProjects = [];
            scope.userModel.projects.forEach(function(project) {
                if (!existingProjects[project.uuid]) {
                    addedProjects.push(project);
                }
            });
            var creationPromises = addedProjects.map(function(project) {
                var instance = projectPermissionsService.$create();
                instance.user = scope.userModel.user.url || scope.editUser.url;
                instance.project = project.url;
                instance.role = 'admin';
                return instance.$save();
            });
            return $q.all(creationPromises.concat(removalPromises));
        }
    }
})();
