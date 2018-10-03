// @ngInject
export default function ProviderProjectsService(
  $q, customersService, projectsService, joinService, joinServiceProjectLinkService, ncUtilsFlash) {

  return {
    loadLinks,
    saveLinks,
  };

  function loadLinks(project) {
    return customersService.isOwnerOrStaff().then(canManage => {
      return loadServices(project).then(services => ({
        canManage: canManage,
        choices: makeChoices(project, services),
      }));
    });
  }

  function loadServices(project) {
    return joinService.getAll({
      customer: project.customer_uuid,
      field: ['uuid', 'url', 'service_type', 'name'],
    }).catch(() => {
      ncUtilsFlash.error(gettext('Unable to fetch project providers.'));
    });
  }

  function makeChoices(project, services) {
    let serviceLinks = {};
    angular.forEach(project.services, service => {
      serviceLinks[service.url] = service;
    });

    return services.map(service => {
      const link = serviceLinks[service.url];
      return {
        title: service.name,
        subtitle: '',
        selected: !!link,
        link_url: link && link.service_project_link_url,
        project_url: project.url,
        service_url: service.url,
        service_uuid: service.uuid,
        service_type: service.service_type,
      };
    });
  }

  function saveLinks(project, choices) {
    const promise = $q.all([
      $q.all(choices.filter(isNewLink).map(createLink)),
      $q.all(choices.filter(isStaleLink).map(removeLink)),
    ]);

    return promise.then(() => {
      projectsService.cleanAllCache();
      return projectsService.$get(project.uuid).then(newProject => {
        project.services = newProject.services;
      });
    }).then(() => {
      joinService.clearAllCacheForCurrentEndpoint();
      ncUtilsFlash.success(gettext('Project providers links have been updated.'));
    });
  }

  function isNewLink(choice) {
    return choice.selected && !choice.link_url;
  }

  function isStaleLink(choice) {
    return !choice.selected && choice.link_url;
  }

  function createLink(choice) {
    choice.subtitle = gettext('Adding link');
    return joinServiceProjectLinkService
      .addLink(choice.service_type, choice.service_uuid, choice.project_url)
      .then(link => {
        choice.link_url = link.url;
        choice.subtitle = gettext('Link created');
      }).catch(response => {
        let reason = '';
        if (response.data && response.data.non_field_errors) {
          reason = response.data.non_field_errors;
        }
        choice.subtitle = gettext('Unable to create link.') + ' ' + reason;
        choice.selected = false;
      });
  }

  function removeLink(choice) {
    choice.subtitle = gettext('Removing link');
    return joinServiceProjectLinkService
      .$deleteByUrl(choice.link_url)
      .then(() => {
        choice.link_url = null;
        choice.subtitle = gettext('Link removed');
      }).catch(response => {
        let reason = '';
        if (response.data && response.data.detail) {
          reason = response.data.detail;
        }
        choice.subtitle = gettext('Unable to delete link.') + ' ' + reason;
        choice.selected = true;
      });
  }
}
