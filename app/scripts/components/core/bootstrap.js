import stableMode from '../../configs/modes/stable.json';
import experimentalMode from '../../configs/modes/experimental.json';
import attachTracking from './tracking';

const CONFIG_FILE = 'scripts/configs/config.json';
const modes = {stableMode, experimentalMode};

export default async function bootstrap(modulename) {
  const initInjector = angular.injector(['ng']);
  const $http = initInjector.get('$http');

  try {
    const frontendResponse = await $http.get(CONFIG_FILE);
    const frontendSettings = frontendResponse.data;

    const backendResponse = await $http.get(`${frontendSettings.apiEndpoint}api/configuration/`);
    const backendSettings = backendResponse.data;

    window.$$CUSTOMENV = {...frontendSettings, plugins: backendSettings};
    window.$$MODES = modes;
    attachTracking(window.$$CUSTOMENV);

    angular.element(document).ready(function() {
      angular.bootstrap(document, [modulename], {strictDi: true});
    });

  } catch (error) {
    alert(gettext('Unable to load application configuration. Please reload this page.'));
  }
}
