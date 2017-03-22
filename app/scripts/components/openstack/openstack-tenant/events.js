// @ngInject
export default function eventsConfig(eventsService, $filter) {
  eventsService.pushPostprocessor(event => {
    if (event.resource_extra_configuration && event.resource_extra_configuration.package_name) {
      const resource_configuration = $filter('formatPackage')(parsePackageEvent(event));
      return angular.extend({}, event, { resource_configuration });
    } else {
      return event;
    }
  });
}

function parsePackageEvent(event) {
  return {
    name: event.resource_extra_configuration.package_name,
    category: event.resource_extra_configuration.package_category,
    ram: event.resource_extra_configuration.ram,
    cores: event.resource_extra_configuration.cores,
    disk: event.resource_extra_configuration.storage,
  };
}
