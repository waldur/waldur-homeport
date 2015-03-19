'use strict';


(function() {
  angular.module('ncsaas')
    .service('projectsService', ['$q', 'baseServiceClass', projectsService]);

  function projectsService($q, baseServiceClass) {
    var ServiceClass = baseServiceClass.extend({
      init:function() {
        this._super();
        this.endpoint = '/projects/';
      },

      // adds users and resources for each project if `includeAdditionalData` is true
      getList: function(filter, includeUsers, includeResources) {
        var projectsPromise = this._super(filter);
        if (includeUsers) {
          projectsPromise = this.chainFunctionsToPromise(projectsPromise, [this._initProjectsUsers.bind(this)]);
        }
        if (includeResources) {
          projectsPromise = this.chainFunctionsToPromise(projectsPromise, [this._initProjectsResources.bind(this)]);
        }
        return projectsPromise;
      },

      _initProjectsUsers: function(projects) {
        var usersFactory = this.getFactory(null, '/users/');
        for (var i = 0; i < projects.length; i++) {
          var project = projects[i];
          usersFactory.query({project: project.name}).$promise.then(
            function(users) {
              project.users = users;
            }
          );
        }
      },

      _initProjectsResources: function(projects) {
        var resourcesFactory = this.getFactory(null, '/resources/');
        for (var i = 0; i < projects.length; i++) {
          var project = projects[i];
          resourcesFactory.query({project: project.name}).$promise.then(
            function(resources) {
              project.resources = resources;
            }
          );
        }
      }

    });
    return new ServiceClass();
  }
})();
