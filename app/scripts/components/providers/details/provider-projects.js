import template from './provider-projects.html';

export default function providerProjects() {
  return {
    restrict: 'E',
    scope: {
      service: '=provider'
    },
    controller: ProviderProjectsController,
    template: template
  };
}

// @ngInject
function ProviderProjectsController(
  $q,
  $scope,
  joinServiceProjectLinkService,
  projectsService,
  currentStateService,
  customersService) {
  angular.extend($scope, {
    init: function() {
      $scope.loading = true;
      $scope.getChoices().then(function(choices) {
        $scope.choices = choices;
      }).finally(function() {
        $scope.loading = false;
      });
    },
    getChoices: function() {
      let vm = this;
      return customersService.isOwnerOrStaff().then(function(canManage) {
        vm.canManage = canManage;
        if (!vm.canManage) {
          return;
        }
        return vm.getContext().then(function(context) {
          let link_for_project = {};
          angular.forEach(context.links, function(link) {
            link_for_project[link.project_uuid] = link;
          });
          return context.projects.map(function(project) {
            let link = link_for_project[project.uuid];
            return vm.newChoice(project, link);
          });
        });
      });

    },
    newChoice: function(project, link) {
      return {
        title: project.name,
        selected: link && !!link.url,
        link_url: link && link.url,
        project_url: project.url,
        subtitle: link && link.state,
        link: link,
      };
    },
    getContext: function() {
      // Context consists of list of projects and list of links
      return currentStateService.getCustomer().then(customer => {
        let context = {};
        return $q.all([
          this.getProjects(customer).then(projects => context.projects = projects),
          this.getLinks(customer).then(links => context.links = links)
        ]).then(() => context);
      });
    },
    getProjects: function(customer) {
      return projectsService.getList({
        customer: customer.uuid
      });
    },
    getLinks: function(customer) {
      // Get service project links filtered by customer and service
      return joinServiceProjectLinkService.getServiceProjectLinks(
        customer.uuid, $scope.service.service_type, $scope.service.uuid
      );
    },
    save: function() {
      let add_promises = this.choices.filter(function(choice) {
        return choice.selected && !choice.link_url;
      }).map(function(choice) {
        choice.subtitle = gettext('Adding link');
        return joinServiceProjectLinkService.addLink(
          $scope.service.service_type,
          $scope.service.uuid,
          choice.project_url).then(function(link) {
            choice.link_url = link.url;
            choice.subtitle = gettext('Link created');
            choice.link = link;
          }).catch(function(response) {
            let reason = '';
            if (response.data && response.data.detail) {
              reason = response.data.detail;
            }
            choice.subtitle = gettext('Unable to create link.') + ' ' + reason;
            choice.selected = false;
          });
      });

      let delete_promises = this.choices.filter(function(choice) {
        return !choice.selected && choice.link_url;
      }).map(function(choice) {
        choice.subtitle = gettext('Removing link');
        return joinServiceProjectLinkService.$deleteByUrl(choice.link_url).then(function() {
          choice.link_url = null;
          choice.link = null;
          choice.subtitle = gettext('Link removed');
        }).catch(function(response) {
          let reason = '';
          if (response.data && response.data.detail) {
            reason = response.data.detail;
          }
          choice.subtitle = gettext('Unable to delete link.') + ' ' + reason;
          choice.selected = true;
        });
      });


      return $q.all(add_promises.concat(delete_promises))
        .then(() => { $scope.$broadcast('onSave'); })
        .then(() => { joinServiceProjectLinkService.clearAllCacheForCurrentEndpoint(); });
    }
  });
  $scope.init();
}
