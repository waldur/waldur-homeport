import stableMode from '../../configs/modes/stable.json';
import experimentalMode from '../../configs/modes/experimental.json';

const files = ['scripts/configs/config.json'];
const modes = {stableMode, experimentalMode};

export default function bootstrap(modulename) {
  loadSettings().then(bootstrapApplication);

  function loadSettings() {
    const initInjector = angular.injector(['ng']);
    const $http = initInjector.get('$http');
    const $q = initInjector.get('$q');
    const promises = files.map(file => $http.get(file).then(response => response.data));
    return $q.all(promises).then(updateSettings).catch(reportError);

    function updateSettings(responses) {
      window.$$CUSTOMENV = angular.extend.apply(null, responses);
      window.$$MODES = modes;
    }

    function reportError() {
      alert(gettext('Unable to load application configuration. Please reload this page.'));
    }
  }

  function bootstrapApplication() {
    angular.element(document).ready(function() {
      angular.bootstrap(document, [modulename]);
    });
  }
}
