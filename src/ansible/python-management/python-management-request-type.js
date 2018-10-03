const requestTypeReadablePresentations = {
  overall: 'Overall state',
  synchronization: 'Virtual environment synchronization',
  initialization: 'Virtual environment initialization',
  virtual_envs_search: 'Virtual environments search',
  installed_libraries_search: 'Installed libraries search',
  python_management_deletion: 'Python management environment deletion',
  virtual_environment_deletion: 'Virtual environment deletion',
};

// @ngInject
export default function pythonManagementRequestType($filter) {
  return raw_request_type => {
    const translate = $filter('translate');
    return translate(requestTypeReadablePresentations[raw_request_type]);
  };
}
