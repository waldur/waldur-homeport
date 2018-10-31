import stableMode from '@waldur/configs/modes/stable.json';
import experimentalMode from '@waldur/configs/modes/experimental.json';
import attachTracking from './tracking';

const CONFIG_FILE = 'scripts/configs/config.json';
const modes = {stableMode, experimentalMode};

export default async function bootstrap(modulename) {
  const initInjector = angular.injector(['ng']);
  const $http = initInjector.get('$http');

  let frontendSettings;
  try {
    const frontendResponse = await $http.get(CONFIG_FILE);
    frontendSettings = frontendResponse.data;
  } catch(error) {
    frontendSettings = {
      apiEndpoint: 'http://localhost:8080/',
    };
  }

  try {
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
