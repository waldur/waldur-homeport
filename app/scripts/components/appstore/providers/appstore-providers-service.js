// @ngInject
export default function AppstoreProvidersService($filter, joinService) {
  const quotaThreshold = 0.8;

  return {
    loadServices,
  };

  function loadServices(project) {
    return joinService.getAll({
      project_uuid: project.uuid,
      field: ['url', 'quotas']
    }).then(function(services) {
      angular.forEach(services, checkQuotaThreshold);
      angular.forEach(services, checkQuotaLimit);

      let details = services.reduce(function(result, service) {
        result[service.url] = service;
        return result;
      }, {});

      let serviceUrlsToRemove = [];
      angular.forEach(project.services, function(service) {
        const detail = details[service.url];
        if (!detail) {
          serviceUrlsToRemove.push(service.url);
          return;
        }
        service.reachedThreshold = detail.reachedThreshold;
        service.reachedLimit = detail.reachedLimit;
        service.warning = getServiceDisabledReason(service) ||
                          getServiceWarningMessage(service);
        service.enabled = getServiceDisabledReason(service) === '';
      });

      project.services = project.services.filter(item => serviceUrlsToRemove.indexOf(item.url) === -1);

      return project;
    });
  }

  function checkQuotaThreshold(service) {
    const quotas = service.quotas.filter(quota =>
      quota.limit !== -1 && quota.usage >= (quota.limit * quotaThreshold));
    service.reachedThreshold = quotas.length > 0;
  }

  function checkQuotaLimit(service) {
    const quotas = service.quotas.filter(quota =>
      quota.limit !== -1 && quota.usage >= quota.limit);
    service.reachedLimit = quotas.length === service.quotas.length && quotas.length > 0;
  }

  function getServiceDisabledReason(service) {
    let messages = [];
    if (service.state === 'Erred') {
      return $filter('translate')(gettext('Provider is in erred state.'));
    }
    if (service.reachedLimit) {
      return $filter('translate')(gettext('All provider quotas have reached limit.'));
    }
    if (service.validation_state === 'ERRED') {
      messages.push(service.validation_message);
    }
    return messages.join('\n');
  }

  function getServiceWarningMessage(service) {
    let messages = [];
    if (service.reachedThreshold) {
      messages.push($filter('translate')(gettext('Provider quota has reached threshold.')));
    }
    if (service.validation_state === 'WARNING') {
      messages.push(service.validation_message);
    }
    return messages.join('\n');
  }
}
