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

        scope.$watch('userModel.projects', watchAddedProjects);
        scope.$watch('userModel.projectsManagerRole', watchAddedProjects);

        function watchAddedProjects(newVal, oldVal) {
            if (newVal && newVal.length !== 0) {
                scope.projects = scope.projects.filter(function(project) {
                    var projectAdded = false;
                    newVal.forEach(function(selectedProject) {
                        if (project.uuid === selectedProject.uuid) {
                            projectAdded = true;
                        }
                    });
                    return !projectAdded;
                });
                if (oldVal && newVal && newVal.length < oldVal.length) {
                    var found = false;
                    oldVal.forEach(function (oldValItem) {
                        newVal.forEach(function (newValItem) {
                            if (oldValItem.uuid === newValItem.uuid) {
                                found = true;
                            }
                        });
                        if (found === false) {
                            scope.projects.push(oldValItem);
                        }
                        found = false;
                    });
                }
            }
        }

        function loadData() {
            if (scope.editUser) {
                scope.addText = 'Save';
                scope.addTitle = 'Edit';
                scope.userModel.user = scope.editUser;
                scope.userModel.role = scope.editUser.role;

                return $q.all([
                    usersService.getCurrentUser().then(function(currentUser) {
                        scope.canChangeRole = currentUser.is_staff || scope.editUser.uuid !== currentUser.uuid;
                    }),
                    projectPermissionsService.getAll().then(function(permissions) {
                        scope.userModel.projects = scope.editUser.projects.map(parseProject).filter(function(item) {
                            return filterPermissions(item, 'admin');
                        });
                        scope.userModel.projectsManagerRole = scope.editUser.projects.map(parseProject).filter(function(item) {
                            return filterPermissions(item, 'manager');
                        });

                        function filterPermissions (item, role) {
                            var isRolePresent = false;
                            for (var i = 0; i < permissions.length; i++) {
                                if (permissions[i].project_uuid === item.uuid && permissions[i].role === role) {
                                    isRolePresent = true;
                                    break;
                                }
                            }
                            return isRolePresent;
                        }
                    })
                ]);
            } else {
                scope.canChangeRole = true;
                return usersService.getAll().then(function(users) {
                    scope.users = users.filter(function(user) {
                        return scope.addedUsers.indexOf(user.uuid) === -1;
                    });
                });
            }
        }

        scope.loading = true;
        loadData().finally(function() {
            scope.loading = false;
        });

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
                    scope.projects = scope.projects.filter(removeSelectedProjects);
                    scope.emptyProjectList = !search && !projects.length;
                }
            );
        }

        function removeSelectedProjects(project) {
            var roleAdded = false;
            scope.userModel.projects && scope.userModel.projects.forEach(function(item) {
                if (item.uuid === project.uuid) {
                    roleAdded = true;
                }
            });
            scope.userModel.projectsManagerRole && scope.userModel.projectsManagerRole.forEach(function(item) {
                if (item.uuid === project.uuid) {
                    roleAdded = true;
                }
            });
            return !roleAdded;
        }

        function cancel() {
            scope.$dismiss();
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
                scope.$close();
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
            var existingProjects = {};
            var currentManagerProjects = {};
            var currentProjects = {};
            if (scope.editUser) {
                existingProjects = (scope.editUser.projects || []).reduce(function(obj, project) {
                    obj[project.uuid] = project.permission;
                    return obj;
                }, {});
            }

            if (scope.userModel.projects) {
                currentProjects = scope.userModel.projects.reduce(function(obj, project) {
                    obj[project.uuid] = true;
                    return obj;
                }, {});
            }

            if (scope.userModel.projectsManagerRole) {
                currentManagerProjects = scope.userModel.projectsManagerRole.reduce(function(obj, project) {
                    obj[project.uuid] = true;
                    return obj;
                }, {});
            }


            var deletedPermissions = [];
            angular.forEach(existingProjects, function(permission, project_uuid) {
                if (!currentProjects[project_uuid] && !currentManagerProjects[project_uuid]) {
                    deletedPermissions.push(permission);
                }
            });

            var removalPromises = deletedPermissions.map(function(permission) {
                return projectPermissionsService.deletePermission(permission);
            });

            var addedProjects = [];
            scope.userModel.projects && scope.userModel.projects.forEach(function(project) {
                if (!existingProjects[project.uuid]) {
                    project.role = 'admin';
                    addedProjects.push(project);
                }
            });

            scope.userModel.projectsManagerRole && scope.userModel.projectsManagerRole.forEach(function(project) {
                if (!existingProjects[project.uuid]) {
                    project.role = 'manager';
                    addedProjects.push(project);
                }
            });

            var creationPromises = addedProjects.map(function(project) {
                var instance = projectPermissionsService.$create();
                instance.user = scope.userModel.user.url || scope.editUser.url;
                instance.project = project.url;
                instance.role = project.role;
                return instance.$save();
            });
            return $q.all(creationPromises.concat(removalPromises));
        }
    }
})();
