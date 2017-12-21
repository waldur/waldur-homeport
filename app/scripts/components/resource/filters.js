// @ngInject
function formatFlavor($filter) {
  return function(resource) {
    if (resource) {
      const parts = [];
      if (resource.cores) {
        parts.push(resource.cores + ' vCPU');
      }
      if (resource.ram) {
        const ramValue = $filter('filesize')(resource.ram);
        parts.push(ramValue + ' RAM');
      }
      const storage = resource.disk || resource.storage;
      if (storage) {
        const diskValue = $filter('filesize')(storage);
        parts.push(diskValue + ' storage');
      }
      return parts.join(', ');
    }
  };
}

export default module => {
  module.filter('formatFlavor', formatFlavor);
};
