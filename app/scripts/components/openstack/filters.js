// @ngInject
function formatPackage($filter) {
  return function(resource) {
    let parts,
      flavor;
    if (resource) {
      parts = [];
      if (resource.cores) {
        parts.push(resource.cores + ' vCPU');
      }
      if (resource.ram) {
        parts.push($filter('filesize')(resource.ram) + ' RAM');
      }
      if (resource.storage) {
        parts.push($filter('filesize')(resource.storage) + ' storage');
      }
      flavor = parts.join(', ');
      return `${resource.name} / ${resource.category} (${flavor})`;
    }
  };
}

export default module => {
  module.filter('formatPackage', formatPackage);
};
