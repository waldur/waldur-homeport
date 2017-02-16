// @ngInject
function formatPackage($filter) {
  return function(resource) {
    if (resource) {
      return `${resource.name} / ${resource.category} (${$filter('formatFlavor')(resource)})`;
    }
  };
}

export default module => {
  module.filter('formatPackage', formatPackage);
};
