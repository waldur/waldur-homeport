// @ngInject
function formatFlavor($filter) {
  return function(resource) {
    if (resource) {
      let parts = [];
      if (resource.cores) {
        parts.push(resource.cores + ' vCPU');
      }
      if (resource.ram) {
        parts.push($filter('filesize')(resource.ram) + ' RAM');
      }
      if (resource.storage) {
        parts.push($filter('filesize')(resource.storage) + ' storage');
      }
      return parts.join(', ');
    }
  };
}

// @ngInject
function formatPackage($filter) {
  return function(resource) {
    if (resource) {
      let flavor = $filter('formatFlavor')(resource);
      return `${resource.name} / ${resource.category} (${flavor})`;
    }
  };
}

export default module => {
  module.filter('formatFlavor', formatFlavor);
  module.filter('formatPackage', formatPackage);
};
