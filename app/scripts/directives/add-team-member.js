'use strict';

(function() {

    angular.module('ncsaas')
        .directive('addTeamMember', [
            'currentStateService',
            'customerPermissionsService',
            'projectPermissionsService',
            'projectsService',
            'usersService',
            '$q',
            addTeamMember]);

    function addTeamMember(
        currentStateService,
        customerPermissionsService,
        projectPermissionsService,
        projectsService,
        usersService,
        $q
    ) {
        return {
            restrict: 'E',
            template: '<div class="add-team-member" ng-include="contentUrl"></div>',
            scope: {
                controller: '=',
                editUser: '='
            },
            link: function(scope) {
                scope.contentUrl = 'views/directives/add-team-member.html';
                scope.add = add;
                scope.getProjectsListForAutoComplete = getProjectsListForAutoComplete;
                scope.userSearchInputChanged = userSearchInputChanged;
                scope.selectedUsersCallback = selectedUsersCallback;
                scope.projectRemove = projectRemove;
                scope.userModel = {};
                var currentCustomer;

                currentStateService.getCustomer().then(function(response) {
                    currentCustomer = response;
                });

                scope.$watch('editUser', function(user) {
                    console.log(user);
                    if (user) {
                        scope.userModel.user_url = user.user;
                    }
                });

                usersService.getList().then(function(users) {
                    scope.users = users;
                });

                getProjectsListForAutoComplete();

                function add() {
                    if (scope.editUser) {
                        saveProjectPermissions();
                        return;
                    }
                    var userPermission = customerPermissionsService.$create();
                    userPermission.customer = currentCustomer.url;
                    userPermission.user = scope.userModel.user_url;
                    userPermission.role = scope.userModel.role;

                    userPermission.$save().then(function(permission) {
                        saveProjectPermissions();
                        customerPermissionsService.clearAllCacheForCurrentEndpoint();
                    }, function(error) {
                        console.log('error ', error);
                    });
                }

                function saveProjectPermissions() {
                    if (scope.userModel.projects) {
                        var promises = [];
                        scope.userModel.projects.forEach(function(item) {
                            var instance = projectPermissionsService.$create();
                            instance.user = scope.userModel.user_url;
                            instance.project = item.url;
                            instance.role = 'admin';
                            var promise = instance.$save();
                            promises.push(promise);
                        });
                        $q.all(promises).then(function() {
                            console.log('here');
                            scope.controller.getList();
                        });
                    }
                }

                function getProjectsListForAutoComplete(filter) {
                    filter = filter || {};
                    filter['DONTBLOCK'] = 1;
                    projectsService.getList(filter).then(function(projects) {
                        scope.projectsListForAutoComplete = projects;
                    });
                }

                function userSearchInputChanged(searchText) {
                    scope.getProjectsListForAutoComplete({name: searchText});
                }

                function selectedUsersCallback(selected) {
                    !scope.userModel.projects && (scope.userModel.projects = []);
                    if (selected) {
                        var isPresent = null;
                        scope.userModel.projects.forEach(function(project) {
                            if (project.uuid === selected.originalObject.uuid) {
                                isPresent = true;
                            }
                        });
                        !isPresent && scope.userModel.projects.push(selected.originalObject);
                    }
                }

                function projectRemove(project) {
                    var index = scope.userModel.projects.indexOf(project);
                    scope.userModel.projects.splice(index, 1);
                }
            }
        };
    }

})();
