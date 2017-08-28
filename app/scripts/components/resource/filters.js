// @ngInject
function formatFlavor($filter) {
  function getFileSize(value, defaultUnit) {
    let result = $filter('filesize')(value);
    if (defaultUnit) {
      result = [value, defaultUnit].join(' ');
    }

    return result;
  }
  return function(resource, defaultUnit) {
    if (resource) {
      let parts = [];
      if (resource.cores) {
        parts.push(resource.cores + ' vCPU');
      }
      if (resource.ram) {
        let ramValue = getFileSize(resource.ram, defaultUnit);
        parts.push(ramValue + ' RAM');
      }
      if (resource.disk) {
        let diskValue = getFileSize(resource.disk, defaultUnit);
        parts.push(diskValue + ' storage');
      }
      if (resource.storage) {
        let diskValue = getFileSize(resource.storage, defaultUnit);
        parts.push(diskValue + ' storage');
      }

      return parts.join(', ');
    }
  };
}

export default module => {
  module.filter('formatFlavor', formatFlavor);
};
