export default function bootstrap(modulename, files) {
  const application = angular.module(modulename);
  loadSettings().then(bootstrapApplication);

  function loadSettings() {
    const initInjector = angular.injector(['ng']);
    const $http = initInjector.get('$http');
    const $q = initInjector.get('$q');
    const promises = files.map(file => $http.get(file).then(response => response.data));
    return $q.all(promises).then(updateSettings);

    function updateSettings(responses) {
      window.$$CUSTOMENV = angular.extend.apply(null, responses);
    }

    function reportError(response) {
      alert('Unable to load application configuration. Please reboot the page');
      console.log(response);
    }
  }

  function bootstrapApplication() {
    angular.element(document).ready(function() {
      angular.bootstrap(document, [modulename]);
    });
  }
}
